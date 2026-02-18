import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground py-12">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
            <span className="font-bold text-lg">Tech Clinic Manager</span>
          </div>

          <div className="flex gap-8 text-sm text-primary-foreground/70">
            <a href="#" className="hover:text-primary-foreground transition-colors">
              Confidentialité
            </a>
            <a href="#" className="hover:text-primary-foreground transition-colors">
              Conditions
            </a>
            <a href="#" className="hover:text-primary-foreground transition-colors">
              Support
            </a>
          </div>

          <p className="text-sm text-primary-foreground/50">
            © 2024 Tech Clinic Manager. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
