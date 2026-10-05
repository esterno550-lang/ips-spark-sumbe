-- 1. Remove public read access to personal data
DROP POLICY IF EXISTS "Anyone can check their application status" ON public.admissions;
DROP POLICY IF EXISTS "Anyone can check their visit" ON public.campus_visits;

-- 2. Secure status lookup functions (return only non-sensitive fields, scoped by email)
CREATE OR REPLACE FUNCTION public.check_admission_status(_email text)
RETURNS TABLE(first_name text, last_name text, course text, secondary_course text, first_cycle_grade numeric, status text, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT first_name, last_name, course, secondary_course, first_cycle_grade, status, created_at
  FROM public.admissions
  WHERE lower(email) = lower(trim(_email))
  ORDER BY created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.check_visit_status(_email text)
RETURNS TABLE(visitor_name text, visit_date date, num_visitors integer, status text, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT visitor_name, visit_date, num_visitors, status, created_at
  FROM public.campus_visits
  WHERE lower(visitor_email) = lower(trim(_email))
  ORDER BY created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.check_admission_status(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_visit_status(text) TO anon, authenticated;