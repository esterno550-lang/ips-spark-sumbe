import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Phone,
  Mail,
  CheckCircle,
  Loader2,
  Image,
  Map,
  Building,
  FlaskConical,
  BookOpen,
  Dumbbell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import campusEntrance from "@/assets/campus-entrance.jpeg";
import campusLab from "@/assets/campus-lab.jpeg";
import campusNight from "@/assets/campus-night.webp";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1 },
  }),
};

const visitInfo = [
  {
    icon: CalendarDays,
    title: "Dias de Visita",
    description: "Terça a Sexta-feira, mediante agendamento prévio. Visitas abertas no primeiro sábado de cada mês.",
  },
  {
    icon: Clock,
    title: "Horário",
    description: "Das 08h00 às 12h00 e das 14h00 às 16h00. Duração média: 1h30.",
  },
  {
    icon: MapPin,
    title: "Localização",
    description: "Rua Principal do Campus, Sumbe, Cuanza Sul, Angola. Acesso pela entrada principal.",
  },
  {
    icon: Users,
    title: "Grupos",
    description: "Visitas individuais ou em grupo (até 30 pessoas). Escolas podem agendar visitas especiais.",
  },
];

const visitHighlights = [
  "Tour pelos laboratórios de Electricidade e Energia",
  "Apresentação dos cursos por docentes especializados",
  "Visita às oficinas práticas e equipamentos",
  "Sessão de perguntas e respostas com alunos actuais",
  "Conhecer as instalações desportivas e biblioteca",
  "Informações sobre admissões e bolsas de estudo",
];

const contacts = [
  { icon: Phone, label: "Telefone", value: "+244 923 456 789" },
  { icon: Mail, label: "Email", value: "visitas@ips.ao" },
  { icon: MapPin, label: "Morada", value: "Campus do IPS, Sumbe, Cuanza Sul" },
];

const campusLocations = [
  { id: "entrance", label: "Entrada Principal", icon: Building, x: 50, y: 85, color: "bg-accent" },
  { id: "labs", label: "Laboratórios", icon: FlaskConical, x: 30, y: 45, color: "bg-primary" },
  { id: "library", label: "Biblioteca", icon: BookOpen, x: 70, y: 35, color: "bg-secondary" },
  { id: "sports", label: "Campo Desportivo", icon: Dumbbell, x: 80, y: 65, color: "bg-accent" },
  { id: "admin", label: "Edifício Admin.", icon: Building, x: 20, y: 70, color: "bg-primary" },
];

const defaultGallery = [
  { src: campusEntrance, title: "Entrada do Campus", category: "campus" },
  { src: campusLab, title: "Laboratório de Electricidade", category: "laboratórios" },
  { src: campusNight, title: "Campus à Noite", category: "campus" },
];

const VisitSection = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<{ src: string; title: string; category: string }[]>(defaultGallery);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    visitors: "1",
    notes: "",
  });

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data } = await supabase
        .from("campus_photos")
        .select("title, storage_path, category")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const uploaded = data.map((p) => ({
          src: `https://${projectId}.supabase.co/storage/v1/object/public/campus-photos/${p.storage_path}`,
          title: p.title,
          category: p.category,
        }));
        setGalleryPhotos([...defaultGallery, ...uploaded]);
      }
    };
    fetchPhotos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast({ title: "Seleccione uma data", description: "Escolha a data pretendida para a visita.", variant: "destructive" });
      return;
    }
    if (!form.name || !form.email || !form.phone) {
      toast({ title: "Campos obrigatórios", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }
    setLoading(true);

    const { error } = await supabase.from("campus_visits").insert({
      visitor_name: form.name,
      visitor_email: form.email,
      visitor_phone: form.phone,
      visit_date: format(date, "yyyy-MM-dd"),
      num_visitors: parseInt(form.visitors) || 1,
      notes: form.notes || null,
    });

    setLoading(false);

    if (error) {
      toast({ title: "Erro", description: "Não foi possível agendar. Tente novamente.", variant: "destructive" });
    } else {
      setSubmitted(true);
      toast({ title: "Visita agendada!", description: `A sua visita está marcada para ${format(date, "d 'de' MMMM 'de' yyyy", { locale: pt })}.` });
    }
  };

  const isWeekday = (d: Date) => {
    const day = d.getDay();
    return day !== 0 && day !== 1;
  };

  return (
    <section className="px-4 py-16">
      <div className="container mx-auto">
        <motion.div className="mb-10 text-center" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}>
          <Badge variant="secondary" className="mb-4 rounded-lg">Visitas ao Campus</Badge>
          <h2 className="text-3xl font-bold text-foreground">Planear a Sua Visita</h2>
          <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
            Venha conhecer o Instituto Politécnico do Sumbe. Agende uma visita guiada e descubra as nossas instalações, laboratórios e o ambiente académico.
          </p>
        </motion.div>

        {/* Info Cards */}
        <motion.div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}>
          {visitInfo.map((info) => (
            <Card key={info.title} className="flex flex-col gap-3 rounded-2xl border-border/50 p-5 transition-all hover:border-accent/30 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <info.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{info.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{info.description}</p>
            </Card>
          ))}
        </motion.div>

        {/* Map & Gallery Tabs */}
        <motion.div className="mb-12" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1.5}>
          <Tabs defaultValue="map" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="map" className="gap-2 rounded-xl"><Map className="h-4 w-4" /> Mapa do Campus</TabsTrigger>
              <TabsTrigger value="gallery" className="gap-2 rounded-xl"><Image className="h-4 w-4" /> Galeria de Fotos</TabsTrigger>
            </TabsList>

            <TabsContent value="map">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Google Maps */}
                <Card className="rounded-2xl border-border/50 overflow-hidden">
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-accent" /> Localização
                    </h3>
                  </div>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15702.28!2d13.85!3d-11.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTHCsDEyJzAwLjAiUyAxM8KwNTEnMDAuMCJF!5e0!3m2!1spt-PT!2sao!4v1!5m2!1spt-PT!2sao"
                    className="w-full h-64 border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Localização do IPS"
                  />
                </Card>

                {/* Illustrated Campus Map */}
                <Card className="rounded-2xl border-border/50 p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Building className="h-4 w-4 text-accent" /> Mapa Ilustrado do Campus
                  </h3>
                  <div className="relative bg-muted/30 rounded-xl h-64 overflow-hidden">
                    {/* Campus background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-muted/20 to-primary/5 rounded-xl" />
                    
                    {/* Campus paths */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path d="M 50 85 L 50 50 L 30 45" fill="none" stroke="hsl(var(--border))" strokeWidth="1.5" strokeDasharray="3 2" />
                      <path d="M 50 50 L 70 35" fill="none" stroke="hsl(var(--border))" strokeWidth="1.5" strokeDasharray="3 2" />
                      <path d="M 50 50 L 80 65" fill="none" stroke="hsl(var(--border))" strokeWidth="1.5" strokeDasharray="3 2" />
                      <path d="M 50 50 L 20 70" fill="none" stroke="hsl(var(--border))" strokeWidth="1.5" strokeDasharray="3 2" />
                    </svg>

                    {/* Location points */}
                    {campusLocations.map((loc) => (
                      <button
                        key={loc.id}
                        className={cn(
                          "absolute flex items-center justify-center h-8 w-8 rounded-full shadow-lg transition-all cursor-pointer hover:scale-125 z-10",
                          selectedLocation === loc.id ? "scale-125 ring-2 ring-accent ring-offset-2 ring-offset-background" : "",
                          loc.color, "text-primary-foreground"
                        )}
                        style={{ left: `${loc.x}%`, top: `${loc.y}%`, transform: "translate(-50%, -50%)" }}
                        onClick={() => setSelectedLocation(selectedLocation === loc.id ? null : loc.id)}
                        title={loc.label}
                      >
                        <loc.icon className="h-4 w-4" />
                      </button>
                    ))}

                    {/* Selected location tooltip */}
                    {selectedLocation && (
                      <div className="absolute bottom-2 left-2 right-2 bg-card/95 backdrop-blur-sm rounded-xl p-3 shadow-lg z-20">
                        <p className="text-sm font-semibold text-foreground">
                          {campusLocations.find((l) => l.id === selectedLocation)?.label}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {campusLocations.map((loc) => (
                      <Badge
                        key={loc.id}
                        variant={selectedLocation === loc.id ? "default" : "outline"}
                        className="rounded-lg cursor-pointer text-xs"
                        onClick={() => setSelectedLocation(selectedLocation === loc.id ? null : loc.id)}
                      >
                        <loc.icon className="mr-1 h-3 w-3" />
                        {loc.label}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="gallery">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {galleryPhotos.map((photo, i) => (
                  <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.1}>
                    <Card className="rounded-2xl border-border/50 overflow-hidden group transition-all hover:shadow-lg">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={photo.src}
                          alt={photo.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Badge className="absolute top-3 right-3 rounded-lg text-xs" variant="secondary">
                          {photo.category}
                        </Badge>
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-foreground">{photo.title}</p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* What you'll see */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}>
            <h3 className="mb-6 text-2xl font-bold text-foreground">O Que Vai Conhecer</h3>
            <Card className="rounded-2xl border-border/50 p-6">
              <ul className="space-y-3">
                {visitHighlights.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            <h3 className="mt-8 mb-4 text-lg font-semibold text-foreground">Contactos</h3>
            <Card className="rounded-2xl border-border/50 p-5">
              <div className="space-y-4">
                {contacts.map((c) => (
                  <div key={c.label} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                      <c.icon className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{c.label}</p>
                      <p className="text-sm font-medium text-foreground">{c.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Booking Form */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3}>
            <h3 className="mb-6 text-2xl font-bold text-foreground">Agendar Visita</h3>
            {submitted ? (
              <Card className="flex flex-col items-center gap-4 rounded-2xl border-border/50 p-10 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                  <CheckCircle className="h-8 w-8 text-accent" />
                </div>
                <h4 className="text-xl font-bold text-foreground">Visita Agendada!</h4>
                <p className="text-muted-foreground">
                  A sua visita está marcada para <strong>{date && format(date, "d 'de' MMMM 'de' yyyy", { locale: pt })}</strong>.
                  Entraremos em contacto para confirmar.
                </p>
                <Button variant="hero" onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", visitors: "1", notes: "" }); setDate(undefined); }}>
                  Agendar Outra Visita
                </Button>
              </Card>
            ) : (
              <Card className="rounded-2xl border-border/50 p-6">
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label>Data Pretendida *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal rounded-xl",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {date ? format(date, "d 'de' MMMM 'de' yyyy", { locale: pt }) : "Seleccione uma data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(d) => d < new Date() || !isWeekday(d)}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="visit-name">Nome Completo *</Label>
                    <Input id="visit-name" placeholder="O seu nome" className="rounded-xl" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="visit-email">Email *</Label>
                      <Input id="visit-email" type="email" placeholder="email@exemplo.com" className="rounded-xl" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="visit-phone">Telefone *</Label>
                      <Input id="visit-phone" type="tel" placeholder="+244 9XX XXX XXX" className="rounded-xl" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="visit-visitors">Nº de Visitantes</Label>
                    <Input id="visit-visitors" type="number" min="1" max="30" className="rounded-xl" value={form.visitors} onChange={(e) => setForm({ ...form, visitors: e.target.value })} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="visit-notes">Observações (opcional)</Label>
                    <Textarea id="visit-notes" placeholder="Indique interesses específicos, necessidades especiais, etc." className="rounded-xl" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  </div>

                  <Button variant="hero" size="lg" className="w-full" type="submit" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loading ? "A agendar..." : "Agendar Visita"}
                  </Button>
                </form>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default VisitSection;
