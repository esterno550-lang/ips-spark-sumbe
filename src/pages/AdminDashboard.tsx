import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { LogOut, Users, Search, Trash2, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [profile, setProfile] = useState<{ display_name: string | null } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin");

      if (!roles || roles.length === 0) {
        await supabase.auth.signOut();
        navigate("/admin/login");
        return;
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", session.user.id)
        .single();

      setProfile(prof);
      fetchAdmissions();
    };

    checkAuth();
  }, [navigate]);

  const fetchAdmissions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admissions")
      .select("*")
      .order("last_name", { ascending: true })
      .order("first_name", { ascending: true });

    if (error) {
      toast({ title: "Erro", description: "Não foi possível carregar candidaturas.", variant: "destructive" });
    } else {
      setAdmissions((data as Admission[]) || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("admissions").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro", description: "Não foi possível eliminar.", variant: "destructive" });
    } else {
      setAdmissions((prev) => prev.filter((a) => a.id !== id));
      toast({ title: "Eliminada", description: "Candidatura removida com sucesso." });
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("admissions").update({ status: newStatus }).eq("id", id);
    if (error) {
      toast({ title: "Erro", description: "Não foi possível actualizar o estado.", variant: "destructive" });
    } else {
      setAdmissions((prev) => prev.map((a) => a.id === id ? { ...a, status: newStatus } : a));
      toast({ title: "Actualizado", description: `Estado alterado para "${newStatus}".` });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const filtered = admissions.filter((a) => {
    const matchSearch = `${a.first_name} ${a.last_name} ${a.email} ${a.course}`.toLowerCase().includes(search.toLowerCase());
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

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-card/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
              IPS
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground">Painel Admin</h1>
              {profile?.display_name && (
                <p className="text-xs text-muted-foreground">{profile.display_name}</p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <Card className="flex items-center gap-4 rounded-2xl border-border/50 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{admissions.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4 rounded-2xl border-border/50 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10">
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{admissions.filter((a) => a.status === "pendente").length}</p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4 rounded-2xl border-border/50 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{admissions.filter((a) => a.status === "aceite").length}</p>
              <p className="text-xs text-muted-foreground">Aceites</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4 rounded-2xl border-border/50 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{admissions.filter((a) => a.status === "rejeitado").length}</p>
              <p className="text-xs text-muted-foreground">Rejeitados</p>
            </div>
          </Card>
        </div>

        {/* Search & Filter */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar candidaturas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full rounded-xl sm:w-48">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Todos os estados</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="aceite">Aceite</SelectItem>
              <SelectItem value="rejeitado">Rejeitado</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="rounded-lg whitespace-nowrap">
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </Badge>
        </div>

        {/* Table */}
        <Card className="rounded-2xl border-border/50 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>1ª Opção</TableHead>
                    <TableHead>2ª Opção</TableHead>
                    <TableHead>Nota 1º Ciclo</TableHead>
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
                      <TableCell className="text-xs">{a.phone}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-lg text-xs">{courseLabels[a.course] || a.course}</Badge>
                      </TableCell>
                      <TableCell>
                        {a.secondary_course ? (
                          <Badge variant="outline" className="rounded-lg text-xs">{courseLabels[a.secondary_course] || a.secondary_course}</Badge>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {a.first_cycle_grade !== null ? a.first_cycle_grade : "—"}
                      </TableCell>
                      <TableCell>
                        <Select value={a.status} onValueChange={(v) => handleStatusChange(a.id, v)}>
                          <SelectTrigger className="h-8 w-32 rounded-lg text-xs">
                            <div className="flex items-center gap-1.5">
                              {statusIcon(a.status)}
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="pendente">Pendente</SelectItem>
                            <SelectItem value="aceite">Aceite</SelectItem>
                            <SelectItem value="rejeitado">Rejeitado</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(a.created_at).toLocaleDateString("pt-AO")}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        Nenhuma candidatura encontrada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
