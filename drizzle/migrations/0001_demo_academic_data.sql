-- Fix Matemática teacher (was pointing to a non-existent user) -> Pedro Silva
UPDATE public.subjects SET teacher_id = '415b7802-411f-4ed0-a869-a78859ec8fc8' WHERE code = 'Mat01';

-- Add demo subjects for the other courses (teacher: Pedro Silva)
INSERT INTO public.subjects (name, code, course_id, teacher_id, year, semester) VALUES
  ('Física Aplicada', 'FA01', 'c454d9d1-2e40-40f4-a15c-125bdc3acb4b', '415b7802-411f-4ed0-a869-a78859ec8fc8', 1, 1),
  ('Sistemas Solares', 'SS01', '2cf479e9-9a58-4d0b-b7fb-4d2598b52a40', '415b7802-411f-4ed0-a869-a78859ec8fc8', 1, 1),
  ('Termodinâmica', 'TD01', 'fc470a4f-e710-409b-81fb-0bd3238e9b28', '415b7802-411f-4ed0-a869-a78859ec8fc8', 1, 1);

-- Demo schedules (1=Segunda ... 5=Sexta)
INSERT INTO public.schedules (subject_id, day_of_week, start_time, end_time, room) VALUES
  ('cd6ec5f6-0789-451d-8b29-179b668cc43a', 1, '07:30', '09:00', 'Sala A1'),
  ('cd6ec5f6-0789-451d-8b29-179b668cc43a', 3, '09:15', '10:45', 'Sala A1'),
  ('3a3e5c81-c6b5-42fb-a9e0-d012888bbb42', 2, '07:30', '09:00', 'Lab. Electricidade'),
  ('3a3e5c81-c6b5-42fb-a9e0-d012888bbb42', 4, '10:00', '11:30', 'Lab. Electricidade');