import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarPlus, Clock, MapPin } from "lucide-react";

const news = [
  { title: "IPS inaugura novo laboratório de Engenharia", category: "Campus", date: "18 Fev 2026" },
  { title: "Parceria com universidades europeias é anunciada", category: "Internacional", date: "12 Fev 2026" },
  { title: "Estudantes vencem competição nacional de robótica", category: "Estudantes", date: "05 Fev 2026" },
  { title: "Abertas candidaturas para bolsas de investigação", category: "Investigação", date: "28 Jan 2026" },
  { title: "Conferência sobre desenvolvimento sustentável", category: "Eventos", date: "20 Jan 2026" },
];

const events = [
  { title: "Dia Aberto — Visita ao Campus", time: "1 Mar 2026 · 09:00", location: "Campus Principal" },
  { title: "Seminário de Inovação Tecnológica", time: "8 Mar 2026 · 14:00", location: "Auditório Central" },
  { title: "Feira de Emprego 2026", time: "15 Mar 2026 · 10:00", location: "Pavilhão Desportivo" },
  { title: "Workshop de Empreendedorismo", time: "22 Mar 2026 · 09:30", location: "Sala de Conferências" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08 },
  }),
};

const NewsEventsSection = () => {
  return (
    <section className="px-4 py-16">
      <div className="container mx-auto">
        <motion.h2
          className="mb-8 text-3xl font-bold text-foreground"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Notícias & Eventos
        </motion.h2>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* News */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Notícias Recentes</h3>
            <div className="space-y-3">
              {news.map((item, i) => (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                >
                  <Card className="flex items-start gap-4 rounded-2xl border-border/50 p-4 transition-all hover:border-accent/30 hover:shadow-md cursor-pointer">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground leading-snug">{item.title}</h4>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary" className="rounded-lg text-xs">
                          {item.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{item.date}</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Events */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Próximos Eventos</h3>
            <div className="space-y-3">
              {events.map((event, i) => (
                <motion.div
                  key={event.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                >
                  <Card className="rounded-2xl border-border/50 p-4 transition-all hover:border-accent/30 hover:shadow-md">
                    <h4 className="font-medium text-foreground">{event.title}</h4>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {event.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {event.location}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="mt-3 gap-1.5 text-accent hover:text-accent">
                      <CalendarPlus className="h-4 w-4" />
                      Adicionar ao calendário
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsEventsSection;
