import { Button } from "@/components/ui/button";
import { Download, ArrowRight } from "lucide-react";
import logo from "@/assets/logo.png";

interface HeroProps {
  onDownloadClick: () => void;
}

const Hero = ({ onDownloadClick }: HeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/60 via-background to-background" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-primary/6 blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full bg-accent/6 blur-3xl" />

      <div className="container relative z-10 px-4 py-28">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left content */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/20 text-primary mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold tracking-wide uppercase">
                Solution médicale N°1
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.15] tracking-tight mb-6">
              Gérez votre clinique <br className="hidden lg:block" />
              avec{" "}
              <span className="gradient-text">Tech Clinic Manager</span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              La solution complète pour la gestion de votre clinique.
              Simplifiez vos rendez-vous, dossiers patients et facturation
              en un seul logiciel puissant et intuitif.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button
                size="lg"
                className="gradient-medical text-white hover:opacity-90 transition-opacity px-7 py-6 text-base font-semibold shadow-md"
                onClick={onDownloadClick}
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger gratuitement
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground hover:bg-muted/60 px-7 py-6 text-base font-medium"
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Voir les fonctionnalités
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-14 flex items-center gap-10 justify-center lg:justify-start">
              {[
                { value: "500+", label: "Cliniques" },
                { value: "50 000+", label: "Patients gérés" },
                { value: "99%", label: "Satisfaction" },
              ].map((stat, i, arr) => (
                <div key={stat.label} className="flex items-center gap-10">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {stat.label}
                    </p>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="w-px h-10 bg-border" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right content - Logo */}
          <div className="flex-1 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 gradient-medical rounded-full blur-3xl opacity-15 scale-110" />
              <img
                src={logo}
                alt="Tech Clinic Manager"
                className="relative w-56 h-56 md:w-72 md:h-72 lg:w-88 lg:h-88 object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
