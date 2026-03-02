
-- Drop restrictive policies
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;
DROP POLICY IF EXISTS "Anyone can view announcements" ON public.announcements;
DROP POLICY IF EXISTS "Teachers can manage announcements" ON public.announcements;

-- Recreate as PERMISSIVE
CREATE POLICY "Anyone can view announcements"
ON public.announcements FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage announcements"
ON public.announcements FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can manage announcements"
ON public.announcements FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'teacher'));

-- Also fix other tables that may have the same issue
DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;
DROP POLICY IF EXISTS "Anyone can view active courses" ON public.courses;
DROP POLICY IF EXISTS "Teachers can manage courses" ON public.courses;

CREATE POLICY "Anyone can view active courses"
ON public.courses FOR SELECT
USING (true);

CREATE POLICY "Admins can manage courses"
ON public.courses FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can manage courses"
ON public.courses FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'teacher'));

-- Fix campus_photos
DROP POLICY IF EXISTS "Admins can manage photos" ON public.campus_photos;
DROP POLICY IF EXISTS "Anyone can view photos" ON public.campus_photos;
DROP POLICY IF EXISTS "Teachers can manage photos" ON public.campus_photos;

CREATE POLICY "Anyone can view photos"
ON public.campus_photos FOR SELECT
USING (true);

CREATE POLICY "Admins can manage photos"
ON public.campus_photos FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can manage photos"
ON public.campus_photos FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'teacher'));

-- Fix site_content
DROP POLICY IF EXISTS "Admins can manage content" ON public.site_content;
DROP POLICY IF EXISTS "Anyone can read site content" ON public.site_content;
DROP POLICY IF EXISTS "Teachers can manage content" ON public.site_content;

CREATE POLICY "Anyone can read site content"
ON public.site_content FOR SELECT
USING (true);

CREATE POLICY "Admins can manage content"
ON public.site_content FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can manage content"
ON public.site_content FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'teacher'));

-- Fix schedules
DROP POLICY IF EXISTS "Admins can manage schedules" ON public.schedules;
DROP POLICY IF EXISTS "Anyone can view schedules" ON public.schedules;
DROP POLICY IF EXISTS "Teachers can manage their schedules" ON public.schedules;

CREATE POLICY "Anyone can view schedules"
ON public.schedules FOR SELECT
USING (true);

CREATE POLICY "Admins can manage schedules"
ON public.schedules FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can manage their schedules"
ON public.schedules FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'teacher') AND subject_id IN (SELECT id FROM public.subjects WHERE teacher_id = auth.uid()));

-- Fix subjects
DROP POLICY IF EXISTS "Admins can manage subjects" ON public.subjects;
DROP POLICY IF EXISTS "Anyone can view subjects" ON public.subjects;
DROP POLICY IF EXISTS "Teachers can manage their subjects" ON public.subjects;

CREATE POLICY "Anyone can view subjects"
ON public.subjects FOR SELECT
USING (true);

CREATE POLICY "Admins can manage subjects"
ON public.subjects FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can manage their subjects"
ON public.subjects FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'teacher') AND teacher_id = auth.uid());

-- Fix grades
DROP POLICY IF EXISTS "Admins can manage grades" ON public.grades;
DROP POLICY IF EXISTS "Students can view own grades" ON public.grades;
DROP POLICY IF EXISTS "Teachers can manage grades" ON public.grades;

CREATE POLICY "Students can view own grades"
ON public.grades FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

CREATE POLICY "Admins can manage grades"
ON public.grades FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can manage grades"
ON public.grades FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'teacher'));

-- Fix enrollments
DROP POLICY IF EXISTS "Admins can manage enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Students can view own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Teachers can view enrollments" ON public.enrollments;

CREATE POLICY "Students can view own enrollments"
ON public.enrollments FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

CREATE POLICY "Admins can manage enrollments"
ON public.enrollments FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view enrollments"
ON public.enrollments FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'teacher'));

-- Fix campus_visits
DROP POLICY IF EXISTS "Admins can manage visits" ON public.campus_visits;
DROP POLICY IF EXISTS "Anyone can book a visit" ON public.campus_visits;
DROP POLICY IF EXISTS "Anyone can check their visit" ON public.campus_visits;
DROP POLICY IF EXISTS "Teachers can view visits" ON public.campus_visits;

CREATE POLICY "Anyone can check their visit"
ON public.campus_visits FOR SELECT
USING (true);

CREATE POLICY "Anyone can book a visit"
ON public.campus_visits FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage visits"
ON public.campus_visits FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view visits"
ON public.campus_visits FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'teacher'));

-- Fix admissions
DROP POLICY IF EXISTS "Admins can delete admissions" ON public.admissions;
DROP POLICY IF EXISTS "Admins can read admissions" ON public.admissions;
DROP POLICY IF EXISTS "Admins can update admissions" ON public.admissions;
DROP POLICY IF EXISTS "Anyone can check their application status" ON public.admissions;
DROP POLICY IF EXISTS "Anyone can submit an application" ON public.admissions;

CREATE POLICY "Anyone can check their application status"
ON public.admissions FOR SELECT
USING (true);

CREATE POLICY "Anyone can submit an application"
ON public.admissions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage admissions"
ON public.admissions FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix user_roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Allow teachers to view profiles (for student names)
CREATE POLICY "Teachers can view profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'teacher'));
