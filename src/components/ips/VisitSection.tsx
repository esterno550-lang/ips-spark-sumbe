import { useState } from "react";
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
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Phone,
  Mail,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

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

const VisitSection = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    visitors: "1",
    notes: "",
  });

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
    // Simulate submission
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
    toast({ title: "Visita agendada!", description: `A sua visita está marcada para ${format(date, "d 'de' MMMM 'de' yyyy", { locale: pt })}.` });
  };

  const isWeekday = (d: Date) => {
    const day = d.getDay();
    return day !== 0 && day !== 1; // Allow Tuesday-Saturday
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
