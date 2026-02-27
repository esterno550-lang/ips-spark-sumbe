
-- Table for storing campus visit bookings
CREATE TABLE public.campus_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_name text NOT NULL,
  visitor_email text NOT NULL,
  visitor_phone text NOT NULL,
  visit_date date NOT NULL,
  num_visitors integer NOT NULL DEFAULT 1,
  notes text,
  status text NOT NULL DEFAULT 'pendente',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.campus_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can book a visit" ON public.campus_visits FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can check their visit" ON public.campus_visits FOR SELECT USING (true);
CREATE POLICY "Admins can manage visits" ON public.campus_visits FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can view visits" ON public.campus_visits FOR SELECT USING (public.has_role(auth.uid(), 'teacher'));

-- Table for editable site content (history, about, etc.)
CREATE TABLE public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text UNIQUE NOT NULL,
  title text,
  content text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage content" ON public.site_content FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can manage content" ON public.site_content FOR ALL USING (public.has_role(auth.uid(), 'teacher'));

-- Table for campus photos
CREATE TABLE public.campus_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'geral',
  storage_path text NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.campus_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view photos" ON public.campus_photos FOR SELECT USING (true);
CREATE POLICY "Admins can manage photos" ON public.campus_photos FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can manage photos" ON public.campus_photos FOR ALL USING (public.has_role(auth.uid(), 'teacher'));

-- Table for courses (editable from admin)
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  duration_years integer NOT NULL DEFAULT 4,
  description text,
  advantages text[] DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can manage courses" ON public.courses FOR ALL USING (public.has_role(auth.uid(), 'teacher'));

-- Insert default courses
INSERT INTO public.courses (slug, name, duration_years, description, advantages, sort_order) VALUES
('energia-eletrica', 'Energia e Instalações Eléctricas', 4, 'Formação completa em sistemas eléctricos, instalações industriais e residenciais, e manutenção de equipamentos de potência.', ARRAY['Curso mais concorrido do instituto', 'Alta empregabilidade no sector energético angolano', 'Formação prática em laboratórios equipados', 'Parcerias com empresas do sector eléctrico'], 1),
('energias-renovaveis', 'Energias Renováveis', 4, 'Especialização em fontes de energia limpa, como solar e eólica, preparando técnicos para o futuro energético de Angola.', ARRAY['Sector em crescimento exponencial', 'Contribuição para o desenvolvimento sustentável', 'Conhecimentos em tecnologia solar e eólica', 'Oportunidades internacionais de carreira'], 2),
('frio-climatizacao', 'Frio e Climatização', 4, 'Formação técnica em sistemas de refrigeração, ar condicionado e climatização industrial e comercial.', ARRAY['Elevada procura no mercado angolano', 'Formação em sistemas industriais e comerciais', 'Capacidade de trabalho autónomo', 'Sector essencial em clima tropical'], 3);

-- Seed initial site content
INSERT INTO public.site_content (section_key, title, content) VALUES
('history', 'Nossa História', 'O Instituto Politécnico do Sumbe é uma instituição de ensino médio técnico situada na cidade do Sumbe, província do Cuanza Sul. Dedicado à formação técnica e profissional de jovens angolanos, o IPS oferece cursos nas áreas de Electricidade, Electrónica, Mecânica, Informática, Construção Civil, Agropecuária, Gestão e Saúde.

Com um campus moderno e equipado, a instituição prepara os seus alunos para enfrentar os desafios do mercado de trabalho angolano, contribuindo para o desenvolvimento sustentável da região.'),
('mission', 'Nossa Missão', 'Providenciar uma educação técnica de excelência que capacite os jovens angolanos a enfrentar os desafios da indústria moderna.');

-- Storage bucket for campus photos
INSERT INTO storage.buckets (id, name, public) VALUES ('campus-photos', 'campus-photos', true);

CREATE POLICY "Anyone can view campus photos" ON storage.objects FOR SELECT USING (bucket_id = 'campus-photos');
CREATE POLICY "Admins can upload campus photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'campus-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can upload campus photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'campus-photos' AND public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "Admins can delete campus photos" ON storage.objects FOR DELETE USING (bucket_id = 'campus-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can delete campus photos" ON storage.objects FOR DELETE USING (bucket_id = 'campus-photos' AND public.has_role(auth.uid(), 'teacher'));

-- Triggers for updated_at
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_content_updated_at BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
