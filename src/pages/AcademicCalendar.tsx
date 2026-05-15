import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isWithinInterval, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarDays, BookOpen, GraduationCap, PartyPopper, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/ips/Header";
import Footer from "@/components/ips/Footer";
import Seo from "@/components/seo/Seo";
import { supabase } from "@/integrations/supabase/client";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1 },
  }),
};

type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  end_date: string | null;
  event_type: string;
  is_public: boolean;
};

const eventTypeConfig: Record<string, { label: string; color: string; icon: typeof CalendarDays }> = {
  evento: { label: "Evento", color: "bg-accent/20 text-accent border-accent/30", icon: CalendarDays },
  exame: { label: "Exame", color: "bg-orange-500/20 text-orange-600 border-orange-500/30", icon: BookOpen },
  feriado: { label: "Feriado", color: "bg-green-500/20 text-green-600 border-green-500/30", icon: PartyPopper },
  academico: { label: "Académico", color: "bg-blue-500/20 text-blue-600 border-blue-500/30", icon: GraduationCap },
  reuniao: { label: "Reunião", color: "bg-purple-500/20 text-purple-600 border-purple-500/30", icon: Info },
};

const AcademicCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("is_public", true)
      .order("event_date");
    setEvents((data as CalendarEvent[]) || []);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start to Monday
  const startDay = monthStart.getDay();
  const paddingDays = startDay === 0 ? 6 : startDay - 1;

  const getEventsForDay = (day: Date) => {
    return events.filter((e) => {
      const eventStart = parseISO(e.event_date);
      if (e.end_date) {
        const eventEnd = parseISO(e.end_date);
        return isWithinInterval(day, { start: eventStart, end: eventEnd }) || isSameDay(day, eventStart) || isSameDay(day, eventEnd);
      }
      return isSameDay(day, eventStart);
    });
  };

  const filteredEvents = filterType === "all"
    ? events
    : events.filter((e) => e.event_type === filterType);

  const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero */}
        <div className="relative bg-primary py-16 md:py-20 overflow-hidden">
          <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}>
              <Badge variant="secondary" className="mb-4 rounded-lg">Calendário</Badge>
              <h1 className="text-4xl font-extrabold text-primary-foreground md:text-5xl">
                Calendário <span className="text-accent">Académico</span>
              </h1>
              <p className="mt-4 max-w-lg mx-auto text-primary-foreground/70">
                Eventos, exames, feriados e datas importantes do ano lectivo.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Calendar Grid */}
            <motion.div className="lg:col-span-2" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}>
              <Card className="rounded-2xl border-border/50 p-4 md:p-6">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <h2 className="text-lg font-bold text-foreground capitalize">
                    {format(currentMonth, "MMMM yyyy", { locale: pt })}
                  </h2>
                  <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>

                {/* Week Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDays.map((d) => (
                    <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: paddingDays }).map((_, i) => (
                    <div key={`pad-${i}`} className="aspect-square" />
                  ))}
                  {days.map((day) => {
                    const dayEvents = getEventsForDay(day);
                    const isToday = isSameDay(day, new Date());
                    const isSelected = selectedDate && isSameDay(day, selectedDate);

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(day)}
                        className={`aspect-square rounded-xl p-1 text-sm transition-all relative flex flex-col items-center justify-start gap-0.5
                          ${isToday ? "ring-2 ring-accent" : ""}
                          ${isSelected ? "bg-accent/20 text-accent font-bold" : "hover:bg-muted/50"}
                          ${!isSameMonth(day, currentMonth) ? "text-muted-foreground/30" : "text-foreground"}
                        `}
                      >
                        <span className="text-xs md:text-sm">{format(day, "d")}</span>
                        {dayEvents.length > 0 && (
                          <div className="flex gap-0.5 flex-wrap justify-center">
                            {dayEvents.slice(0, 3).map((e) => (
                              <span
                                key={e.id}
                                className={`h-1.5 w-1.5 rounded-full ${
                                  e.event_type === "exame" ? "bg-orange-500" :
                                  e.event_type === "feriado" ? "bg-green-500" :
                                  e.event_type === "academico" ? "bg-blue-500" :
                                  e.event_type === "reuniao" ? "bg-purple-500" :
                                  "bg-accent"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {Object.entries(eventTypeConfig).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setFilterType(filterType === key ? "all" : key)}
                      className={`flex items-center gap-1.5 text-xs rounded-lg px-2.5 py-1.5 border transition-all ${
                        filterType === key ? config.color + " font-semibold" : "border-border/50 text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      <config.icon className="h-3 w-3" />
                      {config.label}
                    </button>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Sidebar: Events List */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}>
              <Card className="rounded-2xl border-border/50 p-4 md:p-6 sticky top-24">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  {selectedDate
                    ? `Eventos — ${format(selectedDate, "d MMM", { locale: pt })}`
                    : "Próximos Eventos"}
                </h3>

                {selectedDate && selectedDayEvents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDayEvents.map((e) => {
                      const config = eventTypeConfig[e.event_type] || eventTypeConfig.evento;
                      return (
                        <div key={e.id} className="rounded-xl border border-border/50 p-3 space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={`rounded-lg text-xs border ${config.color}`}>{config.label}</Badge>
                          </div>
                          <h4 className="font-semibold text-foreground text-sm">{e.title}</h4>
                          {e.description && <p className="text-xs text-muted-foreground">{e.description}</p>}
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(e.event_date), "d MMM yyyy", { locale: pt })}
                            {e.end_date && ` — ${format(parseISO(e.end_date), "d MMM yyyy", { locale: pt })}`}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : selectedDate ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Nenhum evento neste dia.</p>
                ) : (
                  <div className="space-y-3">
                    {filteredEvents
                      .filter((e) => parseISO(e.event_date) >= new Date())
                      .slice(0, 8)
                      .map((e) => {
                        const config = eventTypeConfig[e.event_type] || eventTypeConfig.evento;
                        return (
                          <div
                            key={e.id}
                            className="rounded-xl border border-border/50 p-3 space-y-1 cursor-pointer hover:border-accent/30 transition-colors"
                            onClick={() => setSelectedDate(parseISO(e.event_date))}
                          >
                            <div className="flex items-center gap-2">
                              <Badge className={`rounded-lg text-xs border ${config.color}`}>{config.label}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(parseISO(e.event_date), "d MMM", { locale: pt })}
                              </span>
                            </div>
                            <h4 className="font-medium text-foreground text-sm">{e.title}</h4>
                          </div>
                        );
                      })}
                    {filteredEvents.filter((e) => parseISO(e.event_date) >= new Date()).length === 0 && (
                      <p className="text-sm text-muted-foreground py-4 text-center">Nenhum evento futuro.</p>
                    )}
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AcademicCalendar;
