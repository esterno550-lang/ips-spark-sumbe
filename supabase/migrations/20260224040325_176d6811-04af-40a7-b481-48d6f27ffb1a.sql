
-- Create admissions table for storing applications
CREATE TABLE public.admissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  course TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public application form)
CREATE POLICY "Anyone can submit an application"
ON public.admissions
FOR INSERT
WITH CHECK (true);

-- Only authenticated admins could read (for now, no reads from frontend)
CREATE POLICY "No public reads"
ON public.admissions
FOR SELECT
USING (false);
