import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/ips/Header";
import Footer from "@/components/ips/Footer";
import {
  CalendarDays,
  FileText,
  GraduationCap,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  HelpCircle,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1 },
  }),
};

const timeline = [
  { step: "1", title: "Submeter candidatura online", desc: "Preencha o formulário com os seus dados pessoais e académicos.", icon: FileText },
  { step: "2", title: "Enviar documentos", desc: "Faça o upload do certificado de habilitações e bilhete de identidade.", icon: CalendarDays },
  { step: "3", title: "Exame de admissão", desc: "Realize o exame de acesso na data agendada.", icon: GraduationCap },
  { step: "4", title: "Resultado e matrícula", desc: "Consulte os resultados e efetue a matrícula presencialmente.", icon: CheckCircle2 },
];

const requirements = [
  "Certificado de conclusão do ensino médio (12ª classe)",
  "Bilhete de identidade válido",
  "4 fotografias tipo passe",
  "Certificado médico",
  "Comprovativo de pagamento da taxa de inscrição",
];

const deadlines = [
  { label: "Candidaturas abertas", date: "1 Mar — 30 Abr 2026", status: "active" },
  { label: "Exames de admissão", date: "15 — 20 Mai 2026", status: "upcoming" },
  { label: "Publicação de resultados", date: "1 Jun 2026", status: "upcoming" },
  { label: "Período de matrícula", date: "5 — 30 Jun 2026", status: "upcoming" },
];

const fees = [
  { label: "Taxa de inscrição", value: "5.000 Kz" },
  { label: "Propina mensal", value: "15.000 Kz" },
  { label: "Taxa de matrícula", value: "10.000 Kz" },
];

const faqs = [
  { q: "Quais são os requisitos mínimos de admissão?", a: "É necessário ter concluído a 12ª classe com aproveitamento e realizar o exame de admissão." },
  { q: "Posso candidatar-me a mais de um curso?", a: "Sim, pode indicar até 2 opções por ordem de preferência no formulário de candidatura." },
  { q: "Existem bolsas de estudo disponíveis?", a: "Sim, o IPS oferece bolsas de mérito e bolsas sociais para estudantes elegíveis." },
  { q: "Como funciona a transferência de outra instituição?", a: "Estudantes transferidos devem apresentar o histórico académico para análise de equivalências." },
];

const Admissions = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-4 py-20 md:py-28">
          <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent/15 blur-3xl" />
          <div className="container mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Badge variant="secondary" className="mb-4 rounded-lg text-sm">Admissões 2026</Badge>
              <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl">
                O seu futuro começa <span className="text-gradient">aqui</span>
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Junte-se a uma comunidade de mais de 12.000 estudantes. Descubra como candidatar-se ao Instituto Politécnico do Sumbe.
              </p>
              <div className="mt-8 flex justify-center gap-3">
                <Button variant="hero" size="lg">Candidatar-se agora</Button>
                <Button variant="heroOutline" size="lg">Contactar admissões</Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Process Timeline */}
        <section className="px-4 py-16">
          <div className="container mx-auto">
            <motion.h2
              className="mb-10 text-center text-3xl font-bold text-foreground"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Processo de Admissão
            </motion.h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.step}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  custom={i}
                >
                  <Card className="relative flex flex-col items-center rounded-2xl border-border/50 p-6 text-center transition-all hover:border-accent/30 hover:shadow-lg">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                      <item.icon className="h-6 w-6 text-accent" />
                    </div>
                    <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent">Passo {item.step}</span>
                    <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Requirements & Deadlines */}
        <section className="px-4 py-16 bg-muted/20">
          <div className="container mx-auto grid gap-8 lg:grid-cols-2">
            {/* Requirements */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="rounded-2xl border-border/50 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-accent" />
                  <h3 className="text-xl font-bold text-foreground">Documentos Necessários</h3>
                </div>
                <ul className="space-y-3">
                  {requirements.map((req) => (
                    <li key={req} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      {req}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>

            {/* Deadlines */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="rounded-2xl border-border/50 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-accent" />
                  <h3 className="text-xl font-bold text-foreground">Datas Importantes</h3>
                </div>
                <div className="space-y-3">
                  {deadlines.map((d) => (
                    <div key={d.label} className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{d.label}</p>
                        <p className="text-xs text-muted-foreground">{d.date}</p>
                      </div>
                      <Badge
                        variant={d.status === "active" ? "default" : "secondary"}
                        className="rounded-lg text-xs"
                      >
                        {d.status === "active" ? "Aberto" : "Brevemente"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Tuition */}
        <section className="px-4 py-16">
          <div className="container mx-auto">
            <motion.div
              className="mx-auto max-w-2xl text-center"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <DollarSign className="mx-auto mb-4 h-8 w-8 text-accent" />
              <h2 className="text-3xl font-bold text-foreground">Propinas & Taxas</h2>
              <p className="mt-2 text-muted-foreground">Valores de referência para o ano lectivo 2026</p>
            </motion.div>
            <motion.div
              className="mx-auto mt-8 grid max-w-lg gap-4"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {fees.map((fee) => (
                <Card key={fee.label} className="flex items-center justify-between rounded-2xl border-border/50 px-6 py-4">
                  <span className="text-sm font-medium text-foreground">{fee.label}</span>
                  <span className="text-lg font-bold text-accent">{fee.value}</span>
                </Card>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 py-16 bg-muted/20">
          <div className="container mx-auto max-w-3xl">
            <motion.div
              className="mb-8 text-center"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <HelpCircle className="mx-auto mb-4 h-8 w-8 text-accent" />
              <h2 className="text-3xl font-bold text-foreground">Perguntas Frequentes</h2>
            </motion.div>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <motion.div
                  key={faq.q}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  custom={i}
                >
                  <Card className="rounded-2xl border-border/50 p-5">
                    <h4 className="font-semibold text-foreground">{faq.q}</h4>
                    <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-20">
          <div className="container mx-auto">
            <motion.div
              className="mx-auto max-w-2xl rounded-2xl bg-primary p-10 text-center text-primary-foreground"
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Users className="mx-auto mb-4 h-8 w-8" />
              <h2 className="text-2xl font-bold">Pronto para começar?</h2>
              <p className="mt-2 text-primary-foreground/70">
                As candidaturas para 2026 já estão abertas. Não perca a oportunidade.
              </p>
              <Button variant="hero" size="lg" className="mt-6">
                Candidatar-se agora
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Admissions;
