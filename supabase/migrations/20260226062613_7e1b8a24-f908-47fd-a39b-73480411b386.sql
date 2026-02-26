
-- Add new columns to admissions table
ALTER TABLE public.admissions 
ADD COLUMN IF NOT EXISTS secondary_course text,
ADD COLUMN IF NOT EXISTS first_cycle_grade numeric(5,2),
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pendente';

-- Create index for status lookups
CREATE INDEX IF NOT EXISTS idx_admissions_status ON public.admissions(status);
CREATE INDEX IF NOT EXISTS idx_admissions_email ON public.admissions(email);

-- Allow anyone to check their own application status by email
CREATE POLICY "Anyone can check their application status"
ON public.admissions
FOR SELECT
USING (true);

-- Drop the old restrictive "No public reads" policy since we now want public status checking
DROP POLICY IF EXISTS "No public reads" ON public.admissions;
