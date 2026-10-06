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
const validPages=['dashboard','patients','recalls','messages','tasks'];
const savedRoute=location.hash.replace(/^#/,'');
let current=validPages.includes(savedRoute)?savedRoute:(savedRoute.startsWith('patient=')?'patients':'dashboard');
let selectedPatient=null, search='';
if(savedRoute.startsWith('patient=')){const pid=decodeURIComponent(savedRoute.slice(8));selectedPatient=state.patients.find(p=>p.id===pid)||null;}
window.addEventListener('hashchange',()=>{const h=location.hash.replace(/^#/,'');if(validPages.includes(h)){current=h;selectedPatient=null;render();}else if(h.startsWith('patient=')){const pid=decodeURIComponent(h.slice(8));selectedPatient=state.patients.find(p=>p.id===pid)||null;current='patients';render();}});
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const save=()=>localStorage.setItem('optiflow_state',JSON.stringify(state));
const initials=n=>n.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();
const toast=m=>{const x=document.createElement('div');x.className='toast';x.textContent=m;document.body.appendChild(x);setTimeout(()=>x.remove(),2400)};
function nav(){return `<aside class="sidebar"><div class="brand"><div class="logo">◉</div><div><strong>OptiFlow</strong><small>Practice Management</small></div></div><div class="nav-title">Workspace</div><div class="nav">${[['dashboard','▦','Dashboard'],['patients','♙','Patients'],['recalls','◷','Recalls'],['messages','✉','Messages'],['tasks','✓','Tasks']].map(x=>`<button class="${current===x[0]?'active':''}" onclick="go('${x[0]}')"><span class="ico">${x[1]}</span>${x[2]}</button>`).join('')}</div><div class="nav-title">Practice</div><div class="nav"><button onclick="toast('Settings panel coming next')"><span class="ico">⚙</span>Settings</button><button onclick="toast('Reports are ready to configure')"><span class="ico">▥</span>Reports</button></div><div class="sidebar-foot"><div class="user-mini"><div class="avatar">${state.user.initials}</div><div><strong>${state.user.name}</strong><span>${state.user.role}</span></div></div></div></aside>`}
function topbar(){return `<header class="topbar"><div class="crumb">OptiFlow / <strong>${current[0].toUpperCase()+current.slice(1)}</strong></div><div class="top-actions"><button class="icon-btn" onclick="toast('No new notifications')">♢</button><span class="role">${state.user.role}</span><div class="avatar">${state.user.initials}</div></div></header>`}
function layout(body){return `<div class="app">${nav()}<main class="main">${topbar()}<section class="content">${body}</section></main><nav class="mobile-nav">${[['dashboard','▦','Home'],['patients','♙','Patients'],['recalls','◷','Recalls'],['messages','✉','Messages'],['tasks','✓','Tasks']].map(x=>`<button class="${current===x[0]?'active':''}" onclick="go('${x[0]}')"><span>${x[1]}</span>${x[2]}</button>`).join('')}</nav></div>`}
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
function appointmentsToday(){
 return '<div class="card panel"><div class="panel-head"><h3>Today\'s appointments</h3><button class="btn" onclick="toast(\'Appointment calendar coming next\')">View calendar</button></div><div class="appointment-list">'+(state.appointments||[]).slice(0,5).map(a=>'<div class="appointment-row"><div class="appt-time">'+a.time+'</div><div class="appt-main"><strong>'+esc(a.patient)+'</strong><span>'+esc(a.visit)+' · '+esc(a.provider)+'</span></div><span class="badge '+appointmentStatus(a.status)+'">'+a.status+'</span></div>').join('')+'</div></div>';
}
function attentionPanel(){
 let items=[];
 state.patients.filter(p=>p.status==='Recall due').slice(0,2).forEach(p=>items.push({name:p.name,reason:'Recall due',target:'recalls'}));
 state.tasks.filter(t=>!t.done&&t.priority==='High').slice(0,2).forEach(t=>items.push({name:t.title,reason:'High-priority task',target:'tasks'}));
 return '<div class="card panel"><div class="panel-head"><h3>Attention required</h3><span>'+items.length+' items</span></div><div class="attention-list">'+(items.length?items.slice(0,4).map(i=>'<div class="attention-row"><div class="attention-dot">!</div><div><strong>'+esc(i.name)+'</strong><p>'+esc(i.reason)+'</p></div><button class="btn" onclick="go(\''+i.target+'\')">Review</button></div>').join(''):'<div class="empty">No urgent items right now.</div>')+'</div></div>';
}
function dashboard(){
 let due=state.recalls.filter(x=>x.status==='Ready').length;
 let openTasks=state.tasks.filter(t=>!t.done).length;
 return '<div class="page-head"><div><h1>Good evening, Dr. Bennett</h1><p>Tuesday, 6 October 2026 · Here is what needs your attention today.</p></div><div class="actions"><button class="btn" onclick="openModal(\'appointment\')">Schedule appointment</button><button class="btn" onclick="openModal(\'schedule\')">+ Schedule recall</button><button class="btn primary" onclick="openModal(\'patient\')">+ New patient</button></div></div>'+intelligencePanel()+'<div class="grid stats"><div class="card stat"><div class="stat-top">Patients <div class="stat-icon">♙</div></div><h2>'+state.patients.length+'</h2><p><span class="positive">+12%</span> vs last month</p></div><div class="card stat"><div class="stat-top">Recalls due <div class="stat-icon">◷</div></div><h2>'+(due+12)+'</h2><p><span class="negative">'+due+' ready</span> for outreach</p></div><div class="card stat"><div class="stat-top">Messages <div class="stat-icon">✉</div></div><h2>38</h2><p><span class="positive">31 delivered</span> · 7 pending</p></div><div class="card stat"><div class="stat-top">Open tasks <div class="stat-icon">✓</div></div><h2>'+openTasks+'</h2><p><span class="negative">'+state.tasks.filter(t=>!t.done&&t.priority==='High').length+' high priority</span></p></div></div><div class="grid two" style="margin-top:16px">'+appointmentsToday()+attentionPanel()+'</div><div class="grid two" style="margin-top:16px"><div class="card panel"><div class="panel-head"><h3>Recall automation</h3><span>Next run · 6:00 PM</span></div><div class="notice"><strong>Annual exam campaign is active.</strong><br>Patients due within 30 days are queued automatically. Staff can review, edit, pause or send manually.</div><div class="kpi-row" style="margin-top:18px"><div class="kpi"><span>Queued</span><strong>24</strong><div class="progress"><i style="width:62%"></i></div></div><div class="kpi"><span>Delivered</span><strong>148</strong><div class="progress"><i style="width:88%"></i></div></div><div class="kpi"><span>Booked</span><strong>19</strong><div class="progress"><i style="width:47%"></i></div></div></div></div><div class="card panel"><div class="panel-head"><h3>Recent activity</h3><span>Live</span></div><div class="timeline">'+(state.activity||[]).slice(0,4).map(e=>'<div class="event"><div class="dot">'+e.icon+'</div><div><strong>'+esc(e.title)+'</strong><p>'+esc(e.detail)+'</p></div><time>'+e.time+'</time></div>').join('')+'</div></div></div>';
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
 return '<div class="page-head"><div><h1>Recall Center</h1><p>Automated and staff-managed patient follow-up, prioritized by OptiFlow intelligence.</p></div><div class="actions"><button class="btn" onclick="toast(\'Campaign settings opened\')">Campaign settings</button><button class="btn primary" onclick="openModal(\'schedule\')">+ Manual follow-up</button></div></div>'+
 recallInsight()+
 '<div class="grid stats recall-stats"><div class="card stat"><div class="stat-top">Due today <div class="stat-icon">◷</div></div><h2>'+dueToday+'</h2><p><span class="negative">'+ready+' ready</span> for outreach</p></div><div class="card stat"><div class="stat-top">Ready to send <div class="stat-icon">↗</div></div><h2>'+ready+'</h2><p>'+scheduled+' scheduled next</p></div><div class="card stat"><div class="stat-top">Delivery rate <div class="stat-icon">✓</div></div><h2>94.2%</h2><p>Across last 30 days</p></div><div class="card stat"><div class="stat-top">Booked <div class="stat-icon">★</div></div><h2>19</h2><p>From recall outreach</p></div></div>'+
 '<div class="recall-toolbar card"><div><strong>Campaign automation</strong><span class="automation-dot"></span><b>ON</b><p>Next automated run · 6:00 PM</p></div><div class="recall-filters"><button class="btn recall-filter '+(filter==='all'?'active':'')+'" onclick="setRecallFilter(\'all\')">All</button><button class="btn recall-filter '+(filter==='high'?'active':'')+'" onclick="setRecallFilter(\'high\')">High priority</button><button class="btn recall-filter '+(filter==='ready'?'active':'')+'" onclick="setRecallFilter(\'ready\')">Ready</button><button class="btn recall-filter '+(filter==='scheduled'?'active':'')+'" onclick="setRecallFilter(\'scheduled\')">Scheduled</button></div></div>'+
 '<div class="card panel" style="margin-top:16px"><div class="panel-head"><div><h3>Intelligent recall queue</h3><span>Patients are ranked by urgency and recommended next action</span></div><span>'+sorted.length+' records</span></div><div class="table-wrap"><table class="table recall-table"><thead><tr><th>Priority</th><th>Patient</th><th>Recall</th><th>Due</th><th>Recommended channel</th><th>Status</th><th>Next action</th></tr></thead><tbody>'+
 sorted.map(r=>{let q=recallPriority(r),ch=recallRecommendation(r);return '<tr><td><span class="badge '+q.tone+'">'+q.label+'</span><span class="table-sub">'+q.reason+'</span></td><td><strong>'+esc(r.patient)+'</strong></td><td>'+esc(r.type)+'</td><td>'+esc(r.due)+'</td><td><strong>'+ch+'</strong><span class="table-sub">Optimized by contact data</span></td><td><span class="badge '+(r.status==='Ready'?'amber':r.status==='Sent'?'green':'blue')+'">'+esc(r.status)+'</span></td><td><div class="recall-actions"><button class="row-action" onclick="openPatientByName(\''+r.patient.replace(/'/g,"\\\'")+'\')">Patient</button><button class="row-action primary-row" onclick="sendRecall('+r.id+')">'+(r.status==='Ready'?'Send now':'Review')+'</button></div></td></tr>'}).join('')+
 '</tbody></table></div></div>'+
 '<div class="grid two" style="margin-top:16px"><div class="card panel"><div class="panel-head"><h3>Recall funnel</h3><span>Current campaign</span></div><div class="recall-funnel"><div><span>Queued</span><strong>24</strong><i style="width:100%"></i></div><div><span>Delivered</span><strong>148</strong><i style="width:78%"></i></div><div><span>Booked</span><strong>19</strong><i style="width:32%"></i></div></div></div><div class="card panel"><div class="panel-head"><h3>Recommended actions</h3><span>Priority queue</span></div><div class="recommend-list">'+(ready?state.recalls.filter(r=>r.status==='Ready').slice(0,3).map(r=>{let q=recallPriority(r);return '<div class="recommend-row"><div class="attention-dot">!</div><div><strong>'+esc(r.patient)+'</strong><p>'+q.label+' priority · '+q.reason+'</p></div><button class="row-action primary-row" onclick="sendRecall('+r.id+')">Act</button></div>'}).join(''):'<div class="empty">No recall actions pending.</div>')+'</div></div></div>';
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
 let pending=7;
 return '<div class="page-head"><div><h1>Messages</h1><p>One communication workspace for SMS, email and patient follow-up.</p></div><div class="actions"><button class="btn" onclick="openModal(\'message\',\''+esc(selected).replace(/'/g,"\\\'")+'\')">Compose</button><button class="btn primary" onclick="openModal(\'message\',\''+esc(selected).replace(/'/g,"\\\'")+'\')">+ New message</button></div></div>'+
 '<div class="grid stats message-stats"><div class="card stat"><div class="stat-top">Unread <div class="stat-icon">●</div></div><h2>'+unread+'</h2><p><span class="negative">Needs response</span></p></div><div class="card stat"><div class="stat-top">Messages today <div class="stat-icon">✉</div></div><h2>'+today+'</h2><p>Across active conversations</p></div><div class="card stat"><div class="stat-top">Awaiting reply <div class="stat-icon">◷</div></div><h2>'+pending+'</h2><p>Patient follow-up queue</p></div><div class="card stat"><div class="stat-top">Response health <div class="stat-icon">✓</div></div><h2>92%</h2><p><span class="positive">Good</span> communication flow</p></div></div>'+
 '<div class="message-intelligence card"><div class="intel-icon">✦</div><div class="intel-copy"><div class="intel-label">OPTIFLOW COMMUNICATION INTELLIGENCE</div><strong>'+ (unread?unread+' patient message'+(unread===1?' needs':'s need')+' attention.':'Communication queue is clear.') +'</strong><p>'+(unread?'OptiFlow recommends responding to unread patient messages before starting non-urgent outbound communication.':'No unread patient messages are currently flagged.')+'</p></div><button class="btn" onclick="setMessageFilter(\'unread\')">Show priority messages</button></div>'+
 '<div class="message-workspace">'+
 '<div class="card conversation-list"><div class="conversation-head"><div><h3>Conversations</h3><span>'+visible.length+' active</span></div></div><div class="message-search"><span>⌕</span><input value="'+esc(window.messageSearch||'')+'" oninput="window.messageSearch=this.value;render()" placeholder="Search patients or conversations…"></div><div class="message-filters"><button class="btn '+(filter==='all'?'active':'')+'" onclick="setMessageFilter(\'all\')">All</button><button class="btn '+(filter==='unread'?'active':'')+'" onclick="setMessageFilter(\'unread\')">Unread</button><button class="btn '+(filter==='sms'?'active':'')+'" onclick="setMessageFilter(\'sms\')">SMS</button><button class="btn '+(filter==='email'?'active':'')+'" onclick="setMessageFilter(\'email\')">Email</button></div><div class="conversation-items">'+
 visible.map(p=>{let last=messageLast(p.name);return '<button class="conversation-item '+(selected===p.name?'selected':'')+'" onclick="selectConversation(\''+p.name.replace(/'/g,"\\\'")+'\')"><div class="avatar">'+initials(p.name)+'</div><div class="conversation-copy"><div><strong>'+esc(p.name)+'</strong><time>'+esc(last?.time||'')+'</time></div><p>'+esc(last?.text||'No messages yet')+'</p><div class="conversation-meta"><span class="channel-pill">'+esc(last?.channel||'SMS')+'</span>'+(messageUnread(p.name)?'<span class="unread-dot">New</span>':'')+'</div></div></button>'}).join('')+
 (visible.length?'':'<div class="empty">No conversations match this view.</div>')+'</div></div>'+
 '<div class="card chat-panel"><div class="chat-head"><div class="chat-person"><div class="avatar">'+initials(patient?.name||selected)+'</div><div><strong>'+esc(patient?.name||selected)+'</strong><span>'+esc(patient?.phone||'')+' · '+esc(patient?.email||'')+'</span></div></div><div class="chat-actions"><span class="channel-pill">SMS</span><button class="row-action" onclick="openPatientByName(\''+String(patient?.name||selected).replace(/'/g,"\\\'")+'\')">Patient record</button></div></div><div class="chat-intelligence"><span>✦</span><div><strong>Suggested next step</strong><p>'+ (messageUnread(selected)?'Respond to this patient before sending a new recall campaign message.':'No urgent response required. Consider a follow-up if this conversation is linked to an outstanding task.') +'</p></div></div><div class="chat-thread">'+conversation.map(m=>'<div class="chat-message '+(m.mine?'mine':'')+'"><div class="bubble">'+esc(m.text)+'</div><time>'+esc(m.time)+'</time></div>').join('')+'</div><div class="composer"><select id="composerChannel"><option>SMS</option><option>Email</option></select><input id="quickMsg" placeholder="Write a patient-friendly message…" onkeydown="if(event.key===\'Enter\')quickMessage()"><button class="btn primary" onclick="quickMessage()">Send</button></div></div></div>';
}
function setMessageFilter(filter){window.messageFilter=filter;render();}
function selectConversation(name){window.selectedConversation=name;state.messages.filter(m=>m.patient===name).forEach(m=>{if(!m.mine)m.unread=false});save();render();}

function tasks(){return `<div class="page-head"><div><h1>Tasks</h1><p>Keep the whole practice aligned on what needs to happen next.</p></div><div class="actions"><button class="btn primary" onclick="openModal('task')">+ New task</button></div></div><div class="grid three"><div class="card stat"><div class="stat-top">Open <div class="stat-icon">○</div></div><h2>${state.tasks.filter(t=>!t.done).length}</h2><p>Across the practice</p></div><div class="card stat"><div class="stat-top">High priority <div class="stat-icon">!</div></div><h2>${state.tasks.filter(t=>!t.done&&t.priority==='High').length}</h2><p>Needs attention today</p></div><div class="card stat"><div class="stat-top">Completed <div class="stat-icon">✓</div></div><h2>${state.tasks.filter(t=>t.done).length}</h2><p>Recently closed</p></div></div><div class="card panel" style="margin-top:16px"><div class="panel-head"><h3>Practice task list</h3><span>Real-time status</span></div>${state.tasks.map(taskHTML).join('')}</div>`}
function patientDetail(p){return `<div class="page-head"><div><button class="btn" onclick="go('patients')">← Back to patients</button></div><div class="actions"><button class="btn" onclick="openModal('message', '${p.name}')">Message patient</button><button class="btn primary" onclick="openModal('appointment')">Schedule appointment</button></div></div><div class="patient-detail"><div class="card profile-card"><div class="avatar">${initials(p.name)}</div><h2>${p.name}</h2><p>${p.id} · ${p.status}</p><div class="profile-list"><div><span>Date of birth</span><strong>${p.dob}</strong></div><div><span>Phone</span><strong>${p.phone}</strong></div><div><span>Email</span><strong>${p.email}</strong></div><div><span>Insurance</span><strong>${p.insurance}</strong></div><div><span>Policy</span><strong>${p.policy}</strong></div><div><span>Next recall</span><strong>${p.nextRecall}</strong></div></div></div><div class="card panel"><div class="tabs"><button class="tab active">Overview</button><button class="tab">Medical history</button><button class="tab">Prescriptions</button><button class="tab">Insurance</button><button class="tab">Communications</button></div><div class="notice"><strong>Clinical note</strong><br>${esc(p.notes)}</div><div class="grid two" style="margin-top:16px"><div><div class="panel-head"><h3>Current prescription</h3><span>Last updated ${p.lastVisit}</span></div><table class="table"><thead><tr><th></th><th>OD</th><th>OS</th></tr></thead><tbody><tr><td>Sphere / Cylinder</td><td>${p.rx.od}</td><td>${p.rx.os}</td></tr><tr><td>Add</td><td>${p.rx.add}</td><td>${p.rx.add}</td></tr></tbody></table></div><div><div class="panel-head"><h3>Record timeline</h3><span>Latest first</span></div><div class="timeline"><div class="event"><div class="dot">♙</div><div><strong>Routine eye examination</strong><p>Prescription updated and recall set for one year.</p></div><time>${p.lastVisit}</time></div><div class="event"><div class="dot">✉</div><div><strong>Recall reminder sent</strong><p>SMS + email</p></div><time>2 days ago</time></div><div class="event"><div class="dot">▣</div><div><strong>Insurance verified</strong><p>${p.insurance} · ${p.policy}</p></div><time>3 days ago</time></div></div></div></div></div></div></div>`}
function openPatient(id){selectedPatient=state.patients.find(p=>p.id===id);current='patients';location.hash='patient='+encodeURIComponent(id);render();}
function openModal(type,arg=''){let title=type==='patient'?'Add patient':type==='schedule'?'Schedule manual recall':type==='message'?'New patient message':type==='task'?'Create task':'Schedule appointment';let body='';if(type==='patient')body=`<div class="form-grid"><div class="field"><label>First name</label><input id="f1"></div><div class="field"><label>Last name</label><input id="f2"></div><div class="field"><label>Date of birth</label><input id="f3" type="date"></div><div class="field"><label>Phone</label><input id="f4"></div><div class="field"><label>Email</label><input id="f5" type="email"></div><div class="field"><label>Insurance provider</label><input id="f6"></div><div class="field"><label>Policy number</label><input id="f7"></div><div class="field"><label>Next recall</label><input id="f8" type="date"></div><div class="field full"><label>Clinical notes</label><textarea id="f9" rows="3"></textarea></div></div>`;if(type==='schedule')body=`<div class="form-grid"><div class="field"><label>Patient</label><select id="f1">${state.patients.map(p=>`<option>${p.name}</option>`).join('')}</select></div><div class="field"><label>Recall type</label><select><option>Annual eye examination</option><option>Contact lens review</option><option>Dry eye review</option></select></div><div class="field"><label>Send date</label><input type="date" id="f3"></div><div class="field"><label>Channels</label><select><option>SMS + Email</option><option>SMS only</option><option>Email only</option></select></div><div class="field full"><label>Message</label><textarea rows="4">Your eye examination is due. Reply to this message or contact our practice to schedule an appointment.</textarea></div></div>`;if(type==='message')body=`<div class="field"><label>Patient</label><select>${state.patients.map(p=>`<option ${p.name===arg?'selected':''}>${p.name}</option>`).join('')}</select></div><div class="field"><label>Channel</label><select><option>SMS</option><option>Email</option></select></div><div class="field"><label>Message</label><textarea rows="6" placeholder="Write a clear, patient-friendly message…"></textarea></div>`;if(type==='task')body=`<div class="form-grid"><div class="field full"><label>Task</label><input id="f1" placeholder="e.g. Verify insurance for new patient"></div><div class="field"><label>Assign to</label><select><option>Sarah L.</option><option>Jordan P.</option><option>Dr. Bennett</option></select></div><div class="field"><label>Priority</label><select id="f2"><option>Normal</option><option>High</option><option>Low</option></select></div><div class="field"><label>Due date</label><input id="f3" type="date"></div></div>`;if(type==='appointment')body=`<div class="notice"><strong>${selectedPatient?.name||'Patient'}</strong> is ready to be scheduled.</div><div class="form-grid" style="margin-top:15px"><div class="field"><label>Date</label><input type="date"></div><div class="field"><label>Time</label><input type="time"></div><div class="field"><label>Visit type</label><select><option>Comprehensive eye exam</option><option>Contact lens review</option><option>Frame/lens collection</option></select></div><div class="field"><label>Provider</label><select><option>Dr. Maya Bennett</option></select></div></div>`;document.body.insertAdjacentHTML('beforeend',`<div class="modal" id="modal"><div class="modal-card"><div class="modal-head"><h2>${title}</h2><button class="icon-btn" onclick="closeModal()">×</button></div><div class="modal-body">${body}</div><div class="modal-foot"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn primary" onclick="submitModal('${type}')">${type==='message'?'Send message':type==='appointment'?'Book appointment':'Save'}</button></div></div></div>`)}
function closeModal(){document.getElementById('modal')?.remove()}
function submitModal(type){if(type==='patient'){const name=((document.getElementById('f1')?.value||'New')+' '+(document.getElementById('f2')?.value||'Patient')).trim();state.patients.unshift({id:'P-'+Math.floor(10000+Math.random()*89999),name,dob:document.getElementById('f3')?.value||'Not provided',phone:document.getElementById('f4')?.value||'—',email:document.getElementById('f5')?.value||'—',insurance:document.getElementById('f6')?.value||'Self-pay',policy:document.getElementById('f7')?.value||'—',status:'Active',lastVisit:'New record',nextRecall:document.getElementById('f8')?.value||'Not set',rx:{od:'—',os:'—',add:'—'},notes:document.getElementById('f9')?.value||''});toast('Patient record created')}else if(type==='task'){state.tasks.unshift({id:Date.now(),title:document.getElementById('f1').value||'New task',owner:'Sarah L.',due:document.getElementById('f3').value||'Today',priority:document.getElementById('f2').value,done:false});toast('Task created')}else if(type==='message'){state.messages.push({patient:'Amelia Carter',time:'Just now',text:'Message sent successfully.',mine:true,channel:'SMS'});toast('Message sent')}else if(type==='schedule'){state.recalls.unshift({id:Date.now(),patient:document.getElementById('f1').value,type:'Annual eye examination',due:'Scheduled',channel:'SMS + Email',status:'Scheduled'});toast('Recall scheduled')}else toast('Appointment booked');save();closeModal();render()}
function sendRecall(id){let r=state.recalls.find(x=>x.id===id);if(r){r.status='Sent';save();toast(`Recall sent to ${r.patient}`);render()}}
function toggleTask(id){
 let t=state.tasks.find(x=>x.id===id);
 if(t){
  t.done=!t.done;
  state.activity=state.activity||[];
  state.activity.unshift({icon:t.done?'✓':'◷',title:t.done?'Task completed':'Task reopened',detail:t.title,time:'Just now'});
  state.activity=state.activity.slice(0,12);
  save();render();toast(t.done?'Task completed':'Task reopened');
 }
}
function quickMessage(){
 const el=document.getElementById('quickMsg'); if(!el?.value.trim())return;
 const patient=window.selectedConversation||'Amelia Carter';
 const channel=document.getElementById('composerChannel')?.value||'SMS';
 state.messages.push({patient,time:'Just now',text:el.value.trim(),mine:true,channel});
 save(); render(); toast(channel+' message sent');
}
function go(page){current=page;selectedPatient=null;location.hash=page;render()}
function render(){let body=selectedPatient?patientDetail(selectedPatient):current==='dashboard'?dashboard():current==='patients'?patients():current==='recalls'?recalls():current==='messages'?messages():tasks();document.getElementById('app').innerHTML=layout(body)}
render();
