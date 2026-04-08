import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen, Award, Info, MapPin, Shield, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AnimatedCounter from "@/components/ips/AnimatedCounter";
import campusNight from "@/assets/campus-night.webp";
import campusEntrance from "@/assets/campus-entrance.jpeg";
import campusLab from "@/assets/campus-lab.jpeg";

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
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + heroImages.length) % heroImages.length);
  const next = () => setCurrent((c) => (c + 1) % heroImages.length);

  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 600], [0, 150]);
  const textY = useTransform(scrollY, [0, 400], [0, -40]);
  const overlayOpacity = useTransform(scrollY, [0, 500], [0.4, 0.8]);

  return (
    <section className="relative overflow-hidden">
      {/* Hero Image Carousel — Full viewport height */}
      <div className="relative h-[85vh] min-h-[480px] max-h-[800px]">
        <motion.div className="absolute inset-0 -inset-y-20" style={{ y: bgY }}>
          <AnimatePresence mode="wait">
            <motion.img
              key={current}
              src={heroImages[current].src}
              alt={heroImages[current].alt}
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 1.2, ease: "easeOut" as const }}
              loading="eager"
            />
          </AnimatePresence>
        </motion.div>

        {/* Gradient overlay with scroll-driven opacity */}
        <motion.div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/40 to-background" style={{ opacity: overlayOpacity }} />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-transparent to-transparent" />

        {/* Carousel controls */}
        <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-background/20 backdrop-blur-md text-white hover:bg-background/40 transition-all hover:scale-110">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-background/20 backdrop-blur-md text-white hover:bg-background/40 transition-all hover:scale-110">
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2.5 rounded-full transition-all duration-500 ${i === current ? "w-8 bg-accent" : "w-2.5 bg-white/40 hover:bg-white/60"}`}
            />
          ))}
        </div>

        {/* Main content overlay with parallax text */}
        <motion.div className="absolute inset-0 flex items-center" style={{ y: textY }}>
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <motion.div
                  className="inline-flex items-center gap-2 mb-6 rounded-full bg-accent/20 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white border border-accent/30"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Sparkles className="h-4 w-4 text-accent" />
                  Candidaturas Abertas 2026
                </motion.div>
              </motion.div>

              <motion.h1
                className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Formação técnica,
                <br />
                <span className="text-gradient bg-gradient-to-r from-accent to-blue-300 bg-clip-text text-transparent">
                  inovação
                </span>{" "}
                e impacto.
              </motion.h1>

              <motion.p
                className="mt-6 max-w-lg text-lg text-white/80 leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                O Instituto Politécnico do Sumbe forma profissionais competentes para o desenvolvimento sustentável de Angola.
              </motion.p>

              <motion.div
                className="mt-8 flex flex-wrap gap-3"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Button variant="hero" size="lg" className="rounded-xl text-base px-8" onClick={() => onNavigate?.("programs")}>
                  Explorar cursos
                </Button>
                <Button variant="heroOutline" size="lg" className="rounded-xl text-base px-8" onClick={() => onNavigate?.("visit")}>
                  Planear uma visita
                </Button>
              </motion.div>

              {/* Stats inline */}
              <motion.div
                className="mt-10 flex flex-wrap gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    className="flex items-center gap-2.5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.9 + i * 0.1 }}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                      <stat.icon className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <AnimatedCounter value={stat.value} className="text-xl font-bold text-white" />
                      <p className="text-xs text-white/60">{stat.label}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
        </motion.div>
      </div>
      </div>

      {/* Quick Links section below hero */}
      <div className="px-4 py-10 md:py-14">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="rounded-2xl border-border/50 bg-card/80 p-6 backdrop-blur-sm">
              <h3 className="mb-4 text-lg font-semibold text-foreground">Links Rápidos</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {quickLinks.map((link, i) => (
                  <motion.button
                    key={link.label}
                    className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3.5 text-left text-sm font-medium text-foreground transition-all hover:bg-accent/10 hover:text-accent hover:shadow-md"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                      <link.icon className="h-4 w-4 text-accent" />
                    </div>
                    {link.label}
                  </motion.button>
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
