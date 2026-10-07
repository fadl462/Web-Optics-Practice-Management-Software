-- OPTIONAL DEVELOPMENT/DEMO SEED
-- Do NOT run this against a live production database containing real patient data.
-- It creates clearly fictional demo records so the OptiFlow UI can be tested end-to-end.
PRAGMA foreign_keys = ON;

INSERT OR IGNORE INTO patients (id,first_name,last_name,date_of_birth,phone,email,status,created_at,updated_at) VALUES
('P-10482','Amelia','Carter','1989-03-14','+1 (404) 555-0182','amelia.carter@email.com','Active','2026-09-04T09:00:00Z','2026-09-04T09:00:00Z'),
('P-10477','Marcus','Johnson','1977-11-22','+1 (404) 555-0144','marcus.j@email.com','Recall due','2026-09-18T09:00:00Z','2026-09-18T09:00:00Z'),
('P-10463','Sofia','Williams','1994-07-06','+1 (404) 555-0198','sofia.w@email.com','Active','2026-08-28T09:00:00Z','2026-08-28T09:00:00Z'),
('P-10421','Daniel','Kim','1968-01-31','+1 (404) 555-0121','daniel.kim@email.com','Recall due','2026-09-12T09:00:00Z','2026-09-12T09:00:00Z'),
('P-10398','Olivia','Thompson','2002-05-19','+1 (404) 555-0167','olivia.t@email.com','Active','2026-08-21T09:00:00Z','2026-08-21T09:00:00Z');

INSERT OR IGNORE INTO insurance_policies (id,patient_id,provider,policy_number,member_id,status,created_at,updated_at) VALUES
('INS-10482','P-10482','VSP Vision Care','VSP-883041','VSP-883041','Verified','2026-09-04T09:00:00Z','2026-09-04T09:00:00Z'),
('INS-10477','P-10477','EyeMed','EM-221093','EM-221093','Verified','2026-09-18T09:00:00Z','2026-09-18T09:00:00Z'),
('INS-10463','P-10463','Blue View Vision','BV-770182','BV-770182','Verified','2026-08-28T09:00:00Z','2026-08-28T09:00:00Z'),
('INS-10421','P-10421','Medicare','MC-482910','MC-482910','Verified','2026-09-12T09:00:00Z','2026-09-12T09:00:00Z'),
('INS-10398','P-10398','Aetna Vision','AV-550731','AV-550731','Verified','2026-08-21T09:00:00Z','2026-08-21T09:00:00Z');

INSERT OR IGNORE INTO prescriptions (id,patient_id,prescribed_at,od_sphere,od_cylinder,od_axis,od_add,os_sphere,os_cylinder,os_axis,os_add,notes,created_at) VALUES
('RX-10482','P-10482','2026-09-04','-2.25','-0.75','090','+1.25','-2.00','-0.50','085','+1.25','Dry eye symptoms reported; daily disposable preference.','2026-09-04T09:00:00Z'),
('RX-10477','P-10477','2025-09-18','-1.00','-0.50','170','+2.00','-0.75','-0.25','010','+2.00','Progressive wearer; family history of glaucoma.','2025-09-18T09:00:00Z'),
('RX-10463','P-10463','2026-08-28','Plano','-0.50','180',NULL,'+0.25','-0.25','175',NULL,'Contact lens wearer.','2026-08-28T09:00:00Z'),
('RX-10421','P-10421','2025-09-12','+1.75','-1.00','090','+2.50','+2.00','-0.75','095','+2.50','Cataract monitoring; ophthalmology referral if progression.','2025-09-12T09:00:00Z'),
('RX-10398','P-10398','2026-08-21','-3.50','-0.25','120',NULL,'-3.25','-0.50','060',NULL,'High myopia; myopia management discussed.','2026-08-21T09:00:00Z');

INSERT OR IGNORE INTO medical_history (id,patient_id,event_date,category,description,created_at) VALUES
('H-10482','P-10482','2026-09-04','Ocular','Dry eye symptoms reported.','2026-09-04T09:00:00Z'),
('H-10477','P-10477','2025-09-18','Family history','Family history of glaucoma documented.','2025-09-18T09:00:00Z'),
('H-10421','P-10421','2025-09-12','Ocular','Cataract monitoring; ophthalmology referral if progression.','2025-09-12T09:00:00Z'),
('H-10398','P-10398','2026-08-21','Ocular','High myopia; myopia management discussed.','2026-08-21T09:00:00Z');

INSERT OR IGNORE INTO recalls (id,patient_id,type,due_date,channel,status,source,created_at,updated_at) VALUES
('RCL-10477','P-10477','Annual exam','2026-10-06','SMS + Email','Ready','Automated','2026-09-18T09:00:00Z','2026-09-18T09:00:00Z'),
('RCL-10421','P-10421','Annual exam','2026-10-06','SMS + Email','Ready','Automated','2026-09-12T09:00:00Z','2026-09-12T09:00:00Z'),
('RCL-10463','P-10463','Annual exam','2026-10-07','Email','Scheduled','Automated','2026-08-28T09:00:00Z','2026-08-28T09:00:00Z');

INSERT OR IGNORE INTO tasks (id,title,owner,patient_id,due_date,priority,done,created_at,updated_at) VALUES
('TSK-1','Verify insurance for Marcus Johnson','Front Desk','P-10477','2026-10-06','High',0,'2026-10-06T08:00:00Z','2026-10-06T08:00:00Z'),
('TSK-2','Review abnormal OCT referral — Daniel Kim','Dr. Maya Bennett','P-10421','2026-10-06','High',0,'2026-10-06T08:15:00Z','2026-10-06T08:15:00Z'),
('TSK-3','Call Amelia Carter about lens order','Front Desk','P-10482','2026-10-07','Normal',0,'2026-10-06T08:30:00Z','2026-10-06T08:30:00Z');

INSERT OR IGNORE INTO appointments (id,patient_id,start_at,end_at,visit_type,provider,status,created_at,updated_at) VALUES
('APT-1','P-10482','2026-10-06T09:00:00Z','2026-10-06T09:45:00Z','Comprehensive eye exam','Dr. Maya Bennett','Checked in','2026-10-05T12:00:00Z','2026-10-06T09:00:00Z'),
('APT-2','P-10477','2026-10-06T10:30:00Z','2026-10-06T11:15:00Z','Annual eye exam','Dr. Maya Bennett','Confirmed','2026-10-05T12:00:00Z','2026-10-05T12:00:00Z'),
('APT-3','P-10463','2026-10-06T11:15:00Z','2026-10-06T12:00:00Z','Contact lens review','Dr. Maya Bennett','Confirmed','2026-10-05T12:00:00Z','2026-10-05T12:00:00Z');

INSERT OR IGNORE INTO messages (id,patient_id,channel,direction,body,status,created_at,updated_at) VALUES
('MSG-1','P-10482','SMS','inbound','Hi, I will come by tomorrow to collect my contact lenses.','Delivered','2026-10-06T14:18:00Z','2026-10-06T14:18:00Z'),
('MSG-2','P-10482','SMS','outbound','Perfect, thank you! We will have them ready at reception.','Delivered','2026-10-06T14:24:00Z','2026-10-06T14:24:00Z'),
('MSG-3','P-10477','SMS','outbound','Your annual eye exam is due. Reply to this message or call us to schedule.','Delivered','2026-10-05T10:04:00Z','2026-10-05T10:04:00Z');
