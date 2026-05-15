import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Session } from "@supabase/supabase-js";

type NavMenu = {
  label: string;
  items: (string | { label: string; link: string })[];
  link?: string;
};

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  navMenus: NavMenu[];
  session: Session | null;
  userRole: string | null;
  onLogout: () => void;
}

const menuVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: "auto", opacity: 1, transition: { duration: 0.3, ease: "easeOut" as const } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.2, ease: "easeIn" as const } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.04, duration: 0.25 },
  }),
};

const MobileMenu = ({ open, onClose, navMenus, session, userRole, onLogout }: MobileMenuProps) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="border-t border-border bg-card overflow-hidden lg:hidden"
          variants={menuVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="p-4 flex flex-col gap-3">
            {navMenus.map((menu, mi) => (
              <motion.div key={menu.label} variants={itemVariants} initial="hidden" animate="visible" custom={mi}>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-accent">{menu.label}</p>
                <div className="ml-1 space-y-0.5">
                  {menu.items.map((item, ii) => {
                    if (typeof item === "string") {
                      return (
                        <motion.button
                          key={item}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          custom={mi * 4 + ii + navMenus.length}
                          className="block w-full rounded-xl px-3 py-2 text-left text-sm text-foreground/80 hover:bg-accent/10 hover:text-accent transition-colors"
                        >
                          {item}
                        </motion.button>
                      );
                    }
                    return (
                      <motion.div key={item.label} variants={itemVariants} initial="hidden" animate="visible" custom={mi * 4 + ii + navMenus.length}>
                        <Link
                          to={item.link}
                          className="block w-full rounded-xl px-3 py-2 text-left text-sm text-foreground/80 hover:bg-accent/10 hover:text-accent transition-colors"
                          onClick={onClose}
                        >
                          {item.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}

            <motion.div variants={itemVariants} initial="hidden" animate="visible" custom={navMenus.length * 5}>
              <Input aria-label="Pesquisar no site" placeholder="Pesquisar..." className="mt-2 rounded-xl" />
            </motion.div>

            {session ? (
              <motion.div className="mt-2 space-y-2" variants={itemVariants} initial="hidden" animate="visible" custom={navMenus.length * 5 + 1}>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50">
                  <User className="h-4 w-4 text-accent" />
                  <span className="text-xs text-muted-foreground truncate">{session.user.email}</span>
                </div>
                {userRole === "admin" && (
                  <Link to="/admin" onClick={onClose}>
                    <Button variant="outline" className="w-full rounded-xl">Painel Admin</Button>
                  </Link>
                )}
                {userRole === "teacher" && (
                  <Link to="/teacher" onClick={onClose}>
                    <Button variant="outline" className="w-full rounded-xl">Painel Professor</Button>
                  </Link>
                )}
                {userRole === "user" && (
                  <Link to="/student" onClick={onClose}>
                    <Button variant="outline" className="w-full rounded-xl">Meu Painel</Button>
                  </Link>
                )}
                <Button variant="destructive" className="w-full rounded-xl" onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Terminar sessão
                </Button>
              </motion.div>
            ) : (
              <motion.div variants={itemVariants} initial="hidden" animate="visible" custom={navMenus.length * 5 + 2}>
                <Link to="/auth" onClick={onClose}>
                  <Button variant="hero" className="mt-2 w-full rounded-xl">
                    <LogIn className="mr-2 h-4 w-4" />
                    Entrar / Registar
                  </Button>
                </Link>
              </motion.div>
            )}

            <motion.div variants={itemVariants} initial="hidden" animate="visible" custom={navMenus.length * 5 + 3}>
              <Link to="/admissions" onClick={onClose}>
                <Button variant="heroPrimary" className="mt-1 w-full rounded-xl">Admissões</Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
