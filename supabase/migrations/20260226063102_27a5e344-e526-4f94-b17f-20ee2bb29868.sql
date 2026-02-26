
-- Allow admins to update admissions (for changing status)
CREATE POLICY "Admins can update admissions"
ON public.admissions
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
