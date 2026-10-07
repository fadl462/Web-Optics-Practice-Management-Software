const JSON_HEADERS = {
  'content-type': 'application/json; charset=UTF-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
};

const ROLES = {
  'Practice Manager': { view: true, create: true, edit: true, export: true, admin: true },
  Provider: { view: true, create: true, edit: true, export: true, admin: false },
  'Front Desk': { view: true, create: true, edit: true, export: false, admin: false },
  Viewer: { view: true, create: false, edit: false, export: false, admin: false },
};

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...SECURITY_HEADERS, ...extra },
  });
}

function error(message, status = 400, code = 'BAD_REQUEST') {
  return json({ error: { code, message } }, status);
}

function id(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function now() {
  return new Date().toISOString();
}

function bytesToHex(bytes) {
  return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSha256(secret, payload) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return bytesToHex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload)));
}

function safeEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

function retryDelayMinutes(attemptNo) {
  return [5, 15, 30, 60][Math.max(0, Math.min(3, attemptNo - 1))];
}

function allowedOrigin(request) {
  const origin = request.headers.get('Origin');
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}

async function requireIdentity(request, env) {
  // Cloudflare Access is the production authentication boundary.
  // For Workers with Static Assets, use the Access identity header because
  // the internal assets router does not expose ctx.access to user Worker code.
  const email = String(request.headers.get('Cf-Access-Authenticated-User-Email') || '').trim().toLowerCase();
  if (!email) return { response: error('Authentication required.', 401, 'AUTH_REQUIRED') };
  const displayName = String(request.headers.get('Cf-Access-Authenticated-User-Name') || '').trim();

  let staff = await env.DB.prepare(
    `SELECT id, email, name, role, active FROM staff WHERE lower(email)=? LIMIT 1`
  ).bind(email).first();

  // One-time bootstrap: only the exact configured admin email can become the first manager.
  if (!staff && env.BOOTSTRAP_ADMIN_EMAIL && email === String(env.BOOTSTRAP_ADMIN_EMAIL).trim().toLowerCase()) {
    const staffId = id('USR');
    await env.DB.prepare(
      `INSERT INTO staff (id,email,name,role,active,created_at,updated_at) VALUES (?,?,?,?,1,?,?)`
    ).bind(staffId, email, displayName || email, 'Practice Manager', now(), now()).run();
    staff = { id: staffId, email, name: displayName || email, role: 'Practice Manager', active: 1 };
  }

  if (!staff || !staff.active) return { response: error('Your account is not authorized for OptiFlow.', 403, 'NOT_AUTHORIZED') };
  return { identity: { email, name: displayName }, staff };
}

function requirePermission(staff, action) {
  const perms = ROLES[staff.role] || ROLES.Viewer;
  if (!perms[action]) return error('You do not have permission to perform this action.', 403, 'FORBIDDEN');
  return null;
}

async function audit(env, staff, request, action, entityType, entityId, metadata = {}) {
  await env.DB.prepare(
    `INSERT INTO audit_events (id,actor_id,actor_email,action,entity_type,entity_id,metadata_json,ip_hash,created_at)
     VALUES (?,?,?,?,?,?,?,?,?)`
  ).bind(
    id('AUD'), staff.id, staff.email, action, entityType, entityId || null,
    JSON.stringify(metadata), null, now()
  ).run();
}

async function body(request) {
  if (!request.headers.get('content-type')?.includes('application/json')) throw new Error('JSON body required');
  const text = await request.text();
  if (text.length > 100000) throw new Error('Request body is too large');
  return JSON.parse(text || '{}');
}

function patientSelect() {
  return `SELECT id, first_name, last_name, date_of_birth, phone, email, status, created_at, updated_at
          FROM patients`;
}

async function runRecallAutomation(env) {
  if (!env.DB) return { recallsQueued: 0, messagesQueued: 0, delivered: 0, reason: 'DB_NOT_CONFIGURED' };
  const timestamp = now();
  let recallsQueued = 0;
  let messagesQueued = 0;
  let delivered = 0;

  // 1) Promote due recalls into the staff-ready queue.
  const candidates = await env.DB.prepare(
    `SELECT r.id, r.patient_id, r.due_date, r.status
     FROM recalls r
     WHERE r.status='Scheduled'
       AND date(r.due_date) <= date('now','+30 day')
     ORDER BY r.due_date ASC LIMIT 500`
  ).all();
  for (const row of candidates.results || []) {
    const result = await env.DB.prepare(`UPDATE recalls SET status='Ready', updated_at=? WHERE id=? AND status='Scheduled'`)
      .bind(timestamp, row.id).run();
    if (result.meta?.changes) {
      await env.DB.prepare(`INSERT INTO recall_events (id,recall_id,event_type,status,created_at) VALUES (?,?,?,?,?)`)
        .bind(id('RCLE'), row.id, 'automation_eligible', 'Ready', timestamp).run();
      recallsQueued += 1;
    }
  }

  // 2) Queue outbound messages only for recalls explicitly approved/queued by staff.
  const queuedRecalls = await env.DB.prepare(
    `SELECT r.*, p.first_name, p.last_name, p.phone, p.email,
            cp.sms_opt_in, cp.email_opt_in
     FROM recalls r JOIN patients p ON p.id=r.patient_id
     LEFT JOIN communication_preferences cp ON cp.patient_id=r.patient_id
     WHERE r.status='Queued' LIMIT 250`
  ).all();
  for (const recall of queuedRecalls.results || []) {
    const existing = await env.DB.prepare(`SELECT COUNT(*) AS count FROM recall_events WHERE recall_id=? AND event_type='message_created'`).bind(recall.id).first();
    if (Number(existing?.count || 0) > 0) continue;

    const channels = String(recall.channel || 'SMS').split('+').map(x => x.trim()).filter(Boolean);
    for (const channelName of channels) {
      const channel = channelName.toLowerCase().startsWith('email') ? 'Email' : 'SMS';
      const optedOut = channel === 'Email' ? recall.email_opt_in === 0 : recall.sms_opt_in === 0;
      if (optedOut) {
        await env.DB.prepare(`INSERT INTO recall_events (id,recall_id,event_type,status,error_code,error_message,created_at) VALUES (?,?,?,?,?,?,?)`)
          .bind(id('RCLE'), recall.id, 'message_blocked', 'Blocked', 'COMMUNICATION_OPT_OUT', `${channel} communication opt-out is active.`, timestamp).run();
        continue;
      }
      const destination = channel === 'Email' ? recall.email : recall.phone;
      if (!destination) continue;
      const messageId = id('MSG');
      const text = `Your ${recall.type || 'eye examination'} is due. Please reply to this message or contact our practice to schedule an appointment.`;
      await env.DB.prepare(`INSERT INTO messages (id,patient_id,channel,direction,body,status,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,NULL,?,?)`)
        .bind(messageId, recall.patient_id, channel, 'outbound', text, 'Queued', timestamp, timestamp).run();
      await env.DB.prepare(`INSERT INTO message_attempts (id,message_id,attempt_no,state,created_at,updated_at) VALUES (?,?,?,?,?,?)`)
        .bind(id('MAT'), messageId, 1, 'Queued', timestamp, timestamp).run();
      await env.DB.prepare(`INSERT INTO recall_events (id,recall_id,event_type,status,created_at) VALUES (?,?,?,?,?)`)
        .bind(id('RCLE'), recall.id, 'message_created', 'Queued', timestamp).run();
      messagesQueued += 1;
    }
    await env.DB.prepare(`UPDATE recalls SET status='Queued', updated_at=? WHERE id=? AND status='Queued'`).bind(timestamp, recall.id).run();
  }

  // 3) Try provider delivery when server-side provider credentials are configured.
  const outbound = await env.DB.prepare(
    `SELECT m.*, p.phone, p.email, ma.attempt_no, ma.next_attempt_at
     FROM messages m JOIN patients p ON p.id=m.patient_id
     LEFT JOIN message_attempts ma ON ma.message_id=m.id
       AND ma.attempt_no=(SELECT MAX(x.attempt_no) FROM message_attempts x WHERE x.message_id=m.id)
     WHERE m.direction='outbound' AND m.status='Queued'
       AND (ma.next_attempt_at IS NULL OR ma.next_attempt_at <= ?)
     ORDER BY m.created_at ASC LIMIT 100`
  ).bind(timestamp).all();
  for (const message of outbound.results || []) {
    const channel = message.channel;
    const endpoint = channel === 'SMS' ? env.SMS_PROVIDER_URL : env.EMAIL_PROVIDER_URL;
    const token = channel === 'SMS' ? env.SMS_PROVIDER_TOKEN : env.EMAIL_PROVIDER_TOKEN;
    if (!endpoint || !token) {
      await env.DB.prepare(`UPDATE message_attempts SET state='ProviderNotConfigured', error_message=?, updated_at=? WHERE message_id=? AND attempt_no=(SELECT MAX(attempt_no) FROM message_attempts WHERE message_id=?)`)
        .bind(`${channel} provider is not configured.`, timestamp, message.id, message.id).run();
      continue;
    }

    const destination = channel === 'SMS' ? message.phone : message.email;
    if (!destination) {
      await env.DB.prepare(`UPDATE messages SET status='Failed', updated_at=? WHERE id=?`).bind(timestamp, message.id).run();
      await env.DB.prepare(`UPDATE message_attempts SET state='Failed', error_code='NO_DESTINATION', error_message=?, updated_at=? WHERE message_id=? AND attempt_no=(SELECT MAX(attempt_no) FROM message_attempts WHERE message_id=?)`)
        .bind(`No ${channel} destination is available.`, timestamp, message.id, message.id).run();
      continue;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'authorization': `Bearer ${token}`, 'x-optiflow-message-id': message.id },
        body: JSON.stringify({ to: destination, body: message.body, channel, messageId: message.id })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const err = new Error(payload?.message || `Provider returned HTTP ${response.status}`);
        err.providerStatus = response.status;
        throw err;
      }
      const providerId = payload?.id || payload?.messageId || payload?.sid || null;
      await env.DB.batch([
        env.DB.prepare(`UPDATE messages SET status='Sent', provider_message_id=?, updated_at=? WHERE id=?`).bind(providerId, timestamp, message.id),
        env.DB.prepare(`UPDATE message_attempts SET state='Sent', provider_message_id=?, next_attempt_at=NULL, updated_at=? WHERE message_id=? AND attempt_no=(SELECT MAX(attempt_no) FROM message_attempts WHERE message_id=?)`).bind(providerId, timestamp, message.id, message.id)
      ]);
      delivered += 1;
    } catch (e) {
      const attemptNo = Number(message.attempt_no || 1);
      const providerStatus = Number(e?.providerStatus || 0);
      const transient = !providerStatus || providerStatus === 408 || providerStatus === 425 || providerStatus === 429 || providerStatus >= 500;
      const maxAttempts = 4;
      if (transient && attemptNo < maxAttempts) {
        const delay = retryDelayMinutes(attemptNo);
        await env.DB.prepare(`UPDATE message_attempts SET state='RetryScheduled', error_message=?, next_attempt_at=datetime('now','+' || ? || ' minutes'), updated_at=? WHERE message_id=? AND attempt_no=(SELECT MAX(attempt_no) FROM message_attempts WHERE message_id=?)`)
          .bind(String(e?.message || e), delay, timestamp, message.id, message.id).run();
      } else {
        await env.DB.batch([
          env.DB.prepare(`UPDATE messages SET status='Failed', updated_at=? WHERE id=?`).bind(timestamp, message.id),
          env.DB.prepare(`UPDATE message_attempts SET state='Failed', error_code=?, error_message=?, next_attempt_at=NULL, updated_at=? WHERE message_id=? AND attempt_no=(SELECT MAX(attempt_no) FROM message_attempts WHERE message_id=?)`).bind(providerStatus ? `HTTP_${providerStatus}` : 'DELIVERY_ERROR', String(e?.message || e), timestamp, message.id, message.id)
        ]);
      }
    }
  }
  return { recallsQueued, messagesQueued, delivered };
}

async function messageWebhook(request, env) {
  if (!env.DB) return error('Production database is not configured.', 503, 'DB_NOT_CONFIGURED');
  const secret = String(env.MESSAGE_WEBHOOK_SECRET || '').trim();
  if (!secret) return error('Message webhook is not configured.', 503, 'WEBHOOK_NOT_CONFIGURED');

  const raw = await request.text();
  if (raw.length > 50000) return error('Webhook body is too large.', 413, 'PAYLOAD_TOO_LARGE');
  const signatureHeader = String(request.headers.get('X-OptiFlow-Signature') || '').trim();
  const legacySecret = String(request.headers.get('X-OptiFlow-Webhook-Secret') || '').trim();
  const expected = await hmacSha256(secret, raw);
  const supplied = signatureHeader.replace(/^sha256=/i, '').trim().toLowerCase();
  const signatureValid = supplied && safeEqual(supplied, expected);
  const legacyValid = legacySecret && safeEqual(legacySecret, secret);
  if (!signatureValid && !legacyValid) return error('Webhook authentication failed.', 401, 'WEBHOOK_UNAUTHORIZED');

  let input;
  try { input = JSON.parse(raw || '{}'); } catch { return error('Webhook JSON is invalid.'); }
  const messageId = String(input.messageId || '').trim();
  const status = String(input.status || '').trim();
  const providerEventId = String(input.eventId || input.providerEventId || input.id || '').trim() || null;
  if (!messageId || !['Sent','Delivered','Failed','Read'].includes(status)) return error('messageId and a valid delivery status are required.');
  const message = await env.DB.prepare(`SELECT id FROM messages WHERE id=?`).bind(messageId).first();
  if (!message) return error('Message not found.', 404, 'NOT_FOUND');

  if (providerEventId) {
    const duplicate = await env.DB.prepare(`SELECT id FROM message_delivery_events WHERE provider_event_id=? LIMIT 1`).bind(providerEventId).first();
    if (duplicate) return json({ ok: true, duplicate: true, data: { messageId, status } });
  }

  const timestamp = now();
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO message_delivery_events (id,message_id,provider_event_id,status,provider_message_id,error_code,error_message,received_at) VALUES (?,?,?,?,?,?,?,?)`).bind(id('MDE'), messageId, providerEventId, status, input.providerMessageId || null, input.errorCode || null, input.errorMessage || null, timestamp),
    env.DB.prepare(`UPDATE messages SET status=?, provider_message_id=COALESCE(?,provider_message_id), updated_at=? WHERE id=?`).bind(status, input.providerMessageId || null, timestamp, messageId),
    env.DB.prepare(`UPDATE message_attempts SET state=?, provider_message_id=COALESCE(?,provider_message_id), error_code=?, error_message=?, next_attempt_at=NULL, updated_at=? WHERE message_id=? AND attempt_no=(SELECT MAX(attempt_no) FROM message_attempts WHERE message_id=?)`).bind(status, input.providerMessageId || null, input.errorCode || null, input.errorMessage || null, timestamp, messageId, messageId)
  ]);
  return json({ ok: true, data: { messageId, status } });
}

function methodIsPost(request) { return request.method.toUpperCase() === 'POST'; }

async function api(request, env, ctx) {
  const url = new URL(request.url);
  if (url.pathname === '/api/webhooks/messages' && methodIsPost(request)) return messageWebhook(request, env);
  if (!env.DB) return error('Production database is not configured.', 503, 'DB_NOT_CONFIGURED');
  if (!allowedOrigin(request)) return error('Cross-origin request blocked.', 403, 'ORIGIN_BLOCKED');

  const method = request.method.toUpperCase();
  const path = url.pathname.replace(/^\/api\/?/, '').replace(/\/$/, '');

  // Health is Access-authenticated but does not require an OptiFlow staff record.
  // This makes first-time setup diagnosable without exposing the configured admin email.
  if (path === 'health' && method === 'GET') {
    const accessEmail = String(request.headers.get('Cf-Access-Authenticated-User-Email') || '').trim().toLowerCase();
    if (!accessEmail) return error('Authentication required.', 401, 'AUTH_REQUIRED');
    if (!env.DB) return error('Production database is not configured.', 503, 'DB_NOT_CONFIGURED');
    let schemaReady = true;
    try {
      await env.DB.prepare(`SELECT 1 FROM staff LIMIT 1`).first();
      await env.DB.prepare(`SELECT 1 FROM patients LIMIT 1`).first();
    } catch { schemaReady = false; }
    if (!schemaReady) return json({ ok: false, service: 'optiflow-api', accessAuthenticated: true, authorized: false, schemaReady: false, bootstrapConfigured: Boolean(String(env.BOOTSTRAP_ADMIN_EMAIL || '').trim()), bootstrapMatches: false, role: null, message: 'D1 is connected but the OptiFlow database schema is not ready.' }, 503, { 'cache-control': 'no-store' });
    const staff = await env.DB.prepare(
      `SELECT id,email,name,role,active FROM staff WHERE lower(email)=? LIMIT 1`
    ).bind(accessEmail).first();
    const bootstrapConfigured = Boolean(String(env.BOOTSTRAP_ADMIN_EMAIL || '').trim());
    const bootstrapMatches = bootstrapConfigured && accessEmail === String(env.BOOTSTRAP_ADMIN_EMAIL).trim().toLowerCase();
    return json({
      ok: true,
      service: 'optiflow-api',
      accessAuthenticated: true,
      authorized: Boolean(staff && staff.active) || bootstrapMatches,
      bootstrapConfigured,
      bootstrapMatches,
      role: staff?.role || (bootstrapMatches ? 'Practice Manager' : null),
      providers: {
        smsConfigured: Boolean(String(env.SMS_PROVIDER_URL || '').trim() && String(env.SMS_PROVIDER_TOKEN || '').trim()),
        emailConfigured: Boolean(String(env.EMAIL_PROVIDER_URL || '').trim() && String(env.EMAIL_PROVIDER_TOKEN || '').trim()),
        webhookConfigured: Boolean(String(env.MESSAGE_WEBHOOK_SECRET || '').trim())
      }
    });
  }

  const auth = await requireIdentity(request, env);
  if (auth.response) return auth.response;
  const { staff } = auth;

  // ---------- Patients ----------
  if (path === 'patients' && method === 'GET') {
    const denied = requirePermission(staff, 'view'); if (denied) return denied;
    const q = (url.searchParams.get('search') || '').trim();
    let result;
    if (q) {
      const like = `%${q}%`;
      result = await env.DB.prepare(`${patientSelect()} WHERE first_name LIKE ? OR last_name LIKE ? OR phone LIKE ? OR email LIKE ? ORDER BY last_name, first_name LIMIT 100`)
        .bind(like, like, like, like).all();
    } else {
      result = await env.DB.prepare(`${patientSelect()} ORDER BY last_name, first_name LIMIT 100`).all();
    }
    return json({ data: result.results });
  }

  if (path === 'patients' && method === 'POST') {
    const denied = requirePermission(staff, 'create'); if (denied) return denied;
    let input; try { input = await body(request); } catch (e) { return error(e.message); }
    const first = String(input.firstName || '').trim();
    const last = String(input.lastName || '').trim();
    if (!first || !last) return error('First name and last name are required.');
    const patientId = id('PAT');
    const timestamp = now();
    await env.DB.prepare(`INSERT INTO patients (id,first_name,last_name,date_of_birth,phone,email,status,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)`)
      .bind(patientId, first, last, input.dateOfBirth || null, input.phone || null, input.email || null, 'Active', input.notes || null, timestamp, timestamp).run();

    if (String(input.insuranceProvider || '').trim()) {
      await env.DB.prepare(`INSERT INTO insurance_policies (id,patient_id,provider,policy_number,member_id,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)`)
        .bind(id('INS'), patientId, String(input.insuranceProvider).trim(), input.policyNumber || null, input.memberId || null, input.insuranceStatus || 'Pending', timestamp, timestamp).run();
    }
    if (input.nextRecall) {
      const recallId = id('RCL');
      await env.DB.prepare(`INSERT INTO recalls (id,patient_id,type,due_date,channel,status,source,created_at,updated_at) VALUES (?,?,?,?,?,'Scheduled','Patient intake',?,?)`)
        .bind(recallId, patientId, input.recallType || 'Annual exam', input.nextRecall, input.recallChannel || 'SMS + Email', timestamp, timestamp).run();
    }
    await audit(env, staff, request, 'patient.created', 'patient', patientId, { fields: ['first_name','last_name','date_of_birth','phone','email','notes','insurance','next_recall'] });
    return json({ data: { id: patientId } }, 201);
  }

  const patientMatch = path.match(/^patients\/([^/]+)$/);
  if (patientMatch && method === 'GET') {
    const denied = requirePermission(staff, 'view'); if (denied) return denied;
    const patientId = decodeURIComponent(patientMatch[1]);
    const patient = await env.DB.prepare(`SELECT * FROM patients WHERE id=?`).bind(patientId).first();
    if (!patient) return error('Patient not found.', 404, 'NOT_FOUND');
    const [insurance, prescriptions, history, allergies, medications, communicationPreferences, recalls, appointments, messages, tasks] = await Promise.all([
      env.DB.prepare(`SELECT * FROM insurance_policies WHERE patient_id=? ORDER BY created_at DESC`).bind(patientId).all(),
      env.DB.prepare(`SELECT * FROM prescriptions WHERE patient_id=? ORDER BY prescribed_at DESC`).bind(patientId).all(),
      env.DB.prepare(`SELECT * FROM medical_history WHERE patient_id=? ORDER BY event_date DESC, created_at DESC`).bind(patientId).all(),
      env.DB.prepare(`SELECT * FROM allergies WHERE patient_id=? ORDER BY created_at DESC`).bind(patientId).all(),
      env.DB.prepare(`SELECT * FROM medications WHERE patient_id=? ORDER BY created_at DESC`).bind(patientId).all(),
      env.DB.prepare(`SELECT * FROM communication_preferences WHERE patient_id=?`).bind(patientId).first(),
      env.DB.prepare(`SELECT id,type,due_date,channel,status,source,created_at,updated_at FROM recalls WHERE patient_id=? ORDER BY COALESCE(due_date,created_at) DESC LIMIT 100`).bind(patientId).all(),
      env.DB.prepare(`SELECT id,start_at,end_at,visit_type,provider,status,created_at,updated_at FROM appointments WHERE patient_id=? ORDER BY start_at DESC LIMIT 100`).bind(patientId).all(),
      env.DB.prepare(`SELECT id,channel,direction,body,status,created_at,updated_at FROM messages WHERE patient_id=? ORDER BY created_at DESC LIMIT 100`).bind(patientId).all(),
      env.DB.prepare(`SELECT id,title,owner,due_date,priority,done,created_at,updated_at FROM tasks WHERE patient_id=? ORDER BY created_at DESC LIMIT 100`).bind(patientId).all(),
    ]);

    const timeline = [];
    for (const x of history.results || []) timeline.push({ id:x.id, type:'Clinical history', title:x.category || 'Clinical history', detail:x.description || 'Clinical history documented', time:x.event_date || x.created_at });
    for (const x of allergies.results || []) timeline.push({ id:x.id, type:'Safety', title:'Allergy recorded', detail:[x.allergen, x.reaction, x.severity].filter(Boolean).join(' · '), time:x.created_at });
    for (const x of medications.results || []) timeline.push({ id:x.id, type:'Medication', title:'Medication recorded', detail:[x.name, x.dose, x.frequency].filter(Boolean).join(' · '), time:x.created_at });
    for (const x of prescriptions.results || []) timeline.push({ id:x.id, type:'Prescription', title:'Prescription recorded', detail:[x.notes, x.od_sphere && `OD ${x.od_sphere}`, x.os_sphere && `OS ${x.os_sphere}`].filter(Boolean).join(' · ') || 'Prescription updated', time:x.prescribed_at || x.created_at });
    for (const x of insurance.results || []) timeline.push({ id:x.id, type:'Insurance', title:'Insurance policy recorded', detail:[x.provider, x.policy_number, x.status].filter(Boolean).join(' · '), time:x.updated_at || x.created_at });
    for (const x of recalls.results || []) timeline.push({ id:x.id, type:'Recall', title:'Recall '+(x.status || 'scheduled').toLowerCase(), detail:[x.type, x.channel, x.source].filter(Boolean).join(' · '), time:x.updated_at || x.created_at });
    for (const x of appointments.results || []) timeline.push({ id:x.id, type:'Appointment', title:'Appointment '+(x.status || 'scheduled').toLowerCase(), detail:[x.visit_type, x.provider].filter(Boolean).join(' · '), time:x.start_at || x.created_at });
    for (const x of messages.results || []) timeline.push({ id:x.id, type:'Communication', title:(x.direction === 'outbound' ? 'Practice message' : 'Patient message')+' · '+(x.status || 'recorded'), detail:[x.channel, x.body].filter(Boolean).join(' · '), time:x.created_at });
    for (const x of tasks.results || []) timeline.push({ id:x.id, type:'Task', title:(x.done ? 'Task completed' : 'Task created'), detail:[x.title, x.priority, x.owner].filter(Boolean).join(' · '), time:x.updated_at || x.created_at });
    timeline.sort((a,b)=>String(b.time||'').localeCompare(String(a.time||'')));
    await audit(env, staff, request, 'patient.viewed', 'patient', patientId);
    return json({ data: { patient, insurance: insurance.results, prescriptions: prescriptions.results, history: history.results, allergies: allergies.results, medications: medications.results, communicationPreferences: communicationPreferences || null, timeline: timeline.slice(0, 100) } });
  }

  if (patientMatch && method === 'PATCH') {
    const denied = requirePermission(staff, 'edit'); if (denied) return denied;
    const patientId = decodeURIComponent(patientMatch[1]);
    let input; try { input = await body(request); } catch (e) { return error(e.message); }
    const allowed = ['first_name','last_name','date_of_birth','phone','email','status'];
    const entries = Object.entries(input).filter(([key]) => allowed.includes(key));
    if (!entries.length) return error('No editable fields supplied.');
    const sets = entries.map(([key]) => `${key}=?`).join(', ');
    const values = entries.map(([, value]) => value);
    values.push(now(), patientId);
    await env.DB.prepare(`UPDATE patients SET ${sets}, updated_at=? WHERE id=?`).bind(...values).run();
    await audit(env, staff, request, 'patient.updated', 'patient', patientId, { fields: entries.map(([k]) => k) });
    return json({ data: { id: patientId } });
  }

  // ---------- Clinical record writes ----------
  const clinicalMatch = path.match(/^patients\/([^/]+)\/(history|allergies|medications|prescriptions|insurance)$/);
  if (clinicalMatch && method === 'POST') {
    const denied = requirePermission(staff, 'edit'); if (denied) return denied;
    const patientId = decodeURIComponent(clinicalMatch[1]);
    const section = clinicalMatch[2];
    const exists = await env.DB.prepare(`SELECT id FROM patients WHERE id=?`).bind(patientId).first();
    if (!exists) return error('Patient not found.', 404, 'NOT_FOUND');
    let input; try { input = await body(request); } catch (e) { return error(e.message); }
    const timestamp = now();
    let recordId;
    if (section === 'history') {
      if (!String(input.category||'').trim() || !String(input.description||'').trim()) return error('History category and description are required.');
      recordId=id('HIS');
      await env.DB.prepare(`INSERT INTO medical_history (id,patient_id,event_date,category,description,created_by,created_at) VALUES (?,?,?,?,?,?,?)`)
        .bind(recordId,patientId,input.eventDate||timestamp.slice(0,10),String(input.category).trim(),String(input.description).trim(),staff.id,timestamp).run();
    } else if (section === 'allergies') {
      if (!String(input.allergen||'').trim()) return error('Allergen is required.');
      recordId=id('ALG');
      await env.DB.prepare(`INSERT INTO allergies (id,patient_id,allergen,reaction,severity,created_at) VALUES (?,?,?,?,?,?)`)
        .bind(recordId,patientId,String(input.allergen).trim(),input.reaction||null,input.severity||null,timestamp).run();
    } else if (section === 'medications') {
      if (!String(input.name||'').trim()) return error('Medication name is required.');
      recordId=id('MED');
      await env.DB.prepare(`INSERT INTO medications (id,patient_id,name,dose,frequency,active,created_at) VALUES (?,?,?,?,?,1,?)`)
        .bind(recordId,patientId,String(input.name).trim(),input.dose||null,input.frequency||null,timestamp).run();
    } else if (section === 'prescriptions') {
      if (!input.prescribedAt) return error('Prescription date is required.');
      recordId=id('RX');
      await env.DB.prepare(`INSERT INTO prescriptions (id,patient_id,prescribed_at,od_sphere,od_cylinder,od_axis,od_add,os_sphere,os_cylinder,os_axis,os_add,notes,created_by,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
        .bind(recordId,patientId,input.prescribedAt,input.odSphere||null,input.odCylinder||null,input.odAxis||null,input.odAdd||null,input.osSphere||null,input.osCylinder||null,input.osAxis||null,input.osAdd||null,input.notes||null,staff.id,timestamp).run();
    } else if (section === 'insurance') {
      if (!String(input.provider||'').trim()) return error('Insurance provider is required.');
      recordId=id('INS');
      await env.DB.prepare(`INSERT INTO insurance_policies (id,patient_id,provider,policy_number,member_id,status,effective_from,effective_to,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)`)
        .bind(recordId,patientId,String(input.provider).trim(),input.policyNumber||null,input.memberId||null,input.status||'Pending',input.effectiveFrom||null,input.effectiveTo||null,timestamp,timestamp).run();
    }
    await audit(env, staff, request, `patient.${section}.created`, section, recordId, { patientId });
    return json({ data: { id: recordId, patientId, section } }, 201);
  }

  // ---------- Recall / appointment / message status updates ----------
  const recallMatch = path.match(/^recalls\/([^/]+)$/);
  if (recallMatch && method === 'PATCH') {
    const denied = requirePermission(staff, 'edit'); if (denied) return denied;
    const recallId = decodeURIComponent(recallMatch[1]);
    let input; try { input = await body(request); } catch (e) { return error(e.message); }
    const allowed=['type','due_date','channel','status'];
    const entries=Object.entries(input).filter(([k])=>allowed.includes(k));
    if(!entries.length) return error('No editable recall fields supplied.');
    const sets=entries.map(([k])=>`${k}=?`).join(', '); const values=entries.map(([,v])=>v); values.push(now(),recallId);
    await env.DB.prepare(`UPDATE recalls SET ${sets}, updated_at=? WHERE id=?`).bind(...values).run();
    await audit(env,staff,request,'recall.updated','recall',recallId,{fields:entries.map(([k])=>k)});
    return json({data:{id:recallId}});
  }

  const appointmentMatch = path.match(/^appointments\/([^/]+)$/);
  if (appointmentMatch && method === 'PATCH') {
    const denied = requirePermission(staff, 'edit'); if (denied) return denied;
    const appointmentId=decodeURIComponent(appointmentMatch[1]);
    let input; try { input=await body(request); } catch(e){ return error(e.message); }
    const allowed=['start_at','end_at','visit_type','provider','status'];
    const entries=Object.entries(input).filter(([k])=>allowed.includes(k));
    if(!entries.length) return error('No editable appointment fields supplied.');
    const sets=entries.map(([k])=>`${k}=?`).join(', '); const values=entries.map(([,v])=>v); values.push(now(),appointmentId);
    await env.DB.prepare(`UPDATE appointments SET ${sets}, updated_at=? WHERE id=?`).bind(...values).run();
    await audit(env,staff,request,'appointment.updated','appointment',appointmentId,{fields:entries.map(([k])=>k)});
    return json({data:{id:appointmentId}});
  }

  const messageMatch = path.match(/^messages\/([^/]+)$/);
  if (messageMatch && method === 'PATCH') {
    const denied = requirePermission(staff, 'edit'); if (denied) return denied;
    const messageId=decodeURIComponent(messageMatch[1]);
    let input; try { input=await body(request); } catch(e){ return error(e.message); }
    const status=String(input.status||'').trim();
    if(!['Queued','Sent','Delivered','Failed','Read'].includes(status)) return error('Invalid message status.');
    await env.DB.prepare(`UPDATE messages SET status=?, updated_at=? WHERE id=?`).bind(status,now(),messageId).run();
    await audit(env,staff,request,'message.updated','message',messageId,{status});
    return json({data:{id:messageId,status}});
  }

  // ---------- Practice settings ----------
  if (path === 'settings' && method === 'GET') {
    const denied=requirePermission(staff,'view'); if(denied) return denied;
    const result=await env.DB.prepare(`SELECT key,value_json,updated_at FROM practice_settings ORDER BY key`).all();
    const settings={}; for(const row of result.results){try{settings[row.key]=JSON.parse(row.value_json)}catch{settings[row.key]=row.value_json}}
    return json({data:settings});
  }
  if (path === 'settings' && method === 'PATCH') {
    const denied=requirePermission(staff,'admin'); if(denied) return denied;
    let input; try{input=await body(request)}catch(e){return error(e.message)}
    const timestamp=now();
    for(const [key,value] of Object.entries(input||{})) {
      if(!/^[a-zA-Z0-9_.-]{1,80}$/.test(key)) continue;
      await env.DB.prepare(`INSERT INTO practice_settings (key,value_json,updated_by,updated_at) VALUES (?,?,?,?) ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json,updated_by=excluded.updated_by,updated_at=excluded.updated_at`)
        .bind(key,JSON.stringify(value),staff.id,timestamp).run();
    }
    await audit(env,staff,request,'settings.updated','practice_settings','practice',{keys:Object.keys(input||{})});
    return json({data:{saved:true}});
  }

  // ---------- Staff administration ----------
  if (path === 'staff' && method === 'GET') {
    const denied=requirePermission(staff,'admin'); if(denied) return denied;
    const result=await env.DB.prepare(`SELECT id,email,name,role,active,created_at,updated_at FROM staff ORDER BY name`).all();
    return json({data:result.results});
  }
  if (path === 'staff' && method === 'POST') {
    const denied=requirePermission(staff,'admin'); if(denied) return denied;
    let input; try{input=await body(request)}catch(e){return error(e.message)}
    const email=String(input.email||'').trim().toLowerCase(), name=String(input.name||'').trim(), role=String(input.role||'Front Desk').trim();
    if(!email||!name) return error('Name and email are required.');
    if(!ROLES[role]) return error('Invalid role.');
    const staffId=id('USR'),timestamp=now();
    try { await env.DB.prepare(`INSERT INTO staff (id,email,name,role,active,created_at,updated_at) VALUES (?,?,?,?,1,?,?)`).bind(staffId,email,name,role,timestamp,timestamp).run(); }
    catch(e){ return error('A staff member with that email already exists.',409,'DUPLICATE_STAFF'); }
    await audit(env,staff,request,'staff.created','staff',staffId,{role,email});
    return json({data:{id:staffId}},201);
  }

  const staffMatch = path.match(/^staff\/([^/]+)$/);
  if (staffMatch && method === 'PATCH') {
    const denied = requirePermission(staff, 'admin'); if (denied) return denied;
    const staffId = decodeURIComponent(staffMatch[1]);
    let input; try { input = await body(request); } catch (e) { return error(e.message); }
    const entries = Object.entries(input || {}).filter(([key]) => ['name','role','active'].includes(key));
    if (!entries.length) return error('No editable staff fields supplied.');
    if (entries.some(([key,value]) => key === 'role' && !ROLES[String(value)])) return error('Invalid role.');
    if (staffId === staff.id && entries.some(([key,value]) => key === 'active' && !value)) return error('You cannot deactivate your own active account.', 409, 'SELF_DEACTIVATION_BLOCKED');
    const sets = entries.map(([key]) => `${key}=?`).join(', ');
    const values = entries.map(([,value]) => typeof value === 'boolean' ? (value ? 1 : 0) : value);
    values.push(now(), staffId);
    await env.DB.prepare(`UPDATE staff SET ${sets}, updated_at=? WHERE id=?`).bind(...values).run();
    await audit(env, staff, request, 'staff.updated', 'staff', staffId, { fields: entries.map(([key]) => key) });
    return json({ data: { id: staffId } });
  }

  // ---------- Security & administration overview ----------
  if (path === 'security/overview' && method === 'GET') {
    const denied = requirePermission(staff, 'admin'); if (denied) return denied;
    const [staffRows, auditRows] = await Promise.all([
      env.DB.prepare(`SELECT id,email,name,role,active,created_at,updated_at FROM staff ORDER BY active DESC, name`).all(),
      env.DB.prepare(`SELECT id,actor_email,action,entity_type,entity_id,metadata_json,created_at FROM audit_events ORDER BY created_at DESC LIMIT 40`).all()
    ]);
    return json({ data: {
      currentUser: { id: staff.id, email: staff.email, name: staff.name, role: staff.role, active: Boolean(staff.active) },
      staff: staffRows.results || [],
      audit: auditRows.results || [],
      providers: {
        smsConfigured: Boolean(String(env.SMS_PROVIDER_URL || '').trim() && String(env.SMS_PROVIDER_TOKEN || '').trim()),
        emailConfigured: Boolean(String(env.EMAIL_PROVIDER_URL || '').trim() && String(env.EMAIL_PROVIDER_TOKEN || '').trim()),
        webhookConfigured: Boolean(String(env.MESSAGE_WEBHOOK_SECRET || '').trim())
      },
      accessBoundary: 'Cloudflare Access',
      database: 'D1'
    } });
  }

  // ---------- Dashboard summary ----------
  if (path === 'dashboard/summary' && method === 'GET') {
    const denied=requirePermission(staff,'view'); if(denied) return denied;
    const [patients,recalls,tasks,messages,appointments,ready,high]=await Promise.all([
      env.DB.prepare(`SELECT COUNT(*) AS count FROM patients`).first(),
      env.DB.prepare(`SELECT COUNT(*) AS count FROM recalls`).first(),
      env.DB.prepare(`SELECT COUNT(*) AS count FROM tasks WHERE done=0`).first(),
      env.DB.prepare(`SELECT COUNT(*) AS count FROM messages`).first(),
      env.DB.prepare(`SELECT COUNT(*) AS count FROM appointments WHERE date(start_at)=date('now')`).first(),
      env.DB.prepare(`SELECT COUNT(*) AS count FROM recalls WHERE status IN ('Ready','Scheduled') AND date(due_date)<=date('now','+30 day')`).first(),
      env.DB.prepare(`SELECT COUNT(*) AS count FROM tasks WHERE done=0 AND priority='High'`).first()
    ]);
    return json({data:{patients:patients.count,recalls:recalls.count,openTasks:tasks.count,messages:messages.count,appointmentsToday:appointments.count,recallAttention:ready.count,highPriorityTasks:high.count}});
  }

  // ---------- Tasks ----------
  if (path === 'tasks' && method === 'GET') {
    const denied = requirePermission(staff, 'view'); if (denied) return denied;
    const result = await env.DB.prepare(`SELECT * FROM tasks ORDER BY done ASC, due_date ASC, created_at DESC LIMIT 250`).all();
    return json({ data: result.results });
  }

  if (path === 'tasks' && method === 'POST') {
    const denied = requirePermission(staff, 'create'); if (denied) return denied;
    let input; try { input = await body(request); } catch (e) { return error(e.message); }
    const title = String(input.title || '').trim();
    if (!title) return error('Task title is required.');
    const taskId = id('TSK'); const timestamp = now();
    await env.DB.prepare(`INSERT INTO tasks (id,title,owner,patient_id,due_date,priority,done,created_at,updated_at) VALUES (?,?,?,?,?,?,0,?,?)`)
      .bind(taskId, title, input.owner || staff.name, input.patientId || null, input.dueDate || null, input.priority || 'Normal', timestamp, timestamp).run();
    await audit(env, staff, request, 'task.created', 'task', taskId);
    return json({ data: { id: taskId } }, 201);
  }

  const taskMatch = path.match(/^tasks\/([^/]+)$/);
  if (taskMatch && method === 'PATCH') {
    const denied = requirePermission(staff, 'edit'); if (denied) return denied;
    const taskId = decodeURIComponent(taskMatch[1]);
    let input; try { input = await body(request); } catch (e) { return error(e.message); }
    const allowed = ['title','owner','patient_id','due_date','priority','done'];
    const entries = Object.entries(input).filter(([key]) => allowed.includes(key));
    if (!entries.length) return error('No editable task fields supplied.');
    const sets = entries.map(([key]) => `${key}=?`).join(', ');
    const values = entries.map(([, value]) => value);
    values.push(now(), taskId);
    await env.DB.prepare(`UPDATE tasks SET ${sets}, updated_at=? WHERE id=?`).bind(...values).run();
    await audit(env, staff, request, 'task.updated', 'task', taskId, { fields: entries.map(([k]) => k) });
    return json({ data: { id: taskId } });
  }

  // ---------- Recalls ----------
  if (path === 'recalls' && method === 'GET') {
    const denied = requirePermission(staff, 'view'); if (denied) return denied;
    const result = await env.DB.prepare(`SELECT r.*, p.first_name, p.last_name FROM recalls r JOIN patients p ON p.id=r.patient_id ORDER BY r.due_date ASC LIMIT 500`).all();
    return json({ data: result.results });
  }

  if (path === 'recalls' && method === 'POST') {
    const denied = requirePermission(staff, 'create'); if (denied) return denied;
    let input; try { input = await body(request); } catch (e) { return error(e.message); }
    if (!input.patientId || !input.dueDate) return error('Patient and due date are required.');
    const recallId = id('RCL'); const timestamp = now();
    await env.DB.prepare(`INSERT INTO recalls (id,patient_id,type,due_date,channel,status,source,created_at,updated_at) VALUES (?,?,?,?,?,'Scheduled',?,?,?)`)
      .bind(recallId, input.patientId, input.type || 'Annual exam', input.dueDate, input.channel || 'SMS + Email', input.source || 'Manual', timestamp, timestamp).run();
    await audit(env, staff, request, 'recall.created', 'recall', recallId);
    return json({ data: { id: recallId } }, 201);
  }

  // ---------- Recall campaign controls ----------
  if (path === 'recall-campaigns/summary' && method === 'GET') {
    const denied = requirePermission(staff, 'view'); if (denied) return denied;
    const [scheduled, ready, queued, sent, delivered, failed] = await Promise.all([
      env.DB.prepare(`SELECT COUNT(*) AS count FROM recalls WHERE status='Scheduled'`).first(),
      env.DB.prepare(`SELECT COUNT(*) AS count FROM recalls WHERE status='Ready'`).first(),
      env.DB.prepare(`SELECT COUNT(*) AS count FROM recalls WHERE status='Queued'`).first(),
      env.DB.prepare(`SELECT COUNT(*) AS count FROM messages WHERE direction='outbound' AND status='Sent'`).first(),
      env.DB.prepare(`SELECT COUNT(*) AS count FROM messages WHERE direction='outbound' AND status IN ('Delivered','Read')`).first(),
      env.DB.prepare(`SELECT COUNT(*) AS count FROM messages WHERE direction='outbound' AND status='Failed'`).first()
    ]);
    return json({ data: { scheduled: Number(scheduled?.count || 0), ready: Number(ready?.count || 0), queued: Number(queued?.count || 0), sent: Number(sent?.count || 0), delivered: Number(delivered?.count || 0), failed: Number(failed?.count || 0), providerReady: Boolean((String(env.SMS_PROVIDER_URL || '').trim() && String(env.SMS_PROVIDER_TOKEN || '').trim()) || (String(env.EMAIL_PROVIDER_URL || '').trim() && String(env.EMAIL_PROVIDER_TOKEN || '').trim())) } });
  }

  if (path === 'recall-campaigns/queue' && method === 'POST') {
    const denied = requirePermission(staff, 'edit'); if (denied) return denied;
    let input; try { input = await body(request); } catch (e) { return error(e.message); }
    const ids = Array.isArray(input.ids) ? input.ids.map(x => String(x)).filter(Boolean).slice(0, 250) : [];
    let rows;
    if (ids.length) {
      const placeholders = ids.map(() => '?').join(',');
      rows = await env.DB.prepare(`SELECT id FROM recalls WHERE status='Ready' AND id IN (${placeholders})`).bind(...ids).all();
    } else rows = await env.DB.prepare(`SELECT id FROM recalls WHERE status='Ready' ORDER BY due_date ASC LIMIT 250`).all();
    const timestamp = now(); let queuedCount = 0;
    for (const row of rows.results || []) {
      const result = await env.DB.prepare(`UPDATE recalls SET status='Queued', updated_at=? WHERE id=? AND status='Ready'`).bind(timestamp, row.id).run();
      if (result.meta?.changes) {
        await env.DB.prepare(`INSERT INTO recall_events (id,recall_id,event_type,status,created_at) VALUES (?,?,?,?,?)`).bind(id('RCLE'), row.id, 'campaign_queued', 'Queued', timestamp).run();
        queuedCount += 1;
      }
    }
    await audit(env, staff, request, 'recall.campaign_queued', 'recall_campaign', null, { count: queuedCount, requestedIds: ids.length ? ids : 'all_ready' });
    return json({ data: { queued: queuedCount } }, 202);
  }

  const retryMessage = path.match(/^messages\/([^/]+)\/retry$/);
  if (retryMessage && method === 'POST') {
    const denied = requirePermission(staff, 'edit'); if (denied) return denied;
    const messageId = decodeURIComponent(retryMessage[1]);
    const message = await env.DB.prepare(`SELECT m.*, cp.sms_opt_in, cp.email_opt_in FROM messages m LEFT JOIN communication_preferences cp ON cp.patient_id=m.patient_id WHERE m.id=?`).bind(messageId).first();
    if (!message) return error('Message not found.', 404, 'NOT_FOUND');
    if (message.status !== 'Failed') return error('Only failed messages can be retried.', 409, 'INVALID_MESSAGE_STATE');
    const optedOut = message.channel === 'Email' ? message.email_opt_in === 0 : message.sms_opt_in === 0;
    if (optedOut) return error(`Patient has opted out of ${message.channel} communication.`, 409, 'COMMUNICATION_OPT_OUT');
    const latest = await env.DB.prepare(`SELECT MAX(attempt_no) AS attempt_no FROM message_attempts WHERE message_id=?`).bind(messageId).first();
    const attemptNo = Number(latest?.attempt_no || 0) + 1; const timestamp = now();
    await env.DB.batch([
      env.DB.prepare(`UPDATE messages SET status='Queued', updated_at=? WHERE id=?`).bind(timestamp, messageId),
      env.DB.prepare(`INSERT INTO message_attempts (id,message_id,attempt_no,state,created_at,updated_at) VALUES (?,?,?,?,?,?)`).bind(id('MAT'), messageId, attemptNo, 'Queued', timestamp, timestamp)
    ]);
    await audit(env, staff, request, 'message.retry_queued', 'message', messageId, { attemptNo });
    return json({ data: { id: messageId, status: 'Queued', attemptNo } }, 202);
  }

  // Sending is deliberately a queue operation. Provider credentials are never accepted from the browser.
  const recallSend = path.match(/^recalls\/([^/]+)\/send$/);
  if (recallSend && method === 'POST') {
    const denied = requirePermission(staff, 'edit'); if (denied) return denied;
    const recallId = decodeURIComponent(recallSend[1]);
    const recall = await env.DB.prepare(`SELECT * FROM recalls WHERE id=?`).bind(recallId).first();
    if (!recall) return error('Recall not found.', 404, 'NOT_FOUND');
    await env.DB.prepare(`INSERT INTO recall_events (id,recall_id,event_type,status,created_at) VALUES (?,?,?,'Queued',?)`)
      .bind(id('RCLE'), recallId, 'send_requested', now()).run();
    await env.DB.prepare(`UPDATE recalls SET status='Queued', updated_at=? WHERE id=?`).bind(now(), recallId).run();
    await audit(env, staff, request, 'recall.send_queued', 'recall', recallId);
    return json({ data: { id: recallId, status: 'Queued' } }, 202);
  }

  // ---------- Communication preferences ----------
  const prefMatch = path.match(/^patients\/([^/]+)\/communication-preferences$/);
  if (prefMatch && method === 'GET') {
    const denied = requirePermission(staff, 'view'); if (denied) return denied;
    const patientId = decodeURIComponent(prefMatch[1]);
    const result = await env.DB.prepare(`SELECT patient_id,sms_opt_in,email_opt_in,consent_source,updated_at FROM communication_preferences WHERE patient_id=?`).bind(patientId).first();
    return json({ data: result || { patient_id: patientId, sms_opt_in: null, email_opt_in: null, consent_source: null, updated_at: null } });
  }
  if (prefMatch && method === 'PATCH') {
    const denied = requirePermission(staff, 'edit'); if (denied) return denied;
    const patientId = decodeURIComponent(prefMatch[1]);
    let input; try { input = await body(request); } catch (e) { return error(e.message); }
    const sms = input.smsOptIn === null || input.smsOptIn === undefined ? null : (input.smsOptIn ? 1 : 0);
    const email = input.emailOptIn === null || input.emailOptIn === undefined ? null : (input.emailOptIn ? 1 : 0);
    const source = String(input.consentSource || 'Staff updated').slice(0,120);
    const timestamp = now();
    await env.DB.prepare(`INSERT INTO communication_preferences (patient_id,sms_opt_in,email_opt_in,consent_source,updated_at) VALUES (?,?,?,?,?) ON CONFLICT(patient_id) DO UPDATE SET sms_opt_in=excluded.sms_opt_in,email_opt_in=excluded.email_opt_in,consent_source=excluded.consent_source,updated_at=excluded.updated_at`)
      .bind(patientId,sms,email,source,timestamp).run();
    await audit(env,staff,request,'patient.communication_preferences.updated','patient',patientId,{smsOptIn:sms,emailOptIn:email});
    return json({ data: { patientId, smsOptIn: sms, emailOptIn: email, consentSource: source } });
  }

  // ---------- Messages ----------
  if (path === 'conversations' && method === 'GET') {
    const denied = requirePermission(staff, 'view'); if (denied) return denied;
    const result = await env.DB.prepare(`SELECT m.*, p.first_name, p.last_name FROM messages m JOIN patients p ON p.id=m.patient_id ORDER BY m.created_at DESC LIMIT 500`).all();
    return json({ data: result.results });
  }

  if (path === 'messages' && method === 'POST') {
    const denied = requirePermission(staff, 'create'); if (denied) return denied;
    let input; try { input = await body(request); } catch (e) { return error(e.message); }
    const text = String(input.text || '').trim();
    if (!input.patientId || !text) return error('Patient and message text are required.');
    const pref = await env.DB.prepare(`SELECT sms_opt_in,email_opt_in FROM communication_preferences WHERE patient_id=?`).bind(input.patientId).first();
    const requestedChannel = input.channel || 'SMS';
    if (pref && ((requestedChannel === 'SMS' && pref.sms_opt_in === 0) || (requestedChannel === 'Email' && pref.email_opt_in === 0))) {
      return error(`Patient has opted out of ${requestedChannel} communication.`, 409, 'COMMUNICATION_OPT_OUT');
    }
    const messageId = id('MSG'); const timestamp = now();
    await env.DB.prepare(`INSERT INTO messages (id,patient_id,channel,direction,body,status,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?, ?,?)`)
      .bind(messageId, input.patientId, requestedChannel, 'outbound', text, 'Queued', staff.id, timestamp, timestamp).run();
    await env.DB.prepare(`INSERT INTO message_attempts (id,message_id,attempt_no,state,created_at,updated_at) VALUES (?,?,?,?,?,?)`).bind(id('MAT'),messageId,1,'Queued',timestamp,timestamp).run();
    await audit(env, staff, request, 'message.queued', 'message', messageId, { channel: requestedChannel });
    return json({ data: { id: messageId, status: 'Queued' } }, 202);
  }

  // ---------- Appointments ----------
  if (path === 'appointments' && method === 'GET') {
    const denied = requirePermission(staff, 'view'); if (denied) return denied;
    const result = await env.DB.prepare(`SELECT a.*, p.first_name, p.last_name FROM appointments a JOIN patients p ON p.id=a.patient_id ORDER BY a.start_at ASC LIMIT 500`).all();
    return json({ data: result.results });
  }

  if (path === 'appointments' && method === 'POST') {
    const denied = requirePermission(staff, 'create'); if (denied) return denied;
    let input; try { input = await body(request); } catch (e) { return error(e.message); }
    if (!input.patientId || !input.startAt) return error('Patient and start time are required.');
    const appointmentId = id('APT'); const timestamp = now();
    await env.DB.prepare(`INSERT INTO appointments (id,patient_id,start_at,end_at,visit_type,provider,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?, ?,?)`)
      .bind(appointmentId, input.patientId, input.startAt, input.endAt || null, input.visitType || 'Eye examination', input.provider || staff.name, 'Pending', timestamp, timestamp).run();
    await audit(env, staff, request, 'appointment.created', 'appointment', appointmentId);
    return json({ data: { id: appointmentId } }, 201);
  }

  // ---------- Reports ----------
  if (path === 'reports/practice-performance' && method === 'GET') {
    const denied = requirePermission(staff, 'view'); if (denied) return denied;
    const [patients, recalls, tasks, messages, appointments] = await Promise.all([
      env.DB.prepare(`SELECT COUNT(*) AS count FROM patients`).first(),
      env.DB.prepare(`SELECT COUNT(*) AS count FROM recalls WHERE status IN ('Ready','Queued','Scheduled')`).first(),
      env.DB.prepare(`SELECT COUNT(*) AS count FROM tasks WHERE done=0`).first(),
      env.DB.prepare(`SELECT COUNT(*) AS count FROM messages WHERE created_at >= datetime('now','-30 day')`).first(),
      env.DB.prepare(`SELECT COUNT(*) AS count FROM appointments WHERE start_at >= datetime('now','-30 day')`).first(),
    ]);
    return json({ data: { patients: patients.count, recallReady: recalls.count, openTasks: tasks.count, messages30d: messages.count, appointments30d: appointments.count } });
  }

  // ---------- Audit ----------
  if (path === 'audit' && method === 'GET') {
    const denied = requirePermission(staff, 'admin'); if (denied) return denied;
    const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 250), 1), 500);
    const action = (url.searchParams.get('action') || '').trim();
    const actor = (url.searchParams.get('actor') || '').trim().toLowerCase();
    let result;
    if (action && actor) result = await env.DB.prepare(`SELECT id,actor_email,action,entity_type,entity_id,metadata_json,created_at FROM audit_events WHERE action LIKE ? AND lower(actor_email) LIKE ? ORDER BY created_at DESC LIMIT ${limit}`).bind(`%${action}%`, `%${actor}%`).all();
    else if (action) result = await env.DB.prepare(`SELECT id,actor_email,action,entity_type,entity_id,metadata_json,created_at FROM audit_events WHERE action LIKE ? ORDER BY created_at DESC LIMIT ${limit}`).bind(`%${action}%`).all();
    else if (actor) result = await env.DB.prepare(`SELECT id,actor_email,action,entity_type,entity_id,metadata_json,created_at FROM audit_events WHERE lower(actor_email) LIKE ? ORDER BY created_at DESC LIMIT ${limit}`).bind(`%${actor}%`).all();
    else result = await env.DB.prepare(`SELECT id,actor_email,action,entity_type,entity_id,metadata_json,created_at FROM audit_events ORDER BY created_at DESC LIMIT ${limit}`).all();
    return json({ data: result.results || [] });
  }

  return error('API route not found.', 404, 'NOT_FOUND');
}

export default {
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(runRecallAutomation(env));
  },
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) return api(request, env, ctx);

    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) headers.set(key, value);
    headers.set('X-Robots-Tag', 'noindex, nofollow');
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  },
};
