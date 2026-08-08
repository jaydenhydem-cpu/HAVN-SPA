-- ══════════════════════════════════════════════════════════════════════
-- Seed for the HAVN booking catalog. Mirrors lib/booking/data/* (the current
-- source of truth for scheduling). Safe to re-run (idempotent upserts).
-- Replace with real staff/services/policy, or manage via a future admin UI.
-- ══════════════════════════════════════════════════════════════════════

-- ── services ───────────────────────────────────────────────────────────
insert into services (id, name, slug, category, description, price_cents, duration_minutes, buffer_before_minutes, buffer_after_minutes, deposit_type, deposit_value, active) values
  ('signature-60','Signature Massage · 60 min','signature-massage-60','Massage','Warm oil, unhurried hands, and pressure that listens.',14000,60,0,15,'percent',20,true),
  ('signature-90','Signature Massage · 90 min','signature-massage-90','Massage','The signature, extended to ninety minutes.',19000,90,0,15,'percent',20,true),
  ('deep-60','Deep Tissue · 60 min','deep-tissue-60','Massage','Slow, deliberate work into the deeper layers.',16000,60,0,15,'percent',20,true),
  ('deep-90','Deep Tissue · 90 min','deep-tissue-90','Massage','A full ninety minutes of focused, deeper work.',21000,90,0,15,'percent',20,true),
  ('hot-stone-75','Hot Stone · 75 min','hot-stone-75','Massage','Basalt warmed in water, drawn along the spine.',17500,75,10,15,'fixed',50,true),
  ('body-60','Body Treatment · 60 min','body-treatment-60','Body','Clay, salt and oil — an exfoliation and wrap.',15000,60,0,15,'percent',20,true),
  ('facial-60','The Facial · 60 min','the-facial-60','Facial','Cleansing, warm compresses and botanical oil, by hand.',15500,60,0,10,'none',0,true)
on conflict (id) do update set
  name=excluded.name, category=excluded.category, description=excluded.description,
  price_cents=excluded.price_cents, duration_minutes=excluded.duration_minutes,
  buffer_before_minutes=excluded.buffer_before_minutes, buffer_after_minutes=excluded.buffer_after_minutes,
  deposit_type=excluded.deposit_type, deposit_value=excluded.deposit_value, active=excluded.active;

-- ── staff ───────────────────────────────────────────────────────────────
insert into staff (id, name, slug, title, bio, image_url, specialties, years_experience, active) values
  ('elena','Elena Rivas','elena-rivas','Senior Massage Therapist','Fifteen years of unhurried, intuitive bodywork.','/images/portrait-1.jpg','{Swedish,"Hot stone",Prenatal}',15,true),
  ('marcus','Marcus Hale','marcus-hale','Deep Tissue & Sports Specialist','A former physiotherapist who works with precision and purpose.','/images/portrait-2.jpg','{"Deep tissue","Sports recovery","Trigger point"}',9,true),
  ('sofia','Sofia Nguyen','sofia-nguyen','Lead Esthetician','A skin-first, ingredient-obsessed practitioner.','/images/portrait-3.jpg','{Facials,"Body treatments","Sensitive skin"}',11,true),
  ('amara','Amara Okafor','amara-okafor','Massage & Body Therapist','Weekend-forward and warm, blending Swedish flow with restorative work.','/images/portrait-1.jpg','{Swedish,"Body treatments",Aromatherapy}',6,true)
on conflict (id) do update set
  name=excluded.name, title=excluded.title, bio=excluded.bio, image_url=excluded.image_url,
  specialties=excluded.specialties, years_experience=excluded.years_experience, active=excluded.active;

-- ── staff ↔ services ─────────────────────────────────────────────────────
insert into staff_services (staff_id, service_id) values
  ('elena','signature-60'),('elena','signature-90'),('elena','hot-stone-75'),('elena','body-60'),
  ('marcus','deep-60'),('marcus','deep-90'),('marcus','signature-60'),('marcus','hot-stone-75'),
  ('sofia','facial-60'),('sofia','body-60'),('sofia','signature-60'),
  ('amara','signature-60'),('amara','signature-90'),('amara','body-60'),('amara','facial-60')
on conflict do nothing;

-- ── recurring availability (day_of_week: 0=Sun … 6=Sat) ──────────────────
insert into staff_availability (staff_id, day_of_week, start_time, end_time) values
  ('elena',1,'10:00','18:00'),('elena',2,'10:00','18:00'),('elena',3,'10:00','18:00'),('elena',4,'10:00','18:00'),
  ('marcus',2,'11:00','19:00'),('marcus',3,'11:00','19:00'),('marcus',4,'11:00','19:00'),('marcus',5,'11:00','19:00'),('marcus',6,'11:00','19:00'),
  ('sofia',3,'09:00','17:00'),('sofia',4,'09:00','17:00'),('sofia',5,'09:00','17:00'),('sofia',6,'09:00','17:00'),('sofia',0,'09:00','17:00'),
  ('amara',5,'11:00','20:00'),('amara',6,'11:00','20:00'),('amara',0,'11:00','20:00')
on conflict do nothing;

-- ── breaks ───────────────────────────────────────────────────────────────
insert into staff_breaks (staff_id, day_of_week, start_time, end_time) values
  ('elena',1,'13:00','14:00'),('elena',2,'13:00','14:00'),('elena',3,'13:00','14:00'),('elena',4,'13:00','14:00'),
  ('marcus',2,'15:00','15:30'),('marcus',3,'15:00','15:30'),('marcus',4,'15:00','15:30'),('marcus',5,'15:00','15:30'),('marcus',6,'15:00','15:30'),
  ('sofia',3,'12:30','13:30'),('sofia',4,'12:30','13:30'),('sofia',5,'12:30','13:30'),('sofia',6,'12:30','13:30'),('sofia',0,'12:30','13:30'),
  ('amara',5,'16:00','16:45'),('amara',6,'16:00','16:45'),('amara',0,'16:00','16:45')
on conflict do nothing;

-- ── example time off (Elena's vacation) ──────────────────────────────────
insert into staff_time_off (staff_id, starts_at, ends_at, reason) values
  ('elena','2026-08-10T00:00:00Z','2026-08-18T04:00:00Z','Vacation')
on conflict do nothing;

-- ── policy ───────────────────────────────────────────────────────────────
insert into booking_policies (id, title, summary, full_text, version, active) values
  ('policy-2026-01','HAVN booking & cancellation policy',
   'A deposit reserves your appointment and is applied toward your service. Deposits are non-refundable for changes made less than 24 hours ahead. Arriving more than 15 minutes late may shorten your service.',
   E'A deposit is required to reserve your appointment. Your deposit is applied toward the final cost of your service.\n\nDeposits are non-refundable for cancellations or rescheduling made less than 24 hours before the appointment.\n\nGuests arriving more than 15 minutes late may receive a shortened service or may need to reschedule.\n\nMissed appointments may forfeit the deposit.',
   '2026-01', true)
on conflict (id) do update set summary=excluded.summary, full_text=excluded.full_text, version=excluded.version, active=excluded.active;
