import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const courseLabels: Record<string, string> = {
  "energia-eletrica": "Energia e Inst. Eléctricas",
  "energias-renovaveis": "Energias Renováveis",
  "frio-climatizacao": "Frio e Climatização",
};

type Admission = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  course: string;
  secondary_course: string | null;
  first_cycle_grade: number | null;
  status: string;
  message: string | null;
  created_at: string;
};

type Course = {
  id: string;
  slug: string;
  name: string;
  duration_years: number;
  description: string | null;
  advantages: string[];
  is_active: boolean;
  sort_order: number;
};

type SiteContent = {
  id: string;
  section_key: string;
  title: string | null;
  content: string | null;
};

type CampusVisit = {
  id: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string;
  visit_date: string;
  num_visitors: number;
  notes: string | null;
  status: string;
  created_at: string;
};

type CampusPhoto = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  storage_path: string;
  created_at: string;
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

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      const userRoles = roles?.map((r) => r.role) || [];
      if (!userRoles.includes("admin") && !userRoles.includes("teacher")) {
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

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [admRes, courseRes, contentRes, visitRes, photoRes] = await Promise.all([
      supabase.from("admissions").select("*").order("last_name").order("first_name"),
      supabase.from("courses").select("*").order("sort_order"),
      supabase.from("site_content").select("*"),
      supabase.from("campus_visits").select("*").order("visit_date", { ascending: false }),
      supabase.from("campus_photos").select("*").order("created_at", { ascending: false }),
    ]);
    setAdmissions((admRes.data as Admission[]) || []);
    setCourses((courseRes.data as Course[]) || []);
    setContents((contentRes.data as SiteContent[]) || []);
    setVisits((visitRes.data as CampusVisit[]) || []);
    setPhotos((photoRes.data as CampusPhoto[]) || []);
    setLoading(false);
  }, []);

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

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;

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
            <TabsTrigger value="courses" className="gap-2 rounded-xl"><GraduationCap className="h-4 w-4" />Cursos</TabsTrigger>
            <TabsTrigger value="photos" className="gap-2 rounded-xl"><Image className="h-4 w-4" />Fotos</TabsTrigger>
            <TabsTrigger value="content" className="gap-2 rounded-xl"><FileText className="h-4 w-4" />Conteúdo</TabsTrigger>
            <TabsTrigger value="visits" className="gap-2 rounded-xl"><CalendarDays className="h-4 w-4" />Visitas</TabsTrigger>
          </TabsList>

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
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
