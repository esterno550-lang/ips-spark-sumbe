-- Enroll demo student in Energia e Instalações Eléctricas, year 1
INSERT INTO public.enrollments (student_id, course_id, academic_year, year_level) VALUES
  ('a0015f34-e0f4-4dce-80e4-8c0d046da794', 'c454d9d1-2e40-40f4-a15c-125bdc3acb4b', '2025/2026', 1);

-- Demo grades (Matemática + Física Aplicada, 4 phases)
INSERT INTO public.grades (student_id, subject_id, grade_type, grade, graded_by) VALUES
  ('a0015f34-e0f4-4dce-80e4-8c0d046da794', 'cd6ec5f6-0789-451d-8b29-179b668cc43a', 'prova1', 14.5, '415b7802-411f-4ed0-a869-a78859ec8fc8'),
  ('a0015f34-e0f4-4dce-80e4-8c0d046da794', 'cd6ec5f6-0789-451d-8b29-179b668cc43a', 'prova2', 13.0, '415b7802-411f-4ed0-a869-a78859ec8fc8'),
  ('a0015f34-e0f4-4dce-80e4-8c0d046da794', 'cd6ec5f6-0789-451d-8b29-179b668cc43a', 'trabalho', 16.0, '415b7802-411f-4ed0-a869-a78859ec8fc8'),
  ('a0015f34-e0f4-4dce-80e4-8c0d046da794', 'cd6ec5f6-0789-451d-8b29-179b668cc43a', 'exame', 12.5, '415b7802-411f-4ed0-a869-a78859ec8fc8');