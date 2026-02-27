import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X, ChevronDown, Sun, Moon, LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

const navMenus = [
  { label: "Cursos", items: ["Cursos Técnicos", "Calendário Académico", "Biblioteca"] },
  { label: "Admissões", items: ["Candidatar-se", "Propinas", "Visitar o Campus", "Requisitos"], link: "/admissions" },
  { label: "Instituição", items: [{ label: "Sobre o IPS", link: "/about" }, "Direcção", "Parcerias", "Contacto"] },
  { label: "Vida no Campus", items: ["Alojamento", "Clubes", "Serviços de Saúde", "Desporto"] },
];

const Header = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        supabase.from("user_roles").select("role").eq("user_id", session.user.id).then(({ data }) => {
          if (data && data.length > 0) {
            const roles = data.map((r) => r.role);
            if (roles.includes("admin")) setUserRole("admin");
            else if (roles.includes("teacher")) setUserRole("teacher");
            else setUserRole("user");
          } else {
            setUserRole("user");
          }
        });
      } else {
        setUserRole(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        supabase.from("user_roles").select("role").eq("user_id", session.user.id).then(({ data }) => {
          if (data && data.length > 0) {
            const roles = data.map((r) => r.role);
            if (roles.includes("admin")) setUserRole("admin");
            else if (roles.includes("teacher")) setUserRole("teacher");
            else setUserRole("user");
          } else {
            setUserRole("user");
          }
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserRole(null);
    navigate("/");
  };

  const renderMenuItem = (item: string | { label: string; link: string }) => {
    if (typeof item === "string") {
      return (
        <DropdownMenuItem key={item} className="rounded-lg cursor-pointer">
          {item}
        </DropdownMenuItem>
      );
    }
    return (
      <DropdownMenuItem key={item.label} className="rounded-lg cursor-pointer" asChild>
        <Link to={item.link}>{item.label}</Link>
      </DropdownMenuItem>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg">
            IPS
          </div>
          <span className="hidden font-bold text-foreground sm:inline-block">
            Instituto Politécnico do Sumbe
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navMenus.map((menu) => (
            <DropdownMenu key={menu.label}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 text-foreground/80 hover:text-foreground">
                  {menu.label}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-xl">
                {menu.items.map((item) => renderMenuItem(item))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {searchOpen && (
            <Input placeholder="Pesquisar..." className="hidden w-48 rounded-xl md:block" autoFocus />
          )}
          <Button variant="ghost" size="icon" onClick={() => setSearchOpen(!searchOpen)} className="hidden md:flex">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDark(!dark)} aria-label="Alternar tema">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs max-w-[120px] truncate">
                    {session.user.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
                  {userRole === "admin" ? "Administrador" : userRole === "teacher" ? "Professor" : "Utilizador"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {(userRole === "admin" || userRole === "teacher") && (
                  <DropdownMenuItem className="rounded-lg cursor-pointer" asChild>
                    <Link to="/admin">Painel Admin</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="rounded-lg cursor-pointer text-destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Terminar sessão
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Entrar</span>
              </Button>
            </Link>
          )}

          <Link to="/admissions">
            <Button variant="heroPrimary" size="sm" className="hidden sm:flex">
              Admissões
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-card p-4 lg:hidden">
          <div className="flex flex-col gap-2">
            {navMenus.map((menu) => (
              <div key={menu.label}>
                <p className="mb-1 text-sm font-semibold text-foreground">{menu.label}</p>
                {menu.items.map((item) => {
                  if (typeof item === "string") {
                    return (
                      <button key={item} className="block w-full rounded-lg px-3 py-1.5 text-left text-sm text-muted-foreground hover:bg-muted">
                        {item}
                      </button>
                    );
                  }
                  return (
                    <Link key={item.label} to={item.link} className="block w-full rounded-lg px-3 py-1.5 text-left text-sm text-muted-foreground hover:bg-muted" onClick={() => setMobileOpen(false)}>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
            <Input placeholder="Pesquisar..." className="mt-2 rounded-xl" />

            {session ? (
              <div className="mt-2 space-y-2">
                <p className="text-xs text-muted-foreground px-3">{session.user.email}</p>
                {(userRole === "admin" || userRole === "teacher") && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full rounded-xl">Painel Admin</Button>
                  </Link>
                )}
                <Button variant="destructive" className="w-full rounded-xl" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Terminar sessão
                </Button>
              </div>
            ) : (
              <Link to="/auth" onClick={() => setMobileOpen(false)}>
                <Button variant="hero" className="mt-2 w-full">
                  <LogIn className="mr-2 h-4 w-4" />
                  Entrar / Registar
                </Button>
              </Link>
            )}

            <Link to="/admissions" onClick={() => setMobileOpen(false)}>
              <Button variant="heroPrimary" className="mt-2 w-full">Admissões</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
