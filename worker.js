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

function allowedOrigin(request) {
  const origin = request.headers.get('Origin');
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}

async function requireIdentity(request, env, ctx) {
  // Cloudflare Access is the production authentication boundary.
  // The Worker trusts identity only when Access has authenticated the request.
  if (!ctx.access) return { response: error('Authentication required.', 401, 'AUTH_REQUIRED') };
  const identity = await ctx.access.getIdentity();
  const email = String(identity?.email || '').trim().toLowerCase();
  if (!email) return { response: error('Authenticated identity is missing an email.', 401, 'IDENTITY_MISSING') };

  let staff = await env.DB.prepare(
    `SELECT id, email, name, role, active FROM staff WHERE lower(email)=? LIMIT 1`
  ).bind(email).first();

  // One-time bootstrap: only the exact configured admin email can become the first manager.
  if (!staff && env.BOOTSTRAP_ADMIN_EMAIL && email === String(env.BOOTSTRAP_ADMIN_EMAIL).trim().toLowerCase()) {
    const staffId = id('USR');
    await env.DB.prepare(
      `INSERT INTO staff (id,email,name,role,active,created_at,updated_at) VALUES (?,?,?,?,1,?,?)`
    ).bind(staffId, email, identity?.name || email, 'Practice Manager', now(), now()).run();
    staff = { id: staffId, email, name: identity?.name || email, role: 'Practice Manager', active: 1 };
  }

  if (!staff || !staff.active) return { response: error('Your account is not authorized for OptiFlow.', 403, 'NOT_AUTHORIZED') };
  return { identity, staff };
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

async function api(request, env, ctx) {
  if (!env.DB) return error('Production database is not configured.', 503, 'DB_NOT_CONFIGURED');
  if (!allowedOrigin(request)) return error('Cross-origin request blocked.', 403, 'ORIGIN_BLOCKED');

  const auth = await requireIdentity(request, env, ctx);
  if (auth.response) return auth.response;
  const { staff } = auth;

  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/?/, '').replace(/\/$/, '');
  const method = request.method.toUpperCase();

  // Health is intentionally authenticated because it reveals deployment state.
  if (path === 'health' && method === 'GET') {
    return json({ ok: true, service: 'optiflow-api', user: staff.email, role: staff.role });
  }

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
    await env.DB.prepare(`INSERT INTO patients (id,first_name,last_name,date_of_birth,phone,email,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)`)
      .bind(patientId, first, last, input.dateOfBirth || null, input.phone || null, input.email || null, 'Active', timestamp, timestamp).run();
    await audit(env, staff, request, 'patient.created', 'patient', patientId, { fields: ['first_name','last_name','date_of_birth','phone','email'] });
    return json({ data: { id: patientId } }, 201);
  }

  const patientMatch = path.match(/^patients\/([^/]+)$/);
  if (patientMatch && method === 'GET') {
    const denied = requirePermission(staff, 'view'); if (denied) return denied;
    const patientId = decodeURIComponent(patientMatch[1]);
    const patient = await env.DB.prepare(`SELECT * FROM patients WHERE id=?`).bind(patientId).first();
    if (!patient) return error('Patient not found.', 404, 'NOT_FOUND');
    const [insurance, prescriptions, history, allergies, medications] = await Promise.all([
      env.DB.prepare(`SELECT * FROM insurance_policies WHERE patient_id=? ORDER BY created_at DESC`).bind(patientId).all(),
      env.DB.prepare(`SELECT * FROM prescriptions WHERE patient_id=? ORDER BY prescribed_at DESC`).bind(patientId).all(),
      env.DB.prepare(`SELECT * FROM medical_history WHERE patient_id=? ORDER BY event_date DESC, created_at DESC`).bind(patientId).all(),
      env.DB.prepare(`SELECT * FROM allergies WHERE patient_id=? ORDER BY created_at DESC`).bind(patientId).all(),
      env.DB.prepare(`SELECT * FROM medications WHERE patient_id=? ORDER BY created_at DESC`).bind(patientId).all(),
    ]);
    await audit(env, staff, request, 'patient.viewed', 'patient', patientId);
    return json({ data: { patient, insurance: insurance.results, prescriptions: prescriptions.results, history: history.results, allergies: allergies.results, medications: medications.results } });
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
    const messageId = id('MSG'); const timestamp = now();
    await env.DB.prepare(`INSERT INTO messages (id,patient_id,channel,direction,body,status,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?, ?,?)`)
      .bind(messageId, input.patientId, input.channel || 'SMS', 'outbound', text, 'Queued', staff.id, timestamp, timestamp).run();
    await audit(env, staff, request, 'message.queued', 'message', messageId, { channel: input.channel || 'SMS' });
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
    const result = await env.DB.prepare(`SELECT id,actor_email,action,entity_type,entity_id,metadata_json,created_at FROM audit_events ORDER BY created_at DESC LIMIT 250`).all();
    return json({ data: result.results });
  }

  return error('API route not found.', 404, 'NOT_FOUND');
}

export default {
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
