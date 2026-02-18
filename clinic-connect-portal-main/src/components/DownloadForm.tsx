import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Send } from "lucide-react";

const formSchema = z.object({
  nom: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(50),
  prenom: z.string().trim().min(2, "Le prénom doit contenir au moins 2 caractères").max(50),
  email: z.string().trim().email("Adresse email invalide").max(100),
  clinique: z.string().min(1, "Veuillez sélectionner une clinique"),
});

type FormData = z.infer<typeof formSchema>;

interface DownloadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const cliniques = [
  { id: "monji-slim", name: "Clinique Monji Slim" },
  { id: "tawfik", name: "Clinique Tawfik" },
];

const DownloadForm = ({ open, onOpenChange }: DownloadFormProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [formData, setFormData] = useState<FormData>({
    nom: "",
    prenom: "",
    email: "",
    clinique: "",
  });

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = formSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Make real API call to backend
      const response = await fetch('http://localhost:8000/api/download-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          clinique_id: formData.clinique,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de la soumission');
      }

      const data = await response.json();

      // Store form data and request ID in sessionStorage for verification page
      sessionStorage.setItem("downloadFormData", JSON.stringify({
        ...formData,
        requestId: data.id
      }));

      setIsLoading(false);
      onOpenChange(false);
      navigate("/verification");
    } catch (error) {
      setIsLoading(false);
      setErrors({
        email: error instanceof Error ? error.message : 'Erreur de connexion au serveur'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold gradient-text">
            Télécharger le Logiciel
          </DialogTitle>
          <DialogDescription>
            Remplissez ce formulaire pour recevoir votre code de vérification.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom</Label>
              <Input
                id="nom"
                placeholder="Votre nom"
                value={formData.nom}
                onChange={(e) => handleChange("nom", e.target.value)}
                className={errors.nom ? "border-destructive" : ""}
              />
              {errors.nom && (
                <p className="text-sm text-destructive">{errors.nom}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom</Label>
              <Input
                id="prenom"
                placeholder="Votre prénom"
                value={formData.prenom}
                onChange={(e) => handleChange("prenom", e.target.value)}
                className={errors.prenom ? "border-destructive" : ""}
              />
              {errors.prenom && (
                <p className="text-sm text-destructive">{errors.prenom}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinique">Clinique</Label>
            <Select
              value={formData.clinique}
              onValueChange={(value) => handleChange("clinique", value)}
            >
              <SelectTrigger className={errors.clinique ? "border-destructive" : ""}>
                <SelectValue placeholder="Sélectionnez votre clinique" />
              </SelectTrigger>
              <SelectContent>
                {cliniques.map((clinique) => (
                  <SelectItem key={clinique.id} value={clinique.id}>
                    {clinique.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.clinique && (
              <p className="text-sm text-destructive">{errors.clinique}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full gradient-medical text-primary-foreground hover:opacity-90 transition-opacity"
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
                Envoyer
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadForm;
