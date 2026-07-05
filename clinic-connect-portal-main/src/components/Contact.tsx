import { useState } from "react";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Contact = () => {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    sujet: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate sending
    await new Promise((res) => setTimeout(res, 1500));
    setIsLoading(false);
    setIsSent(true);
    setFormData({ nom: "", email: "", sujet: "", message: "" });
    setTimeout(() => setIsSent(false), 4000);
  };

  const contactInfos = [
    {
      icon: Mail,
      label: "Email",
      value: "rmedyesser6@gmail.com",
      href: "mailto:rmedyesser6@gmail.com",
    },
    {
      icon: Phone,
      label: "Téléphone",
      value: "+216 96 421 260",
      href: "tel:+21696421260",
    },
    {
      icon: MapPin,
      label: "Adresse",
      value: "Tunis, Tunisie",
      href: "#",
    },
  ];

  return (
    <section id="contact" className="py-24 bg-background">
      <div className="container px-4 mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold tracking-widest uppercase text-primary mb-3">
            Nous contacter
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Une question ?{" "}
            <span className="gradient-text">Écrivez-nous</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Notre équipe est disponible pour répondre à toutes vos questions
            concernant Tech Clinic Manager.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className="lg:col-span-2 flex flex-col gap-6 justify-center">
            {contactInfos.map((info, i) => (
              <a
                key={i}
                href={info.href}
                className="flex items-start gap-4 group p-5 rounded-xl border border-border/60 bg-card hover:border-primary/40 hover:shadow-md transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-lg gradient-medical flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <info.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                    {info.label}
                  </p>
                  <p className="text-foreground font-medium">{info.value}</p>
                </div>
              </a>
            ))}

            {/* Availability badge */}
            <div className="mt-2 p-5 rounded-xl bg-primary/5 border border-primary/15">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-semibold text-primary">Disponible</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Lun – Ven, 8h00 – 18h00
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border/60 rounded-2xl p-8 shadow-sm">
              {isSent ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    Message envoyé !
                  </h3>
                  <p className="text-muted-foreground max-w-xs">
                    Merci pour votre message. Nous vous répondrons dans les plus
                    brefs délais.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="contact-nom" className="text-sm font-medium">
                        Nom complet
                      </Label>
                      <Input
                        id="contact-nom"
                        placeholder="Votre nom"
                        value={formData.nom}
                        onChange={(e) => handleChange("nom", e.target.value)}
                        required
                        className="border-border/70 focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="contact-email" className="text-sm font-medium">
                        Adresse email
                      </Label>
                      <Input
                        id="contact-email"
                        type="email"
                        placeholder="votre@email.com"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        required
                        className="border-border/70 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="contact-sujet" className="text-sm font-medium">
                      Sujet
                    </Label>
                    <Input
                      id="contact-sujet"
                      placeholder="Comment pouvons-nous vous aider ?"
                      value={formData.sujet}
                      onChange={(e) => handleChange("sujet", e.target.value)}
                      required
                      className="border-border/70 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="contact-message" className="text-sm font-medium">
                      Message
                    </Label>
                    <Textarea
                      id="contact-message"
                      placeholder="Décrivez votre demande en détail..."
                      rows={5}
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      required
                      className="border-border/70 focus:border-primary resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full gradient-medical text-white hover:opacity-90 transition-opacity py-5 text-base font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Envoyer le message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
