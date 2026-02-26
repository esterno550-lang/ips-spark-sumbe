import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen, Award, Info, MapPin, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import campusNight from "@/assets/campus-night.webp";
import campusEntrance from "@/assets/campus-entrance.jpeg";
import campusLab from "@/assets/campus-lab.jpeg";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1 },
  }),
};

const heroImages = [
  { src: campusEntrance, alt: "Entrada do campus do IPS" },
  { src: campusNight, alt: "Campus do IPS à noite" },
  { src: campusLab, alt: "Laboratório do IPS" },
];

const stats = [
  { icon: BookOpen, value: "3", label: "Cursos" },
  { icon: Users, value: "200+", label: "Docentes" },
  { icon: GraduationCap, value: "3,000+", label: "Estudantes" },
  { icon: Award, value: "20+", label: "Parcerias" },
];

const quickLinks = [
  { icon: Info, label: "Solicitar informações" },
  { icon: GraduationCap, label: "Encontrar curso" },
  { icon: Shield, label: "Segurança no campus" },
  { icon: MapPin, label: "Visitar o campus" },
];

interface HeroSectionProps {
  onNavigate?: (tab: string) => void;
}

const HeroSection = ({ onNavigate }: HeroSectionProps) => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + heroImages.length) % heroImages.length);
  const next = () => setCurrent((c) => (c + 1) % heroImages.length);

  return (
    <section className="relative overflow-hidden">
      {/* Hero Image Carousel */}
      <div className="relative h-[320px] sm:h-[400px] md:h-[480px]">
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={heroImages[current].src}
            alt={heroImages[current].alt}
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            loading="eager"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/50 to-background" />

        {/* Carousel controls */}
        <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background/30 backdrop-blur-sm text-white hover:bg-background/50 transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background/30 backdrop-blur-sm text-white hover:bg-background/50 transition-colors">
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${i === current ? "w-6 bg-accent" : "w-2 bg-white/50"}`}
            />
          ))}
        </div>

        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <motion.h1
              className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl drop-shadow-lg"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
            >
              Formação técnica, inovação e impacto —{" "}
              <span className="text-accent">construindo futuros</span> no Sumbe.
            </motion.h1>
          </div>
        </div>
      </div>

      <div className="px-4 py-12 md:py-16">
        {/* Decorative blurs */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />

        <div className="container mx-auto">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <motion.p
                className="max-w-lg text-lg text-muted-foreground leading-relaxed"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={1}
              >
                O Instituto Politécnico do Sumbe é uma instituição de ensino médio técnico que forma profissionais competentes, promovendo a formação técnica e profissional para o desenvolvimento sustentável de Angola.
              </motion.p>

              <motion.div
                className="mt-8 flex flex-wrap gap-3"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={2}
              >
                <Button variant="hero" size="lg" onClick={() => onNavigate?.("programs")}>
                  Explorar cursos
                </Button>
                <Button variant="heroOutline" size="lg" onClick={() => onNavigate?.("visit")}>
                  Planear uma visita
                </Button>
              </motion.div>

              <motion.div
                className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={3}
              >
                {stats.map((stat) => (
                  <Card key={stat.label} className="flex flex-col items-center gap-1 rounded-2xl border-border/50 bg-card/60 p-4 backdrop-blur-sm">
                    <stat.icon className="h-5 w-5 text-accent" />
                    <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </Card>
                ))}
              </motion.div>
            </div>

            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={4}>
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
      </div>
    </section>
  );
};

export default HeroSection;
