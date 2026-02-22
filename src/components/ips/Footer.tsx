const footerLinks = [
  {
    title: "Academics",
    links: ["Programs", "Online Learning", "Academic Calendar", "Library", "Faculty Directory"],
  },
  {
    title: "Admissions",
    links: ["Apply Now", "Tuition & Aid", "Visit Campus", "Transfer Students", "International"],
  },
  {
    title: "Campus",
    links: ["Housing", "Dining", "Health Services", "Student Clubs", "Athletics"],
  },
  {
    title: "About",
    links: ["Our History", "Leadership", "Careers", "Contact Us", "News"],
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground font-bold text-lg">
                IPS
              </div>
            </div>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              Instituto Politécnico do Sumbe — Formação técnica, inovação e impacto no coração de Angola.
            </p>
          </div>

          {/* Link columns */}
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-sm font-semibold text-primary-foreground">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-primary-foreground/60 transition-colors hover:text-accent"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/10 pt-6 sm:flex-row">
          <p className="text-xs text-primary-foreground/50">
            © {new Date().getFullYear()} Instituto Politécnico do Sumbe. Todos os direitos reservados.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-xs text-primary-foreground/50 hover:text-accent">Política de Privacidade</a>
            <a href="#" className="text-xs text-primary-foreground/50 hover:text-accent">Termos de Uso</a>
            <a href="#" className="text-xs text-primary-foreground/50 hover:text-accent">Acessibilidade</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
