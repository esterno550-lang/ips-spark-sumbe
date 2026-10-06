import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LogOut, Users, Search, Trash2, Loader2, CheckCircle, XCircle, Clock,
  GraduationCap, Image, FileText, CalendarDays, Upload, Plus, Save, Edit2, X,
  BookOpen, UserPlus, ClipboardList, Shield, Megaphone, Calendar, Database, RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const courseLabels: Record<string, string> = {
  "energia-eletrica": "Energia e Inst. Eléctricas",
  "energias-renovaveis": "Energias Renováveis",
  "frio-climatizacao": "Frio e Climatização",
};

type Admission = {
  id: string; first_name: string; last_name: string; email: string; phone: string;
  course: string; secondary_course: string | null; first_cycle_grade: number | null;
  status: string; message: string | null; created_at: string;
};

type Course = {
  id: string; slug: string; name: string; duration_years: number;
  description: string | null; advantages: string[]; is_active: boolean; sort_order: number;
};

type SiteContent = { id: string; section_key: string; title: string | null; content: string | null; };
type CampusVisit = { id: string; visitor_name: string; visitor_email: string; visitor_phone: string; visit_date: string; num_visitors: number; notes: string | null; status: string; created_at: string; };
type CampusPhoto = { id: string; title: string; description: string | null; category: string; storage_path: string; created_at: string; };

type Subject = {
  id: string; name: string; code: string; course_id: string; teacher_id: string;
  year: number; semester: number; teacher_name?: string; course_name?: string;
};

type Enrollment = {
  id: string; student_id: string; course_id: string; academic_year: string;
  year_level: number; student_name?: string; course_name?: string;
};

type ScheduleItem = { id: string; subject_id: string; day_of_week: number; start_time: string; end_time: string; room: string; };

type Announcement = {
  id: string; title: string; content: string | null; category: string;
  start_date: string | null; end_date: string | null; is_active: boolean;
  sort_order: number;
};

type CalendarEventItem = {
  id: string; title: string; description: string | null; event_date: string;
  end_date: string | null; event_type: string; is_public: boolean;
};

type ManagedUser = {
  user_id: string; display_name: string | null; role: string;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ display_name: string | null } | null>(null);
  
  // Admissions
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Courses
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Content
  const [contents, setContents] = useState<SiteContent[]>([]);
  const [editingContent, setEditingContent] = useState<SiteContent | null>(null);

  // Visits
  const [visits, setVisits] = useState<CampusVisit[]>([]);

  // Photos
  const [photos, setPhotos] = useState<CampusPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [photoForm, setPhotoForm] = useState({ title: "", description: "", category: "geral" });

  // Subjects
  const [subjectsList, setSubjectsList] = useState<Subject[]>([]);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [teacherProfiles, setTeacherProfiles] = useState<{ user_id: string; display_name: string }[]>([]);

  // Enrollments
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [newEnrollment, setNewEnrollment] = useState({ student_email: "", course_id: "", year_level: 1, academic_year: "2025/2026" });
  const [enrollDialog, setEnrollDialog] = useState(false);

  // Schedules
  const [schedulesList, setSchedulesList] = useState<ScheduleItem[]>([]);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);

  // Announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  // Calendar Events
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>([]);
  const [editingCalendarEvent, setEditingCalendarEvent] = useState<CalendarEventItem | null>(null);

  // User Management
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
  const [newUserDialog, setNewUserDialog] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ email: "", password: "", displayName: "", role: "teacher" });
  const [creatingUser, setCreatingUser] = useState(false);
  const [tableCounts, setTableCounts] = useState<{ table_name: string; row_count: number }[]>([]);
  const [countsLoading, setCountsLoading] = useState(false);
  const [countsUpdatedAt, setCountsUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      const userRoles = roles?.map((r) => r.role) || [];
      if (!userRoles.includes("admin")) {
        await supabase.auth.signOut();
        navigate("/auth");
        return;
      }

      const { data: prof } = await supabase.from("profiles").select("display_name").eq("user_id", session.user.id).single();
      setProfile(prof);
      fetchAll();
    };
    checkAuth();
  }, [navigate]);

  const fetchTableCounts = useCallback(async () => {
    setCountsLoading(true);
    const { data, error } = await supabase.rpc("admin_table_counts");
    if (!error && data) {
      setTableCounts(data as { table_name: string; row_count: number }[]);
      setCountsUpdatedAt(new Date());
    }
    setCountsLoading(false);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    fetchTableCounts();
    const [admRes, courseRes, contentRes, visitRes, photoRes, subRes, enrRes, schRes, annRes, calRes] = await Promise.all([
      supabase.from("admissions").select("*").order("last_name").order("first_name"),
      supabase.from("courses").select("*").order("sort_order"),
      supabase.from("site_content").select("*"),
      supabase.from("campus_visits").select("*").order("visit_date", { ascending: false }),
      supabase.from("campus_photos").select("*").order("created_at", { ascending: false }),
      supabase.from("subjects").select("*, courses(name)"),
      supabase.from("enrollments").select("*, courses(name)"),
      supabase.from("schedules").select("*"),
      supabase.from("announcements").select("*").order("sort_order"),
      supabase.from("calendar_events").select("*").order("event_date"),
    ]);
    setAdmissions((admRes.data as Admission[]) || []);
    setCourses((courseRes.data as Course[]) || []);
    setContents((contentRes.data as SiteContent[]) || []);
    setVisits((visitRes.data as CampusVisit[]) || []);
    setPhotos((photoRes.data as CampusPhoto[]) || []);
    setAnnouncements((annRes.data as Announcement[]) || []);
    setCalendarEvents((calRes.data as CalendarEventItem[]) || []);

    // Subjects with teacher names
    const subs = (subRes.data || []) as any[];
    const teacherIds = [...new Set(subs.map(s => s.teacher_id))];
    if (teacherIds.length > 0) {
      const { data: tProf } = await supabase.from("profiles").select("user_id, display_name").in("user_id", teacherIds);
      setTeacherProfiles((tProf || []) as any);
      const tMap: Record<string, string> = {};
      (tProf || []).forEach((p: any) => { tMap[p.user_id] = p.display_name || "—"; });
      setSubjectsList(subs.map(s => ({ ...s, teacher_name: tMap[s.teacher_id] || "—", course_name: s.courses?.name || "" })));
    } else {
      setSubjectsList(subs.map(s => ({ ...s, course_name: s.courses?.name || "" })));
    }

    // Enrollments with student names
    const enrs = (enrRes.data || []) as any[];
    const studentIds = [...new Set(enrs.map(e => e.student_id))];
    if (studentIds.length > 0) {
      const { data: sProf } = await supabase.from("profiles").select("user_id, display_name").in("user_id", studentIds);
      const sMap: Record<string, string> = {};
      (sProf || []).forEach((p: any) => { sMap[p.user_id] = p.display_name || "—"; });
      setEnrollments(enrs.map(e => ({ ...e, student_name: sMap[e.student_id] || "—", course_name: e.courses?.name || "" })));
    } else {
      setEnrollments([]);
    }

    setSchedulesList((schRes.data || []) as ScheduleItem[]);

    // Fetch managed users (all non-user roles)
    const { data: allRoles } = await supabase.from("user_roles").select("user_id, role");
    if (allRoles && allRoles.length > 0) {
      const staffRoles = allRoles.filter(r => r.role !== "user");
      const staffIds = [...new Set(staffRoles.map(r => r.user_id))];
      if (staffIds.length > 0) {
        const { data: staffProfiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", staffIds);
        const profileMap: Record<string, string> = {};
        (staffProfiles || []).forEach((p: any) => { profileMap[p.user_id] = p.display_name || "Sem nome"; });
        setManagedUsers(staffRoles.map(r => ({
          user_id: r.user_id,
          display_name: profileMap[r.user_id] || "Sem nome",
          role: r.role,
        })));
      }
    }

    setLoading(false);
  }, [fetchTableCounts]);

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/auth"); };

  // ---- Admissions ----
  const handleDelete = async (id: string) => {
    await supabase.from("admissions").delete().eq("id", id);
    setAdmissions((prev) => prev.filter((a) => a.id !== id));
    toast({ title: "Eliminada" });
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await supabase.from("admissions").update({ status: newStatus }).eq("id", id);
    setAdmissions((prev) => prev.map((a) => a.id === id ? { ...a, status: newStatus } : a));
    toast({ title: "Estado actualizado" });
  };

  const filtered = admissions.filter((a) => {
    const matchSearch = `${a.first_name} ${a.last_name} ${a.email}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusIcon = (status: string) => {
    switch (status) {
      case "aceite": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejeitado": return <XCircle className="h-4 w-4 text-destructive" />;
      case "confirmado": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "cancelado": return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  // ---- Courses ----
  const saveCourse = async () => {
    if (!editingCourse) return;
    const { id, ...rest } = editingCourse;
    if (id) {
      await supabase.from("courses").update(rest).eq("id", id);
    } else {
      await supabase.from("courses").insert(rest);
    }
    setEditingCourse(null);
    fetchAll();
    toast({ title: "Curso guardado" });
  };

  // ---- Content ----
  const saveContent = async () => {
    if (!editingContent) return;
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from("site_content").update({
      title: editingContent.title,
      content: editingContent.content,
      updated_by: session?.user.id,
    }).eq("id", editingContent.id);
    setEditingContent(null);
    fetchAll();
    toast({ title: "Conteúdo guardado" });
  };

  // ---- Visit status ----
  const handleVisitStatus = async (id: string, status: string) => {
    await supabase.from("campus_visits").update({ status }).eq("id", id);
    setVisits((prev) => prev.map((v) => v.id === id ? { ...v, status } : v));
    toast({ title: "Estado da visita actualizado" });
  };

  // ---- Photos ----
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !photoForm.title) {
      toast({ title: "Preencha o título", variant: "destructive" });
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("campus-photos").upload(path, file);
    if (uploadErr) {
      toast({ title: "Erro no upload", description: uploadErr.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from("campus_photos").insert({
      title: photoForm.title,
      description: photoForm.description || null,
      category: photoForm.category,
      storage_path: path,
      uploaded_by: session?.user.id,
    });
    setPhotoForm({ title: "", description: "", category: "geral" });
    setUploading(false);
    fetchAll();
    toast({ title: "Foto adicionada" });
  };

  const deletePhoto = async (photo: CampusPhoto) => {
    await supabase.storage.from("campus-photos").remove([photo.storage_path]);
    await supabase.from("campus_photos").delete().eq("id", photo.id);
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    toast({ title: "Foto eliminada" });
  };

  // ---- Subjects ----
  const saveSubject = async () => {
    if (!editingSubject) return;
    const { id, teacher_name, course_name, ...rest } = editingSubject;
    if (id) {
      await supabase.from("subjects").update(rest).eq("id", id);
    } else {
      await supabase.from("subjects").insert(rest);
    }
    setEditingSubject(null);
    fetchAll();
    toast({ title: "Disciplina guardada" });
  };

  const deleteSubject = async (id: string) => {
    await supabase.from("subjects").delete().eq("id", id);
    fetchAll();
    toast({ title: "Disciplina eliminada" });
  };

  // ---- Enrollments ----
  const enrollStudentById = async (studentId: string, courseId: string, yearLevel: number, academicYear: string) => {
    const { error } = await supabase.from("enrollments").insert({
      student_id: studentId,
      course_id: courseId,
      year_level: yearLevel,
      academic_year: academicYear,
    });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Estudante matriculado!" });
      fetchAll();
    }
  };

  const deleteEnrollment = async (id: string) => {
    await supabase.from("enrollments").delete().eq("id", id);
    fetchAll();
    toast({ title: "Matrícula removida" });
  };

  // ---- Schedules ----
  const saveSchedule = async () => {
    if (!editingSchedule) return;
    const { id, ...rest } = editingSchedule;
    if (id) {
      await supabase.from("schedules").update(rest).eq("id", id);
    } else {
      await supabase.from("schedules").insert(rest);
    }
    setEditingSchedule(null);
    fetchAll();
    toast({ title: "Horário guardado" });
  };

  const deleteSchedule = async (id: string) => {
    await supabase.from("schedules").delete().eq("id", id);
    fetchAll();
    toast({ title: "Horário eliminado" });
  };

  // ---- Announcements ----
  const saveAnnouncement = async () => {
    if (!editingAnnouncement) return;
    const { data: { session } } = await supabase.auth.getSession();
    const { id, ...rest } = editingAnnouncement;
    const payload = { ...rest, created_by: session?.user.id };
    if (id) {
      await supabase.from("announcements").update(payload).eq("id", id);
    } else {
      await supabase.from("announcements").insert(payload);
    }
    setEditingAnnouncement(null);
    fetchAll();
    toast({ title: "Anúncio guardado" });
  };

  const deleteAnnouncement = async (id: string) => {
    await supabase.from("announcements").delete().eq("id", id);
    fetchAll();
    toast({ title: "Anúncio eliminado" });
  };

  // ---- Calendar Events ----
  const saveCalendarEvent = async () => {
    if (!editingCalendarEvent) return;
    const { data: { session } } = await supabase.auth.getSession();
    const { id, ...rest } = editingCalendarEvent;
    const payload = { ...rest, created_by: session?.user.id };
    if (id) {
      await supabase.from("calendar_events").update(payload).eq("id", id);
    } else {
      await supabase.from("calendar_events").insert(payload);
    }
    setEditingCalendarEvent(null);
    fetchAll();
    toast({ title: "Evento guardado" });
  };

  const deleteCalendarEvent = async (id: string) => {
    await supabase.from("calendar_events").delete().eq("id", id);
    fetchAll();
    toast({ title: "Evento eliminado" });
  };

  // ---- User Management ----
  const createStaffUser = async () => {
    if (!newUserForm.email || !newUserForm.password || !newUserForm.displayName) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    if (newUserForm.password.length < 6) {
      toast({ title: "A palavra-passe deve ter pelo menos 6 caracteres", variant: "destructive" });
      return;
    }
    setCreatingUser(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Sessão expirada", variant: "destructive" });
        navigate("/auth");
        return;
      }

      const response = await supabase.functions.invoke("create-staff-user", {
        body: {
          email: newUserForm.email,
          password: newUserForm.password,
          displayName: newUserForm.displayName,
          role: newUserForm.role,
        },
      });

      if (response.error || response.data?.error) {
        toast({ title: "Erro ao criar conta", description: response.data?.error || response.error?.message, variant: "destructive" });
      } else {
        toast({ title: "Conta criada com sucesso!", description: `${newUserForm.displayName} (${newUserForm.role})` });
        setNewUserForm({ email: "", password: "", displayName: "", role: "teacher" });
        setNewUserDialog(false);
        fetchAll();
      }
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }

    setCreatingUser(false);
  };

  const removeUserRole = async (userId: string, role: string) => {
    await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role as any);
    fetchAll();
    toast({ title: "Papel removido" });
  };

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    teacher: "Professor",
    director: "Director",
    subdirector: "Sub-Director",
    coordinator: "Coordenador",
    user: "Estudante",
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-card/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">IPS</div>
            <div>
              <h1 className="text-sm font-bold text-foreground">Painel Admin</h1>
              {profile?.display_name && <p className="text-xs text-muted-foreground">{profile.display_name}</p>}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" />Sair</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="admissions">
          <TabsList className="mb-8 flex-wrap">
            <TabsTrigger value="admissions" className="gap-2 rounded-xl"><Users className="h-4 w-4" />Candidaturas</TabsTrigger>
            <TabsTrigger value="users" className="gap-2 rounded-xl"><Shield className="h-4 w-4" />Utilizadores</TabsTrigger>
            <TabsTrigger value="announcements" className="gap-2 rounded-xl"><Megaphone className="h-4 w-4" />Anúncios</TabsTrigger>
            <TabsTrigger value="courses" className="gap-2 rounded-xl"><GraduationCap className="h-4 w-4" />Cursos</TabsTrigger>
            <TabsTrigger value="subjects" className="gap-2 rounded-xl"><BookOpen className="h-4 w-4" />Disciplinas</TabsTrigger>
            <TabsTrigger value="enrollments" className="gap-2 rounded-xl"><UserPlus className="h-4 w-4" />Matrículas</TabsTrigger>
            <TabsTrigger value="schedules" className="gap-2 rounded-xl"><ClipboardList className="h-4 w-4" />Horários</TabsTrigger>
            <TabsTrigger value="photos" className="gap-2 rounded-xl"><Image className="h-4 w-4" />Fotos</TabsTrigger>
            <TabsTrigger value="content" className="gap-2 rounded-xl"><FileText className="h-4 w-4" />Conteúdo</TabsTrigger>
            <TabsTrigger value="visits" className="gap-2 rounded-xl"><CalendarDays className="h-4 w-4" />Visitas</TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2 rounded-xl"><Calendar className="h-4 w-4" />Calendário</TabsTrigger>
            <TabsTrigger value="dbhealth" className="gap-2 rounded-xl"><Database className="h-4 w-4" />Saúde BD</TabsTrigger>
          </TabsList>

          {/* DB HEALTH TAB */}
          <TabsContent value="dbhealth">
            <Card className="rounded-2xl p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                    <Database className="h-5 w-5 text-accent" />
                    Saúde da Base de Dados
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Resumo de registos por tabela. Nenhum dado pessoal é exposto nesta vista.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {countsUpdatedAt && (
                    <span className="text-xs text-muted-foreground">
                      Atualizado às {countsUpdatedAt.toLocaleTimeString("pt-AO")}
                    </span>
                  )}
                  <Button variant="outline" size="sm" onClick={fetchTableCounts} disabled={countsLoading} className="rounded-xl">
                    {countsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    Atualizar
                  </Button>
                </div>
              </div>

              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-accent/10 p-4">
                  <p className="text-xs text-muted-foreground">Total de registos</p>
                  <p className="text-2xl font-bold text-foreground">
                    {tableCounts.reduce((sum, t) => sum + Number(t.row_count), 0).toLocaleString("pt-AO")}
                  </p>
                </div>
                <div className="rounded-xl bg-accent/10 p-4">
                  <p className="text-xs text-muted-foreground">Tabelas monitorizadas</p>
                  <p className="text-2xl font-bold text-foreground">{tableCounts.length}</p>
                </div>
                <div className="rounded-xl bg-green-500/10 p-4">
                  <p className="text-xs text-muted-foreground">Estado</p>
                  <p className="flex items-center gap-2 text-2xl font-bold text-green-500">
                    <CheckCircle className="h-5 w-5" /> Operacional
                  </p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tabela</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Registos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableCounts.map((t) => (
                    <TableRow key={t.table_name}>
                      <TableCell className="font-mono text-xs">{t.table_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {({
                          admissions: "Candidaturas de admissão",
                          announcements: "Anúncios institucionais",
                          calendar_events: "Eventos do calendário académico",
                          campus_photos: "Fotos do campus",
                          campus_visits: "Visitas ao campus",
                          courses: "Cursos técnicos",
                          enrollments: "Matrículas de estudantes",
                          grades: "Notas lançadas",
                          profiles: "Perfis de utilizadores",
                          schedules: "Horários de aulas",
                          site_content: "Conteúdo editável do site",
                          subjects: "Disciplinas",
                          user_roles: "Papéis de acesso",
                        } as Record<string, string>)[t.table_name] || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="rounded-lg">{Number(t.row_count).toLocaleString("pt-AO")}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {tableCounts.length === 0 && !countsLoading && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                        Sem dados disponíveis.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* ADMISSIONS TAB */}
          <TabsContent value="admissions">
            <div className="mb-8 grid gap-4 sm:grid-cols-4">
              {[
                { label: "Total", count: admissions.length, icon: Users, color: "bg-accent/10", iconColor: "text-accent" },
                { label: "Pendentes", count: admissions.filter((a) => a.status === "pendente").length, icon: Clock, color: "bg-yellow-500/10", iconColor: "text-yellow-500" },
                { label: "Aceites", count: admissions.filter((a) => a.status === "aceite").length, icon: CheckCircle, color: "bg-green-500/10", iconColor: "text-green-500" },
                { label: "Rejeitados", count: admissions.filter((a) => a.status === "rejeitado").length, icon: XCircle, color: "bg-destructive/10", iconColor: "text-destructive" },
              ].map((s) => (
                <Card key={s.label} className="flex items-center gap-4 rounded-2xl border-border/50 p-5">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.color}`}>
                    <s.icon className={`h-6 w-6 ${s.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{s.count}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Pesquisar candidaturas..." value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-xl pl-10" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full rounded-xl sm:w-48"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="aceite">Aceite</SelectItem>
                  <SelectItem value="rejeitado">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="secondary" className="rounded-lg whitespace-nowrap">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</Badge>
            </div>

            <Card className="rounded-2xl border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>1ª Opção</TableHead>
                      <TableHead>Nota</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{a.last_name}, {a.first_name}</TableCell>
                        <TableCell className="text-xs">{a.email}</TableCell>
                        <TableCell><Badge variant="outline" className="rounded-lg text-xs">{courseLabels[a.course] || a.course}</Badge></TableCell>
                        <TableCell className="text-center font-semibold">{a.first_cycle_grade ?? "—"}</TableCell>
                        <TableCell>
                          <Select value={a.status} onValueChange={(v) => handleStatusChange(a.id, v)}>
                            <SelectTrigger className="h-8 w-32 rounded-lg text-xs">
                              <div className="flex items-center gap-1.5">{statusIcon(a.status)}<SelectValue /></div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="pendente">Pendente</SelectItem>
                              <SelectItem value="aceite">Aceite</SelectItem>
                              <SelectItem value="rejeitado">Rejeitado</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString("pt-AO")}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtered.length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhuma candidatura encontrada.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* USERS TAB */}
          <TabsContent value="users">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Gestão de Utilizadores</h2>
              <Dialog open={newUserDialog} onOpenChange={setNewUserDialog}>
                <DialogTrigger asChild>
                  <Button className="rounded-xl"><Plus className="mr-2 h-4 w-4" />Criar Conta</Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>Criar Conta de Pessoal</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Nome Completo *</Label>
                      <Input className="rounded-xl" placeholder="Nome do colaborador" value={newUserForm.displayName} onChange={e => setNewUserForm({ ...newUserForm, displayName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input className="rounded-xl" type="email" placeholder="email@exemplo.com" value={newUserForm.email} onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Palavra-passe *</Label>
                      <Input className="rounded-xl" type="password" placeholder="Mínimo 6 caracteres" value={newUserForm.password} onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Papel / Cargo</Label>
                      <Select value={newUserForm.role} onValueChange={v => setNewUserForm({ ...newUserForm, role: v })}>
                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="director">Director</SelectItem>
                          <SelectItem value="subdirector">Sub-Director</SelectItem>
                          <SelectItem value="coordinator">Coordenador</SelectItem>
                          <SelectItem value="teacher">Professor</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full rounded-xl" onClick={createStaffUser} disabled={creatingUser}>
                      {creatingUser ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                      Criar Conta
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="rounded-2xl border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Papel</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {managedUsers.map((u, i) => (
                      <TableRow key={`${u.user_id}-${u.role}-${i}`}>
                        <TableCell className="font-medium">{u.display_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-lg capitalize">{roleLabels[u.role] || u.role}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">{u.user_id.substring(0, 8)}...</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => removeUserRole(u.user_id, u.role)} className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {managedUsers.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhum utilizador com papel especial.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* ANNOUNCEMENTS TAB */}
          <TabsContent value="announcements">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Anúncios e Datas Institucionais</h2>
              <Button onClick={() => setEditingAnnouncement({ id: "", title: "", content: "", category: "geral", start_date: "", end_date: "", is_active: true, sort_order: announcements.length + 1 })} className="rounded-xl">
                <Plus className="mr-2 h-4 w-4" />Novo Anúncio
              </Button>
            </div>

            {editingAnnouncement && (
              <Card className="rounded-2xl border-border/50 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">{editingAnnouncement.id ? "Editar" : "Novo"} Anúncio</h3>
                  <Button variant="ghost" size="icon" onClick={() => setEditingAnnouncement(null)}><X className="h-4 w-4" /></Button>
                </div>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Título *</Label>
                      <Input className="rounded-xl" value={editingAnnouncement.title} onChange={e => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select value={editingAnnouncement.category} onValueChange={v => setEditingAnnouncement({ ...editingAnnouncement, category: v })}>
                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="geral">Geral</SelectItem>
                          <SelectItem value="candidaturas">Candidaturas</SelectItem>
                          <SelectItem value="documentos">Entrega de Documentos</SelectItem>
                          <SelectItem value="provas">Provas de Admissão</SelectItem>
                          <SelectItem value="resultados">Resultados</SelectItem>
                          <SelectItem value="matriculas">Matrículas / Início de Aulas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Conteúdo / Descrição</Label>
                    <Textarea className="rounded-xl" rows={3} value={editingAnnouncement.content || ""} onChange={e => setEditingAnnouncement({ ...editingAnnouncement, content: e.target.value })} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Data Início</Label>
                      <Input type="date" className="rounded-xl" value={editingAnnouncement.start_date || ""} onChange={e => setEditingAnnouncement({ ...editingAnnouncement, start_date: e.target.value || null })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Data Fim</Label>
                      <Input type="date" className="rounded-xl" value={editingAnnouncement.end_date || ""} onChange={e => setEditingAnnouncement({ ...editingAnnouncement, end_date: e.target.value || null })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Ordem</Label>
                      <Input type="number" className="rounded-xl" value={editingAnnouncement.sort_order} onChange={e => setEditingAnnouncement({ ...editingAnnouncement, sort_order: parseInt(e.target.value) || 0 })} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={editingAnnouncement.is_active} onChange={e => setEditingAnnouncement({ ...editingAnnouncement, is_active: e.target.checked })} />
                      Activo (visível ao público)
                    </label>
                  </div>
                  <Button onClick={saveAnnouncement} className="rounded-xl"><Save className="mr-2 h-4 w-4" />Guardar</Button>
                </div>
              </Card>
            )}

            {announcements.length === 0 ? (
              <Card className="rounded-2xl border-border/50 p-12 text-center">
                <Megaphone className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum anúncio criado</h3>
                <p className="text-sm text-muted-foreground mb-4">Adicione datas de candidatura, provas, resultados, início de aulas, etc.</p>
                <Button onClick={() => setEditingAnnouncement({ id: "", title: "", content: "", category: "geral", start_date: "", end_date: "", is_active: true, sort_order: 1 })} className="rounded-xl">
                  <Plus className="mr-2 h-4 w-4" />Criar Primeiro Anúncio
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {announcements.map(ann => (
                  <Card key={ann.id} className="rounded-2xl border-border/50 p-5 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="rounded-lg text-xs capitalize">{ann.category}</Badge>
                        {!ann.is_active && <Badge variant="destructive" className="rounded-lg text-xs">Inactivo</Badge>}
                      </div>
                      <h3 className="font-semibold text-foreground">{ann.title}</h3>
                      {ann.content && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ann.content}</p>}
                      {(ann.start_date || ann.end_date) && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {ann.start_date && new Date(ann.start_date).toLocaleDateString("pt-AO")}
                          {ann.end_date && ` — ${new Date(ann.end_date).toLocaleDateString("pt-AO")}`}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditingAnnouncement(ann)}><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteAnnouncement(ann.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* COURSES TAB */}
          <TabsContent value="courses">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Gestão de Cursos</h2>
              <Button onClick={() => setEditingCourse({ id: "", slug: "", name: "", duration_years: 4, description: "", advantages: [], is_active: true, sort_order: courses.length + 1 })} className="rounded-xl">
                <Plus className="mr-2 h-4 w-4" />Novo Curso
              </Button>
            </div>

            {editingCourse && (
              <Card className="rounded-2xl border-border/50 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">{editingCourse.id ? "Editar" : "Novo"} Curso</h3>
                  <Button variant="ghost" size="icon" onClick={() => setEditingCourse(null)}><X className="h-4 w-4" /></Button>
                </div>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input className="rounded-xl" value={editingCourse.name} onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Slug</Label>
                      <Input className="rounded-xl" value={editingCourse.slug} onChange={(e) => setEditingCourse({ ...editingCourse, slug: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Duração (anos)</Label>
                      <Input type="number" className="rounded-xl" value={editingCourse.duration_years} onChange={(e) => setEditingCourse({ ...editingCourse, duration_years: parseInt(e.target.value) || 4 })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Ordem</Label>
                      <Input type="number" className="rounded-xl" value={editingCourse.sort_order} onChange={(e) => setEditingCourse({ ...editingCourse, sort_order: parseInt(e.target.value) || 0 })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea className="rounded-xl" value={editingCourse.description || ""} onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Vantagens (uma por linha)</Label>
                    <Textarea className="rounded-xl" rows={4} value={(editingCourse.advantages || []).join("\n")} onChange={(e) => setEditingCourse({ ...editingCourse, advantages: e.target.value.split("\n").filter(Boolean) })} />
                  </div>
                  <Button onClick={saveCourse} className="rounded-xl"><Save className="mr-2 h-4 w-4" />Guardar</Button>
                </div>
              </Card>
            )}

            <div className="grid gap-4">
              {courses.map((c) => (
                <Card key={c.id} className="rounded-2xl border-border/50 p-5 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{c.name}</h3>
                      {!c.is_active && <Badge variant="destructive" className="rounded-lg text-xs">Inactivo</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{c.duration_years} anos • {c.advantages?.length || 0} vantagens</p>
                    <p className="text-xs text-muted-foreground mt-1">{c.description?.substring(0, 100)}...</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setEditingCourse(c)}><Edit2 className="h-4 w-4" /></Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* SUBJECTS TAB */}
          <TabsContent value="subjects">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Gestão de Disciplinas</h2>
              <Button onClick={() => setEditingSubject({ id: "", name: "", code: "", course_id: courses[0]?.id || "", teacher_id: "", year: 1, semester: 1 })} className="rounded-xl">
                <Plus className="mr-2 h-4 w-4" />Nova Disciplina
              </Button>
            </div>

            {editingSubject && (
              <Card className="rounded-2xl border-border/50 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">{editingSubject.id ? "Editar" : "Nova"} Disciplina</h3>
                  <Button variant="ghost" size="icon" onClick={() => setEditingSubject(null)}><X className="h-4 w-4" /></Button>
                </div>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input className="rounded-xl" value={editingSubject.name} onChange={e => setEditingSubject({ ...editingSubject, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Código</Label>
                      <Input className="rounded-xl" placeholder="EX: MAT101" value={editingSubject.code} onChange={e => setEditingSubject({ ...editingSubject, code: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Curso</Label>
                      <Select value={editingSubject.course_id} onValueChange={v => setEditingSubject({ ...editingSubject, course_id: v })}>
                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Ano</Label>
                      <Select value={String(editingSubject.year)} onValueChange={v => setEditingSubject({ ...editingSubject, year: parseInt(v) })}>
                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {[1,2,3,4].map(y => <SelectItem key={y} value={String(y)}>{y}º ano</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Semestre</Label>
                      <Select value={String(editingSubject.semester)} onValueChange={v => setEditingSubject({ ...editingSubject, semester: parseInt(v) })}>
                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="1">1º semestre</SelectItem>
                          <SelectItem value="2">2º semestre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Professor</Label>
                    {managedUsers.filter(u => ["teacher", "director", "subdirector", "coordinator"].includes(u.role)).length > 0 ? (
                      <Select value={editingSubject.teacher_id} onValueChange={v => setEditingSubject({ ...editingSubject, teacher_id: v })}>
                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="Seleccione o professor" /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {[...new Map(managedUsers.filter(u => ["teacher", "director", "subdirector", "coordinator"].includes(u.role)).map(u => [u.user_id, u])).values()].map(u => (
                            <SelectItem key={u.user_id} value={u.user_id}>{u.display_name} ({roleLabels[u.role]})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input className="rounded-xl" placeholder="UUID do professor" value={editingSubject.teacher_id} onChange={e => setEditingSubject({ ...editingSubject, teacher_id: e.target.value })} />
                    )}
                  </div>
                  <Button onClick={saveSubject} className="rounded-xl"><Save className="mr-2 h-4 w-4" />Guardar</Button>
                </div>
              </Card>
            )}

            <div className="grid gap-4">
              {subjectsList.map(s => (
                <Card key={s.id} className="rounded-2xl border-border/50 p-5 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="rounded-lg text-xs">{s.code}</Badge>
                      <h3 className="font-semibold text-foreground">{s.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{s.course_name} • {s.year}º ano • {s.semester}º sem</p>
                    <p className="text-xs text-muted-foreground mt-1">Prof. {s.teacher_name || "—"}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setEditingSubject(s)}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteSubject(s.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </Card>
              ))}
              {subjectsList.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma disciplina criada.</p>}
            </div>
          </TabsContent>

          {/* ENROLLMENTS TAB */}
          <TabsContent value="enrollments">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Matrículas de Estudantes</h2>
              <Dialog open={enrollDialog} onOpenChange={setEnrollDialog}>
                <DialogTrigger asChild>
                  <Button className="rounded-xl"><Plus className="mr-2 h-4 w-4" />Nova Matrícula</Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>Matricular Estudante</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>ID do Estudante (UUID)</Label>
                      <Input className="rounded-xl" placeholder="UUID do estudante" value={newEnrollment.student_email} onChange={e => setNewEnrollment({ ...newEnrollment, student_email: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Curso</Label>
                      <Select value={newEnrollment.course_id} onValueChange={v => setNewEnrollment({ ...newEnrollment, course_id: v })}>
                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="Seleccione" /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-4 grid-cols-2">
                      <div className="space-y-2">
                        <Label>Ano</Label>
                        <Select value={String(newEnrollment.year_level)} onValueChange={v => setNewEnrollment({ ...newEnrollment, year_level: parseInt(v) })}>
                          <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {[1,2,3,4].map(y => <SelectItem key={y} value={String(y)}>{y}º ano</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Ano Lectivo</Label>
                        <Input className="rounded-xl" value={newEnrollment.academic_year} onChange={e => setNewEnrollment({ ...newEnrollment, academic_year: e.target.value })} />
                      </div>
                    </div>
                    <Button className="w-full rounded-xl" onClick={async () => {
                      if (!newEnrollment.student_email || !newEnrollment.course_id) {
                        toast({ title: "Preencha todos os campos", variant: "destructive" });
                        return;
                      }
                      await enrollStudentById(newEnrollment.student_email, newEnrollment.course_id, newEnrollment.year_level, newEnrollment.academic_year);
                      setEnrollDialog(false);
                      setNewEnrollment({ student_email: "", course_id: "", year_level: 1, academic_year: "2025/2026" });
                    }}>
                      <Save className="mr-2 h-4 w-4" />Matricular
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="rounded-2xl border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estudante</TableHead>
                      <TableHead>Curso</TableHead>
                      <TableHead>Ano</TableHead>
                      <TableHead>Ano Lectivo</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map(e => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">{e.student_name || e.student_id}</TableCell>
                        <TableCell>{e.course_name}</TableCell>
                        <TableCell>{e.year_level}º ano</TableCell>
                        <TableCell>{e.academic_year}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => deleteEnrollment(e.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {enrollments.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhuma matrícula registada.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* SCHEDULES TAB */}
          <TabsContent value="schedules">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Gestão de Horários</h2>
              <Button onClick={() => setEditingSchedule({ id: "", subject_id: subjectsList[0]?.id || "", day_of_week: 1, start_time: "08:00", end_time: "10:00", room: "Sala A1" })} className="rounded-xl">
                <Plus className="mr-2 h-4 w-4" />Novo Horário
              </Button>
            </div>

            {editingSchedule && (
              <Card className="rounded-2xl border-border/50 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">{editingSchedule.id ? "Editar" : "Novo"} Horário</h3>
                  <Button variant="ghost" size="icon" onClick={() => setEditingSchedule(null)}><X className="h-4 w-4" /></Button>
                </div>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Disciplina</Label>
                      <Select value={editingSchedule.subject_id} onValueChange={v => setEditingSchedule({ ...editingSchedule, subject_id: v })}>
                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {subjectsList.map(s => <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Dia da Semana</Label>
                      <Select value={String(editingSchedule.day_of_week)} onValueChange={v => setEditingSchedule({ ...editingSchedule, day_of_week: parseInt(v) })}>
                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {[{v:1,l:"Segunda"},{v:2,l:"Terça"},{v:3,l:"Quarta"},{v:4,l:"Quinta"},{v:5,l:"Sexta"},{v:6,l:"Sábado"}].map(d => (
                            <SelectItem key={d.v} value={String(d.v)}>{d.l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Hora Início</Label>
                      <Input type="time" className="rounded-xl" value={editingSchedule.start_time} onChange={e => setEditingSchedule({ ...editingSchedule, start_time: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Hora Fim</Label>
                      <Input type="time" className="rounded-xl" value={editingSchedule.end_time} onChange={e => setEditingSchedule({ ...editingSchedule, end_time: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Sala</Label>
                      <Input className="rounded-xl" value={editingSchedule.room} onChange={e => setEditingSchedule({ ...editingSchedule, room: e.target.value })} />
                    </div>
                  </div>
                  <Button onClick={saveSchedule} className="rounded-xl"><Save className="mr-2 h-4 w-4" />Guardar</Button>
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
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedulesList
                      .sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time))
                      .map(sch => {
                        const subj = subjectsList.find(s => s.id === sch.subject_id);
                        return (
                          <TableRow key={sch.id}>
                            <TableCell className="font-medium">{({1:"Segunda",2:"Terça",3:"Quarta",4:"Quinta",5:"Sexta",6:"Sábado"} as any)[sch.day_of_week]}</TableCell>
                            <TableCell className="text-sm">{sch.start_time.slice(0,5)} — {sch.end_time.slice(0,5)}</TableCell>
                            <TableCell>{subj ? `${subj.code} — ${subj.name}` : "—"}</TableCell>
                            <TableCell><Badge variant="outline" className="rounded-lg">{sch.room}</Badge></TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => setEditingSchedule(sch)}><Edit2 className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => deleteSchedule(sch.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    {schedulesList.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum horário configurado.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* PHOTOS TAB */}
          <TabsContent value="photos">
            <h2 className="text-xl font-bold text-foreground mb-6">Galeria de Fotos do Campus</h2>
            <Card className="rounded-2xl border-border/50 p-6 mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Adicionar Nova Foto</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Título *</Label>
                  <Input className="rounded-xl" value={photoForm.title} onChange={(e) => setPhotoForm({ ...photoForm, title: e.target.value })} placeholder="Nome da foto" />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={photoForm.category} onValueChange={(v) => setPhotoForm({ ...photoForm, category: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="geral">Geral</SelectItem>
                      <SelectItem value="campus">Campus</SelectItem>
                      <SelectItem value="laboratórios">Laboratórios</SelectItem>
                      <SelectItem value="eventos">Eventos</SelectItem>
                      <SelectItem value="desporto">Desporto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ficheiro</Label>
                  <Input type="file" accept="image/*" className="rounded-xl" onChange={handlePhotoUpload} disabled={uploading || !photoForm.title} />
                </div>
              </div>
              {uploading && <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />A carregar...</div>}
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((p) => (
                <Card key={p.id} className="rounded-2xl border-border/50 overflow-hidden">
                  <img
                    src={`https://${projectId}.supabase.co/storage/v1/object/public/campus-photos/${p.storage_path}`}
                    alt={p.title}
                    className="h-40 w-full object-cover"
                    loading="lazy"
                  />
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.title}</p>
                      <Badge variant="secondary" className="rounded-lg text-xs mt-1">{p.category}</Badge>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deletePhoto(p)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </Card>
              ))}
              {photos.length === 0 && <p className="col-span-full text-center text-muted-foreground py-8">Nenhuma foto carregada.</p>}
            </div>
          </TabsContent>

          {/* CONTENT TAB */}
          <TabsContent value="content">
            <h2 className="text-xl font-bold text-foreground mb-6">Editar Conteúdo do Site</h2>
            {editingContent ? (
              <Card className="rounded-2xl border-border/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Editar: {editingContent.section_key}</h3>
                  <Button variant="ghost" size="icon" onClick={() => setEditingContent(null)}><X className="h-4 w-4" /></Button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input className="rounded-xl" value={editingContent.title || ""} onChange={(e) => setEditingContent({ ...editingContent, title: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Conteúdo</Label>
                    <Textarea className="rounded-xl" rows={8} value={editingContent.content || ""} onChange={(e) => setEditingContent({ ...editingContent, content: e.target.value })} />
                  </div>
                  <Button onClick={saveContent} className="rounded-xl"><Save className="mr-2 h-4 w-4" />Guardar</Button>
                </div>
              </Card>
            ) : (
              <div className="grid gap-4">
                {contents.map((c) => (
                  <Card key={c.id} className="rounded-2xl border-border/50 p-5 flex items-start justify-between">
                    <div>
                      <Badge variant="outline" className="rounded-lg text-xs mb-2">{c.section_key}</Badge>
                      <h3 className="font-semibold text-foreground">{c.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{c.content}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setEditingContent(c)}><Edit2 className="h-4 w-4" /></Button>
                  </Card>
                ))}
                {contents.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum conteúdo configurado.</p>}
              </div>
            )}
          </TabsContent>

          {/* VISITS TAB */}
          <TabsContent value="visits">
            <h2 className="text-xl font-bold text-foreground mb-6">Histórico de Visitas</h2>
            <Card className="rounded-2xl border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Visitante</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Nº</TableHead>
                      <TableHead>Notas</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visits.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell className="font-medium">{v.visitor_name}</TableCell>
                        <TableCell className="text-xs">{v.visitor_email}</TableCell>
                        <TableCell className="text-xs">{v.visitor_phone}</TableCell>
                        <TableCell className="text-xs">{new Date(v.visit_date).toLocaleDateString("pt-AO")}</TableCell>
                        <TableCell className="text-center">{v.num_visitors}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{v.notes || "—"}</TableCell>
                        <TableCell>
                          <Select value={v.status} onValueChange={(s) => handleVisitStatus(v.id, s)}>
                            <SelectTrigger className="h-8 w-32 rounded-lg text-xs">
                              <div className="flex items-center gap-1.5">{statusIcon(v.status)}<SelectValue /></div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="pendente">Pendente</SelectItem>
                              <SelectItem value="confirmado">Confirmado</SelectItem>
                              <SelectItem value="cancelado">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                    {visits.length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhuma visita registada.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* CALENDAR EVENTS TAB */}
          <TabsContent value="calendar">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Calendário Académico</h2>
              <Button onClick={() => setEditingCalendarEvent({ id: "", title: "", description: "", event_date: "", end_date: null, event_type: "evento", is_public: true })} className="rounded-xl">
                <Plus className="mr-2 h-4 w-4" />Novo Evento
              </Button>
            </div>

            {editingCalendarEvent && (
              <Card className="rounded-2xl border-border/50 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">{editingCalendarEvent.id ? "Editar" : "Novo"} Evento</h3>
                  <Button variant="ghost" size="icon" onClick={() => setEditingCalendarEvent(null)}><X className="h-4 w-4" /></Button>
                </div>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Título *</Label>
                      <Input className="rounded-xl" value={editingCalendarEvent.title} onChange={e => setEditingCalendarEvent({ ...editingCalendarEvent, title: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select value={editingCalendarEvent.event_type} onValueChange={v => setEditingCalendarEvent({ ...editingCalendarEvent, event_type: v })}>
                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="evento">Evento</SelectItem>
                          <SelectItem value="exame">Exame</SelectItem>
                          <SelectItem value="feriado">Feriado</SelectItem>
                          <SelectItem value="academico">Académico</SelectItem>
                          <SelectItem value="reuniao">Reunião</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea className="rounded-xl" rows={3} value={editingCalendarEvent.description || ""} onChange={e => setEditingCalendarEvent({ ...editingCalendarEvent, description: e.target.value })} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Data Início *</Label>
                      <Input type="date" className="rounded-xl" value={editingCalendarEvent.event_date} onChange={e => setEditingCalendarEvent({ ...editingCalendarEvent, event_date: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Data Fim (opcional)</Label>
                      <Input type="date" className="rounded-xl" value={editingCalendarEvent.end_date || ""} onChange={e => setEditingCalendarEvent({ ...editingCalendarEvent, end_date: e.target.value || null })} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={editingCalendarEvent.is_public} onChange={e => setEditingCalendarEvent({ ...editingCalendarEvent, is_public: e.target.checked })} />
                      Público (visível no calendário)
                    </label>
                  </div>
                  <Button onClick={saveCalendarEvent} className="rounded-xl"><Save className="mr-2 h-4 w-4" />Guardar</Button>
                </div>
              </Card>
            )}

            {calendarEvents.length === 0 ? (
              <Card className="rounded-2xl border-border/50 p-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum evento no calendário</h3>
                <p className="text-sm text-muted-foreground mb-4">Adicione exames, feriados, eventos académicos e reuniões.</p>
                <Button onClick={() => setEditingCalendarEvent({ id: "", title: "", description: "", event_date: "", end_date: null, event_type: "evento", is_public: true })} className="rounded-xl">
                  <Plus className="mr-2 h-4 w-4" />Criar Primeiro Evento
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {calendarEvents.map(ev => {
                  const typeLabels: Record<string, string> = { evento: "Evento", exame: "Exame", feriado: "Feriado", academico: "Académico", reuniao: "Reunião" };
                  return (
                    <Card key={ev.id} className="rounded-2xl border-border/50 p-5 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="rounded-lg text-xs capitalize">{typeLabels[ev.event_type] || ev.event_type}</Badge>
                          {!ev.is_public && <Badge variant="destructive" className="rounded-lg text-xs">Privado</Badge>}
                        </div>
                        <h3 className="font-semibold text-foreground">{ev.title}</h3>
                        {ev.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ev.description}</p>}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(ev.event_date).toLocaleDateString("pt-AO")}
                          {ev.end_date && ` — ${new Date(ev.end_date).toLocaleDateString("pt-AO")}`}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setEditingCalendarEvent(ev)}><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteCalendarEvent(ev.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
