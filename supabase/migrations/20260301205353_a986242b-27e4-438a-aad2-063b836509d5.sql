
-- Add coordinator role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'coordinator';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'director';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'subdirector';

-- Create announcements table for institutional dates and information
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  category text NOT NULL DEFAULT 'geral',
  start_date date,
  end_date date,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Anyone can view active announcements
CREATE POLICY "Anyone can view announcements"
ON public.announcements FOR SELECT
USING (true);

-- Admins can manage announcements
CREATE POLICY "Admins can manage announcements"
ON public.announcements FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Teachers can manage announcements
CREATE POLICY "Teachers can manage announcements"
ON public.announcements FOR ALL
USING (has_role(auth.uid(), 'teacher'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_announcements_updated_at
BEFORE UPDATE ON public.announcements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
