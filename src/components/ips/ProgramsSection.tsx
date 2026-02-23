import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, GraduationCap } from "lucide-react";
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
  { name: "Engenharia Mecânica", area: "Engenharia", level: "Licenciatura", duration: "5 anos" },
  { name: "Ciências da Computação", area: "Tecnologia", level: "Licenciatura", duration: "4 anos" },
  { name: "Engenharia Civil", area: "Engenharia", level: "Licenciatura", duration: "5 anos" },
  { name: "Agronomia", area: "Ciências Agrárias", level: "Licenciatura", duration: "5 anos" },
  { name: "Gestão de Empresas", area: "Gestão", level: "Licenciatura", duration: "4 anos" },
  { name: "Contabilidade e Finanças", area: "Gestão", level: "Licenciatura", duration: "4 anos" },
  { name: "Engenharia Electrotécnica", area: "Engenharia", level: "Licenciatura", duration: "5 anos" },
  { name: "Matemática", area: "Ciências", level: "Licenciatura", duration: "4 anos" },
  { name: "Biologia", area: "Ciências", level: "Licenciatura", duration: "4 anos" },
  { name: "Enfermagem", area: "Saúde", level: "Licenciatura", duration: "4 anos" },
  { name: "Arquitectura", area: "Engenharia", level: "Licenciatura", duration: "5 anos" },
  { name: "Direito", area: "Ciências Sociais", level: "Licenciatura", duration: "5 anos" },
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

  return (
    <section className="px-4 py-16">
      <div className="container mx-auto">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-foreground">Encontrar Programas</h2>
          <p className="mt-2 text-muted-foreground">Explore os nossos cursos e áreas de formação</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="mb-8 flex flex-col gap-3 sm:flex-row"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar programas..."
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((program, i) => (
            <motion.div
              key={program.name}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={i}
            >
              <Card className="group flex h-full flex-col justify-between rounded-2xl border-border/50 p-5 transition-all hover:border-accent/30 hover:shadow-lg">
                <div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                    <GraduationCap className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
                    {program.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{program.duration}</p>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-lg text-xs">
                    {program.area}
                  </Badge>
                  <Badge variant="outline" className="rounded-lg text-xs">
                    {program.level}
                  </Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-8 text-center text-muted-foreground">
            Nenhum programa encontrado. Tente ajustar a pesquisa.
          </p>
        )}
      </div>
    </section>
  );
};

export default ProgramsSection;
