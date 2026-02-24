import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Eye, Heart, Zap } from "lucide-react";
import Header from "@/components/ips/Header";
import Footer from "@/components/ips/Footer";
import campusNight from "@/assets/campus-night.webp";
import campusEntrance from "@/assets/campus-entrance.jpeg";
import campusLab from "@/assets/campus-lab.jpeg";
import directorPhoto from "@/assets/director-maria-chilumbo.jpg";

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
    role: "Directora do Instituto",
    photo: directorPhoto,
    bio: "Maria Chilumbo é a atual Directora do Instituto Politécnico do Sumbe, liderando a instituição com visão estratégica e compromisso com a formação técnica de qualidade.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero */}
        <div className="relative h-[300px] md:h-[400px]">
          <img src={campusNight} alt="Campus do IPS à noite" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/50 to-background" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div className="text-center" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}>
              <Badge variant="secondary" className="mb-4 rounded-lg">Sobre o IPS</Badge>
              <h1 className="text-4xl font-extrabold text-white md:text-5xl drop-shadow-lg">
                Conheça o <span className="text-accent">IPS</span>
              </h1>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* History */}
          <motion.section className="mb-16" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}>
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">Nossa História</h2>
                <p className="text-muted-foreground leading-relaxed">
                  O Instituto Politécnico do Sumbe é uma instituição de ensino médio técnico situada na cidade do Sumbe, província do Cuanza Sul. Dedicado à formação técnica e profissional de jovens angolanos, o IPS oferece cursos nas áreas de Electricidade, Electrónica, Mecânica, Informática, Construção Civil, Agropecuária, Gestão e Saúde.
                </p>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Com um campus moderno e equipado, a instituição prepara os seus alunos para enfrentar os desafios do mercado de trabalho angolano, contribuindo para o desenvolvimento sustentável da região.
                </p>
              </div>
              <img src={campusEntrance} alt="Entrada do campus do IPS" className="rounded-2xl object-cover h-64 w-full" />
            </div>
          </motion.section>

          {/* Mission */}
          <motion.section className="mb-16" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}>
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <img src={campusLab} alt="Laboratório do IPS" className="rounded-2xl object-cover h-64 w-full order-last lg:order-first" />
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
              {values.map((v) => (
                <Card key={v.title} className="flex flex-col items-center gap-3 rounded-2xl border-border/50 p-6 text-center transition-all hover:border-accent/30 hover:shadow-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                    <v.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{v.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{v.description}</p>
                </Card>
              ))}
            </div>
          </motion.section>

          {/* Leadership */}
          <motion.section className="mb-16" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={4}>
            <h2 className="mb-8 text-2xl font-bold text-foreground text-center">Equipa de Direcção</h2>
            <div className="flex justify-center">
              {leadership.map((person) => (
                <Card key={person.name} className="max-w-sm rounded-2xl border-border/50 overflow-hidden transition-all hover:shadow-lg">
                  <img src={person.photo} alt={person.name} className="h-72 w-full object-cover" />
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-foreground">{person.name}</h3>
                    <Badge variant="secondary" className="mt-1 rounded-lg">{person.role}</Badge>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{person.bio}</p>
                  </div>
                </Card>
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
