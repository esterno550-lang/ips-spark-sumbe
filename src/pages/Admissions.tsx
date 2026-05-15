import { useState, useEffect } from "react";
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
import { CheckCircle, Clock, FileText, GraduationCap, CalendarDays, Loader2, Download, Search, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/ips/Header";
import Footer from "@/components/ips/Footer";
import Seo from "@/components/seo/Seo";
import { z } from "zod";

const admissionSchema = z.object({
  firstName: z.string().trim().min(2, "O nome deve ter pelo menos 2 caracteres").max(50, "O nome não pode exceder 50 caracteres"),
  lastName: z.string().trim().min(2, "O apelido deve ter pelo menos 2 caracteres").max(50, "O apelido não pode exceder 50 caracteres"),
  email: z.string().trim().email("Endereço de email inválido").max(255, "Email demasiado longo"),
  phone: z.string().trim().min(9, "O número de telefone deve ter pelo menos 9 dígitos").max(20, "Número de telefone inválido").regex(/^[+\d\s()-]+$/, "Formato de telefone inválido"),
  course: z.string().min(1, "Seleccione um curso"),
  secondaryCourse: z.string().optional().or(z.literal("")),
  firstCycleGrade: z.string().optional().or(z.literal("")).refine((val) => {
    if (!val || val === "") return true;
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0 && num <= 20;
  }, "A nota deve estar entre 0 e 20"),
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

const requirements = [
  "Cópia do Bilhete de Identidade",
  "Cópia do Certificado da 9ª classe",
];

const faqs = [
  { q: "Qual é a idade mínima para ingressar?", a: "O candidato deve ter concluído a 9ª classe e ter no mínimo 14 anos de idade à data da candidatura." },
  { q: "Posso candidatar-me a mais de um curso?", a: "Sim, pode indicar até duas opções de curso por ordem de preferência no formulário de candidatura." },
  { q: "As aulas são presenciais?", a: "Sim, todos os cursos do IPS são leccionados em regime presencial no campus do Sumbe." },
  { q: "A instituição é gratuita?", a: "Sim, o IPS é uma instituição pública e gratuita. Apenas é cobrada uma taxa de inscrição única de 2.000 Kz." },
  { q: "Qual é a duração dos cursos?", a: "Todos os cursos técnicos médios têm a duração de 4 anos lectivos." },
];

const courses = [
  { value: "energia-eletrica", label: "Energia e Instalações Eléctricas" },
  { value: "energias-renovaveis", label: "Energias Renováveis" },
  { value: "frio-climatizacao", label: "Frio e Climatização" },
];

const courseLabels: Record<string, string> = {
  "energia-eletrica": "Energia e Instalações Eléctricas",
  "energias-renovaveis": "Energias Renováveis",
  "frio-climatizacao": "Frio e Climatização",
};

type Announcement = {
  id: string;
  title: string;
  content: string | null;
  category: string;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
};

const categoryIcons: Record<string, any> = {
  candidaturas: CalendarDays,
  documentos: FileText,
  provas: GraduationCap,
  resultados: CheckCircle,
  matriculas: Clock,
  geral: Info,
};

const generatePDF = (data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  course: string;
  secondaryCourse?: string;
  firstCycleGrade?: string;
  date: string;
  id: string;
}) => {
  const courseLabel = courseLabels[data.course] || data.course;
  const secondaryLabel = data.secondaryCourse ? (courseLabels[data.secondaryCourse] || data.secondaryCourse) : "—";
  
  const content = `
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj

2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj

3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842]
/Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj

5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj

4 0 obj
<< /Length 950 >>
stream
BT
/F1 22 Tf 50 780 Td (COMPROVATIVO DE CANDIDATURA) Tj
/F1 12 Tf 0 -30 Td (Instituto Politecnico do Sumbe) Tj
0 -20 Td (---------------------------------------------------) Tj
0 -30 Td (Numero de Referencia: ${data.id.substring(0, 8).toUpperCase()}) Tj
0 -20 Td (Data de Submissao: ${data.date}) Tj
0 -30 Td (---------------------------------------------------) Tj
0 -25 Td (DADOS DO CANDIDATO) Tj
0 -20 Td (Nome Completo: ${data.firstName} ${data.lastName}) Tj
0 -20 Td (Email: ${data.email}) Tj
0 -20 Td (Telefone: ${data.phone}) Tj
0 -20 Td (Nota do 1o Ciclo: ${data.firstCycleGrade || "Nao informada"}) Tj
0 -30 Td (---------------------------------------------------) Tj
0 -25 Td (CURSOS PRETENDIDOS) Tj
0 -20 Td (1a Opcao: ${courseLabel}) Tj
0 -20 Td (2a Opcao: ${secondaryLabel}) Tj
0 -30 Td (---------------------------------------------------) Tj
0 -25 Td (Estado: PENDENTE) Tj
0 -20 Td (Taxa de inscricao: 2.000 Kz (unica)) Tj
0 -30 Td (Este documento serve como comprovativo da sua candidatura.) Tj
0 -20 Td (Guarde-o para consulta futura.) Tj
ET
stream
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000206 00000 n 

trailer
<< /Size 6 /Root 1 0 R >>
startxref
1270
%%EOF`;

  const blob = new Blob([content], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Comprovativo_Candidatura_${data.firstName}_${data.lastName}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
};

const Admissions = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [statusSearch, setStatusSearch] = useState("");
  const [statusResult, setStatusResult] = useState<any[] | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    course: "",
    secondaryCourse: "",
    firstCycleGrade: "",
    message: "",
  });

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data } = await supabase
        .from("announcements")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      setAnnouncements((data || []) as Announcement[]);
    };
    fetchAnnouncements();
  }, []);

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
    const { data, error } = await supabase.from("admissions").insert({
      first_name: result.data.firstName,
      last_name: result.data.lastName,
      email: result.data.email,
      phone: result.data.phone,
      course: result.data.course,
      secondary_course: result.data.secondaryCourse || null,
      first_cycle_grade: result.data.firstCycleGrade ? parseFloat(result.data.firstCycleGrade) : null,
      message: result.data.message || null,
    }).select().single();
    setLoading(false);

    if (error) {
      toast({ title: "Erro", description: "Não foi possível submeter. Tente novamente.", variant: "destructive" });
    } else {
      setSubmittedData({
        ...result.data,
        id: data.id,
        date: new Date().toLocaleDateString("pt-AO"),
      });
      setSubmitted(true);
      toast({ title: "Candidatura submetida!", description: "O seu comprovativo está pronto para download." });
    }
  };

  const handleCheckStatus = async () => {
    if (!statusSearch.trim()) return;
    setStatusLoading(true);
    const { data, error } = await supabase
      .from("admissions")
      .select("first_name, last_name, course, secondary_course, first_cycle_grade, status, created_at")
      .eq("email", statusSearch.trim().toLowerCase());
    
    setStatusLoading(false);
    if (error || !data || data.length === 0) {
      setStatusResult([]);
      toast({ title: "Sem resultados", description: "Nenhuma candidatura encontrada com este email.", variant: "destructive" });
    } else {
      setStatusResult(data);
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
      <Seo
        title="Admissões 2026 — Candidate-se ao IPS"
        description="Candidaturas abertas para 2026 no Instituto Politécnico do Sumbe. Requisitos, prazos, taxa única de 2.000 Kz e formulário online de candidatura."
        path="/admissions"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <motion.div className="mb-12 text-center" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}>
          <Badge variant="secondary" className="mb-4 rounded-lg">Admissões 2026</Badge>
          <h1 className="text-4xl font-extrabold text-foreground md:text-5xl">
            Junte-se ao <span className="text-accent">IPS</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Comece a sua jornada de formação técnica. O IPS é uma instituição pública e gratuita — apenas é cobrada uma taxa de inscrição única de 2.000 Kz.
          </p>
        </motion.div>

        {/* Check Status Section */}
        <motion.section className="mb-12" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0.5}>
          <Card className="rounded-2xl border-border/50 p-6">
            <h2 className="mb-4 text-lg font-bold text-foreground flex items-center gap-2">
              <Search className="h-5 w-5 text-accent" />
              Consultar Estado da Candidatura
            </h2>
            <div className="flex gap-3">
              <Input
                aria-label="Email para consultar candidatura"
                placeholder="Introduza o seu email de candidatura..."
                className="rounded-xl flex-1"
                value={statusSearch}
                onChange={(e) => setStatusSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCheckStatus()}
              />
              <Button variant="hero" onClick={handleCheckStatus} disabled={statusLoading} aria-label="Consultar estado da candidatura">
                {statusLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Consultar"}
              </Button>
            </div>
            {statusResult !== null && (
              <div className="mt-4">
                {statusResult.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma candidatura encontrada com este email.</p>
                ) : (
                  <div className="space-y-3">
                    {statusResult.map((r, i) => (
                      <Card key={i} className="rounded-xl border-border/50 p-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{r.first_name} {r.last_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {courseLabels[r.course] || r.course}
                              {r.secondary_course && ` | 2ª opção: ${courseLabels[r.secondary_course] || r.secondary_course}`}
                            </p>
                            {r.first_cycle_grade && (
                              <p className="text-xs text-muted-foreground">Nota 1º Ciclo: {r.first_cycle_grade}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <Badge variant={r.status === "aceite" ? "default" : r.status === "rejeitado" ? "destructive" : "secondary"} className="rounded-lg capitalize">
                              {r.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(r.created_at).toLocaleDateString("pt-AO")}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        </motion.section>

        {/* Dynamic Announcements / Timeline */}
        {announcements.length > 0 && (
          <motion.section className="mb-16" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}>
            <h2 className="mb-8 text-2xl font-bold text-foreground">Calendário e Informações</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {announcements.map((ann, i) => {
                const IconComp = categoryIcons[ann.category] || Info;
                const dateStr = ann.start_date && ann.end_date
                  ? `${new Date(ann.start_date).toLocaleDateString("pt-AO")} — ${new Date(ann.end_date).toLocaleDateString("pt-AO")}`
                  : ann.start_date
                  ? new Date(ann.start_date).toLocaleDateString("pt-AO")
                  : null;

                return (
                  <motion.div key={ann.id} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
                    <Card className="flex h-full flex-col items-center gap-3 rounded-2xl border-border/50 p-5 text-center transition-all hover:border-accent/30 hover:shadow-lg">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                        <IconComp className="h-6 w-6 text-accent" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">{ann.title}</h3>
                      {dateStr && <Badge variant="outline" className="rounded-lg text-xs">{dateStr}</Badge>}
                      {ann.content && <p className="text-xs text-muted-foreground leading-relaxed">{ann.content}</p>}
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-10">
            {/* Requirements */}
            <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}>
              <h2 className="mb-6 text-2xl font-bold text-foreground">Documentos Necessários</h2>
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
                <div className="mt-6 rounded-xl bg-accent/5 border border-accent/20 p-4">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Info className="h-4 w-4 text-accent" />
                    Informação sobre Taxas
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    O IPS é uma instituição <strong>pública e gratuita</strong>. A única taxa cobrada é a <strong>taxa de inscrição de 2.000 Kz</strong> (pagamento único).
                  </p>
                </div>
              </Card>
            </motion.section>
          </div>

          {/* Application Form */}
          <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}>
            <h2 className="mb-6 text-2xl font-bold text-foreground">Formulário de Candidatura</h2>
            {submitted && submittedData ? (
              <Card className="flex flex-col items-center gap-4 rounded-2xl border-border/50 p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                  <CheckCircle className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Candidatura Submetida!</h3>
                <p className="text-sm text-muted-foreground">Ref: {submittedData.id.substring(0, 8).toUpperCase()}</p>
                <Button variant="hero" onClick={() => generatePDF(submittedData)}>
                  <Download className="mr-2 h-4 w-4" />
                  Descarregar Comprovativo PDF
                </Button>
                <Button variant="outline" className="rounded-xl" onClick={() => { setSubmitted(false); setSubmittedData(null); setForm({ firstName: "", lastName: "", email: "", phone: "", course: "", secondaryCourse: "", firstCycleGrade: "", message: "" }); setErrors({}); }}>
                  Nova Candidatura
                </Button>
              </Card>
            ) : (
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
                    <Label htmlFor="firstCycleGrade">Nota do 1º Ciclo (0-20)</Label>
                    <Input id="firstCycleGrade" type="number" step="0.01" min="0" max="20" placeholder="Ex: 14.5" className={`rounded-xl ${errors.firstCycleGrade ? "border-destructive" : ""}`} value={form.firstCycleGrade} onChange={(e) => updateField("firstCycleGrade", e.target.value)} />
                    {errors.firstCycleGrade && <p className="text-xs text-destructive">{errors.firstCycleGrade}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course">1ª Opção de Curso *</Label>
                    <Select value={form.course} onValueChange={(v) => updateField("course", v)}>
                      <SelectTrigger className={`rounded-xl ${errors.course ? "border-destructive" : ""}`}>
                        <SelectValue placeholder="Seleccione o curso pretendido" />
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
                    <Label htmlFor="secondaryCourse">2ª Opção de Curso (opcional)</Label>
                    <Select value={form.secondaryCourse} onValueChange={(v) => updateField("secondaryCourse", v)}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Seleccione a segunda opção" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {courses.filter((c) => c.value !== form.course).map((c) => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
            )}
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
