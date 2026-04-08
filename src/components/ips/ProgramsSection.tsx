import { useState, useMemo, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Search, GraduationCap, Zap, Leaf, Snowflake } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const programs = [
  {
    name: "Energia e Instalações Eléctricas",
    area: "Electricidade",
    level: "Ensino Médio Técnico",
    duration: "4 anos",
    icon: Zap,
    popular: true,
    advantages: [
      "Curso mais concorrido do instituto",
      "Alta empregabilidade no sector energético angolano",
      "Formação prática em instalações industriais e domésticas",
      "Preparação para certificação profissional",
    ],
  },
  {
    name: "Energias Renováveis",
    area: "Energia",
    level: "Ensino Médio Técnico",
    duration: "4 anos",
    icon: Leaf,
    popular: false,
    advantages: [
      "Sector em rápido crescimento em Angola e no mundo",
      "Formação em energia solar, eólica e biomassa",
      "Oportunidades de emprego em projectos sustentáveis",
      "Contribuição directa para o desenvolvimento sustentável",
    ],
  },
  {
    name: "Frio e Climatização",
    area: "Refrigeração",
    level: "Ensino Médio Técnico",
    duration: "4 anos",
    icon: Snowflake,
    popular: false,
    advantages: [
      "Competências técnicas altamente procuradas",
      "Formação em sistemas AVAC e refrigeração industrial",
      "Mercado de trabalho em expansão contínua",
      "Possibilidade de trabalho autónomo e empreendedorismo",
    ],
  },
];

const areas = [...new Set(programs.map((p) => p.area))];

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.05 },
  }),
};

const ProgramsSection = () => {
  const [search, setSearch] = useState("");
  const [area, setArea] = useState("all");

  const filtered = useMemo(() => {
    return programs.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchArea = area === "all" || p.area === area;
      return matchSearch && matchArea;
    });
  }, [search, area]);

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgX = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  return (
    <section ref={sectionRef} className="relative px-4 py-16 overflow-hidden">
      {/* Floating background decoration */}
      <motion.div
        className="pointer-events-none absolute -right-32 top-20 h-80 w-80 rounded-full bg-accent/5 blur-3xl"
        style={{ x: bgX }}
      />
      <motion.div
        className="pointer-events-none absolute -left-32 bottom-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl"
        style={{ x: useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]) }}
      />
      <div className="container mx-auto">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-foreground">Nossos Cursos</h2>
          <p className="mt-2 text-muted-foreground">Explore os nossos cursos técnicos de formação profissional</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="mb-8 flex flex-col gap-3 sm:flex-row"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar cursos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl pl-10"
            />
          </div>
          <Select value={area} onValueChange={setArea}>
            <SelectTrigger className="w-full rounded-xl sm:w-56">
              <SelectValue placeholder="Área" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="rounded-lg">Todas as áreas</SelectItem>
              {areas.map((a) => (
                <SelectItem key={a} value={a} className="rounded-lg">{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {filtered.map((program, i) => (
            <motion.div
              key={program.name}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
            >
              <Card className="group flex h-full flex-col rounded-2xl border-border/50 p-6 transition-all hover:border-accent/30 hover:shadow-lg">
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                      <program.icon className="h-6 w-6 text-accent" />
                    </div>
                    {program.popular && (
                      <Badge className="rounded-lg bg-accent text-accent-foreground text-xs">
                        Mais concorrido
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
                    {program.name}
                  </h3>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="secondary" className="rounded-lg text-xs">
                      {program.area}
                    </Badge>
                    <Badge variant="outline" className="rounded-lg text-xs">
                      {program.duration}
                    </Badge>
                  </div>
                </div>

                {/* Advantages */}
                <div className="mt-5 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vantagens</p>
                  <ul className="space-y-1.5">
                    {program.advantages.map((adv) => (
                      <li key={adv} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <GraduationCap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                        {adv}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-8 text-center text-muted-foreground">
            Nenhum curso encontrado. Tente ajustar a pesquisa.
          </p>
        )}
      </div>
    </section>
  );
};

export default ProgramsSection;
