-- Admin-only table row counts (no personal data exposed)
CREATE OR REPLACE FUNCTION public.admin_table_counts()
RETURNS TABLE(table_name text, row_count bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  RETURN QUERY
    SELECT 'admissions'::text, count(*) FROM public.admissions
    UNION ALL SELECT 'announcements', count(*) FROM public.announcements
    UNION ALL SELECT 'calendar_events', count(*) FROM public.calendar_events
    UNION ALL SELECT 'campus_photos', count(*) FROM public.campus_photos
    UNION ALL SELECT 'campus_visits', count(*) FROM public.campus_visits
    UNION ALL SELECT 'courses', count(*) FROM public.courses
    UNION ALL SELECT 'enrollments', count(*) FROM public.enrollments
    UNION ALL SELECT 'grades', count(*) FROM public.grades
    UNION ALL SELECT 'profiles', count(*) FROM public.profiles
    UNION ALL SELECT 'schedules', count(*) FROM public.schedules
    UNION ALL SELECT 'site_content', count(*) FROM public.site_content
    UNION ALL SELECT 'subjects', count(*) FROM public.subjects
    UNION ALL SELECT 'user_roles', count(*) FROM public.user_roles
    ORDER BY 1;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_table_counts() FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_table_counts() TO authenticated;