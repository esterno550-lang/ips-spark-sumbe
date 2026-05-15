import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Eye, Heart, Zap, Award, Users, BookOpen, Calendar } from "lucide-react";
import Header from "@/components/ips/Header";
import Footer from "@/components/ips/Footer";
import Seo from "@/components/seo/Seo";
import AnimatedCounter from "@/components/ips/AnimatedCounter";
import campusNight from "@/assets/campus-night.webp";
import campusEntrance from "@/assets/campus-entrance.jpeg";
import campusLab from "@/assets/campus-lab.jpeg";
import directorPhoto from "@/assets/director-maria-chilumbo.jpg";
import viceAcademicoPhoto from "@/assets/director-vice-academico.jpg";
import viceAdminPhoto from "@/assets/director-vice-admin.jpg";
import pedagogicoPhoto from "@/assets/director-pedagogico.jpg";
import secretarioPhoto from "@/assets/director-secretario.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1 },
  }),
};

const values = [
  { icon: Heart, title: "Ética Profissional", description: "Formamos técnicos com integridade, responsabilidade e compromisso com a excelência." },
  { icon: Zap, title: "Inovação Contínua", description: "Adoptamos novas tecnologias e metodologias para preparar os alunos para a indústria moderna." },
  { icon: Target, title: "Responsabilidade Social", description: "Contribuímos para o desenvolvimento de infraestruturas locais e da comunidade do Sumbe." },
];

const leadership = [
  {
    name: "Maria Chilumbo",
    role: "Directora Geral",
    photo: directorPhoto,
    bio: "Lidera o Instituto com visão estratégica e compromisso com a formação técnica de qualidade, representando a instituição perante entidades nacionais e internacionais.",
  },
  {
    name: "António Sebastião",
    role: "Sub-Director Académico",
    photo: viceAcademicoPhoto,
    bio: "Responsável pela coordenação dos programas académicos, gestão curricular e supervisão da qualidade pedagógica dos cursos técnicos.",
  },
  {
    name: "Teresa Domingos",
    role: "Sub-Directora Administrativa",
    photo: viceAdminPhoto,
    bio: "Gere os recursos humanos, financeiros e patrimoniais do instituto, garantindo o funcionamento eficiente de todos os serviços de apoio.",
  },
  {
    name: "José Manuel Ferreira",
    role: "Director Pedagógico",
    photo: pedagogicoPhoto,
    bio: "Coordena as actividades pedagógicas, formação de docentes e implementação de metodologias de ensino inovadoras.",
  },
  {
    name: "Carlos Eduardo Pinto",
    role: "Secretário Geral",
    photo: secretarioPhoto,
    bio: "Responsável pela gestão documental, arquivo institucional e coordenação dos processos administrativos e de matrículas.",
  },
];

const milestones = [
  { year: "2005", event: "Fundação do Instituto Politécnico do Sumbe" },
  { year: "2008", event: "Inauguração dos laboratórios de Electricidade" },
  { year: "2012", event: "Introdução do curso de Energias Renováveis" },
  { year: "2018", event: "Parcerias com universidades internacionais" },
  { year: "2023", event: "Modernização completa das instalações" },
  { year: "2026", event: "Novos laboratórios de investigação" },
];

const quickStats = [
  { icon: Users, value: "200+", label: "Docentes" },
  { icon: BookOpen, value: "3", label: "Cursos" },
  { icon: Award, value: "20+", label: "Parcerias" },
  { icon: Calendar, value: "21", label: "Anos de história" },
];

const About = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(heroProgress, [0, 0.8], [1, 0.3]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero with parallax */}
        <div ref={heroRef} className="relative h-[340px] md:h-[420px] overflow-hidden">
          <motion.img
            src={campusNight}
            alt="Campus do IPS à noite"
            className="absolute inset-0 -inset-y-16 h-[calc(100%+4rem)] w-full object-cover"
            style={{ y: heroY }}
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/50 to-background" />
          <motion.div className="absolute inset-0 flex items-center justify-center" style={{ opacity: heroOpacity }}>
            <motion.div className="text-center px-4" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}>
              <Badge variant="secondary" className="mb-4 rounded-lg">Sobre o IPS</Badge>
              <h1 className="text-4xl font-extrabold text-primary-foreground md:text-5xl drop-shadow-lg">
                Conheça o <span className="text-accent">IPS</span>
              </h1>
              <p className="mt-4 max-w-md mx-auto text-primary-foreground/70">
                21 anos a formar profissionais competentes para Angola.
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <div className="border-b border-border/40 bg-card/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {quickStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                    <stat.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <AnimatedCounter value={stat.value} className="text-xl font-bold text-foreground" />
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* History */}
          <motion.section className="mb-16" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}>
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">Nossa História</h2>
                <p className="text-muted-foreground leading-relaxed">
                  O Instituto Politécnico do Sumbe é uma instituição de ensino médio técnico situada na cidade do Sumbe, província do Cuanza Sul. Dedicado à formação técnica e profissional de jovens angolanos, o IPS oferece cursos nas áreas de Electricidade, Energias Renováveis e Frio & Climatização.
                </p>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Com um campus moderno e equipado, a instituição prepara os seus alunos para enfrentar os desafios do mercado de trabalho angolano, contribuindo para o desenvolvimento sustentável da região.
                </p>
              </div>
              <div className="relative overflow-hidden rounded-2xl">
                <img src={campusEntrance} alt="Entrada do campus do IPS" className="h-64 w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
              </div>
            </div>
          </motion.section>

          {/* Timeline */}
          <motion.section className="mb-16" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1.5}>
            <h2 className="mb-8 text-2xl font-bold text-foreground text-center">Marcos Históricos</h2>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border md:left-1/2 md:-translate-x-0.5" />
              <div className="space-y-8">
                {milestones.map((m, i) => (
                  <motion.div
                    key={m.year}
                    className={`relative flex items-center gap-4 md:gap-8 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                  >
                    <div className="hidden md:block md:w-1/2" />
                    <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold shadow-md">
                      {i + 1}
                    </div>
                    <Card className={`ml-12 md:ml-0 md:w-1/2 rounded-2xl border-border/50 p-4 transition-all hover:border-accent/30 hover:shadow-md ${i % 2 !== 0 ? "md:mr-12" : "md:ml-12"}`}>
                      <Badge variant="outline" className="rounded-lg text-xs mb-2">{m.year}</Badge>
                      <p className="text-sm font-medium text-foreground">{m.event}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Mission */}
          <motion.section className="mb-16" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}>
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div className="relative overflow-hidden rounded-2xl order-last lg:order-first">
                <img src={campusLab} alt="Laboratório do IPS" className="h-64 w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                    <Target className="h-5 w-5 text-accent" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Nossa Missão</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Providenciar uma educação técnica de excelência que capacite os jovens angolanos a enfrentar os desafios da indústria moderna.
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                    <Eye className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Foco Prático</h3>
                </div>
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  Aulas laboratoriais intensivas em laboratórios equipados para as áreas de Electricidade e Electrónica.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Values */}
          <motion.section className="mb-16" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3}>
            <h2 className="mb-8 text-2xl font-bold text-foreground text-center">Nossos Valores</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card className="flex flex-col items-center gap-3 rounded-2xl border-border/50 p-6 text-center transition-all hover:border-accent/30 hover:shadow-lg group">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 transition-colors group-hover:bg-accent/20">
                      <v.icon className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{v.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{v.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Leadership */}
          <motion.section className="mb-16" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={4}>
            <h2 className="mb-8 text-2xl font-bold text-foreground text-center">Equipa de Direcção</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {leadership.map((person, i) => (
                <motion.div
                  key={person.name}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                >
                  <Card className={`rounded-2xl border-border/50 overflow-hidden transition-all hover:shadow-lg group ${i === 0 ? "sm:col-span-2 lg:col-span-1" : ""}`}>
                    <div className="relative overflow-hidden">
                      <img
                        src={person.photo}
                        alt={person.name}
                        className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-foreground">{person.name}</h3>
                      <Badge variant="secondary" className="mt-1 rounded-lg">{person.role}</Badge>
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{person.bio}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;