import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/ips/Header";
import Footer from "@/components/ips/Footer";
import Seo from "@/components/seo/Seo";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  subject: z.string().trim().min(1, "Assunto é obrigatório").max(200),
  message: z.string().trim().min(1, "Mensagem é obrigatória").max(2000),
});

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1 },
  }),
};

const contactInfo = [
  { icon: MapPin, label: "Morada", value: "Rua Principal, Cidade do Sumbe, Cuanza Sul, Angola", href: "https://maps.google.com/?q=Sumbe+Angola" },
  { icon: Phone, label: "Telefone", value: "+244 936 000 000", href: "tel:+244936000000" },
  { icon: Mail, label: "Email", value: "info@ips.edu.ao", href: "mailto:info@ips.edu.ao" },
  { icon: Clock, label: "Horário", value: "Seg – Sex: 07:30 – 17:00", href: null },
];

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSending(true);

    // Simulate sending
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    toast({ title: "Mensagem enviada!", description: "Entraremos em contacto em breve." });
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero */}
        <div className="relative bg-primary py-16 md:py-24 overflow-hidden">
          <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-secondary/20 blur-3xl" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}>
              <Badge variant="secondary" className="mb-4 rounded-lg">Contacto</Badge>
              <h1 className="text-4xl font-extrabold text-primary-foreground md:text-5xl">
                Fale <span className="text-accent">Connosco</span>
              </h1>
              <p className="mt-4 max-w-lg mx-auto text-primary-foreground/70">
                Tem alguma questão? Estamos aqui para ajudar. Entre em contacto e responderemos o mais breve possível.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Contact Info */}
            <motion.div className="lg:col-span-2 space-y-4" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}>
              <h2 className="text-xl font-bold text-foreground mb-4">Informações de Contacto</h2>
              {contactInfo.map((info) => (
                <Card key={info.label} className="flex items-start gap-4 rounded-2xl border-border/50 p-4 transition-all hover:border-accent/30 hover:shadow-md">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                    <info.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{info.label}</p>
                    {info.href ? (
                      <a href={info.href} target="_blank" rel="noopener noreferrer" className="text-sm text-foreground hover:text-accent transition-colors flex items-center gap-1">
                        {info.value}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <p className="text-sm text-foreground">{info.value}</p>
                    )}
                  </div>
                </Card>
              ))}

              {/* Map */}
              <Card className="rounded-2xl border-border/50 overflow-hidden mt-4">
                <iframe
                  title="Localização do IPS"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15778.0!2d13.85!3d-11.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1a51f0!2sSumbe!5e0!3m2!1spt!2sao!4v1700000000000!5m2!1spt!2sao"
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full"
                />
              </Card>
            </motion.div>

            {/* Contact Form */}
            <motion.div className="lg:col-span-3" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}>
              <Card className="rounded-2xl border-border/50 p-6 md:p-8">
                <h2 className="text-xl font-bold text-foreground mb-6">Envie-nos uma Mensagem</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input
                        id="name"
                        className="rounded-xl"
                        placeholder="O seu nome"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                      {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        className="rounded-xl"
                        placeholder="email@exemplo.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                      {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Assunto *</Label>
                    <Input
                      id="subject"
                      className="rounded-xl"
                      placeholder="Sobre o que deseja falar?"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    />
                    {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem *</Label>
                    <Textarea
                      id="message"
                      className="rounded-xl"
                      rows={5}
                      placeholder="Escreva a sua mensagem aqui..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    />
                    {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
                  </div>
                  <Button type="submit" className="w-full rounded-xl" disabled={sending}>
                    {sending ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        A enviar...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Enviar Mensagem
                      </span>
                    )}
                  </Button>
                </form>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
