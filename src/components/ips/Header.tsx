import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navMenus = [
  { label: "Cursos", items: ["Cursos Técnicos", "Calendário Académico", "Biblioteca"] },
  { label: "Admissões", items: ["Candidatar-se", "Propinas", "Visitar o Campus", "Requisitos"] },
  { label: "Instituição", items: ["Sobre o IPS", "Direcção", "Parcerias", "Contacto"] },
  { label: "Vida no Campus", items: ["Alojamento", "Clubes", "Serviços de Saúde", "Desporto"] },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg">
            IPS
          </div>
          <span className="hidden font-bold text-foreground sm:inline-block">
            Instituto Politécnico do Sumbe
          </span>
        </div>

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
                {menu.items.map((item) => (
                  <DropdownMenuItem key={item} className="rounded-lg cursor-pointer">
                    {item}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {searchOpen && (
            <Input
              placeholder="Search..."
              className="hidden w-48 rounded-xl md:block"
              autoFocus
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(!searchOpen)}
            className="hidden md:flex"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Link to="/admissions">
            <Button variant="heroPrimary" size="sm" className="hidden sm:flex">
              Admissões
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
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
                {menu.items.map((item) => (
                  <button
                    key={item}
                    className="block w-full rounded-lg px-3 py-1.5 text-left text-sm text-muted-foreground hover:bg-muted"
                  >
                    {item}
                  </button>
                ))}
              </div>
            ))}
            <Input placeholder="Search..." className="mt-2 rounded-xl" />
            <Link to="/admissions">
              <Button variant="heroPrimary" className="mt-2 w-full">
                Admissões
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
