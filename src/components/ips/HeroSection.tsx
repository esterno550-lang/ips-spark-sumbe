import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen, Award, Info, MapPin, Shield } from "lucide-react";
import ipsLogo from "@/assets/ips-logo.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1 },
  }),
};

const stats = [
  { icon: BookOpen, value: "170+", label: "Programas" },
  { icon: Users, value: "1,000+", label: "Docentes" },
  { icon: GraduationCap, value: "12,000+", label: "Estudantes" },
  { icon: Award, value: "50+", label: "Parcerias" },
];

const quickLinks = [
  { icon: Info, label: "Solicitar informações" },
  { icon: GraduationCap, label: "Encontrar curso" },
  { icon: Shield, label: "Segurança no campus" },
  { icon: MapPin, label: "Visitar o campus" },
];

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden px-4 py-16 md:py-24">
      {/* Decorative blurs */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />

      <div className="container mx-auto">
        {/* Logo */}
        <motion.div
          className="mb-10 flex justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <img
            src={ipsLogo}
            alt="Instituto Politécnico do Sumbe"
            className="h-40 w-auto object-contain md:h-52"
          />
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left */}
          <div>
            <motion.h1
              className="text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              Formação técnica, inovação e impacto —{" "}
              <span className="text-gradient">construindo futuros</span> no Sumbe.
            </motion.h1>

            <motion.p
              className="mt-6 max-w-lg text-lg text-muted-foreground leading-relaxed"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
            >
              O Instituto Politécnico do Sumbe forma profissionais competentes, promovendo a investigação científica e a extensão universitária para o desenvolvimento sustentável de Angola.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-wrap gap-3"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
            >
              <Button variant="hero" size="lg">
                Explorar programas
              </Button>
              <Button variant="heroOutline" size="lg">
                Planear uma visita
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              custom={0}
            >
              {stats.map((stat, i) => (
                <motion.div key={stat.label} variants={fadeUp} custom={i}>
                  <Card className="flex flex-col items-center gap-1 rounded-2xl border-border/50 bg-card/60 p-4 backdrop-blur-sm">
                    <stat.icon className="h-5 w-5 text-accent" />
                    <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right - Quick Links */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            custom={0}
          >
            <Card className="rounded-2xl border-border/50 bg-card/80 p-6 backdrop-blur-sm">
              <h3 className="mb-4 text-lg font-semibold text-foreground">Links Rápidos</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {quickLinks.map((link) => (
                  <button
                    key={link.label}
                    className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent/10 hover:text-accent"
                  >
                    <link.icon className="h-5 w-5 text-accent" />
                    {link.label}
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
