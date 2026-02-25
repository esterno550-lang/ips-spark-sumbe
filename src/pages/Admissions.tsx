import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, FileText, GraduationCap, CalendarDays, DollarSign, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/ips/Header";
import Footer from "@/components/ips/Footer";
import { z } from "zod";

const admissionSchema = z.object({
  firstName: z.string().trim().min(2, "O nome deve ter pelo menos 2 caracteres").max(50, "O nome não pode exceder 50 caracteres"),
  lastName: z.string().trim().min(2, "O apelido deve ter pelo menos 2 caracteres").max(50, "O apelido não pode exceder 50 caracteres"),
  email: z.string().trim().email("Endereço de email inválido").max(255, "Email demasiado longo"),
  phone: z.string().trim().min(9, "O número de telefone deve ter pelo menos 9 dígitos").max(20, "Número de telefone inválido").regex(/^[+\d\s()-]+$/, "Formato de telefone inválido"),
  course: z.string().min(1, "Seleccione um curso"),
  message: z.string().max(500, "A mensagem não pode exceder 500 caracteres").optional().or(z.literal("")),
});

type FormErrors = Partial<Record<keyof z.infer<typeof admissionSchema>, string>>;

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1 },
  }),
};

const timeline = [
  { icon: CalendarDays, title: "Abertura de Candidaturas", date: "1 de Março", description: "Início do período de inscrições online e presenciais." },
  { icon: FileText, title: "Entrega de Documentos", date: "1 Mar — 30 Abr", description: "Submissão de documentos necessários na secretaria." },
  { icon: GraduationCap, title: "Provas de Admissão", date: "15 — 20 de Maio", description: "Exames escritos nas áreas do curso pretendido." },
  { icon: CheckCircle, title: "Publicação de Resultados", date: "10 de Junho", description: "Listas de admitidos publicadas no campus e online." },
  { icon: Clock, title: "Matrículas", date: "15 — 30 de Junho", description: "Confirmação da matrícula e pagamento da primeira propina." },
];

const requirements = [
  "Certificado de conclusão da 9ª classe",
  "Declaração de notas da 9ª classe",
  "Cópia do Bilhete de Identidade",
  "2 fotografias tipo passe",
  "Atestado médico",
  "Comprovativo de residência",
];

const tuition = [
  { item: "Taxa de inscrição", value: "5.000 Kz" },
  { item: "Propina mensal", value: "8.000 Kz" },
  { item: "Taxa de exame", value: "3.000 Kz" },
  { item: "Seguro escolar (anual)", value: "2.500 Kz" },
];

const faqs = [
  { q: "Qual é a idade mínima para ingressar?", a: "O candidato deve ter concluído a 9ª classe e ter no mínimo 14 anos de idade à data da candidatura." },
  { q: "Posso candidatar-me a mais de um curso?", a: "Sim, pode indicar até duas opções de curso por ordem de preferência no formulário de candidatura." },
  { q: "As aulas são presenciais?", a: "Sim, todos os cursos do IPS são leccionados em regime presencial no campus do Sumbe." },
  { q: "Existem bolsas de estudo disponíveis?", a: "O IPS oferece bolsas de mérito para os melhores alunos de cada curso, bem como apoio social para estudantes carenciados." },
  { q: "Qual é a duração dos cursos?", a: "Todos os cursos técnicos médios têm a duração de 4 anos lectivos." },
];

const courses = [
  { value: "energia-eletrica", label: "Energia e Instalações Eléctricas" },
  { value: "energias-renovaveis", label: "Energias Renováveis" },
  { value: "frio-climatizacao", label: "Frio e Climatização" },
];

const Admissions = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    course: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = admissionSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FormErrors;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      toast({ title: "Erro de validação", description: "Corrija os campos assinalados.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("admissions").insert({
      first_name: result.data.firstName,
      last_name: result.data.lastName,
      email: result.data.email,
      phone: result.data.phone,
      course: result.data.course,
      message: result.data.message || null,
    });
    setLoading(false);

    if (error) {
      toast({ title: "Erro", description: "Não foi possível submeter. Tente novamente.", variant: "destructive" });
    } else {
      toast({ title: "Candidatura submetida!", description: "Entraremos em contacto em breve." });
      setForm({ firstName: "", lastName: "", email: "", phone: "", course: "", message: "" });
      setErrors({});
    }
  };

  const updateField = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
    if (errors[field as keyof FormErrors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <motion.div className="mb-12 text-center" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}>
          <Badge variant="secondary" className="mb-4 rounded-lg">Admissões 2026</Badge>
          <h1 className="text-4xl font-extrabold text-foreground md:text-5xl">
            Junte-se ao <span className="text-accent">IPS</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Comece a sua jornada de formação técnica. Saiba como candidatar-se, os requisitos e as propinas.
          </p>
        </motion.div>

        {/* Timeline */}
        <motion.section className="mb-16" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}>
          <h2 className="mb-8 text-2xl font-bold text-foreground">Calendário de Admissão</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {timeline.map((step, i) => (
              <motion.div key={step.title} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
                <Card className="flex h-full flex-col items-center gap-3 rounded-2xl border-border/50 p-5 text-center transition-all hover:border-accent/30 hover:shadow-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                    <step.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                  <Badge variant="outline" className="rounded-lg text-xs">{step.date}</Badge>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-10">
            <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}>
              <h2 className="mb-6 text-2xl font-bold text-foreground">Requisitos Académicos</h2>
              <Card className="rounded-2xl border-border/50 p-6">
                <p className="mb-4 text-sm text-muted-foreground">Para se candidatar ao IPS, o aluno deve apresentar os seguintes documentos:</p>
                <ul className="space-y-3">
                  {requirements.map((req) => (
                    <li key={req} className="flex items-start gap-3 text-sm text-foreground">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      {req}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.section>

            <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3}>
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-foreground">
                <DollarSign className="h-6 w-6 text-accent" />
                Propinas e Taxas
              </h2>
              <Card className="rounded-2xl border-border/50 p-6">
                <div className="space-y-3">
                  {tuition.map((t) => (
                    <div key={t.item} className="flex items-center justify-between border-b border-border/30 pb-3 last:border-0">
                      <span className="text-sm text-muted-foreground">{t.item}</span>
                      <span className="text-sm font-semibold text-foreground">{t.value}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  * Os valores são indicativos e podem ser actualizados no início de cada ano lectivo.
                </p>
              </Card>
            </motion.section>
          </div>

          {/* Application Form */}
          <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}>
            <h2 className="mb-6 text-2xl font-bold text-foreground">Formulário de Candidatura</h2>
            <Card className="rounded-2xl border-border/50 p-6">
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome *</Label>
                    <Input id="firstName" placeholder="Primeiro nome" className={`rounded-xl ${errors.firstName ? "border-destructive" : ""}`} value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} />
                    {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apelido *</Label>
                    <Input id="lastName" placeholder="Apelido" className={`rounded-xl ${errors.lastName ? "border-destructive" : ""}`} value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} />
                    {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" placeholder="email@exemplo.com" className={`rounded-xl ${errors.email ? "border-destructive" : ""}`} value={form.email} onChange={(e) => updateField("email", e.target.value)} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input id="phone" type="tel" placeholder="+244 9XX XXX XXX" className={`rounded-xl ${errors.phone ? "border-destructive" : ""}`} value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course">Curso Pretendido *</Label>
                  <Select value={form.course} onValueChange={(v) => updateField("course", v)}>
                    <SelectTrigger className={`rounded-xl ${errors.course ? "border-destructive" : ""}`}>
                      <SelectValue placeholder="Seleccione um curso" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {courses.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.course && <p className="text-xs text-destructive">{errors.course}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem (opcional)</Label>
                  <Textarea id="message" placeholder="Informações adicionais..." className={`rounded-xl ${errors.message ? "border-destructive" : ""}`} value={form.message} onChange={(e) => updateField("message", e.target.value)} />
                  {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
                </div>

                <Button variant="hero" size="lg" className="w-full" type="submit" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "A submeter..." : "Submeter Candidatura"}
                </Button>
              </form>
            </Card>
          </motion.section>
        </div>

        {/* FAQ */}
        <motion.section className="mt-16" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={4}>
          <h2 className="mb-6 text-2xl font-bold text-foreground">Perguntas Frequentes</h2>
          <Card className="rounded-2xl border-border/50 p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:text-accent">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
};

export default Admissions;
