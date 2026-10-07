const seed={
 user:{name:'Dr. Maya Bennett',role:'Practice Manager',initials:'MB'},
 patients:[
  {id:'P-10482',name:'Amelia Carter',dob:'14 Mar 1989',phone:'+1 (404) 555-0182',email:'amelia.carter@email.com',insurance:'VSP Vision Care',policy:'VSP-883041',status:'Active',lastVisit:'04 Sep 2026',nextRecall:'04 Sep 2027',rx:{od:'-2.25 -0.75 × 090',os:'-2.00 -0.50 × 085',add:'+1.25'},notes:'Dry eye symptoms reported. Prefers daily disposable lenses.'},
  {id:'P-10477',name:'Marcus Johnson',dob:'22 Nov 1977',phone:'+1 (404) 555-0144',email:'marcus.j@email.com',insurance:'EyeMed',policy:'EM-221093',status:'Recall due',lastVisit:'18 Sep 2025',nextRecall:'18 Sep 2026',rx:{od:'-1.00 -0.50 × 170',os:'-0.75 -0.25 × 010',add:'+2.00'},notes:'Progressive wearer. Family history of glaucoma.'},
  {id:'P-10463',name:'Sofia Williams',dob:'06 Jul 1994',phone:'+1 (404) 555-0198',email:'sofia.w@email.com',insurance:'Blue View Vision',policy:'BV-770182',status:'Active',lastVisit:'28 Aug 2026',nextRecall:'28 Aug 2027',rx:{od:'Plano -0.50 × 180',os:'+0.25 -0.25 × 175',add:'—'},notes:'Contact lens wearer. No current concerns.'},
  {id:'P-10421',name:'Daniel Kim',dob:'31 Jan 1968',phone:'+1 (404) 555-0121',email:'daniel.kim@email.com',insurance:'Medicare',policy:'MC-482910',status:'Recall due',lastVisit:'12 Sep 2025',nextRecall:'12 Sep 2026',rx:{od:'+1.75 -1.00 × 090',os:'+2.00 -0.75 × 095',add:'+2.50'},notes:'Cataract monitoring. Referred to ophthalmology if progression.'},
  {id:'P-10398',name:'Olivia Thompson',dob:'19 May 2002',phone:'+1 (404) 555-0167',email:'olivia.t@email.com',insurance:'Aetna Vision',policy:'AV-550731',status:'Active',lastVisit:'21 Aug 2026',nextRecall:'21 Aug 2027',rx:{od:'-3.50 -0.25 × 120',os:'-3.25 -0.50 × 060',add:'—'},notes:'High myopia. Discussed myopia management.'}
 ],
 tasks:[
  {id:1,title:'Verify insurance for Marcus Johnson',owner:'Sarah L.',due:'Today',priority:'High',done:false},
  {id:2,title:'Review abnormal OCT referral — Daniel Kim',owner:'Dr. Bennett',due:'Today',priority:'High',done:false},
  {id:3,title:'Call Amelia Carter about lens order',owner:'Jordan P.',due:'Tomorrow',priority:'Normal',done:false},
  {id:4,title:'Prepare monthly recall campaign',owner:'Sarah L.',due:'Oct 8',priority:'Normal',done:true},
  {id:5,title:'Update staff emergency contacts',owner:'Jordan P.',due:'Oct 9',priority:'Low',done:false}
 ],
 recalls:[
  {id:1,patient:'Marcus Johnson',type:'Annual exam',due:'Today',channel:'SMS + Email',status:'Ready'},
  {id:2,patient:'Daniel Kim',type:'Annual exam',due:'Today',channel:'SMS + Email',status:'Ready'},
  {id:3,patient:'Liam Brown',type:'Annual exam',due:'Tomorrow',channel:'Email',status:'Scheduled'},
  {id:4,patient:'Emma Davis',type:'Contact lens review',due:'Oct 10',channel:'SMS',status:'Scheduled'},
  {id:5,patient:'Noah Wilson',type:'Annual exam',due:'Oct 12',channel:'SMS + Email',status:'Scheduled'}
 ],
 messages:[
  {patient:'Amelia Carter',time:'Today, 2:18 PM',text:'Hi Amelia, your new contact lenses have arrived. We can hold them for you at reception.',mine:false,channel:'SMS'},
  {patient:'Amelia Carter',time:'Today, 2:24 PM',text:'Perfect, thank you! I will come by tomorrow.',mine:true,channel:'SMS'},
  {patient:'Marcus Johnson',time:'Yesterday, 10:04 AM',text:'Your annual eye exam is due. Reply to this message or call us to schedule.',mine:false,channel:'SMS'}
 ],
 appointments:[
  {id:1,time:'09:00 AM',patient:'Amelia Carter',visit:'Comprehensive eye exam',provider:'Dr. Bennett',status:'Checked in'},
  {id:2,time:'10:30 AM',patient:'Marcus Johnson',visit:'Annual eye exam',provider:'Dr. Bennett',status:'Confirmed'},
  {id:3,time:'11:15 AM',patient:'Sofia Williams',visit:'Contact lens review',provider:'Dr. Bennett',status:'Confirmed'},
  {id:4,time:'02:00 PM',patient:'Daniel Kim',visit:'Clinical follow-up',provider:'Dr. Bennett',status:'Pending'},
  {id:5,time:'03:30 PM',patient:'Olivia Thompson',visit:'Myopia management review',provider:'Dr. Bennett',status:'Confirmed'}
 ],
 activity:[
  {icon:'✓',title:'Recall campaign sent',detail:'18 patients contacted via SMS + email',time:'10m'},
  {icon:'✉',title:'Message received',detail:'Amelia Carter replied to SMS',time:'36m'},
  {icon:'♙',title:'Patient record updated',detail:'Sofia Williams — prescription renewed',time:'1h'},
  {icon:'◷',title:'Appointment pending',detail:'Daniel Kim — confirmation required',time:'1h'}
 ]
};
let state=JSON.parse(localStorage.getItem('optiflow_state')||'null')||seed;
function migrateState(){
 state.user=state.user||seed.user;
 state.patients=Array.isArray(state.patients)?state.patients:[];
 state.tasks=Array.isArray(state.tasks)?state.tasks:[];
 state.recalls=Array.isArray(state.recalls)?state.recalls:[];
 state.messages=Array.isArray(state.messages)?state.messages:[];
 state.appointments=Array.isArray(state.appointments)?state.appointments:[];
 state.activity=Array.isArray(state.activity)?state.activity:[];
 state.settings=state.settings||{};
 state.staff=Array.isArray(state.staff)?state.staff:[];
 state.audit=Array.isArray(state.audit)?state.audit:[];
 state.patients.forEach(p=>{
  p.rx=p.rx||{od:'—',os:'—',add:'—'};
  p.notes=p.notes||'';
  p.medicalHistory=Array.isArray(p.medicalHistory)?p.medicalHistory:[];
  p.allergies=Array.isArray(p.allergies)?p.allergies:[];
  p.medications=Array.isArray(p.medications)?p.medications:[];
  p.prescriptions=Array.isArray(p.prescriptions)?p.prescriptions:[];
  p.insuranceDetails=p.insuranceDetails||{provider:p.insurance||'Self-pay',policy:p.policy||'—',memberId:p.policy||'—',status:'Verified'};
  p.communication=p.communication||{sms:true,email:true,preferred:'SMS'};
  p.timeline=Array.isArray(p.timeline)?p.timeline:[];
 });
}
migrateState();
const validPages=['dashboard','patients','recalls','messages','tasks','calendar','settings','reports'];
const savedRoute=location.hash.replace(/^#/,'');
let current=validPages.includes(savedRoute)?savedRoute:(savedRoute.startsWith('patient=')?'patients':'dashboard');
let selectedPatient=null, search='';
if(savedRoute.startsWith('patient=')){const pid=decodeURIComponent(savedRoute.slice(8));selectedPatient=state.patients.find(p=>p.id===pid)||null;}
window.addEventListener('hashchange',()=>{const h=location.hash.replace(/^#/,'');if(validPages.includes(h)){current=h;selectedPatient=null;render();}else if(h.startsWith('patient=')){const pid=decodeURIComponent(h.slice(8));selectedPatient=state.patients.find(p=>p.id===pid)||null;current='patients';render();}});
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const save=()=>localStorage.setItem('optiflow_state',JSON.stringify(state));
let backend={status:'checking',message:'Connecting to secure practice records…'};
async function apiRequest(path, options={}){
 const res=await fetch('/api/'+path,{credentials:'same-origin',headers:{'content-type':'application/json',...(options.headers||{})},...options});
 let payload={}; try{payload=await res.json()}catch{}
 if(!res.ok) throw new Error(payload?.error?.message||('API request failed ('+res.status+')'));
 return payload;
}
function dbPatient(row){
 const name=[row.first_name,row.last_name].filter(Boolean).join(' ');
 return {id:row.id,name,dob:row.date_of_birth||'Not provided',phone:row.phone||'—',email:row.email||'—',insurance:'Self-pay',policy:'—',status:row.status||'Active',lastVisit:'—',nextRecall:'Not set',rx:{od:'—',os:'—',add:'—'},notes:'',medicalHistory:[],allergies:[],medications:[],prescriptions:[],insuranceDetails:{provider:'Self-pay',policy:'—',memberId:'—',status:'Pending'},communication:{sms:null,email:null,preferred:'SMS'},timeline:[]};
}
function dbRecall(row){return {id:row.id,patient:[row.first_name,row.last_name].filter(Boolean).join(' '),patientId:row.patient_id,type:row.type,due:row.due_date||'—',channel:row.channel||'SMS + Email',status:row.status||'Scheduled'};}
function dbTask(row){return {id:row.id,title:row.title,owner:row.owner||'Unassigned',patientId:row.patient_id||null,due:row.due_date||'—',priority:row.priority||'Normal',done:!!row.done};}
function dbMessage(row){return {id:row.id,patientId:row.patient_id,patient:[row.first_name,row.last_name].filter(Boolean).join(' '),time:row.created_at,text:row.body,mine:row.direction==='outbound',channel:row.channel,status:row.status};}
function dbAppointment(row){return {id:row.id,patientId:row.patient_id,patient:[row.first_name,row.last_name].filter(Boolean).join(' '),time:row.start_at,visit:row.visit_type,provider:row.provider||'—',status:row.status,date:row.start_at};}
async function refreshRecallCampaign(){if(!state.backendConnected)return;try{state.recallCampaign=(await apiRequest('recall-campaigns/summary')).data||null;render();}catch(e){toast(e.message);}}
async function queueReadyRecalls(){if(!state.backendConnected){toast('Connect secure records first');return;}try{const res=await apiRequest('recall-campaigns/queue',{method:'POST',body:JSON.stringify({})});toast((res.data?.queued||0)+' recall'+((res.data?.queued||0)===1?'':'s')+' queued for delivery');await syncBackend();}catch(e){toast(e.message);}}
async function retryMessage(id){if(!state.backendConnected)return toast('Connect secure records first');try{await apiRequest('messages/'+encodeURIComponent(id)+'/retry',{method:'POST'});toast('Message queued for retry');await syncBackend();}catch(e){toast(e.message);}}
async function syncBackend(){
 try{
  const health=await apiRequest('health');
  if(!health.authorized){
   state.backendConnected=false;
   const msg=health.bootstrapConfigured
    ? (health.bootstrapMatches?'OptiFlow is provisioning your manager account — retry in a moment.':'Access is authenticated, but this account is not provisioned for OptiFlow.')
    : 'Access is authenticated, but the Worker bootstrap secret is not configured.';
   backend={status:'offline',message:msg};
   render();
   return;
  }
  const baseCalls=[apiRequest('patients'),apiRequest('recalls'),apiRequest('tasks'),apiRequest('conversations'),apiRequest('appointments'),apiRequest('settings'),apiRequest('dashboard/summary'),apiRequest('recall-campaigns/summary')];
  if(health.role==='Practice Manager') baseCalls.push(apiRequest('staff'),apiRequest('audit?limit=100'));
  const results=await Promise.all(baseCalls);
  const [ps,rs,ts,ms,as,ss,ds,rc]=results;
  state.patients=(ps.data||[]).map(dbPatient);
  state.recalls=(rs.data||[]).map(dbRecall);
  state.tasks=(ts.data||[]).map(dbTask);
  state.messages=(ms.data||[]).map(dbMessage);
  state.appointments=(as.data||[]).map(dbAppointment);
  if(ss?.data&&Object.keys(ss.data).length){state.settings=Object.assign({},state.settings||{},ss.data);}
  state.dashboardSummary=ds?.data||null; state.recallCampaign=rc?.data||null;
  if(health.role==='Practice Manager'){state.staff=results[8]?.data||[];state.audit=results[9]?.data||[];}
  state.user.role=health.role||state.user.role;
  state.backendConnected=true;
  backend={status:'connected',message:'Secure records connected'};
  if(selectedPatient) selectedPatient=state.patients.find(p=>p.id===selectedPatient.id)||null;
  render();
 }catch(e){
  state.backendConnected=false;
  const detail=String(e?.message||'Connection failed').replace(/\s+/g,' ').slice(0,120);
  backend={status:'offline',message:'Secure records unavailable — '+detail};
  render();
 }
}
window.syncBackend=syncBackend;
const initials=n=>n.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();
const todayLabel=()=>new Intl.DateTimeFormat(undefined,{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date());
const toast=m=>{const x=document.createElement('div');x.className='toast';x.textContent=m;document.body.appendChild(x);setTimeout(()=>x.remove(),2400)};
const permissionMap={
 'Practice Manager':{view:true,create:true,edit:true,export:true,admin:true},
 'Provider':{view:true,create:true,edit:true,export:true,admin:false},
 'Front Desk':{view:true,create:true,edit:true,export:false,admin:false},
 'Viewer':{view:true,create:false,edit:false,export:false,admin:false}
};
function can(action){return !!(permissionMap[state.user?.role||'Viewer']||permissionMap.Viewer)[action]}
function resetDemoData(){localStorage.removeItem('optiflow_state');location.hash='dashboard';location.reload();}
window.resetDemoData=resetDemoData;

function nav(){return `<aside class="sidebar"><div class="brand"><div class="logo">◉</div><div><strong>OptiFlow</strong><small>Practice Management</small></div></div><div class="nav-title">Workspace</div><div class="nav">${[['dashboard','▦','Dashboard'],['patients','♙','Patients'],['recalls','◷','Recalls'],['messages','✉','Messages'],['tasks','✓','Tasks'],['calendar','□','Calendar']].map(x=>`<button class="${current===x[0]?'active':''}" onclick="window.go('${x[0]}')"><span class="ico">${x[1]}</span>${x[2]}</button>`).join('')}</div><div class="nav-title">Practice</div><div class="nav"><button class="${current==='settings'?'active':''}" onclick="window.go('settings')"><span class="ico">⚙</span>Settings</button><button class="${current==='reports'?'active':''}" onclick="window.go('reports')"><span class="ico">▥</span>Reports</button></div><div class="sidebar-foot"><div class="user-mini"><div class="avatar">${state.user.initials}</div><div><strong>${state.user.name}</strong><span>${state.user.role}</span></div></div></div></aside>`}
function topbar(){return `<header class="topbar"><div class="crumb">OptiFlow / <strong>${current[0].toUpperCase()+current.slice(1)}</strong></div><div class="top-actions"><span class="backend-pill ${backend.status==='connected'?'connected':'offline'}" title="${esc(backend.message)}"><i></i>${esc(backend.message)}${backend.status!=='connected'?'<button class="backend-retry" onclick="syncBackend()">Retry</button>':''}</span><button class="icon-btn" onclick="toast('No new notifications')">♢</button><span class="role">${state.user.role}</span><div class="avatar">${state.user.initials}</div></div></header>`}
function layout(body){return `<div class="app">${nav()}<main class="main">${topbar()}<section class="content">${body}</section></main><nav class="mobile-nav">${[['dashboard','▦','Home'],['patients','♙','Patients'],['recalls','◷','Recalls'],['messages','✉','Messages'],['tasks','✓','Tasks'],['calendar','□','Calendar']].map(x=>`<button class="${current===x[0]?'active':''}" onclick="go('${x[0]}')"><span>${x[1]}</span>${x[2]}</button>`).join('')}</nav></div>`}
function patientRows(list){return list.map(p=>`<tr onclick="openPatient('${p.id}')" style="cursor:pointer"><td><div class="patient-cell"><div class="avatar">${initials(p.name)}</div><div><strong>${esc(p.name)}</strong><span>${p.id}</span></div></div></td><td>${p.dob}</td><td>${p.phone}</td><td>${esc(p.insurance)}</td><td><span class="badge ${p.status==='Active'?'green':'amber'}">${p.status}</span></td><td>${p.nextRecall}</td></tr>`).join('')}
function intelligencePanel(){
 let overdue=state.patients.filter(p=>p.status==='Recall due').length;
 let high=state.tasks.filter(t=>!t.done&&t.priority==='High').length;
 let pending=(state.appointments||[]).filter(a=>a.status==='Pending').length;
 let headline=overdue>=2?'Recall attention is the biggest risk today.':high>=2?'Two high-priority tasks need attention today.':'The practice is operating normally today.';
 let detail=overdue>=2?overdue+' patients have recalls requiring staff attention. Review them before the end of the day.':pending?pending+' appointment needs confirmation.':'No immediate operational risks detected.';
 return '<div class="intelligence card"><div class="intel-icon">✦</div><div class="intel-copy"><div class="intel-label">OPTIFLOW INTELLIGENCE</div><strong>'+headline+'</strong><p>'+detail+'</p></div><div class="intel-actions"><button class="btn" onclick="go(\'recalls\')">Review insight</button></div></div>';
}
function appointmentStatus(status){return status==='Checked in'?'green':status==='Pending'?'amber':'blue'}
function appointmentDateValue(a){const d=new Date(a.date||a.time);return isNaN(d)?null:d;}
function appointmentTime(a){const d=appointmentDateValue(a);return d?new Intl.DateTimeFormat(undefined,{hour:'2-digit',minute:'2-digit'}).format(d):String(a.time||'');}
function appointmentsToday(){
 const today=new Date(); today.setHours(0,0,0,0); const tomorrow=new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
 const list=(state.appointments||[]).filter(a=>{const d=appointmentDateValue(a);return d&&d>=today&&d<tomorrow}).sort((a,b)=>appointmentDateValue(a)-appointmentDateValue(b));
 const rows=list.length?list.slice(0,5).map(a=>{const next=a.status==='Pending'?'Confirmed':a.status==='Confirmed'?'Checked in':a.status==='Checked in'?'Completed':a.status; return `<div class="appointment-row"><div class="appt-time">${esc(appointmentTime(a))}</div><div class="appt-main"><strong>${esc(a.patient)}</strong><span>${esc(a.visit)} · ${esc(a.provider)}</span></div><button class="badge ${appointmentStatus(a.status)} appointment-status-btn" onclick="updateAppointmentStatus('${esc(a.id)}','${esc(next)}')">${esc(a.status)}</button></div>`;}).join(''):'<div class="empty">No appointments scheduled for today.</div>';
 return `<div class="card panel"><div class="panel-head"><h3>Today's appointments</h3><button class="btn" onclick="go('calendar')">View calendar</button></div><div class="appointment-list">${rows}</div></div>`;
}
function calendar(){
 const mode=window.calendarMode||'week'; const now=new Date(); const start=new Date(now); start.setHours(0,0,0,0); if(mode==='week'){const day=(start.getDay()+6)%7;start.setDate(start.getDate()-day);}
 const days=mode==='day'?1:7; const cols=[]; for(let i=0;i<days;i++){const d=new Date(start);d.setDate(start.getDate()+i);cols.push(d);}
 const events=(state.appointments||[]).slice().sort((a,b)=>(appointmentDateValue(a)||0)-(appointmentDateValue(b)||0));
 const dayHtml=cols.map(d=>{const key=d.toISOString().slice(0,10);const items=events.filter(a=>{const x=appointmentDateValue(a);return x&&x.toISOString().slice(0,10)===key});const itemHtml=items.length?items.map(a=>`<div class="calendar-event"><div><strong>${esc(appointmentTime(a))} · ${esc(a.patient)}</strong><span>${esc(a.visit)} · ${esc(a.provider)}</span></div><select onchange="updateAppointmentStatus('${esc(a.id)}',this.value)"><option ${a.status==='Pending'?'selected':''}>Pending</option><option ${a.status==='Confirmed'?'selected':''}>Confirmed</option><option ${a.status==='Checked in'?'selected':''}>Checked in</option><option ${a.status==='Completed'?'selected':''}>Completed</option><option ${a.status==='Cancelled'?'selected':''}>Cancelled</option><option ${a.status==='No-show'?'selected':''}>No-show</option></select></div>`).join(''):'<div class="calendar-empty">No visits</div>';return `<div class="calendar-day"><div class="calendar-day-head"><strong>${new Intl.DateTimeFormat(undefined,{weekday:'short'}).format(d)}</strong><span>${new Intl.DateTimeFormat(undefined,{day:'numeric',month:'short'}).format(d)}</span></div><div class="calendar-events">${itemHtml}</div></div>`;}).join('');
 return `<div class="page-head"><div><h1>Calendar</h1><p>Manage appointments, provider workload and patient visits.</p></div><div class="actions"><button class="btn ${mode==='day'?'active':''}" onclick="window.calendarMode='day';render()">Day</button><button class="btn ${mode==='week'?'active':''}" onclick="window.calendarMode='week';render()">Week</button><button class="btn primary" onclick="openModal('appointment')">+ Appointment</button></div></div><div class="card panel calendar-panel"><div class="calendar-grid calendar-${mode}">${dayHtml}</div></div>`;
}
async function updateAppointmentStatus(id,status){if(!state.backendConnected){toast('Connect secure records first');return;}try{await apiRequest('appointments/'+encodeURIComponent(id),{method:'PATCH',body:JSON.stringify({status})});toast('Appointment updated');await syncBackend();}catch(e){toast(e.message);}}
window.updateAppointmentStatus=updateAppointmentStatus;
function attentionPanel(){
 let items=[];
 state.patients.filter(p=>p.status==='Recall due').slice(0,2).forEach(p=>items.push({name:p.name,reason:'Recall due',target:'recalls'}));
 state.tasks.filter(t=>!t.done&&t.priority==='High').slice(0,2).forEach(t=>items.push({name:t.title,reason:'High-priority task',target:'tasks'}));
 return '<div class="card panel"><div class="panel-head"><h3>Attention required</h3><span>'+items.length+' items</span></div><div class="attention-list">'+(items.length?items.slice(0,4).map(i=>'<div class="attention-row"><div class="attention-dot">!</div><div><strong>'+esc(i.name)+'</strong><p>'+esc(i.reason)+'</p></div><button class="btn" onclick="go(\''+i.target+'\')">Review</button></div>').join(''):'<div class="empty">No urgent items right now.</div>')+'</div></div>';
}
function dashboard(){
 let due=state.recalls.filter(x=>x.status==='Ready'||x.status==='Scheduled').length;
 let openTasks=state.tasks.filter(t=>!t.done).length;
 let messageCount=state.messages.length;
 let deliveredCount=state.messages.filter(m=>['Delivered','Sent','Read'].includes(m.status)).length;
 let queuedCount=state.messages.filter(m=>m.status==='Queued').length;
 let recallQueued=state.recalls.filter(r=>['Queued','Ready'].includes(r.status)).length;
 let recallBooked=state.appointments.filter(a=>/book|confirmed|checked in/i.test(a.status||'')).length;
 return '<div class="page-head"><div><h1>Good evening, Dr. Bennett</h1><p>'+todayLabel()+' · Here is what needs your attention today.</p></div><div class="actions"><button class="btn" onclick="openModal(\'appointment\')">Schedule appointment</button><button class="btn" onclick="openModal(\'schedule\')">+ Schedule recall</button><button class="btn primary" onclick="openModal(\'patient\')">+ New patient</button></div></div>'+intelligencePanel()+'<div class="grid stats"><div class="card stat"><div class="stat-top">Patients <div class="stat-icon">♙</div></div><h2>'+state.patients.length+'</h2><p><span class="positive">+12%</span> vs last month</p></div><div class="card stat"><div class="stat-top">Recalls due <div class="stat-icon">◷</div></div><h2>'+due+'</h2><p><span class="negative">'+state.recalls.filter(x=>x.status==='Ready').length+' ready</span> for outreach</p></div><div class="card stat"><div class="stat-top">Messages <div class="stat-icon">✉</div></div><h2>'+messageCount+'</h2><p><span class="positive">'+deliveredCount+' delivered</span> · '+queuedCount+' pending</p></div><div class="card stat"><div class="stat-top">Open tasks <div class="stat-icon">✓</div></div><h2>'+openTasks+'</h2><p><span class="negative">'+state.tasks.filter(t=>!t.done&&t.priority==='High').length+' high priority</span></p></div></div><div class="grid two" style="margin-top:16px">'+appointmentsToday()+attentionPanel()+'</div><div class="grid two" style="margin-top:16px"><div class="card panel"><div class="panel-head"><h3>Recall automation</h3><span>Automation schedule · Not yet configured</span></div><div class="notice"><strong>Recall workflow is active.</strong><br>Eligible patients can be queued for outreach. Staff retain control to review, edit, pause or send manually.</div><div class="kpi-row" style="margin-top:18px"><div class="kpi"><span>Queued</span><strong>'+recallQueued+'</strong><div class="progress"><i style="width:'+(Math.min(100,Math.max(8,recallQueued*8)))+'%"></i></div></div><div class="kpi"><span>Delivered</span><strong>'+deliveredCount+'</strong><div class="progress"><i style="width:'+(Math.min(100,Math.max(8,deliveredCount*4)))+'%"></i></div></div><div class="kpi"><span>Booked</span><strong>'+recallBooked+'</strong><div class="progress"><i style="width:'+(Math.min(100,Math.max(8,recallBooked*6)))+'%"></i></div></div></div></div><div class="card panel"><div class="panel-head"><h3>Recent activity</h3><span>Live</span></div><div class="timeline">'+(state.activity||[]).slice(0,4).map(e=>'<div class="event"><div class="dot">'+e.icon+'</div><div><strong>'+esc(e.title)+'</strong><p>'+esc(e.detail)+'</p></div><time>'+e.time+'</time></div>').join('')+'</div></div></div>';
}
function taskUrgency(t){
 let score=0,reasons=[];
 if(t.done)return {label:'Completed',tone:'green',reason:'task closed'};
 if(t.priority==='High'){score+=50;reasons.push('high priority')}
 if(String(t.due).toLowerCase()==='today'){score+=35;reasons.push('due today')}
 if(String(t.due).toLowerCase()==='tomorrow'){score+=15;reasons.push('due tomorrow')}
 if(t.title.toLowerCase().match(/referral|clinical|abnormal|insurance/)){score+=15;reasons.push('patient-care dependency')}
 if(score>=70)return {label:'Urgent',tone:'red',reason:reasons.slice(0,2).join(' · ')};
 if(score>=40)return {label:'Priority',tone:'amber',reason:reasons.slice(0,2).join(' · ')};
 return {label:'Routine',tone:'blue',reason:reasons[0]||'planned work'};
}
function taskPatient(t){
 let found=state.patients.find(p=>t.title.toLowerCase().includes(p.name.toLowerCase()));
 return found;
}
function taskHTML(t){
 let u=taskUrgency(t),p=taskPatient(t);
 return '<div id="task-'+t.id+'" class="task task-enhanced '+(t.done?'is-done':'')+'"><button class="check '+(t.done?'done':'')+'" onclick="toggleTask('+t.id+')">'+(t.done?'✓':'')+'</button><div class="task-main"><div class="task-title-row"><strong>'+esc(t.title)+'</strong><span class="badge '+u.tone+'">'+u.label+'</span></div><p>'+esc(t.owner)+' · <span class="badge '+(t.priority==='High'?'red':t.priority==='Low'?'gray':'blue')+'">'+esc(t.priority)+'</span>'+(p?' · <button class="task-link" onclick="event.stopPropagation();openPatient(\''+p.id+'\')">'+esc(p.name)+'</button>':'')+'</p><span class="task-reason">'+esc(u.reason)+'</span></div><div class="task-meta"><small>'+esc(t.due)+'</small><button class="row-action" onclick="editTask('+t.id+')">Open</button></div></div>';
}
function taskInsight(){
 let open=state.tasks.filter(t=>!t.done), urgent=open.filter(t=>taskUrgency(t).label==='Urgent'), high=open.filter(t=>t.priority==='High');
 let focus=urgent[0]||high[0]||open[0];
 let headline=urgent.length?urgent.length+' task'+(urgent.length===1?' requires':'s require')+' immediate attention.':high.length?high.length+' high-priority tasks should be cleared first.':'The practice task queue is under control.';
 let detail=focus?'Start with “'+focus.title+'” — '+taskUrgency(focus).reason+'.':'No urgent task requires action right now.';
 return '<div class="task-intelligence card"><div class="intel-icon">✦</div><div class="intel-copy"><div class="intel-label">OPTIFLOW WORK INTELLIGENCE</div><strong>'+headline+'</strong><p>'+detail+'</p></div><button class="btn" onclick="'+(focus?'focusTask('+focus.id+')':'toast(\'Task queue reviewed\')')+'">'+(focus?'Focus task':'Review queue')+'</button></div>';
}
function taskOwnerCounts(){
 let counts={};state.tasks.filter(t=>!t.done).forEach(t=>counts[t.owner]=(counts[t.owner]||0)+1);
 return Object.entries(counts).sort((a,b)=>b[1]-a[1]);
}
function tasks(){
 let filter=window.taskFilter||'all', term=String(window.taskSearch||'').toLowerCase();
 let list=state.tasks.filter(t=>(t.title+' '+t.owner+' '+t.priority+' '+t.due).toLowerCase().includes(term));
 if(filter==='open')list=list.filter(t=>!t.done);
 if(filter==='high')list=list.filter(t=>!t.done&&t.priority==='High');
 if(filter==='completed')list=list.filter(t=>t.done);
 if(filter==='today')list=list.filter(t=>!t.done&&String(t.due).toLowerCase()==='today');
 let open=state.tasks.filter(t=>!t.done),high=open.filter(t=>t.priority==='High'),done=state.tasks.filter(t=>t.done),today=open.filter(t=>String(t.due).toLowerCase()==='today');
 let owners=taskOwnerCounts(),lead=owners[0];
 return '<div class="page-head"><div><h1>Tasks</h1><p>Turn practice priorities into clear, accountable work.</p></div><div class="actions"><button class="btn" onclick="setTaskFilter(\'today\')">Today’s focus</button><button class="btn primary" onclick="openModal(\'task\')">+ New task</button></div></div>'+
 taskInsight()+
 '<div class="grid stats task-stats"><div class="card stat"><div class="stat-top">Open <div class="stat-icon">○</div></div><h2>'+open.length+'</h2><p>Across the practice</p></div><div class="card stat"><div class="stat-top">High priority <div class="stat-icon">!</div></div><h2>'+high.length+'</h2><p><span class="negative">'+today.length+' due today</span></p></div><div class="card stat"><div class="stat-top">Completed <div class="stat-icon">✓</div></div><h2>'+done.length+'</h2><p>Recently closed</p></div><div class="card stat"><div class="stat-top">Workload <div class="stat-icon">↔</div></div><h2>'+(lead?lead[1]:0)+'</h2><p>'+esc(lead?lead[0]:'No open owner')+' · most assigned</p></div></div>'+
 '<div class="card task-toolbar"><div class="task-search"><span>⌕</span><input value="'+esc(window.taskSearch||'')+'" oninput="window.taskSearch=this.value;render()" placeholder="Search tasks, owners, patients or priorities…"></div><div class="task-filters"><button class="btn '+(filter==='all'?'active':'')+'" onclick="setTaskFilter(\'all\')">All</button><button class="btn '+(filter==='open'?'active':'')+'" onclick="setTaskFilter(\'open\')">Open</button><button class="btn '+(filter==='today'?'active':'')+'" onclick="setTaskFilter(\'today\')">Today</button><button class="btn '+(filter==='high'?'active':'')+'" onclick="setTaskFilter(\'high\')">High priority</button><button class="btn '+(filter==='completed'?'active':'')+'" onclick="setTaskFilter(\'completed\')">Completed</button></div></div>'+
 '<div class="grid two task-lower"><div class="card panel"><div class="panel-head"><div><h3>Practice task list</h3><span>'+list.length+' tasks in this view</span></div><span>Live status</span></div><div class="task-list">'+(list.length?list.map(taskHTML).join(''):'<div class="empty"><strong>No tasks found.</strong><br>Try another filter or search term.</div>')+'</div></div>'+
 '<div class="card panel"><div class="panel-head"><div><h3>Workload intelligence</h3><span>Open tasks by owner</span></div></div><div class="workload-list">'+(owners.length?owners.map((o,i)=>'<div class="workload-row"><div class="avatar">'+initials(o[0])+'</div><div><strong>'+esc(o[0])+'</strong><span>'+o[1]+' open task'+(o[1]===1?'':'s')+'</span></div><div class="workload-bar"><i style="width:'+Math.min(100,Math.round(o[1]/Math.max(1,owners[0][1])*100))+'%"></i></div></div>').join(''):'<div class="empty">No open work assigned.</div>')+'</div><div class="notice task-note"><strong>Smart suggestion</strong><br>'+(lead&&lead[1]>=3?'Consider redistributing lower-priority work from '+esc(lead[0])+' to another team member.':'Workload is reasonably distributed across the current queue.')+'</div></div></div>';
}
function setTaskFilter(filter){window.taskFilter=filter;render();}
function focusTask(id){
 window.taskFilter='all';window.taskSearch='';
 const el=document.getElementById('task-'+id);if(el){el.scrollIntoView({behavior:'smooth',block:'center'});el.classList.add('task-focus');setTimeout(()=>el.classList.remove('task-focus'),1400);}else render();
}
function editTask(id){let t=state.tasks.find(x=>x.id===id);if(t)toast('Task: '+t.title);}
function patientAttention(p){
 if(p.status==='Recall due') return {label:'Recall due',tone:'amber',detail:'Annual follow-up needs scheduling'};
 if((p.notes||'').toLowerCase().includes('glaucoma')) return {label:'Clinical flag',tone:'red',detail:'Family history of glaucoma'};
 if((p.notes||'').toLowerCase().includes('cataract')) return {label:'Follow-up',tone:'red',detail:'Cataract monitoring'};
 if((p.notes||'').toLowerCase().includes('myopia')) return {label:'Review',tone:'blue',detail:'Myopia management'};
 return {label:'Up to date',tone:'green',detail:'No immediate action'};
}
function patientAge(dob){
 const d=new Date(dob);
 if(Number.isNaN(d.getTime())) return '—';
 const now=new Date('2026-10-06T12:00:00');
 let age=now.getFullYear()-d.getFullYear();
 const m=now.getMonth()-d.getMonth();
 if(m<0 || (m===0 && now.getDate()<d.getDate())) age--;
 return age;
}
function patientFilterMatch(p,filter){
 if(filter==='all') return true;
 if(filter==='active') return p.status==='Active';
 if(filter==='recall') return p.status==='Recall due';
 if(filter==='clinical') return ['glaucoma','cataract','myopia','dry eye'].some(x=>(p.notes||'').toLowerCase().includes(x));
 return true;
}
function patientStatusClass(p){return p.status==='Active'?'green':'amber'}

function patients(){
 let filter=window.patientFilter||'all';
 let list=state.patients.filter(p=>(p.name+' '+p.id+' '+p.phone+' '+p.insurance+' '+p.notes).toLowerCase().includes(search.toLowerCase())).filter(p=>patientFilterMatch(p,filter));
 let recallCount=state.patients.filter(p=>p.status==='Recall due').length;
 let clinicalCount=state.patients.filter(p=>patientAttention(p).tone==='red').length;
 let activeCount=state.patients.filter(p=>p.status==='Active').length;
 return `<div class="page-head"><div><h1>Patients</h1><p>Manage patient records, identify care needs and stay ahead of follow-up.</p></div><div class="actions"><button class="btn" onclick="toast('Patient import workflow will connect to your data source')">Import patients</button><button class="btn primary" onclick="openModal('patient')">+ New patient</button></div></div>
 <div class="grid stats patient-stats">
  <div class="card stat"><div class="stat-top">Total patients <div class="stat-icon">♙</div></div><h2>${state.patients.length}</h2><p><span class="positive">${activeCount} active</span> records</p></div>
  <div class="card stat"><div class="stat-top">Recall due <div class="stat-icon">◷</div></div><h2>${recallCount}</h2><p><span class="negative">Needs outreach</span> today</p></div>
  <div class="card stat"><div class="stat-top">Clinical flags <div class="stat-icon">!</div></div><h2>${clinicalCount}</h2><p>Records needing review</p></div>
  <div class="card stat"><div class="stat-top">Records found <div class="stat-icon">⌕</div></div><h2>${list.length}</h2><p>Matching current view</p></div>
 </div>
 <div class="patient-insight card"><div class="intel-icon">✦</div><div><div class="intel-label">PATIENT INTELLIGENCE</div><strong>${recallCount} patients require recall attention.</strong><p>OptiFlow has identified follow-up or clinical-review signals in the patient list. Start with the highest-priority records.</p></div><button class="btn" onclick="window.patientFilter='recall';search='';render()">Show recall due</button></div>
 <div class="card panel"><div class="searchbar"><div class="search"><span>⌕</span><input value="${esc(search)}" oninput="search=this.value;render()" placeholder="Search name, patient ID, phone, insurance or clinical note…"></div><div class="filters"><select onchange="window.patientFilter=this.value;render()"><option value="all" ${filter==='all'?'selected':''}>All patients</option><option value="active" ${filter==='active'?'selected':''}>Active</option><option value="recall" ${filter==='recall'?'selected':''}>Recall due</option><option value="clinical" ${filter==='clinical'?'selected':''}>Clinical attention</option></select></div></div>
 <div class="table-wrap"><table class="table patient-table"><thead><tr><th>Patient</th><th>Age</th><th>Contact</th><th>Insurance</th><th>Care status</th><th>Next recall</th><th>Action</th></tr></thead><tbody>
 ${list.map(p=>{let a=patientAttention(p);return `<tr onclick="openPatient('${p.id}')" style="cursor:pointer"><td><div class="patient-cell"><div class="avatar">${initials(p.name)}</div><div><strong>${esc(p.name)}</strong><span>${p.id}</span></div></div></td><td>${patientAge(p.dob)}</td><td><strong>${esc(p.phone)}</strong><span class="table-sub">${esc(p.email)}</span></td><td>${esc(p.insurance)}</td><td><span class="badge ${a.tone}">${a.label}</span><span class="table-sub">${a.detail}</span></td><td>${esc(p.nextRecall)}</td><td><button class="row-action" onclick="event.stopPropagation();openPatient('${p.id}')">Open</button></td></tr>`}).join('')}
 </tbody></table>${!list.length?'<div class="empty"><strong>No patients found.</strong><br>Try a different search term or filter.</div>':''}</div></div>`;
}
function recallPriority(r){
 let p=state.patients.find(x=>x.name===r.patient);
 let score=0,reasons=[];
 if(r.status==='Ready'){score+=30;reasons.push('ready for outreach')}
 if(String(r.due).toLowerCase()==='today'){score+=30;reasons.push('due today')}
 if(p?.status==='Recall due'){score+=25;reasons.push('recall overdue')}
 if((p?.notes||'').toLowerCase().match(/glaucoma|cataract/)){score+=15;reasons.push('clinical follow-up signal')}
 if(score>=70)return {label:'High',tone:'red',reason:reasons.slice(0,2).join(' · ')};
 if(score>=40)return {label:'Medium',tone:'amber',reason:reasons.slice(0,2).join(' · ')};
 return {label:'Routine',tone:'blue',reason:reasons[0]||'scheduled follow-up'};
}
function recallRecommendation(r){
 let p=state.patients.find(x=>x.name===r.patient);
 if(r.status==='Ready'&&p?.phone&&p?.email)return 'SMS + Email';
 if(p?.phone)return 'SMS';
 return 'Email';
}
function recallInsight(){
 let ready=state.recalls.filter(r=>r.status==='Ready');
 let high=ready.filter(r=>recallPriority(r).label==='High');
 let dueToday=state.recalls.filter(r=>String(r.due).toLowerCase()==='today').length;
 let rec=high[0]||ready[0];
 let text=high.length?high.length+' high-priority recall'+(high.length===1?'':'s')+' should be contacted first.':'Today’s recall queue is ready for staff review.';
 let detail=rec?'Start with '+rec.patient+'. Recommended channel: '+recallRecommendation(rec)+'.':'No ready recalls require action right now.';
 let action=rec?'sendRecall('+rec.id+')':'toast("Queue reviewed")';
 let label=rec?'Send recommended':'Review queue';
 return '<div class="recall-intelligence card"><div class="intel-icon">✦</div><div class="intel-copy"><div class="intel-label">OPTIFLOW RECALL INTELLIGENCE</div><strong>'+text+'</strong><p>'+detail+' '+dueToday+' recall'+(dueToday===1?' is':'s are')+' due today.</p></div><div class="intel-actions"><button class="btn primary" onclick="'+action+'">'+label+'</button></div></div>';
}
function recalls(){
 let ready=state.recalls.filter(r=>r.status==='Ready').length;
 let scheduled=state.recalls.filter(r=>r.status==='Scheduled').length;
 let dueToday=state.recalls.filter(r=>String(r.due).toLowerCase()==='today').length;
 let filter=window.recallFilter||'all';
 let filtered=filter==='high'?state.recalls.filter(r=>recallPriority(r).label==='High'):filter==='ready'?state.recalls.filter(r=>r.status==='Ready'):filter==='scheduled'?state.recalls.filter(r=>r.status==='Scheduled'):state.recalls;
 let sorted=[...filtered].sort((a,b)=>({High:0,Medium:1,Routine:2}[recallPriority(a).label]-{High:0,Medium:1,Routine:2}[recallPriority(b).label]));
 let c=state.recallCampaign||{}; let sent=Number(c.sent||0), delivered=Number(c.delivered||0), failed=Number(c.failed||0), queued=Number(c.queued||0); let rate=(sent+delivered)?Math.round((delivered/(sent+delivered))*100):0;
 let rows=sorted.map(r=>{let q=recallPriority(r),ch=recallRecommendation(r);let name=String(r.patient).replace(/'/g,"\\'");let action=r.status==='Ready'?'Send now':r.status==='Queued'?'Queued':'Review';return `<tr><td><span class="badge ${q.tone}">${q.label}</span><span class="table-sub">${q.reason}</span></td><td><strong>${esc(r.patient)}</strong></td><td>${esc(r.type)}</td><td>${esc(r.due)}</td><td><strong>${ch}</strong><span class="table-sub">Optimized by contact data</span></td><td><span class="badge ${r.status==='Ready'?'amber':r.status==='Sent'?'green':r.status==='Failed'?'red':'blue'}">${esc(r.status)}</span></td><td><div class="recall-actions"><button class="row-action" onclick="openPatientByName('${name}')">Patient</button><button class="row-action primary-row" onclick="sendRecall('${r.id}')">${action}</button></div></td></tr>`}).join('');
 let recommended=ready?state.recalls.filter(r=>r.status==='Ready').slice(0,3).map(r=>{let q=recallPriority(r);return `<div class="recommend-row"><div class="attention-dot">!</div><div><strong>${esc(r.patient)}</strong><p>${q.label} priority · ${q.reason}</p></div><button class="row-action primary-row" onclick="sendRecall('${r.id}')">Act</button></div>`}).join(''):'<div class="empty">No recall actions pending.</div>';
 return `<div class="page-head"><div><h1>Recall Center</h1><p>Automated and staff-managed patient follow-up, prioritized by OptiFlow intelligence.</p></div><div class="actions"><button class="btn" onclick="refreshRecallCampaign()">Refresh campaign</button><button class="btn primary" onclick="openModal('schedule')">+ Manual follow-up</button></div></div>
 ${recallInsight()}
 <div class="grid stats recall-stats"><div class="card stat"><div class="stat-top">Due today <div class="stat-icon">◷</div></div><h2>${dueToday}</h2><p><span class="negative">${ready} ready</span> for outreach</p></div><div class="card stat"><div class="stat-top">Ready to send <div class="stat-icon">↗</div></div><h2>${ready}</h2><p>${scheduled} scheduled next</p></div><div class="card stat"><div class="stat-top">Delivery rate <div class="stat-icon">✓</div></div><h2>${rate}%</h2><p>From current outbound records</p></div><div class="card stat"><div class="stat-top">Failed <div class="stat-icon">!</div></div><h2>${failed}</h2><p>Require review or retry</p></div></div>
 <div class="recall-toolbar card"><div><strong>Campaign automation</strong><span class="automation-dot"></span><b>ON</b><p>Eligibility runs every 15 minutes. Staff approval is required before outbound messaging.</p></div><div class="recall-filters"><button class="btn primary" onclick="queueReadyRecalls()">Queue ready recalls</button><button class="btn recall-filter ${filter==='all'?'active':''}" onclick="setRecallFilter('all')">All</button><button class="btn recall-filter ${filter==='high'?'active':''}" onclick="setRecallFilter('high')">High priority</button><button class="btn recall-filter ${filter==='ready'?'active':''}" onclick="setRecallFilter('ready')">Ready</button><button class="btn recall-filter ${filter==='scheduled'?'active':''}" onclick="setRecallFilter('scheduled')">Scheduled</button></div></div>
 <div class="card panel" style="margin-top:16px"><div class="panel-head"><div><h3>Intelligent recall queue</h3><span>Patients are ranked by urgency and recommended next action</span></div><span>${sorted.length} records</span></div><div class="table-wrap"><table class="table recall-table"><thead><tr><th>Priority</th><th>Patient</th><th>Recall</th><th>Due</th><th>Recommended channel</th><th>Status</th><th>Next action</th></tr></thead><tbody>${rows}</tbody></table></div></div>
 <div class="grid two" style="margin-top:16px"><div class="card panel"><div class="panel-head"><h3>Recall campaign funnel</h3><span>Live database records</span></div><div class="recall-funnel"><div><span>Queued</span><strong>${queued}</strong><i style="width:100%"></i></div><div><span>Sent</span><strong>${sent}</strong><i style="width:78%"></i></div><div><span>Delivered</span><strong>${delivered}</strong><i style="width:58%"></i></div><div><span>Failed</span><strong>${failed}</strong><i style="width:${Math.min(100,failed*8)}%"></i></div></div></div><div class="card panel"><div class="panel-head"><h3>Recommended actions</h3><span>Priority queue</span></div><div class="recommend-list">${recommended}</div></div></div>`;
}
function setRecallFilter(filter){window.recallFilter=filter;render();}
function openPatientByName(name){let p=state.patients.find(x=>x.name===name);if(p){openPatient(p.id);}else toast('Patient record not found');}

function messagePatients(){
 return [...new Set(state.messages.map(m=>m.patient))].map(name=>state.patients.find(p=>p.name===name)).filter(Boolean);
}
function messageLast(name){
 let rows=state.messages.filter(m=>m.patient===name);
 return rows[rows.length-1];
}
function messageUnread(name){
 let rows=state.messages.filter(m=>m.patient===name);
 return rows.some(m=>!m.mine&&m.unread);
}
function messages(){
 let names=messagePatients();
 let selected=window.selectedConversation||names[0]?.name||'Amelia Carter';
 let term=String(window.messageSearch||'').toLowerCase();
 let filter=window.messageFilter||'all';
 let visible=names.filter(p=>(p.name+' '+p.phone+' '+p.email).toLowerCase().includes(term));
 if(filter==='unread') visible=visible.filter(p=>messageUnread(p.name));
 if(filter==='sms') visible=visible.filter(p=>state.messages.some(m=>m.patient===p.name&&m.channel==='SMS'));
 if(filter==='email') visible=visible.filter(p=>state.messages.some(m=>m.patient===p.name&&m.channel==='Email'));
 let conversation=state.messages.filter(m=>m.patient===selected);
 let patient=state.patients.find(p=>p.name===selected)||state.patients[0];
 let unread=state.messages.filter(m=>!m.mine&&m.unread).length;
 let today=state.messages.filter(m=>String(m.time).toLowerCase().includes('today')).length;
 let pending=state.messages.filter(m=>m.status==='Queued').length; let delivered=state.messages.filter(m=>['Delivered','Read'].includes(m.status)).length; let deliveryRate=state.messages.length?Math.round((delivered/state.messages.length)*100):0;
 return '<div class="page-head"><div><h1>Messages</h1><p>One communication workspace for SMS, email and patient follow-up.</p></div><div class="actions"><button class="btn" onclick="openModal(\'message\',\''+esc(selected).replace(/'/g,"\\\'")+'\')">Compose</button><button class="btn primary" onclick="openModal(\'message\',\''+esc(selected).replace(/'/g,"\\\'")+'\')">+ New message</button></div></div>'+
 '<div class="grid stats message-stats"><div class="card stat"><div class="stat-top">Unread <div class="stat-icon">●</div></div><h2>'+unread+'</h2><p><span class="negative">Needs response</span></p></div><div class="card stat"><div class="stat-top">Messages today <div class="stat-icon">✉</div></div><h2>'+today+'</h2><p>Across active conversations</p></div><div class="card stat"><div class="stat-top">Queued outbound <div class="stat-icon">◷</div></div><h2>'+pending+'</h2><p>Waiting for provider delivery</p></div><div class="card stat"><div class="stat-top">Delivery status <div class="stat-icon">✓</div></div><h2>'+deliveryRate+'%</h2><p><span class="positive">Delivery status</span> from current records</p></div></div>'+
 '<div class="message-intelligence card"><div class="intel-icon">✦</div><div class="intel-copy"><div class="intel-label">OPTIFLOW COMMUNICATION INTELLIGENCE</div><strong>'+ (unread?unread+' patient message'+(unread===1?' needs':'s need')+' attention.':'Communication queue is clear.') +'</strong><p>'+(unread?'OptiFlow recommends responding to unread patient messages before starting non-urgent outbound communication.':'No unread patient messages are currently flagged.')+'</p></div><button class="btn" onclick="setMessageFilter(\'unread\')">Show priority messages</button></div>'+
 '<div class="message-workspace">'+
 '<div class="card conversation-list"><div class="conversation-head"><div><h3>Conversations</h3><span>'+visible.length+' active</span></div></div><div class="message-search"><span>⌕</span><input value="'+esc(window.messageSearch||'')+'" oninput="window.messageSearch=this.value;render()" placeholder="Search patients or conversations…"></div><div class="message-filters"><button class="btn '+(filter==='all'?'active':'')+'" onclick="setMessageFilter(\'all\')">All</button><button class="btn '+(filter==='unread'?'active':'')+'" onclick="setMessageFilter(\'unread\')">Unread</button><button class="btn '+(filter==='sms'?'active':'')+'" onclick="setMessageFilter(\'sms\')">SMS</button><button class="btn '+(filter==='email'?'active':'')+'" onclick="setMessageFilter(\'email\')">Email</button></div><div class="conversation-items">'+
 visible.map(p=>{let last=messageLast(p.name);return '<button class="conversation-item '+(selected===p.name?'selected':'')+'" onclick="selectConversation(\''+p.name.replace(/'/g,"\\\'")+'\')"><div class="avatar">'+initials(p.name)+'</div><div class="conversation-copy"><div><strong>'+esc(p.name)+'</strong><time>'+esc(last?.time||'')+'</time></div><p>'+esc(last?.text||'No messages yet')+'</p><div class="conversation-meta"><span class="channel-pill">'+esc(last?.channel||'SMS')+'</span>'+(messageUnread(p.name)?'<span class="unread-dot">New</span>':'')+'</div></div></button>'}).join('')+
 (visible.length?'':'<div class="empty">No conversations match this view.</div>')+'</div></div>'+
 '<div class="card chat-panel"><div class="chat-head"><div class="chat-person"><div class="avatar">'+initials(patient?.name||selected)+'</div><div><strong>'+esc(patient?.name||selected)+'</strong><span>'+esc(patient?.phone||'')+' · '+esc(patient?.email||'')+'</span></div></div><div class="chat-actions"><span class="channel-pill">SMS</span><button class="row-action" onclick="openPatientByName(\''+String(patient?.name||selected).replace(/'/g,"\\\'")+'\')">Patient record</button></div></div><div class="chat-intelligence"><span>✦</span><div><strong>Suggested next step</strong><p>'+ (messageUnread(selected)?'Respond to this patient before sending a new recall campaign message.':'No urgent response required. Consider a follow-up if this conversation is linked to an outstanding task.') +'</p></div></div><div class="chat-thread">'+conversation.map(m=>'<div class="chat-message '+(m.mine?'mine':'')+'"><div class="bubble">'+esc(m.text)+'</div><time>'+esc(m.time)+'</time></div>').join('')+'</div><div class="composer"><select id="composerChannel"><option>SMS</option><option>Email</option></select><input id="quickMsg" placeholder="Write a patient-friendly message…" onkeydown="if(event.key===\'Enter\')quickMessage()"><button class="btn primary" onclick="quickMessage()">Send</button></div></div></div>';
}
function setMessageFilter(filter){window.messageFilter=filter;render();}
function selectConversation(name){window.selectedConversation=name;state.messages.filter(m=>m.patient===name).forEach(m=>{if(!m.mine)m.unread=false});save();render();}

function openClinicalAmend(section,id){
 const map={history:'medicalHistory',allergies:'allergies',medications:'medications',prescriptions:'prescriptions',insurance:'insuranceRecords'};
 const arr=selectedPatient?.[map[section]]||[]; const rec=arr.find(x=>x.id===id);
 if(!rec){toast('Clinical record is no longer available');return;}
 window.clinicalAmend={section,id,record:rec}; openModal('clinicalAmend');
}

function patientDetail(p){
 const tab=window.patientTab||'overview';
 const age=patientAge(p.dob);
 const med=p.medicalHistory||[];
 const allergies=p.allergies||[];
 const meds=p.medications||[];
 const rxs=p.prescriptions||[];
 const ins=p.insuranceDetails||{provider:p.insurance||'Self-pay',policy:p.policy||'—',memberId:p.policy||'—',status:'Verified'};
 const comm=p.communication||{sms:null,email:null,preferred:'SMS'}; const commState=v=>v===null||v===undefined?'Not recorded':(v?'Enabled':'Off');
 const timeline=(p.timeline&&p.timeline.length?p.timeline:[
  {type:'Clinical',title:'Patient record available',detail:'No recent timeline events are recorded yet.',time:p.lastVisit||'Recent'}
 ]);
 const tabBtn=(key,label)=>`<button class="tab ${tab===key?'active':''}" onclick="setPatientTab('${key}')">${label}</button>`;
 let panel='';
 if(tab==='overview') panel=`<div class="record-grid">
  <div class="record-card"><div class="panel-head"><div><h3>Clinical summary</h3><span>Latest documented patient information</span></div><button class="row-action" onclick="openModal('history')">Edit</button></div><div class="summary-note">${esc(p.notes||'No clinical summary has been documented yet.')}</div><div class="summary-tags"><span class="badge ${p.status==='Active'?'green':'amber'}">${esc(p.status)}</span><span class="badge blue">Age ${age}</span><span class="badge green">${esc(ins.status||'Verified')} insurance</span></div></div>
  <div class="record-card"><div class="panel-head"><div><h3>Contact preferences</h3><span>Preferred communication channels</span></div></div><div class="contact-preferences"><div><strong>${comm.preferred||'SMS'}</strong><span>Preferred channel</span></div><div><strong>${commState(comm.sms)}</strong><span>SMS</span></div><div><strong>${commState(comm.email)}</strong><span>Email</span></div></div><div style="margin-top:14px"><button class="row-action primary-row" onclick="openModal('communication')">Manage consent</button></div></div>
  <div class="record-card full"><div class="panel-head"><div><h3>Current prescription</h3><span>Last updated ${esc(p.lastVisit||'—')}</span></div><button class="row-action primary-row" onclick="openModal('prescription')">Update Rx</button></div><table class="table"><thead><tr><th></th><th>OD</th><th>OS</th></tr></thead><tbody><tr><td>Sphere / Cylinder</td><td>${esc(p.rx?.od||'—')}</td><td>${esc(p.rx?.os||'—')}</td></tr><tr><td>Add</td><td>${esc(p.rx?.add||'—')}</td><td>${esc(p.rx?.add||'—')}</td></tr></tbody></table></div>
  <div class="record-card"><div class="panel-head"><div><h3>Care signals</h3><span>Operational review cues</span></div></div><div class="signal-list"><div><span class="signal-dot amber"></span><div><strong>${p.status==='Recall due'?'Recall due':'Recall scheduled'}</strong><small>${esc(p.nextRecall||'Not set')}</small></div></div><div><span class="signal-dot ${allergies.length?'red':'green'}"></span><div><strong>${allergies.length?'Allergy information present':'No allergies recorded'}</strong><small>${allergies.length?esc(allergies.join(', ')):'Verify during next clinical review'}</small></div></div></div></div>
 </div>`;
 if(tab==='medical') panel=`<div class="record-grid"><div class="record-card"><div class="panel-head"><div><h3>Medical & ocular history</h3><span>Documented history and review items</span></div><button class="row-action primary-row" onclick="openModal('history')">Add history</button></div><div class="record-list">${med.length?med.map(x=>`<div class="record-list-row"><div><strong>${esc(x.title||x.category||x)}</strong><span>${esc(x.detail||x.description||'Documented')}</span></div>${x.id?`<button class="row-action" onclick="openClinicalAmend('history','${esc(x.id)}')">Amend</button>`:''}</div>`).join(''):'<div class="empty"><strong>No detailed history recorded.</strong><br>Add relevant ocular and systemic history during the next review.</div>'}</div></div><div class="record-card"><div class="panel-head"><div><h3>Allergies</h3><span>Safety-critical information</span></div><button class="row-action primary-row" onclick="openModal('allergy')">Add allergy</button></div><div class="safety-box ${allergies.length?'attention':''}">${allergies.length?allergies.map(x=>typeof x==='string'?`<span>${esc(x)}</span>`:`<span class="safety-item"><strong>${esc(x.allergen||'Allergy')}</strong>${x.reaction?` · ${esc(x.reaction)}`:''}${x.id?` <button class="row-action" onclick="openClinicalAmend('allergies','${esc(x.id)}')">Amend</button>`:''}</span>`).join(''):'No known allergies recorded'}</div></div><div class="record-card full"><div class="panel-head"><div><h3>Current medications</h3><span>Medication list for clinical review</span></div><button class="row-action primary-row" onclick="openModal('medication')">Add medication</button></div><div class="record-list">${meds.length?meds.map(x=>`<div class="record-list-row"><div><strong>${esc(x.name||x)}</strong><span>${esc(x.dose||'Dose not specified')} · ${esc(x.frequency||'Frequency not specified')}</span></div>${x.id?`<button class="row-action" onclick="openClinicalAmend('medications','${esc(x.id)}')">Amend</button>`:''}</div>`).join(''):'<div class="empty">No medications recorded.</div>'}</div></div></div>`;
 if(tab==='prescriptions') panel=`<div class="record-card"><div class="panel-head"><div><h3>Prescription history</h3><span>Most recent prescriptions first</span></div><button class="row-action primary-row" onclick="openModal('prescription')">+ New prescription</button></div><div class="rx-history">${(rxs.length?rxs:[{date:p.lastVisit||'Current',od:p.rx?.od||'—',os:p.rx?.os||'—',add:p.rx?.add||'—'}]).map(x=>`<div class="rx-row"><div><strong>${esc(x.date||x.prescribed_at||'Current')}</strong><small>OD ${esc(x.od||x.od_sphere||'—')} · OS ${esc(x.os||x.os_sphere||'—')}</small></div><span>Add ${esc(x.add||x.od_add||'—')}</span>${x.id?`<button class="row-action" onclick="openClinicalAmend('prescriptions','${esc(x.id)}')">Amend</button>`:`<button class="row-action" onclick="toast('Prescription record selected')">View</button>`}</div>`).join('')}</div></div>`;
 if(tab==='insurance') panel=`<div class="record-grid"><div class="record-card"><div class="panel-head"><div><h3>Insurance coverage</h3><span>Eligibility and policy information</span></div><button class="row-action primary-row" onclick="openModal('insurance')">Verify / update</button></div><div class="insurance-grid"><div><span>Provider</span><strong>${esc(ins.provider)}</strong></div><div><span>Policy</span><strong>${esc(ins.policy)}</strong></div><div><span>Member ID</span><strong>${esc(ins.memberId)}</strong></div><div><span>Status</span><strong><span class="badge green">${esc(ins.status||'Verified')}</span></strong></div></div></div><div class="record-card"><div class="panel-head"><div><h3>Coverage notes</h3><span>Practice-facing information</span></div></div><div class="notice"><strong>Verification recommended before next billed visit.</strong><br>Insurance details should be confirmed against the payer before services are submitted.</div></div></div>`;
 if(tab==='communications') panel=`<div class="record-card"><div class="panel-head"><div><h3>Patient communications</h3><span>Recent SMS and email activity</span></div><button class="row-action primary-row" onclick="openModal('message','${esc(p.name).replace(/'/g,"\\'")}')">Compose</button></div><div class="record-list">${state.messages.filter(m=>m.patient===p.name).map(m=>`<div class="record-list-row"><div><strong>${m.mine?'Practice':'Patient'} · ${esc(m.channel||'Message')}</strong><span>${esc(m.text)}</span></div><time>${esc(m.time)}</time></div>`).join('')||'<div class="empty">No communication history for this patient.</div>'}</div></div>`;
 return `<div class="patient-record-head"><div class="patient-record-identity"><button class="btn" onclick="go('patients')">← Patients</button><div class="identity-main"><div class="avatar large">${initials(p.name)}</div><div><div class="eyebrow">PATIENT RECORD · ${esc(p.id)}</div><h1>${esc(p.name)}</h1><p>${esc(p.phone)} · ${esc(p.email)} · Age ${age}</p></div></div></div><div class="record-actions"><button class="btn" onclick="openModal('message','${esc(p.name).replace(/'/g,"\\'")}')">Message</button><button class="btn" onclick="openModal('schedule')">Schedule recall</button><button class="btn primary" onclick="openModal('appointment')">Book appointment</button></div></div>
 <div class="patient-record-layout"><aside class="card patient-side"><div class="record-status"><span class="badge ${p.status==='Active'?'green':'amber'}">${esc(p.status)}</span><span>Last visit ${esc(p.lastVisit||'—')}</span></div><div class="profile-list"><div><span>Date of birth</span><strong>${esc(p.dob)}</strong></div><div><span>Phone</span><strong>${esc(p.phone)}</strong></div><div><span>Email</span><strong>${esc(p.email)}</strong></div><div><span>Insurance</span><strong>${esc(ins.provider)}</strong></div><div><span>Policy</span><strong>${esc(ins.policy)}</strong></div><div><span>Next recall</span><strong>${esc(p.nextRecall||'Not set')}</strong></div></div><div class="quick-actions"><button onclick="openModal('task')">+ Create task</button><button onclick="openModal('message','${esc(p.name).replace(/'/g,"\\'")}')">Send message</button></div></aside><div class="patient-record-main"><div class="card record-tabs">${tabBtn('overview','Overview')}${tabBtn('medical','Medical history')}${tabBtn('prescriptions','Prescriptions')}${tabBtn('insurance','Insurance')}${tabBtn('communications','Communications')}</div><div class="record-panel">${panel}</div><div class="record-card timeline-card"><div class="panel-head"><div><h3>Patient timeline</h3><span>Latest activity across the record</span></div><span>Audit-ready</span></div><div class="timeline">${timeline.slice(0,12).map(e=>`<div class="event"><div class="dot">${e.type==='Safety'?'!':e.type==='Communication'?'✉':e.type==='Appointment'?'◷':e.type==='Recall'?'↻':e.type==='Task'?'✓':e.type==='Prescription'?'Rx':'•'}</div><div><strong>${esc(e.title)}</strong><p>${esc(e.detail)}</p><span class="timeline-type">${esc(e.type||'Record')}</span></div><time>${esc(e.time)}</time></div>`).join('')||'<div class="empty">No patient activity has been recorded yet.</div>'}</div></div></div></div>`;
}
function setPatientTab(tab){window.patientTab=tab;render();}

async function openPatient(id){
 selectedPatient=state.patients.find(p=>p.id===id)||null; current='patients'; location.hash='patient='+encodeURIComponent(id); render();
 if(state.backendConnected && selectedPatient){
  try{
   const res=await apiRequest('patients/'+encodeURIComponent(id)); const d=res.data||{}; const p=selectedPatient;
   const history=(d.history||[]).map(x=>({...x,type:'Clinical history',title:x.category,detail:x.description,time:x.event_date||x.created_at}));
   const allergies=(d.allergies||[]).map(x=>({...x,label:x.allergen+(x.reaction?' — '+x.reaction:'')}));
   const medications=(d.medications||[]).map(x=>({...x,dose:[x.dose,x.frequency].filter(Boolean).join(' · ')}));
   const rxs=(d.prescriptions||[]).map(x=>({...x,date:x.prescribed_at,od:[x.od_sphere,x.od_cylinder,x.od_axis].filter(Boolean).join(' '),os:[x.os_sphere,x.os_cylinder,x.os_axis].filter(Boolean).join(' '),add:x.od_add||x.os_add||'—',notes:x.notes||''}));
   const ins=(d.insurance||[])[0];
   Object.assign(p,{medicalHistory:history,allergies,medications,prescriptions:rxs,insuranceDetails:ins?{...ins,provider:ins.provider,policy:ins.policy_number||'—',memberId:ins.member_id||'—',status:ins.status||'Pending'}:p.insuranceDetails});
   if(rxs[0]) p.rx={od:rxs[0].od||'—',os:rxs[0].os||'—',add:rxs[0].add||'—'};
   p.timeline=(d.timeline||[]).map(x=>({type:x.type||'Record',title:x.title,detail:x.detail,time:x.time}));
   render();
  }catch(e){toast('Patient record could not be refreshed from secure storage');}
 }
}
function openModal(type,arg=''){
 let title=type==='patient'?'Add patient':type==='schedule'?'Schedule manual recall':type==='message'?'New patient message':type==='task'?'Create task':type==='history'?'Add medical history':type==='allergy'?'Add allergy':type==='medication'?'Add medication':type==='prescription'?'Record prescription':type==='insurance'?'Add insurance policy':type==='clinicalAmend'?'Amend clinical record':type==='communication'?'Communication consent':type==='staff'?'Add team member':'Schedule appointment';
 let body='';
 if(type==='patient') body=`<div class="form-grid"><div class="field"><label>First name</label><input id="f1" required></div><div class="field"><label>Last name</label><input id="f2" required></div><div class="field"><label>Date of birth</label><input id="f3" type="date"></div><div class="field"><label>Phone</label><input id="f4"></div><div class="field"><label>Email</label><input id="f5" type="email"></div><div class="field"><label>Insurance provider</label><input id="f6"></div><div class="field"><label>Policy number</label><input id="f7"></div><div class="field"><label>Next recall</label><input id="f8" type="date"></div><div class="field full"><label>Clinical notes</label><textarea id="f9" rows="3"></textarea></div></div>`;
 if(type==='schedule') body=`<div class="form-grid"><div class="field"><label>Patient</label><select id="f1">${state.patients.map(p=>`<option>${esc(p.name)}</option>`).join('')}</select></div><div class="field"><label>Recall type</label><select id="f2"><option>Annual eye examination</option><option>Contact lens review</option><option>Dry eye review</option><option>Prescription review</option></select></div><div class="field"><label>Follow-up date</label><input type="date" id="f3"></div><div class="field"><label>Channels</label><select id="f4"><option>SMS + Email</option><option>SMS only</option><option>Email only</option><option>Manual staff follow-up</option></select></div><div class="field full"><label>Message</label><textarea id="f5" rows="4">Your eye examination is due. Reply to this message or contact our practice to schedule an appointment.</textarea></div></div>`;
 if(type==='message') body=`<div class="field"><label>Patient</label><select id="f1">${state.patients.map(p=>`<option ${p.name===arg?'selected':''}>${esc(p.name)}</option>`).join('')}</select></div><div class="field"><label>Channel</label><select id="f2"><option>SMS</option><option>Email</option></select></div><div class="field"><label>Message</label><textarea id="f3" rows="6" placeholder="Write a clear, patient-friendly message…"></textarea></div>`;
 if(type==='task') body=`<div class="form-grid"><div class="field full"><label>Task</label><input id="f1" placeholder="e.g. Verify insurance for new patient"></div><div class="field"><label>Assign to</label><select id="f2"><option>Sarah L.</option><option>Jordan P.</option><option>Dr. Bennett</option></select></div><div class="field"><label>Priority</label><select id="f3"><option>Normal</option><option>High</option><option>Low</option></select></div><div class="field"><label>Due date</label><input id="f4" type="date"></div><div class="field"><label>Patient link</label><select id="f5"><option value="">No patient link</option>${state.patients.map(p=>`<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('')}</select></div></div>`;
 if(type==='history') body=`<div class="notice"><strong>${esc(selectedPatient?.name||'Patient')}</strong> · clinical history</div><div class="form-grid" style="margin-top:15px"><div class="field"><label>Category</label><input id="f1" placeholder="e.g. Ocular history"></div><div class="field"><label>Date</label><input id="f2" type="date"></div><div class="field full"><label>Description</label><textarea id="f3" rows="4" placeholder="Document the relevant history…"></textarea></div></div>`;
 if(type==='allergy') body=`<div class="form-grid"><div class="field"><label>Allergen</label><input id="f1" placeholder="e.g. Penicillin"></div><div class="field"><label>Severity</label><select id="f2"><option>Mild</option><option>Moderate</option><option>Severe</option></select></div><div class="field full"><label>Reaction</label><input id="f3" placeholder="e.g. Rash"></div></div>`;
 if(type==='medication') body=`<div class="form-grid"><div class="field"><label>Medication</label><input id="f1"></div><div class="field"><label>Dose</label><input id="f2"></div><div class="field full"><label>Frequency</label><input id="f3" placeholder="e.g. Once daily"></div></div>`;
 if(type==='prescription') body=`<div class="form-grid"><div class="field"><label>Prescription date</label><input id="f1" type="date"></div><div class="field"><label>Notes</label><input id="f2"></div><div class="field"><label>OD sphere</label><input id="f3"></div><div class="field"><label>OD cylinder</label><input id="f4"></div><div class="field"><label>OD axis</label><input id="f5"></div><div class="field"><label>OD add</label><input id="f6"></div><div class="field"><label>OS sphere</label><input id="f7"></div><div class="field"><label>OS cylinder</label><input id="f8"></div><div class="field"><label>OS axis</label><input id="f9"></div><div class="field"><label>OS add</label><input id="f10"></div></div>`;
 if(type==='communication') body=`<div class="notice"><strong>${esc(selectedPatient?.name||'Patient')}</strong> · communication consent</div><div class="form-grid" style="margin-top:15px"><div class="field"><label>SMS consent</label><select id="f1"><option value="unknown">Not recorded</option><option value="yes">Opted in</option><option value="no">Opted out</option></select></div><div class="field"><label>Email consent</label><select id="f2"><option value="unknown">Not recorded</option><option value="yes">Opted in</option><option value="no">Opted out</option></select></div><div class="field full"><label>Consent source / note</label><input id="f3" placeholder="e.g. Patient confirmed at front desk"></div></div>`;
 if(type==='insurance') body=`<div class="form-grid"><div class="field"><label>Provider</label><input id="f1"></div><div class="field"><label>Policy number</label><input id="f2"></div><div class="field"><label>Member ID</label><input id="f3"></div><div class="field"><label>Status</label><select id="f4"><option>Pending</option><option>Verified</option><option>Inactive</option></select></div></div>`;
 if(type==='clinicalAmend'){
  const c=window.clinicalAmend||{}; const r=c.record||{};
  if(c.section==='history') body=`<div class="notice"><strong>Clinical amendment</strong><br>The previous entry will remain in the audit history and a new version will become active.</div><div class="form-grid" style="margin-top:15px"><div class="field"><label>Category</label><input id="f1" value="${esc(r.category||r.title||'')}" ></div><div class="field"><label>Event date</label><input id="f2" type="date" value="${esc(r.event_date||r.eventDate||'')}" ></div><div class="field full"><label>Description</label><textarea id="f3">${esc(r.description||r.detail||'')}</textarea></div></div>`;
  if(c.section==='allergies') body=`<div class="notice"><strong>Safety-critical amendment</strong><br>The previous allergy entry will remain preserved as an amended record.</div><div class="form-grid" style="margin-top:15px"><div class="field"><label>Allergen</label><input id="f1" value="${esc(r.allergen||'')}"></div><div class="field"><label>Severity</label><select id="f2"><option ${r.severity==='Mild'?'selected':''}>Mild</option><option ${r.severity==='Moderate'?'selected':''}>Moderate</option><option ${r.severity==='Severe'?'selected':''}>Severe</option></select></div><div class="field full"><label>Reaction</label><input id="f3" value="${esc(r.reaction||'')}"></div></div>`;
  if(c.section==='medications') body=`<div class="notice"><strong>Medication amendment</strong><br>The current medication entry will be closed and replaced with a new active version.</div><div class="form-grid" style="margin-top:15px"><div class="field"><label>Medication</label><input id="f1" value="${esc(r.name||'')}"></div><div class="field"><label>Dose</label><input id="f2" value="${esc(r.dose||'')}"></div><div class="field full"><label>Frequency</label><input id="f3" value="${esc(r.frequency||'')}"></div></div>`;
  if(c.section==='prescriptions') body=`<div class="notice"><strong>Prescription amendment</strong><br>The prior prescription remains preserved and marked amended.</div><div class="form-grid" style="margin-top:15px"><div class="field"><label>Prescription date</label><input id="f1" type="date" value="${esc(r.prescribed_at||r.date||'')}"></div><div class="field"><label>Notes</label><input id="f2" value="${esc(r.notes||'')}"></div><div class="field"><label>OD sphere</label><input id="f3" value="${esc(r.od_sphere||'')}"></div><div class="field"><label>OD cylinder</label><input id="f4" value="${esc(r.od_cylinder||'')}"></div><div class="field"><label>OD axis</label><input id="f5" value="${esc(r.od_axis||'')}"></div><div class="field"><label>OD add</label><input id="f6" value="${esc(r.od_add||'')}"></div><div class="field"><label>OS sphere</label><input id="f7" value="${esc(r.os_sphere||'')}"></div><div class="field"><label>OS cylinder</label><input id="f8" value="${esc(r.os_cylinder||'')}"></div><div class="field"><label>OS axis</label><input id="f9" value="${esc(r.os_axis||'')}"></div><div class="field"><label>OS add</label><input id="f10" value="${esc(r.os_add||'')}"></div></div>`;
  if(c.section==='insurance') body=`<div class="notice"><strong>Insurance amendment</strong><br>The previous policy remains preserved for audit purposes.</div><div class="form-grid" style="margin-top:15px"><div class="field"><label>Provider</label><input id="f1" value="${esc(r.provider||'')}"></div><div class="field"><label>Policy number</label><input id="f2" value="${esc(r.policy_number||r.policy||'')}"></div><div class="field"><label>Member ID</label><input id="f3" value="${esc(r.member_id||r.memberId||'')}"></div><div class="field"><label>Status</label><select id="f4"><option ${r.status==='Pending'?'selected':''}>Pending</option><option ${r.status==='Verified'?'selected':''}>Verified</option><option ${r.status==='Inactive'?'selected':''}>Inactive</option></select></div></div>`;
 }
 if(type==='staff') body=`<div class="form-grid"><div class="field"><label>Full name</label><input id="f1" required></div><div class="field"><label>Work email</label><input id="f2" type="email" required></div><div class="field"><label>Role</label><select id="f3"><option>Provider</option><option>Front Desk</option><option>Viewer</option><option>Practice Manager</option></select></div><div class="field full"><div class="notice">This provisions the staff account in OptiFlow. Authentication remains controlled by your Cloudflare Access policy.</div></div></div>`;
 if(type==='appointment') body=`<div class="notice"><strong>${esc(selectedPatient?.name||'Patient')}</strong> is ready to be scheduled.</div><div class="form-grid" style="margin-top:15px"><div class="field"><label>Patient</label><select id="f1">${state.patients.map(p=>`<option ${p.name===selectedPatient?.name?'selected':''}>${esc(p.name)}</option>`).join('')}</select></div><div class="field"><label>Date</label><input id="f2" type="date"></div><div class="field"><label>Time</label><input id="f3" type="time"></div><div class="field"><label>Visit type</label><select id="f4"><option>Comprehensive eye exam</option><option>Contact lens review</option><option>Clinical follow-up</option><option>Frame/lens collection</option></select></div><div class="field"><label>Provider</label><select id="f5"><option>Dr. Maya Bennett</option></select></div></div>`;
 document.body.insertAdjacentHTML('beforeend',`<div class="modal" id="modal"><div class="modal-card"><div class="modal-head"><h2>${title}</h2><button class="icon-btn" onclick="closeModal()">×</button></div><div class="modal-body">${body}</div><div class="modal-foot"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn primary" onclick="submitModal('${type}')">${type==='message'?'Send message':type==='appointment'?'Book appointment':type==='communication'?'Save consent':type==='staff'?'Add team member':type==='clinicalAmend'?'Save amendment':(['history','allergy','medication','prescription','insurance'].includes(type)?'Save clinical record':'Save')}</button></div></div></div>`);
}
function closeModal(){document.getElementById('modal')?.remove()}
async function submitModal(type){
 if(type==='patient'){
  const first=(document.getElementById('f1')?.value||'New').trim(), last=(document.getElementById('f2')?.value||'Patient').trim();
  if(!first||!last){toast('First name and last name are required');return;}
  const payload={firstName:first,lastName:last,dateOfBirth:document.getElementById('f3')?.value||null,phone:document.getElementById('f4')?.value||null,email:document.getElementById('f5')?.value||null,insuranceProvider:document.getElementById('f6')?.value||null,policyNumber:document.getElementById('f7')?.value||null,nextRecall:document.getElementById('f8')?.value||null,notes:document.getElementById('f9')?.value||null};
  let patientId='P-'+Math.floor(10000+Math.random()*89999);
  if(state.backendConnected){try{patientId=(await apiRequest('patients',{method:'POST',body:JSON.stringify(payload)})).data.id;}catch(e){toast(e.message);return;}}
  const name=(first+' '+last).trim();
  state.patients.unshift({id:patientId,name,dob:payload.dateOfBirth||'Not provided',phone:payload.phone||'—',email:payload.email||'—',insurance:document.getElementById('f6')?.value||'Self-pay',policy:document.getElementById('f7')?.value||'—',status:'Active',lastVisit:'New record',nextRecall:document.getElementById('f8')?.value||'Not set',rx:{od:'—',os:'—',add:'—'},notes:document.getElementById('f9')?.value||'',medicalHistory:[],allergies:[],medications:[],prescriptions:[],insuranceDetails:{provider:document.getElementById('f6')?.value||'Self-pay',policy:document.getElementById('f7')?.value||'—',memberId:document.getElementById('f7')?.value||'—',status:'Pending'},communication:{sms:true,email:true,preferred:'SMS'},timeline:[{title:'Patient record created',detail:'New patient record added to the practice.',time:'Just now'}]});
  state.activity.unshift({icon:'♙',title:'Patient record created',detail:name,time:'Just now'});toast(state.backendConnected?'Patient record saved securely':'Patient record created locally');
 }else if(type==='task'){
  const taskPayload={title:document.getElementById('f1').value||'New task',owner:document.getElementById('f2').value,dueDate:document.getElementById('f4').value||null,priority:document.getElementById('f3').value,patientId:document.getElementById('f5').value||null};
  let taskId=Date.now(); if(state.backendConnected){try{taskId=(await apiRequest('tasks',{method:'POST',body:JSON.stringify(taskPayload)})).data.id;}catch(e){toast(e.message);return;}}
  state.tasks.unshift({id:taskId,title:taskPayload.title,owner:taskPayload.owner,due:taskPayload.dueDate||'Today',priority:taskPayload.priority,patientId:taskPayload.patientId,done:false});toast(state.backendConnected?'Task saved securely':'Task created');
 }else if(type==='message'){
  const patient=document.getElementById('f1').value, channel=document.getElementById('f2').value, text=document.getElementById('f3').value.trim();
  if(!text){toast('Write a message before sending');return;}
  const target=state.patients.find(p=>p.name===patient); if(state.backendConnected){if(!target){toast('Patient record not found');return;}try{await apiRequest('messages',{method:'POST',body:JSON.stringify({patientId:target.id,channel,text})});}catch(e){toast(e.message);return;}}
  state.messages.push({patient,patientId:target?.id,time:'Just now',text,mine:true,channel,unread:false,status:'Queued'});window.selectedConversation=patient;toast(state.backendConnected?channel+' message queued securely':channel+' message queued');
 }else if(type==='schedule'){
  const patient=document.getElementById('f1').value,typeName=document.getElementById('f2').value,date=document.getElementById('f3').value||'Scheduled',channel=document.getElementById('f4').value;
  const target=state.patients.find(p=>p.name===patient); if(state.backendConnected){if(!target){toast('Patient record not found');return;}try{const created=await apiRequest('recalls',{method:'POST',body:JSON.stringify({patientId:target.id,type:typeName,dueDate:date,channel,source:'Manual'})});state.recalls.unshift({id:created.data.id,patient,patientId:target.id,type:typeName,due:date,channel,status:'Scheduled'});}catch(e){toast(e.message);return;}}else state.recalls.unshift({id:Date.now(),patient,type:typeName,due:date,channel,status:channel==='Manual staff follow-up'?'Manual':'Scheduled',message:document.getElementById('f5').value});toast(state.backendConnected?'Recall saved securely':'Recall follow-up scheduled');
 }else if(type==='communication'){
  if(!selectedPatient?.id){toast('Open a patient record first');return;}
  const val=id=>{const v=document.getElementById(id)?.value;return v==='unknown'?null:v==='yes';};
  const payload={smsOptIn:val('f1'),emailOptIn:val('f2'),consentSource:document.getElementById('f3')?.value||'Staff updated'};
  if(state.backendConnected){try{await apiRequest('patients/'+encodeURIComponent(selectedPatient.id)+'/communication-preferences',{method:'PATCH',body:JSON.stringify(payload)});await openPatient(selectedPatient.id);closeModal();toast('Communication consent saved securely');return;}catch(e){toast(e.message);return;}}
  selectedPatient.communication={sms:payload.smsOptIn,email:payload.emailOptIn,preferred:payload.smsOptIn===true?'SMS':payload.emailOptIn===true?'Email':'SMS'};save();closeModal();toast('Communication consent saved locally');render();return;
 }else if(type==='clinicalAmend'){
  const c=window.clinicalAmend; if(!selectedPatient?.id||!c?.id){toast('Clinical record context is missing');return;}
  let payload={};
  if(c.section==='history') payload={category:document.getElementById('f1')?.value,eventDate:document.getElementById('f2')?.value,description:document.getElementById('f3')?.value};
  if(c.section==='allergies') payload={allergen:document.getElementById('f1')?.value,severity:document.getElementById('f2')?.value,reaction:document.getElementById('f3')?.value};
  if(c.section==='medications') payload={name:document.getElementById('f1')?.value,dose:document.getElementById('f2')?.value,frequency:document.getElementById('f3')?.value};
  if(c.section==='prescriptions') payload={prescribedAt:document.getElementById('f1')?.value,notes:document.getElementById('f2')?.value,odSphere:document.getElementById('f3')?.value,odCylinder:document.getElementById('f4')?.value,odAxis:document.getElementById('f5')?.value,odAdd:document.getElementById('f6')?.value,osSphere:document.getElementById('f7')?.value,osCylinder:document.getElementById('f8')?.value,osAxis:document.getElementById('f9')?.value,osAdd:document.getElementById('f10')?.value};
  if(c.section==='insurance') payload={provider:document.getElementById('f1')?.value,policyNumber:document.getElementById('f2')?.value,memberId:document.getElementById('f3')?.value,status:document.getElementById('f4')?.value};
  if(state.backendConnected){try{await apiRequest('patients/'+encodeURIComponent(selectedPatient.id)+'/'+c.section+'/'+encodeURIComponent(c.id)+'/amend',{method:'POST',body:JSON.stringify(payload)});await openPatient(selectedPatient.id);closeModal();window.clinicalAmend=null;toast('Clinical amendment saved with prior version preserved');return;}catch(e){toast(e.message);return;}}
  toast('Clinical amendments require the secure backend');
}else if(['history','allergy','medication','prescription','insurance'].includes(type)){
  if(!selectedPatient){toast('Open a patient record first');return;}
  const map={history:{path:'history',payload:{category:document.getElementById('f1').value, eventDate:document.getElementById('f2').value||null, description:document.getElementById('f3').value}},allergy:{path:'allergies',payload:{allergen:document.getElementById('f1').value,reaction:document.getElementById('f3').value,severity:document.getElementById('f2').value}},medication:{path:'medications',payload:{name:document.getElementById('f1').value,dose:document.getElementById('f2').value,frequency:document.getElementById('f3').value}},prescription:{path:'prescriptions',payload:{prescribedAt:document.getElementById('f1').value,notes:document.getElementById('f2').value,odSphere:document.getElementById('f3').value,odCylinder:document.getElementById('f4').value,odAxis:document.getElementById('f5').value,odAdd:document.getElementById('f6').value,osSphere:document.getElementById('f7').value,osCylinder:document.getElementById('f8').value,osAxis:document.getElementById('f9').value,osAdd:document.getElementById('f10').value}},insurance:{path:'insurance',payload:{provider:document.getElementById('f1').value,policyNumber:document.getElementById('f2').value,memberId:document.getElementById('f3').value,status:document.getElementById('f4').value}}}[type];
  if(state.backendConnected){try{await apiRequest('patients/'+encodeURIComponent(selectedPatient.id)+'/'+map.path,{method:'POST',body:JSON.stringify(map.payload)});}catch(e){toast(e.message);return;}}
  await openPatient(selectedPatient.id); toast(state.backendConnected?'Patient clinical record saved securely':'Clinical record saved locally'); return;
 }else if(type==='communication'){
  if(!selectedPatient?.id){toast('Open a patient record first');return;}
  const val=id=>{const v=document.getElementById(id)?.value;return v==='unknown'?null:v==='yes';};
  const payload={smsOptIn:val('f1'),emailOptIn:val('f2'),consentSource:document.getElementById('f3')?.value||'Staff updated'};
  if(state.backendConnected){try{await apiRequest('patients/'+encodeURIComponent(selectedPatient.id)+'/communication-preferences',{method:'PATCH',body:JSON.stringify(payload)});await openPatient(selectedPatient.id);closeModal();toast('Communication consent saved securely');return;}catch(e){toast(e.message);return;}}
  selectedPatient.communication={sms:payload.smsOptIn,email:payload.emailOptIn,preferred:payload.smsOptIn===true?'SMS':payload.emailOptIn===true?'Email':'SMS'};save();closeModal();toast('Communication consent saved locally');render();return;
}else if(['history','allergy','medication','prescription','insurance'].includes(type)){
  if(!selectedPatient?.id){toast('Open a patient record before adding clinical information');return;}
  const map={history:'history',allergy:'allergies',medication:'medications',prescription:'prescriptions',insurance:'insurance'};
  let payload={};
  if(type==='history') payload={category:document.getElementById('f1')?.value,eventDate:document.getElementById('f2')?.value,description:document.getElementById('f3')?.value};
  if(type==='allergy') payload={allergen:document.getElementById('f1')?.value,severity:document.getElementById('f2')?.value,reaction:document.getElementById('f3')?.value};
  if(type==='medication') payload={name:document.getElementById('f1')?.value,dose:document.getElementById('f2')?.value,frequency:document.getElementById('f3')?.value};
  if(type==='prescription') payload={prescribedAt:document.getElementById('f1')?.value,notes:document.getElementById('f2')?.value,odSphere:document.getElementById('f3')?.value,odCylinder:document.getElementById('f4')?.value,odAxis:document.getElementById('f5')?.value,odAdd:document.getElementById('f6')?.value,osSphere:document.getElementById('f7')?.value,osCylinder:document.getElementById('f8')?.value,osAxis:document.getElementById('f9')?.value,osAdd:document.getElementById('f10')?.value};
  if(type==='insurance') payload={provider:document.getElementById('f1')?.value,policyNumber:document.getElementById('f2')?.value,memberId:document.getElementById('f3')?.value,status:document.getElementById('f4')?.value};
  if(state.backendConnected){try{await apiRequest('patients/'+encodeURIComponent(selectedPatient.id)+'/'+map[type],{method:'POST',body:JSON.stringify(payload)}); await openPatient(selectedPatient.id); closeModal(); toast('Clinical record saved securely'); return;}catch(e){toast(e.message);return;}}
  closeModal(); toast('Clinical record saved locally');
 }else if(type==='staff'){
  const name=document.getElementById('f1')?.value.trim(),email=document.getElementById('f2')?.value.trim(),role=document.getElementById('f3')?.value;
  if(!name||!email){toast('Name and work email are required');return;}
  if(state.backendConnected){try{await apiRequest('staff',{method:'POST',body:JSON.stringify({name,email,role})});state.staff=(await apiRequest('staff')).data||[];state.audit=(await apiRequest('audit?limit=100')).data||[];closeModal();window.settingsSection='team';render();toast('Team member added securely');return;}catch(e){toast(e.message);return;}}
  toast('Team administration requires secure backend connection');return;
}else if(type==='appointment'){
  const patient=document.getElementById('f1').value; const target=state.patients.find(p=>p.name===patient); const date=document.getElementById('f2').value, time=document.getElementById('f3').value||'09:00';
  if(state.backendConnected){if(!target){toast('Patient record not found');return;}try{const startAt=new Date(date+'T'+time).toISOString();const created=await apiRequest('appointments',{method:'POST',body:JSON.stringify({patientId:target.id,startAt,visitType:document.getElementById('f4').value,provider:document.getElementById('f5').value})});state.appointments.unshift({id:created.data.id,time,patient,patientId:target.id,visit:document.getElementById('f4').value,provider:document.getElementById('f5').value,status:'Pending',date});}catch(e){toast(e.message);return;}}else state.appointments.unshift({id:Date.now(),time,patient,visit:document.getElementById('f4').value,provider:document.getElementById('f5').value,status:'Confirmed',date:date||'Scheduled'});toast(state.backendConnected?'Appointment saved securely':'Appointment booked');
 }
 save();closeModal();render();
}

async function sendRecall(id){
 let r=state.recalls.find(x=>x.id===id); if(!r)return;
 if(r.status==='Sent'||r.status==='Queued'){toast('Recall already queued');return;}
 if(state.backendConnected){try{const res=await apiRequest('recalls/'+encodeURIComponent(id)+'/send',{method:'POST'});r.status=res.data?.status||'Queued';}catch(e){toast(e.message);return;}}
 else r.status='Sent';
 state.messages.push({patient:r.patient,time:'Just now',text:r.message||'Your eye examination is due. Reply to this message or contact our practice to schedule an appointment.',mine:true,channel:r.channel==='Email only'?'Email':'SMS',unread:false,status:state.backendConnected?'Queued':'Sent'});
 state.activity.unshift({icon:'↗',title:state.backendConnected?'Recall queued':'Recall sent',detail:r.patient+' · '+r.channel,time:'Just now'}); state.activity=state.activity.slice(0,12);save();toast(state.backendConnected?'Recall queued securely':'Recall sent to '+r.patient);render();
}
async function toggleTask(id){
 let t=state.tasks.find(x=>x.id===id); if(!t)return;
 const next=!t.done;
 if(state.backendConnected){try{await apiRequest('tasks/'+encodeURIComponent(id),{method:'PATCH',body:JSON.stringify({done:next?1:0})});}catch(e){toast(e.message);return;}}
 t.done=next;
 state.activity=state.activity||[]; state.activity.unshift({icon:t.done?'✓':'◷',title:t.done?'Task completed':'Task reopened',detail:t.title,time:'Just now'}); state.activity=state.activity.slice(0,12);save();render();toast(t.done?'Task completed':'Task reopened');
}
async function quickMessage(){
 const el=document.getElementById('quickMsg'); if(!el?.value.trim())return;
 const patient=window.selectedConversation||'Amelia Carter';
 const channel=document.getElementById('composerChannel')?.value||'SMS';
 const target=state.patients.find(p=>p.name===patient);
 if(state.backendConnected){if(!target){toast('Patient record not found');return;}try{await apiRequest('messages',{method:'POST',body:JSON.stringify({patientId:target.id,channel,text:el.value.trim()})});}catch(e){toast(e.message);return;}}
 state.messages.push({patient,patientId:target?.id,time:'Just now',text:el.value.trim(),mine:true,channel,status:state.backendConnected?'Queued':'Sent'});
 save(); render(); toast(state.backendConnected?channel+' message queued securely':channel+' message sent');
}

async function refreshAdminData(){
 if(!state.backendConnected){toast('Connect secure records first');return;}
 try{const [staff,audit]=await Promise.all([apiRequest('staff'),apiRequest('audit?limit=100')]);state.staff=staff.data||[];state.audit=audit.data||[];render();toast('Administration data refreshed');}catch(e){toast(e.message);}
}
async function updateStaffMember(id,patch){
 try{await apiRequest('staff/'+encodeURIComponent(id),{method:'PATCH',body:JSON.stringify(patch)});const [staff,audit]=await Promise.all([apiRequest('staff'),apiRequest('audit?limit=100')]);state.staff=staff.data||[];state.audit=audit.data||[];render();toast('Staff access updated securely');}catch(e){toast(e.message);}
}
function staffRows(){
 const rows=state.staff||[];
 if(!rows.length)return '<div class="empty">No staff records are available yet.</div>';
 return '<div class="admin-table"><div class="admin-row admin-head"><span>Team member</span><span>Role</span><span>Status</span><span>Last updated</span><span></span></div>'+rows.map(m=>'<div class="admin-row"><div><strong>'+esc(m.name)+'</strong><small>'+esc(m.email)+'</small></div><select onchange="updateStaffMember(\''+esc(m.id)+'\',{role:this.value})"><option '+(m.role==='Practice Manager'?'selected':'')+'>Practice Manager</option><option '+(m.role==='Provider'?'selected':'')+'>Provider</option><option '+(m.role==='Front Desk'?'selected':'')+'>Front Desk</option><option '+(m.role==='Viewer'?'selected':'')+'>Viewer</option></select><span class="admin-status '+(m.active?'active':'inactive')+'">'+(m.active?'Active':'Inactive')+'</span><small>'+esc((m.updated_at||'').replace('T',' ').slice(0,16))+'</small><button class="row-action" onclick="updateStaffMember(\''+esc(m.id)+'\',{active:'+(!m.active)+'})">'+(m.active?'Deactivate':'Activate')+'</button></div>').join('')+'</div>';
}
function auditRows(){
 const rows=state.audit||[];
 if(!rows.length)return '<div class="empty">No audit events have been recorded yet.</div>';
 return '<div class="audit-table"><div class="audit-row audit-head"><span>Time</span><span>Actor</span><span>Action</span><span>Entity</span></div>'+rows.map(a=>'<div class="audit-row"><time>'+esc((a.created_at||'').replace('T',' ').slice(0,19))+'</time><div><strong>'+esc(a.actor_email||'System')+'</strong></div><span>'+esc(a.action)+'</span><span>'+esc((a.entity_type||'')+(a.entity_id?' · '+a.entity_id:''))+'</span></div>').join('')+'</div>';
}
function settingState(){
 const defaults={practiceName:'OptiFlow Vision Center',timezone:'Africa/Accra',defaultRecall:'Annual exam',recallAutomation:true,autoPrioritize:true,smartSuggestions:true,smsEnabled:true,emailEnabled:true,twoFactor:true,sessionTimeout:'30 minutes',dateFormat:'DD MMM YYYY',compactMode:false};
 state.settings=Object.assign({},defaults,state.settings||{});
 return state.settings;
}
function settingToggle(key,label,desc){
 let s=settingState(),on=!!s[key];
 return '<div class="setting-row"><div><strong>'+label+'</strong><p>'+desc+'</p></div><button class="switch '+(on?'on':'')+'" onclick="toggleSetting(\''+key+'\')"><span></span></button></div>';
}
function settings(){
 let s=settingState(),activeSection=window.settingsSection||'practice';
 return '<div class="settings-page">'+
 '<div class="settings-topline"><div><div class="eyebrow">PRACTICE ADMINISTRATION</div><h1>Settings & Control Center</h1><p>One place to configure how your practice operates, communicates and protects patient information.</p></div><div class="settings-actions"><span class="save-state"><i></i> All changes saved</span><button class="btn primary" onclick="saveSettings()">Save changes</button></div></div>'+
 '<div class="settings-hero card"><div class="settings-hero-main"><div class="settings-hero-mark">⚙</div><div><div class="intel-label">OPTIFLOW PRACTICE CONTROL CENTER</div><h2>Everything important, under control.</h2><p>Manage practice identity, access, security, automation and intelligence without leaving your workspace.</p><div class="hero-tags"><span>● Practice operational</span><span>◈ Secure configuration</span><span>✦ Intelligence active</span></div></div></div><div class="settings-health"><div class="health-ring"><strong>98%</strong><span>Configured</span></div><small>Workspace health</small></div></div>'+
 '<div class="settings-overview"><div class="overview-card"><div class="overview-icon teal">✓</div><div><span>Practice status</span><strong>Operational</strong><small>Core settings are configured</small></div></div><div class="overview-card"><div class="overview-icon blue">♙</div><div><span>Access control</span><strong>Protected</strong><small>Role-based workspace active</small></div></div><div class="overview-card"><div class="overview-icon purple">✦</div><div><span>Intelligence</span><strong>Advanced</strong><small>Recommendations enabled</small></div></div><div class="overview-card"><div class="overview-icon amber">↗</div><div><span>Communications</span><strong>Ready for integration</strong><small>Provider connection required for delivery</small></div></div></div>'+
 '<div class="settings-layout"><aside class="settings-nav card"><div class="settings-nav-head"><strong>Configuration</strong><span>8 areas</span></div><button class="settings-tab "'+(activeSection==='practice'?'active':'')+'" onclick="settingsTab(this,\'practice\')"><span>⌂</span><div><strong>Practice profile</strong><small>Identity & defaults</small></div></button><button class="settings-tab "'+(activeSection==='team'?'active':'')+'" onclick="settingsTab(this,\'team\')"><span>♙</span><div><strong>Team & roles</strong><small>Access & responsibilities</small></div></button><button class="settings-tab "'+(activeSection==='audit'?'active':'')+'" onclick="settingsTab(this,\'audit\')"><span>⌁</span><div><strong>Audit trail</strong><small>Security activity</small></div></button><button class="settings-tab "'+(activeSection==='security'?'active':'')+'" onclick="settingsTab(this,\'security\')"><span>◈</span><div><strong>Security & privacy</strong><small>Protection & sessions</small></div></button><button class="settings-tab "'+(activeSection==='automation'?'active':'')+'" onclick="settingsTab(this,\'automation\')"><span>↻</span><div><strong>Automation</strong><small>Rules & workflows</small></div></button><button class="settings-tab "'+(activeSection==='communications'?'active':'')+'" onclick="settingsTab(this,\'communications\')"><span>✉</span><div><strong>Communications</strong><small>Patient channels</small></div></button><button class="settings-tab "'+(activeSection==='intelligence'?'active':'')+'" onclick="settingsTab(this,\'intelligence\')"><span>✦</span><div><strong>Intelligence</strong><small>Recommendations</small></div></button><button class="settings-tab "'+(activeSection==='appearance'?'active':'')+'" onclick="settingsTab(this,\'appearance\')"><span>◐</span><div><strong>Appearance</strong><small>Workspace experience</small></div></button><div class="settings-nav-foot"><span class="nav-foot-dot"></span><div><strong>System healthy</strong><small>Last checked just now</small></div></div></aside>'+
 '<div class="settings-content">'+
 '<div class="settings-section '+(activeSection==='practice'?'active':'')+'" data-settings="practice"><div class="section-heading"><div><div class="section-kicker">01 · PRACTICE IDENTITY</div><h3>Practice profile</h3><p>Define the identity and operating defaults used throughout OptiFlow.</p></div><span class="settings-chip">Live configuration</span></div><div class="profile-banner"><div class="practice-avatar">OV</div><div><strong>'+esc(s.practiceName)+'</strong><p>Primary practice workspace · '+esc(s.timezone)+'</p></div><span class="profile-status">● Active</span></div><div class="form-grid"><div class="field"><label>Practice name</label><input id="setPracticeName" value="'+esc(s.practiceName)+'"><small>Displayed across reports, communications and practice documents.</small></div><div class="field"><label>Timezone</label><select id="setTimezone"><option '+(s.timezone==='Africa/Accra'?'selected':'')+'>Africa/Accra</option><option '+(s.timezone==='America/New_York'?'selected':'')+'>America/New_York</option><option '+(s.timezone==='Europe/London'?'selected':'')+'>Europe/London</option></select><small>Used for appointments, recalls and automated schedules.</small></div><div class="field"><label>Default recall type</label><select id="setRecall"><option '+(s.defaultRecall==='Annual exam'?'selected':'')+'>Annual exam</option><option>Contact lens review</option><option>Clinical follow-up</option></select><small>Applied when staff create a new recall.</small></div><div class="field"><label>Date format</label><select id="setDate"><option '+(s.dateFormat==='DD MMM YYYY'?'selected':'')+'>DD MMM YYYY</option><option>MMM DD, YYYY</option><option>YYYY-MM-DD</option></select><small>Controls how dates appear across the workspace.</small></div></div><div class="settings-callout"><span>✦</span><div><strong>Recommended configuration</strong><p>Africa/Accra + DD MMM YYYY is currently aligned with your practice workspace.</p></div><button class="row-action" onclick="toast(\'Recommended configuration applied\')">Review</button></div></div>'+
 '<div class="settings-section '+(activeSection==='team'?'active':'')+'" data-settings="team"><div class="section-heading"><div><div class="section-kicker">02 · ACCESS MODEL</div><h3>Team & roles</h3><p>Manage the people who can access this practice and the level of access they receive.</p></div><div class="settings-actions"><span class="settings-chip secure">'+(state.backendConnected?'Live D1':'Backend required')+'</span><button class="btn" onclick="refreshAdminData()">Refresh</button><button class="btn primary" onclick="openModal(\'staff\')">+ Add team member</button></div></div><div class="admin-summary"><div><span>Team members</span><strong>'+(state.staff?.length||0)+'</strong><small>Provisioned in D1</small></div><div><span>Active</span><strong>'+(state.staff||[]).filter(x=>x.active).length+'</strong><small>Access currently enabled</small></div><div><span>Administrators</span><strong>'+(state.staff||[]).filter(x=>x.role==='Practice Manager'&&x.active).length+'</strong><small>Practice managers</small></div><div><span>Access model</span><strong>RBAC</strong><small>Server-enforced</small></div></div><div class="admin-panel card">'+staffRows()+'</div><div class="permission-strip"><strong>Permission model</strong><span>View · Create · Edit · Export · Admin</span><button class="row-action primary-row" onclick="window.settingsSection=\'security\';render()">Review security →</button></div></div>'+
 '<div class="settings-section '+(activeSection==='audit'?'active':'')+'" data-settings="audit"><div class="section-heading"><div><div class="section-kicker">03 · SECURITY ACTIVITY</div><h3>Audit trail</h3><p>Review who accessed or changed practice information and configuration.</p></div><div class="settings-actions"><span class="settings-chip secure">Admin only</span><button class="btn" onclick="refreshAdminData()">Refresh activity</button></div></div><div class="audit-banner"><div class="audit-mark">◈</div><div><strong>Server-side audit logging is active</strong><p>Patient access, configuration changes, staff administration and operational actions are recorded in D1.</p></div><span>LIVE</span></div><div class="admin-panel card">'+auditRows()+'</div></div>'+
 '<div class="settings-section '+(activeSection==='security'?'active':'')+'" data-settings="security"><div class="section-heading"><div><div class="section-kicker">03 · PROTECTION</div><h3>Security & privacy</h3><p>Control access, sessions and safeguards around sensitive practice information.</p></div><span class="settings-chip secure">Protected</span></div><div class="security-score"><div><span>Security posture</span><strong>Strong</strong></div><div class="score-track"><i></i></div><small>2-factor authentication and controlled sessions are enabled.</small></div>'+settingToggle('twoFactor','Two-factor authentication','Require a second verification step for privileged accounts.')+settingToggle('compactMode','Compact operational mode','Reduce visual density for high-volume front-desk workflows.')+'<div class="field"><label>Session timeout</label><select id="setTimeout"><option '+(s.sessionTimeout==='30 minutes'?'selected':'')+'>30 minutes</option><option '+(s.sessionTimeout==='15 minutes'?'selected':'')+'>15 minutes</option><option '+(s.sessionTimeout==='60 minutes'?'selected':'')+'>60 minutes</option></select></div><div class="security-note"><strong>Production security boundary</strong><p>When connected to a real patient database, enforce authorization, encryption, audit logging and server-side access controls. Interface permissions alone are not sufficient for sensitive patient data.</p></div></div>'+
 '<div class="settings-section '+(activeSection==='automation'?'active':'')+'" data-settings="automation"><div class="section-heading"><div><div class="section-kicker">04 · WORKFLOW ENGINE</div><h3>Workflow automation</h3><p>Let OptiFlow handle repetitive work while staff retain control.</p></div><span class="settings-chip">Smart workflows</span></div><div class="automation-hero"><div class="automation-orbit">↻</div><div><strong>Automation engine is active</strong><p>OptiFlow can prioritize, queue and surface follow-up work based on configured rules.</p></div><span>ACTIVE</span></div>'+settingToggle('recallAutomation','Recall automation','Automatically queue eligible patients for recall campaigns.')+settingToggle('autoPrioritize','Automatic prioritization','Rank recalls and tasks by urgency and operational impact.')+'</div>'+
 '<div class="settings-section '+(activeSection==='communications'?'active':'')+'" data-settings="communications"><div class="section-heading"><div><div class="section-kicker">05 · PATIENT CONNECTIONS</div><h3>Communications</h3><p>Control the channels used for patient outreach and everyday messaging.</p></div><span class="settings-chip">Connected</span></div>'+settingToggle('smsEnabled','SMS messaging','Enable SMS communication workflows.')+settingToggle('emailEnabled','Email messaging','Enable email communication workflows.')+'<div class="channel-health"><div><span>SMS gateway</span><strong>● Pending integration</strong><small>Provider credentials not configured</small></div><div><span>Email service</span><strong>● Pending integration</strong><small>Provider credentials not configured</small></div><div><span>Delivery monitoring</span><strong>● Ready</strong><small>Activates with a messaging provider</small></div></div></div>'+
 '<div class="settings-section '+(activeSection==='intelligence'?'active':'')+'" data-settings="intelligence"><div class="section-heading"><div><div class="section-kicker">06 · INTELLIGENCE LAYER</div><h3>OptiFlow Intelligence</h3><p>Control how proactive recommendations appear across the platform.</p></div><span class="settings-chip ai">Advanced</span></div><div class="intelligence-hero"><div class="intelligence-symbol">✦</div><div><strong>Operational intelligence is enabled</strong><p>Signals from patients, recalls, tasks and communications can be surfaced as recommended next actions.</p></div><span>78%</span></div>'+settingToggle('smartSuggestions','Smart recommendations','Surface next-best actions from patient, recall, task and communication signals.')+'<div class="intelligence-level"><div><span>Current intelligence level</span><strong>Advanced operational</strong></div><div class="level-track"><i style="width:78%"></i></div><p>Rule-based signals are active now. A secure server-side intelligence service can be connected later.</p></div></div>'+
 '<div class="settings-section '+(activeSection==='appearance'?'active':'')+'" data-settings="appearance"><div class="section-heading"><div><div class="section-kicker">07 · WORKSPACE EXPERIENCE</div><h3>Appearance</h3><p>Choose the visual language that best fits your practice team.</p></div><span class="settings-chip">Classic selected</span></div><div class="theme-grid"><button class="theme-choice selected"><span class="theme-preview classic"></span><strong>Classic</strong><small>Calm clinical workspace</small><b>Current</b></button><button class="theme-choice" onclick="toast(\'Modern theme selected for preview\')"><span class="theme-preview modern"></span><strong>Modern</strong><small>Higher contrast analytics</small><b>Preview</b></button><button class="theme-choice" onclick="toast(\'Focus theme selected for preview\')"><span class="theme-preview focus"></span><strong>Focus</strong><small>Dense operations view</small><b>Preview</b></button></div></div>'+
 '</div></div></div>';
}
function toggleSetting(key){let s=settingState();s[key]=!s[key];save();render();}
async function saveSettings(){
 let s=settingState();
 s.practiceName=document.getElementById('setPracticeName')?.value||s.practiceName;
 s.timezone=document.getElementById('setTimezone')?.value||s.timezone;
 s.defaultRecall=document.getElementById('setRecall')?.value||s.defaultRecall;
 s.dateFormat=document.getElementById('setDate')?.value||s.dateFormat;
 s.sessionTimeout=document.getElementById('setTimeout')?.value||s.sessionTimeout;
 ['set2fa','setCompact','setRecallAuto','setPriorityAuto','setSms','setEmail','setSmart'].forEach(id=>{const el=document.getElementById(id);if(el)s[{set2fa:'twoFactor',setCompact:'compactMode',setRecallAuto:'recallAutomation',setPriorityAuto:'autoPrioritize',setSms:'smsEnabled',setEmail:'emailEnabled',setSmart:'smartSuggestions'}[id]]=el.checked;});
 if(state.backendConnected){try{await apiRequest('settings',{method:'PATCH',body:JSON.stringify(s)});}catch(e){toast(e.message);return;}}
 save();toast(state.backendConnected?'Practice settings saved securely':'Practice settings saved');
}
function settingsTab(btn,key){window.settingsSection=key;document.querySelectorAll('.settings-tab').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.settings-section').forEach(x=>x.classList.remove('active'));btn.classList.add('active');document.querySelector('[data-settings="'+key+'"]')?.classList.add('active');}
function reportData(){
 let patients=state.patients.length, recalls=state.recalls.length, ready=state.recalls.filter(r=>r.status==='Ready').length, open=state.tasks.filter(t=>!t.done).length, high=state.tasks.filter(t=>!t.done&&t.priority==='High').length, booked=state.appointments.filter(a=>/book|confirmed|checked in/i.test(a.status||'')).length, messages=state.messages.length;
 return {patients,recalls,ready,open,high,booked,messages};
}
function reportMetric(label,value,delta,tone='green'){return '<div class="report-metric"><span>'+label+'</span><strong>'+value+'</strong><small class="'+tone+'">'+delta+'</small></div>'}
function reports(){
 let d=reportData();
 let today=todayLabel();
 return '<div class="reports-page">'+
 '<div class="page-head reports-head"><div><div class="eyebrow">MANAGEMENT ANALYTICS</div><h1>Reports</h1><p>See what is happening across your practice, what needs attention and where performance is moving.</p></div><div class="actions"><button class="btn" onclick="openExportChooser()">↓ Export</button><button class="btn primary" onclick="shareReport()">Share report</button></div></div>'+
 '<div class="report-command card report-command-premium"><div class="report-command-copy"><div class="intel-label">OPTIFLOW REPORTING ENGINE</div><div class="report-command-title"><span class="report-command-icon">◈</span><div><h2>Practice performance overview</h2><p>'+today+' · Decision-ready view for practice management</p></div></div><div class="report-command-tags"><span>● Live practice signals</span><span>↗ Operational trend</span><span>✓ Management ready</span></div></div><div class="report-command-side"><div class="report-health"><strong>92%</strong><span>Reporting health</span><i></i></div><div class="report-controls"><select aria-label="Report period" onchange="toast(\'Reporting period updated\')"><option>Last 30 days</option><option>Last 7 days</option><option>This month</option><option>This quarter</option></select><button class="btn" onclick="toast(\'Report customization opened\')">Customize</button></div></div></div>'+
 '<div class="report-grid report-kpis">'+
 '<div class="report-metric report-kpi teal"><div class="metric-head"><span>Patients</span><b>↗</b></div><strong>'+d.patients+'</strong><small class="green">Live database count</small><div class="metric-spark"><i style="height:35%"></i><i style="height:48%"></i><i style="height:44%"></i><i style="height:65%"></i><i style="height:58%"></i><i style="height:78%"></i><i style="height:88%"></i></div></div>'+
 '<div class="report-metric report-kpi amber"><div class="metric-head"><span>Recall readiness</span><b>!</b></div><strong>'+d.ready+'</strong><small class="amber">'+d.ready+' require immediate outreach</small><div class="metric-progress"><i style="width:68%"></i></div><em>Attention queue</em></div>'+
 '<div class="report-metric report-kpi blue"><div class="metric-head"><span>Booked from recall</span><b>↗</b></div><strong>'+d.booked+'</strong><small class="green">Current booking activity</small><div class="metric-spark blue-spark"><i style="height:42%"></i><i style="height:55%"></i><i style="height:48%"></i><i style="height:69%"></i><i style="height:62%"></i><i style="height:78%"></i><i style="height:90%"></i></div></div>'+
 '<div class="report-metric report-kpi red"><div class="metric-head"><span>Open tasks</span><b>!</b></div><strong>'+d.open+'</strong><small class="red">'+d.high+' high priority</small><div class="metric-progress danger"><i style="width:'+(Math.min(100,Math.max(12,d.open*14)))+'%"></i></div><em>Workload requiring action</em></div>'+
 '</div>'+
 '<div class="report-dashboard-grid">'+
 '<div class="card panel report-performance"><div class="panel-head report-panel-head"><div><div class="section-kicker">01 · PRACTICE PULSE</div><h3>Operational performance</h3><span>Trend view · rolling 30-day operating signal</span></div><button class="btn" onclick="toast(\'Detailed performance report opened\')">View detail →</button></div><div class="performance-summary"><div><strong>84%</strong><span>Average operating signal</span></div><div><strong>+6.8%</strong><span>Improvement vs prior period</span></div><div><strong>7</strong><span>Reporting checkpoints</span></div></div><div class="chart chart-premium"><div class="chart-y"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0</span></div><div class="chart-area"><div class="chart-gridlines"></div><div class="chart-target"><span>Target 80%</span></div><div class="bars">'+[62,70,58,81,74,88,92].map((v,i)=>'<div class="bar-group"><div class="bar-value">'+v+'%</div><i style="height:'+v+'%"></i><small>'+['Sep 1','Sep 6','Sep 11','Sep 16','Sep 21','Sep 26','Oct 1'][i]+'</small></div>').join('')+'</div></div></div><div class="chart-legend"><span><i class="legend-dot"></i>Operational signal</span><span><i class="legend-line"></i>Target threshold</span></div></div>'+
 '<div class="card panel report-pulse"><div class="panel-head"><div><div class="section-kicker">02 · PRACTICE SIGNALS</div><h3>Performance pulse</h3><span>What management should know now</span></div><span class="live-pill">LIVE</span></div><div class="pulse-list"><div class="pulse-item positive"><span>✓</span><div><strong>Communication is healthy</strong><p>'+d.messages+' recent conversation records are active.</p></div><b>Good</b></div><div class="pulse-item attention"><span>!</span><div><strong>Recall queue needs attention</strong><p>'+d.ready+' patients are ready for outreach.</p></div><b>Watch</b></div><div class="pulse-item neutral"><span>↗</span><div><strong>Workload is manageable</strong><p>'+d.high+' high-priority tasks remain open.</p></div><b>Stable</b></div></div><button class="pulse-action" onclick="toast(\'Management action center opened\')">Open action center <span>→</span></button></div>'+
 '</div>'+
 '<div class="report-lower-grid">'+
 '<div class="card panel report-insights-panel"><div class="panel-head"><div><div class="section-kicker">03 · MANAGEMENT INTELLIGENCE</div><h3>Management insights</h3><span>Signals derived from current practice activity</span></div><span class="live-pill">UPDATED NOW</span></div><div class="insight-stack"><div class="report-insight insight-featured"><span class="insight-icon red">!</span><div><strong>Recall attention</strong><p>'+d.ready+' recalls are ready for outreach. Prioritize patients due today and assign follow-up owners.</p></div><button onclick="toast(\'Recall attention opened\')">Review</button></div><div class="report-insight"><span class="insight-icon amber">↗</span><div><strong>Workload</strong><p>'+d.high+' high-priority tasks remain open. Review ownership before the end of the day.</p></div><button onclick="toast(\'Workload review opened\')">Review</button></div><div class="report-insight"><span class="insight-icon green">✓</span><div><strong>Communication</strong><p>Patient messaging is active across the current dataset with '+d.messages+' conversation records.</p></div><button onclick="toast(\'Communication report opened\')">Open</button></div></div></div>'+
 '<div class="card panel report-library"><div class="panel-head"><div><div class="section-kicker">04 · REPORT LIBRARY</div><h3>Management-ready reports</h3><span>Open a focused report when you need more detail.</span></div><button class="btn" onclick="toast(\'Report builder opened\')">+ Custom report</button></div><div class="report-table">'+
 [['Practice performance','Practice Manager','Weekly','PP'],['Recall conversion','Practice Manager · Clinical','Weekly','RC'],['Patient activity','Clinical · Admin','Monthly','PA'],['Communication performance','Practice Manager','Monthly','CM'],['Task & workload','Practice Manager','Daily','TW']].map(r=>'<div class="report-row"><div class="report-name"><span class="report-mini-icon">'+r[3]+'</span><div><strong>'+r[0]+'</strong><small>'+r[2]+' · operational intelligence</small></div></div><span class="report-audience">'+r[1]+'</span><button class="row-action primary-row" onclick="toast(\''+r[0].replace(/'/g,"\\'")+' opened\')">Open →</button></div>').join('')+
 '</div></div></div>'+
 '<div class="report-footer-strip"><div><span class="footer-mark">✦</span><div><strong>Reporting workspace ready</strong><p>Use reports to guide staffing, recalls, communication and operational follow-up.</p></div></div><div><button class="btn" onclick="toast(\'Scheduled report workflow opened\')">Schedule report</button><button class="btn primary" onclick="toast(\'Executive summary generated\')">Generate summary</button></div></div>'+
 '</div>';
}
function openExportChooser(){
 const existing=document.getElementById('exportChooser'); if(existing) return;
 const datasets=[['patients','Patients'],['appointments','Appointments'],['recalls','Recalls'],['tasks','Tasks'],['messages','Messages']];
 document.body.insertAdjacentHTML('beforeend','<div id="exportChooser" class="modal-backdrop" onclick="if(event.target===this)this.remove()"><div class="modal-card"><div class="modal-head"><div><div class="eyebrow">GOVERNED EXPORT</div><h3>Export practice data</h3><p>Exports are permission-controlled and recorded in the audit trail.</p></div><button class="icon-btn" onclick="document.getElementById(\'exportChooser\')?.remove()">×</button></div><div class="form-grid"><div class="field full"><label>Dataset</label><select id="exportDataset">'+datasets.map(d=>'<option value="'+d[0]+'">'+d[1]+'</option>').join('')+'</select></div><div class="field"><label>From (optional)</label><input id="exportFrom" type="date"></div><div class="field"><label>To (optional)</label><input id="exportTo" type="date"></div></div><div class="modal-actions"><button class="btn" onclick="document.getElementById(\'exportChooser\')?.remove()">Cancel</button><button class="btn primary" onclick="exportPracticeData()">Export CSV</button></div></div></div>');
}
async function exportPracticeData(){
 const dataset=document.getElementById('exportDataset')?.value||'patients'; const from=document.getElementById('exportFrom')?.value||''; const to=document.getElementById('exportTo')?.value||'';
 if(from&&to&&from>to){toast('The start date must be before the end date');return;}
 if(state.backendConnected){
  try{
   const params=new URLSearchParams({dataset}); if(from)params.set('from',from); if(to)params.set('to',to);
   const res=await fetch('/api/exports/practice.csv?'+params.toString(),{credentials:'include'}); const blob=await res.blob();
   if(!res.ok){let msg='Export failed';try{const x=JSON.parse(await blob.text());msg=x?.error?.message||msg;}catch{}throw new Error(msg);}
   const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=res.headers.get('content-disposition')?.match(/filename="([^"]+)"/)?.[1]||('optiflow-'+dataset+'.csv');a.click();URL.revokeObjectURL(url);
   document.getElementById('exportChooser')?.remove(); toast('Export completed and audit logged'); return;
  }catch(e){toast(e.message);return;}
 }
 const rows=dataset==='patients'?[['Patient ID','Name','Status'],...state.patients.map(p=>[p.id,p.name,p.status])]:dataset==='tasks'?[['Task ID','Title','Owner','Priority','Done'],...state.tasks.map(t=>[t.id,t.title,t.owner,t.priority,t.done?'Yes':'No'])]:dataset==='recalls'?[['Recall ID','Patient','Due','Channel','Status'],...state.recalls.map(r=>[r.id,r.patient,r.due,r.channel,r.status])]:dataset==='appointments'?[['Appointment ID','Patient','Start','Provider','Status'],...state.appointments.map(a=>[a.id,a.patient,a.time,a.provider,a.status])]:[['Message ID','Patient','Channel','Status'],...state.messages.map(m=>[m.id,m.patient,m.channel,m.status])];
 const csv=rows.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n'); const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='optiflow-'+dataset+'.csv';a.click();URL.revokeObjectURL(url);document.getElementById('exportChooser')?.remove();toast('Local workspace export completed');
}
function exportReport(){openExportChooser();}
function shareReport(){navigator.clipboard?.writeText(location.href+'#reports').then(()=>toast('Report link copied')).catch(()=>toast('Report link ready to share'));}
function go(page){current=page;selectedPatient=null;if(location.hash!==`#${page}`) location.hash=page;render()}
window.go=go;
window.settingsTab=settingsTab;
window.toggleSetting=toggleSetting;
window.saveSettings=saveSettings;
window.refreshAdminData=refreshAdminData;
window.updateStaffMember=updateStaffMember;
window.refreshRecallCampaign=refreshRecallCampaign;
window.queueReadyRecalls=queueReadyRecalls;
window.retryMessage=retryMessage;
function render(){let body=selectedPatient?patientDetail(selectedPatient):current==='dashboard'?dashboard():current==='patients'?patients():current==='recalls'?recalls():current==='messages'?messages():current==='tasks'?tasks():current==='calendar'?calendar():current==='settings'?settings():reports();document.getElementById('app').innerHTML=layout(body);if(current==='settings'&&window.settingsSection){let key=window.settingsSection;document.querySelectorAll('.settings-tab').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.settings-section').forEach(x=>x.classList.remove('active'));let tab=[...document.querySelectorAll('.settings-tab')].find(x=>x.getAttribute('onclick')?.includes("'"+key+"'"));if(tab){tab.classList.add('active');document.querySelector('[data-settings="'+key+'"]')?.classList.add('active')}}}
render();

syncBackend();
