import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LogOut, Loader2, BookOpen, Users, ClipboardList, Save, Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Subject = {
  id: string;
  name: string;
  code: string;
  course_id: string;
  year: number;
  semester: number;
  course_name?: string;
};

type StudentGrade = {
  student_id: string;
  student_name: string;
  student_email: string;
  prova1: number | null;
  prova2: number | null;
  exame: number | null;
  recurso: number | null;
};

type Schedule = {
  id: string;
  subject_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string;
};

const dayLabels: Record<number, string> = {
  1: "Segunda", 2: "Terça", 3: "Quarta", 4: "Quinta", 5: "Sexta", 6: "Sábado",
};

const gradeTypes = ["prova1", "prova2", "exame", "recurso"] as const;
const gradeLabels: Record<string, string> = {
  prova1: "1ª Prova", prova2: "2ª Prova", exame: "Exame", recurso: "Recurso",
};

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [students, setStudents] = useState<StudentGrade[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [saving, setSaving] = useState(false);
  const [pendingGrades, setPendingGrades] = useState<Record<string, Record<string, number | null>>>({});

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }

      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
      const userRoles = roles?.map(r => r.role) || [];
      if (!userRoles.includes("teacher") && !userRoles.includes("admin")) {
        navigate("/auth");
        return;
      }

      setUserId(session.user.id);
      setLoading(false);
    };
    check();
  }, [navigate]);

  const fetchSubjects = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("subjects")
      .select("*, courses(name)")
      .eq("teacher_id", userId);

    if (data) {
      setSubjects(data.map((s: any) => ({
        ...s,
        course_name: s.courses?.name || "",
      })));
      if (data.length > 0 && !selectedSubject) {
        setSelectedSubject(data[0].id);
      }
    }
  }, [userId, selectedSubject]);

  const fetchStudentsAndGrades = useCallback(async () => {
    if (!selectedSubject) return;

    const subject = subjects.find(s => s.id === selectedSubject);
    if (!subject) return;

    // Get enrolled students for this course
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("student_id")
      .eq("course_id", subject.course_id);

    if (!enrollments || enrollments.length === 0) {
      setStudents([]);
      return;
    }

    const studentIds = enrollments.map(e => e.student_id);

    // Get profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", studentIds);

    // Get grades for this subject
    const { data: grades } = await supabase
      .from("grades")
      .select("*")
      .eq("subject_id", selectedSubject)
      .in("student_id", studentIds);

    const studentMap: Record<string, StudentGrade> = {};
    (profiles || []).forEach((p: any) => {
      studentMap[p.user_id] = {
        student_id: p.user_id,
        student_name: p.display_name || "Sem nome",
        student_email: "",
        prova1: null, prova2: null, exame: null, recurso: null,
      };
    });

    (grades || []).forEach((g: any) => {
      if (studentMap[g.student_id] && gradeTypes.includes(g.grade_type)) {
        (studentMap[g.student_id] as any)[g.grade_type] = g.grade;
      }
    });

    setStudents(Object.values(studentMap).sort((a, b) => a.student_name.localeCompare(b.student_name)));
    setPendingGrades({});
  }, [selectedSubject, subjects]);

  const fetchSchedules = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("schedules")
      .select("*, subjects(name)")
      .in("subject_id", subjects.map(s => s.id));
    setSchedules(data || []);
  }, [userId, subjects]);

  useEffect(() => { fetchSubjects(); }, [fetchSubjects]);
  useEffect(() => { fetchStudentsAndGrades(); }, [fetchStudentsAndGrades]);
  useEffect(() => { if (subjects.length) fetchSchedules(); }, [subjects, fetchSchedules]);

  const handleGradeChange = (studentId: string, gradeType: string, value: string) => {
    const numVal = value === "" ? null : Math.min(20, Math.max(0, parseFloat(value)));
    setPendingGrades(prev => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), [gradeType]: numVal },
    }));
  };

  const saveGrades = async () => {
    setSaving(true);
    const upserts: any[] = [];

    for (const [studentId, types] of Object.entries(pendingGrades)) {
      for (const [gradeType, grade] of Object.entries(types)) {
        if (grade !== undefined) {
          upserts.push({
            student_id: studentId,
            subject_id: selectedSubject,
            grade_type: gradeType,
            grade,
            graded_by: userId,
            academic_year: "2025/2026",
          });
        }
      }
    }

    if (upserts.length > 0) {
      const { error } = await supabase.from("grades").upsert(upserts, {
        onConflict: "student_id,subject_id,grade_type,academic_year",
      });
      if (error) {
        toast({ title: "Erro ao guardar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Notas guardadas com sucesso!" });
        fetchStudentsAndGrades();
      }
    }
    setSaving(false);
  };

  const getDisplayGrade = (student: StudentGrade, type: string) => {
    const pending = pendingGrades[student.student_id]?.[type];
    if (pending !== undefined) return pending;
    return (student as any)[type];
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/auth"); };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-card/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">IPS</div>
            <div>
              <h1 className="text-sm font-bold text-foreground">Painel do Professor</h1>
              <p className="text-xs text-muted-foreground">{subjects.length} disciplina{subjects.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" />Sair</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="grades">
          <TabsList className="mb-8 flex-wrap">
            <TabsTrigger value="grades" className="gap-2 rounded-xl"><ClipboardList className="h-4 w-4" />Lançar Notas</TabsTrigger>
            <TabsTrigger value="subjects" className="gap-2 rounded-xl"><BookOpen className="h-4 w-4" />Disciplinas</TabsTrigger>
            <TabsTrigger value="schedule" className="gap-2 rounded-xl"><Calendar className="h-4 w-4" />Horários</TabsTrigger>
          </TabsList>

          {/* GRADES TAB */}
          <TabsContent value="grades">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-bold text-foreground">Lançamento de Notas</h2>
              <div className="flex gap-3 items-center">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-64 rounded-xl"><SelectValue placeholder="Seleccione disciplina" /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {subjects.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {subjects.length === 0 ? (
              <Card className="rounded-2xl border-border/50 p-8 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma disciplina atribuída. Contacte o administrador.</p>
              </Card>
            ) : students.length === 0 ? (
              <Card className="rounded-2xl border-border/50 p-8 text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum estudante matriculado nesta disciplina.</p>
              </Card>
            ) : (
              <>
                <Card className="rounded-2xl border-border/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Estudante</TableHead>
                          {gradeTypes.map(t => (
                            <TableHead key={t} className="text-center w-28">{gradeLabels[t]}</TableHead>
                          ))}
                          <TableHead className="text-center w-20">Média</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map(student => {
                          const p1 = getDisplayGrade(student, "prova1");
                          const p2 = getDisplayGrade(student, "prova2");
                          const ex = getDisplayGrade(student, "exame");
                          const validGrades = [p1, p2, ex].filter(g => g !== null && g !== undefined) as number[];
                          const avg = validGrades.length > 0 ? validGrades.reduce((a, b) => a + b, 0) / validGrades.length : null;

                          return (
                            <TableRow key={student.student_id}>
                              <TableCell className="font-medium">{student.student_name}</TableCell>
                              {gradeTypes.map(type => (
                                <TableCell key={type} className="text-center">
                                  <Input
                                    type="number"
                                    min={0}
                                    max={20}
                                    step={0.5}
                                    className="w-20 mx-auto rounded-lg text-center h-8 text-sm"
                                    value={getDisplayGrade(student, type) ?? ""}
                                    onChange={e => handleGradeChange(student.student_id, type, e.target.value)}
                                    placeholder="—"
                                  />
                                </TableCell>
                              ))}
                              <TableCell className="text-center">
                                <Badge variant={avg !== null && avg >= 10 ? "default" : avg !== null ? "destructive" : "secondary"} className="rounded-lg">
                                  {avg !== null ? avg.toFixed(1) : "—"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
                <div className="mt-4 flex justify-end">
                  <Button onClick={saveGrades} disabled={saving || Object.keys(pendingGrades).length === 0} className="rounded-xl">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Guardar Notas
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          {/* SUBJECTS TAB */}
          <TabsContent value="subjects">
            <h2 className="text-xl font-bold text-foreground mb-6">As Minhas Disciplinas</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map(s => (
                <Card key={s.id} className="rounded-2xl border-border/50 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="outline" className="rounded-lg">{s.code}</Badge>
                    <Badge variant="secondary" className="rounded-lg text-xs">{s.year}º ano • {s.semester}º sem</Badge>
                  </div>
                  <h3 className="font-semibold text-foreground">{s.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{s.course_name}</p>
                </Card>
              ))}
              {subjects.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground py-8">Nenhuma disciplina atribuída.</p>
              )}
            </div>
          </TabsContent>

          {/* SCHEDULE TAB */}
          <TabsContent value="schedule">
            <h2 className="text-xl font-bold text-foreground mb-6">Horário Semanal</h2>
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
                    {schedules
                      .sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time))
                      .map(sch => {
                        const subj = subjects.find(s => s.id === sch.subject_id);
                        return (
                          <TableRow key={sch.id}>
                            <TableCell className="font-medium">{dayLabels[sch.day_of_week]}</TableCell>
                            <TableCell className="text-sm">{sch.start_time.slice(0, 5)} — {sch.end_time.slice(0, 5)}</TableCell>
                            <TableCell>{subj?.name || "—"}</TableCell>
                            <TableCell><Badge variant="outline" className="rounded-lg">{sch.room}</Badge></TableCell>
                          </TableRow>
                        );
                      })}
                    {schedules.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhum horário configurado.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TeacherDashboard;
