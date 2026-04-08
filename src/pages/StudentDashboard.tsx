import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LogOut, Loader2, BookOpen, ClipboardList, Calendar, GraduationCap, User,
  Bell, TrendingUp, Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/ips/Header";
import Footer from "@/components/ips/Footer";

type SubjectWithTeacher = {
  id: string;
  name: string;
  code: string;
  year: number;
  semester: number;
  teacher_name: string;
  course_name: string;
};

type GradeRow = {
  subject_name: string;
  subject_code: string;
  prova1: number | null;
  prova2: number | null;
  exame: number | null;
  recurso: number | null;
};

type ScheduleRow = {
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string;
  subject_name: string;
  subject_code: string;
};

type Announcement = {
  id: string;
  title: string;
  content: string | null;
  category: string;
  created_at: string;
};

const dayLabels: Record<number, string> = {
  1: "Segunda", 2: "Terça", 3: "Quarta", 4: "Quinta", 5: "Sexta", 6: "Sábado",
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08 },
  }),
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [profileName, setProfileName] = useState("");
  const [subjects, setSubjects] = useState<SubjectWithTeacher[]>([]);
  const [grades, setGrades] = useState<GradeRow[]>([]);
  const [schedules, setSchedules] = useState<ScheduleRow[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [enrollment, setEnrollment] = useState<{ course_name: string; year_level: number; academic_year: string } | null>(null);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setUserId(session.user.id);

      const { data: prof } = await supabase.from("profiles").select("display_name").eq("user_id", session.user.id).single();
      setProfileName(prof?.display_name || session.user.email || "");
      setLoading(false);
    };
    check();
  }, [navigate]);

  const fetchData = useCallback(async () => {
    if (!userId) return;

    // Fetch announcements
    const { data: annData } = await supabase
      .from("announcements")
      .select("id, title, content, category, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(5);
    setAnnouncements(annData || []);

    // Get enrollment
    const { data: enr } = await supabase
      .from("enrollments")
      .select("*, courses(name)")
      .eq("student_id", userId)
      .order("enrolled_at", { ascending: false })
      .limit(1);

    if (!enr || enr.length === 0) {
      setEnrollment(null);
      return;
    }

    const enrollment = enr[0] as any;
    setEnrollment({
      course_name: enrollment.courses?.name || "",
      year_level: enrollment.year_level,
      academic_year: enrollment.academic_year,
    });

    // Get subjects for this course
    const { data: subs } = await supabase
      .from("subjects")
      .select("*")
      .eq("course_id", enrollment.course_id);

    if (!subs || subs.length === 0) {
      setSubjects([]);
      setGrades([]);
      setSchedules([]);
      return;
    }

    // Get teacher profiles
    const teacherIds = [...new Set(subs.map((s: any) => s.teacher_id))];
    const { data: teacherProfiles } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", teacherIds);

    const teacherMap: Record<string, string> = {};
    (teacherProfiles || []).forEach((p: any) => {
      teacherMap[p.user_id] = p.display_name || "Professor";
    });

    const subjectsWithTeachers: SubjectWithTeacher[] = subs.map((s: any) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      year: s.year,
      semester: s.semester,
      teacher_name: teacherMap[s.teacher_id] || "Professor",
      course_name: enrollment.courses?.name || "",
    }));
    setSubjects(subjectsWithTeachers);

    // Get grades
    const subjectIds = subs.map((s: any) => s.id);
    const { data: gradeData } = await supabase
      .from("grades")
      .select("*")
      .eq("student_id", userId)
      .in("subject_id", subjectIds);

    const gradeMap: Record<string, GradeRow> = {};
    subs.forEach((s: any) => {
      gradeMap[s.id] = {
        subject_name: s.name,
        subject_code: s.code,
        prova1: null, prova2: null, exame: null, recurso: null,
      };
    });

    (gradeData || []).forEach((g: any) => {
      if (gradeMap[g.subject_id]) {
        (gradeMap[g.subject_id] as any)[g.grade_type] = g.grade;
      }
    });
    setGrades(Object.values(gradeMap));

    // Get schedules
    const { data: schData } = await supabase
      .from("schedules")
      .select("*")
      .in("subject_id", subjectIds);

    const scheduleRows: ScheduleRow[] = (schData || []).map((sch: any) => {
      const sub = subs.find((s: any) => s.id === sch.subject_id);
      return {
        day_of_week: sch.day_of_week,
        start_time: sch.start_time,
        end_time: sch.end_time,
        room: sch.room,
        subject_name: sub?.name || "",
        subject_code: sub?.code || "",
      };
    });
    setSchedules(scheduleRows.sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time)));
  }, [userId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Computed stats
  const gradeAvg = (() => {
    const allGrades = grades.flatMap(g => [g.prova1, g.prova2, g.exame].filter(v => v !== null) as number[]);
    return allGrades.length > 0 ? (allGrades.reduce((a, b) => a + b, 0) / allGrades.length) : null;
  })();

  const passedCount = grades.filter(g => {
    const valid = [g.prova1, g.prova2, g.exame].filter(v => v !== null) as number[];
    const avg = valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
    return avg !== null && avg >= 10;
  }).length;

  const todaySchedule = schedules.filter(s => {
    const today = new Date().getDay();
    const mappedDay = today === 0 ? 7 : today;
    return s.day_of_week === mappedDay;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Welcome card */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
          <Card className="rounded-2xl border-border/50 p-6 mb-6 bg-gradient-to-r from-primary/5 via-card to-accent/5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
                <GraduationCap className="h-7 w-7 text-accent" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-foreground">Olá, {profileName}!</h1>
                {enrollment ? (
                  <p className="text-sm text-muted-foreground">
                    {enrollment.course_name} • {enrollment.year_level}º ano • {enrollment.academic_year}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Ainda não está matriculado. Contacte a administração.</p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick stats */}
        {enrollment && (
          <motion.div
            className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            <Card className="rounded-2xl border-border/50 p-4 text-center">
              <BookOpen className="mx-auto h-5 w-5 text-accent mb-1" />
              <p className="text-2xl font-bold text-foreground">{subjects.length}</p>
              <p className="text-xs text-muted-foreground">Disciplinas</p>
            </Card>
            <Card className="rounded-2xl border-border/50 p-4 text-center">
              <TrendingUp className="mx-auto h-5 w-5 text-accent mb-1" />
              <p className="text-2xl font-bold text-foreground">{gradeAvg !== null ? gradeAvg.toFixed(1) : "—"}</p>
              <p className="text-xs text-muted-foreground">Média geral</p>
            </Card>
            <Card className="rounded-2xl border-border/50 p-4 text-center">
              <GraduationCap className="mx-auto h-5 w-5 text-accent mb-1" />
              <p className="text-2xl font-bold text-foreground">{passedCount}/{grades.length}</p>
              <p className="text-xs text-muted-foreground">Aprovadas</p>
            </Card>
            <Card className="rounded-2xl border-border/50 p-4 text-center">
              <Clock className="mx-auto h-5 w-5 text-accent mb-1" />
              <p className="text-2xl font-bold text-foreground">{todaySchedule.length}</p>
              <p className="text-xs text-muted-foreground">Aulas hoje</p>
            </Card>
          </motion.div>
        )}

        {/* Announcements banner */}
        {announcements.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1.5}>
            <Card className="rounded-2xl border-accent/20 bg-accent/5 p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-semibold text-foreground">Avisos Recentes</h3>
              </div>
              <div className="space-y-2">
                {announcements.slice(0, 3).map(a => (
                  <div key={a.id} className="flex items-start gap-3 rounded-xl bg-card/60 p-3">
                    <Badge variant="secondary" className="rounded-lg text-xs shrink-0 mt-0.5">{a.category}</Badge>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{a.title}</p>
                      {a.content && <p className="text-xs text-muted-foreground line-clamp-1">{a.content}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {!enrollment ? (
          <Card className="rounded-2xl border-border/50 p-8 text-center">
            <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Sem matrícula activa</h2>
            <p className="text-muted-foreground">Contacte a administração do IPS para efectuar a sua matrícula.</p>
          </Card>
        ) : (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}>
            <Tabs defaultValue="grades">
              <TabsList className="mb-8 flex-wrap">
                <TabsTrigger value="grades" className="gap-2 rounded-xl"><ClipboardList className="h-4 w-4" />Notas</TabsTrigger>
                <TabsTrigger value="subjects" className="gap-2 rounded-xl"><BookOpen className="h-4 w-4" />Disciplinas</TabsTrigger>
                <TabsTrigger value="schedule" className="gap-2 rounded-xl"><Calendar className="h-4 w-4" />Horários</TabsTrigger>
              </TabsList>

              {/* GRADES TAB */}
              <TabsContent value="grades">
                <h2 className="text-xl font-bold text-foreground mb-6">As Minhas Notas</h2>
                <Card className="rounded-2xl border-border/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Disciplina</TableHead>
                          <TableHead className="text-center">1ª Prova</TableHead>
                          <TableHead className="text-center">2ª Prova</TableHead>
                          <TableHead className="text-center">Exame</TableHead>
                          <TableHead className="text-center">Recurso</TableHead>
                          <TableHead className="text-center">Média</TableHead>
                          <TableHead className="text-center">Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {grades.map(g => {
                          const validGrades = [g.prova1, g.prova2, g.exame].filter(v => v !== null) as number[];
                          const avg = validGrades.length > 0 ? validGrades.reduce((a, b) => a + b, 0) / validGrades.length : null;
                          const passed = avg !== null && avg >= 10;

                          return (
                            <TableRow key={g.subject_code}>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-foreground">{g.subject_name}</p>
                                  <p className="text-xs text-muted-foreground">{g.subject_code}</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-center font-mono">{g.prova1 !== null ? g.prova1.toFixed(1) : "—"}</TableCell>
                              <TableCell className="text-center font-mono">{g.prova2 !== null ? g.prova2.toFixed(1) : "—"}</TableCell>
                              <TableCell className="text-center font-mono">{g.exame !== null ? g.exame.toFixed(1) : "—"}</TableCell>
                              <TableCell className="text-center font-mono">{g.recurso !== null ? g.recurso.toFixed(1) : "—"}</TableCell>
                              <TableCell className="text-center">
                                <Badge variant={passed ? "default" : avg !== null ? "destructive" : "secondary"} className="rounded-lg font-mono">
                                  {avg !== null ? avg.toFixed(1) : "—"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                {avg !== null && (
                                  <Badge variant={passed ? "default" : "destructive"} className="rounded-lg text-xs">
                                    {passed ? "Aprovado" : "Reprovado"}
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {grades.length === 0 && (
                          <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhuma nota disponível.</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </TabsContent>

              {/* SUBJECTS TAB */}
              <TabsContent value="subjects">
                <h2 className="text-xl font-bold text-foreground mb-6">As Minhas Disciplinas</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {subjects.map((s, i) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                    >
                      <Card className="rounded-2xl border-border/50 p-5 transition-all hover:border-accent/30 hover:shadow-md group">
                        <div className="flex items-start justify-between mb-3">
                          <Badge variant="outline" className="rounded-lg">{s.code}</Badge>
                          <Badge variant="secondary" className="rounded-lg text-xs">{s.year}º ano • {s.semester}º sem</Badge>
                        </div>
                        <h3 className="font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">{s.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-3.5 w-3.5" />
                          <span>Prof. {s.teacher_name}</span>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                  {subjects.length === 0 && (
                    <p className="col-span-full text-center text-muted-foreground py-8">Nenhuma disciplina disponível.</p>
                  )}
                </div>
              </TabsContent>

              {/* SCHEDULE TAB */}
              <TabsContent value="schedule">
                <h2 className="text-xl font-bold text-foreground mb-6">Horário Semanal</h2>

                {/* Today's classes highlight */}
                {todaySchedule.length > 0 && (
                  <Card className="rounded-2xl border-accent/20 bg-accent/5 p-4 mb-6">
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-accent" />
                      Aulas de Hoje
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {todaySchedule.map((s, i) => (
                        <Badge key={i} variant="secondary" className="rounded-lg text-xs py-1.5 px-3">
                          {s.start_time.slice(0, 5)} — {s.subject_name} ({s.room})
                        </Badge>
                      ))}
                    </div>
                  </Card>
                )}

                <Card className="rounded-2xl border-border/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Dia</TableHead>
                          <TableHead>Hora</TableHead>
                          <TableHead>Disciplina</TableHead>
                          <TableHead>Sala</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {schedules.map((sch, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{dayLabels[sch.day_of_week]}</TableCell>
                            <TableCell className="text-sm">{sch.start_time.slice(0, 5)} — {sch.end_time.slice(0, 5)}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{sch.subject_name}</p>
                                <p className="text-xs text-muted-foreground">{sch.subject_code}</p>
                              </div>
                            </TableCell>
                            <TableCell><Badge variant="outline" className="rounded-lg">{sch.room}</Badge></TableCell>
                          </TableRow>
                        ))}
                        {schedules.length === 0 && (
                          <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhum horário configurado.</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default StudentDashboard;