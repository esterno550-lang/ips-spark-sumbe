
-- Subjects/Disciplines table
CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  teacher_id uuid NOT NULL,
  year integer NOT NULL DEFAULT 1,
  semester integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Admins can manage subjects" ON public.subjects FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can manage their subjects" ON public.subjects FOR ALL USING (public.has_role(auth.uid(), 'teacher') AND teacher_id = auth.uid());

-- Student enrollments
CREATE TABLE public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  academic_year text NOT NULL DEFAULT '2025/2026',
  year_level integer NOT NULL DEFAULT 1,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, course_id, academic_year)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own enrollments" ON public.enrollments FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Admins can manage enrollments" ON public.enrollments FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can view enrollments" ON public.enrollments FOR SELECT USING (public.has_role(auth.uid(), 'teacher'));

-- Grades table
CREATE TABLE public.grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  grade_type text NOT NULL DEFAULT 'prova1',
  grade numeric(4,1) CHECK (grade >= 0 AND grade <= 20),
  academic_year text NOT NULL DEFAULT '2025/2026',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  graded_by uuid,
  UNIQUE(student_id, subject_id, grade_type, academic_year)
);

ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own grades" ON public.grades FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Admins can manage grades" ON public.grades FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can manage grades" ON public.grades FOR ALL USING (public.has_role(auth.uid(), 'teacher'));

-- Schedules table
CREATE TABLE public.schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  room text NOT NULL DEFAULT 'Sala A1',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view schedules" ON public.schedules FOR SELECT USING (true);
CREATE POLICY "Admins can manage schedules" ON public.schedules FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can manage their schedules" ON public.schedules FOR ALL USING (
  public.has_role(auth.uid(), 'teacher') AND 
  subject_id IN (SELECT id FROM public.subjects WHERE teacher_id = auth.uid())
);

-- Trigger for grades updated_at
CREATE TRIGGER update_grades_updated_at
  BEFORE UPDATE ON public.grades
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
