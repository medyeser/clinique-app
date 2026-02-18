import { Calendar, Users, FileText, CreditCard, Clock, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Calendar,
    title: "Gestion des Rendez-vous",
    description: "Planifiez et gérez facilement tous vos rendez-vous avec un calendrier intelligent.",
  },
  {
    icon: Users,
    title: "Dossiers Patients",
    description: "Accédez instantanément aux dossiers médicaux complets de vos patients.",
  },
  {
    icon: FileText,
    title: "Ordonnances Numériques",
    description: "Créez et imprimez des ordonnances professionnelles en quelques clics.",
  },
  {
    icon: CreditCard,
    title: "Facturation Simplifiée",
    description: "Gérez vos factures et paiements avec un système de facturation intégré.",
  },
  {
    icon: Clock,
    title: "Historique Complet",
    description: "Consultez l'historique des consultations et traitements à tout moment.",
  },
  {
    icon: Shield,
    title: "Sécurité Maximale",
    description: "Vos données sont protégées avec un cryptage de niveau bancaire.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Fonctionnalités <span className="gradient-text">Puissantes</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tout ce dont vous avez besoin pour gérer efficacement votre clinique, 
            dans une interface simple et intuitive.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="bg-card border-border/50 card-hover group"
            >
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-xl gradient-medical flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
