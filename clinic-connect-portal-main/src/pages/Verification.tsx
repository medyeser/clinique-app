import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, ArrowLeft, Mail, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

const Verification = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [downloadInfo, setDownloadInfo] = useState<any>(null);
  const [userData, setUserData] = useState<{ email?: string; prenom?: string } | null>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem("downloadFormData");
    if (storedData) {
      setUserData(JSON.parse(storedData));
    }
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      toast({
        title: "Code invalide",
        description: "Veuillez entrer un code à 6 chiffres",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch('http://localhost:8000/api/download-requests/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_code: fullCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Code invalide');
      }

      const data = await response.json();
      setDownloadInfo(data);
      setIsVerified(true);

      // Trigger download
      if (data.download_url) {
        window.location.href = data.download_url;
      }

      toast({
        title: "Vérification réussie!",
        description: "Votre téléchargement va commencer automatiquement.",
      });
    } catch (error) {
      toast({
        title: "Erreur de vérification",
        description: error instanceof Error ? error.message : "Code invalide ou expiré",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerified && downloadInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-background to-muted p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-10 pb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full gradient-medical flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">Vérification Réussie!</h2>
            <p className="text-muted-foreground mb-6">
              Votre téléchargement va commencer automatiquement.
            </p>

            <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Informations de connexion
              </h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><strong>Base de données:</strong> {downloadInfo.database_name}</p>
                <p><strong>Hôte:</strong> {downloadInfo.database_host}</p>
                <p><strong>Port:</strong> {downloadInfo.database_port}</p>
                <p><strong>Utilisateur:</strong> {downloadInfo.database_user}</p>
              </div>
            </div>

            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="border-primary/30 hover:bg-primary/5"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-background to-muted p-4">
      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />

      <Card className="w-full max-w-md relative z-10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />
          </div>
          <CardTitle className="text-2xl font-bold">
            <span className="gradient-text">Code de Vérification</span>
          </CardTitle>
          <CardDescription className="flex items-center justify-center gap-2 mt-2">
            <Mail className="w-4 h-4" />
            Code envoyé à {userData?.email || "votre email"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            Bonjour {userData?.prenom || ""}, entrez le code à 6 chiffres que nous avons envoyé à votre adresse email.
          </p>

          <div className="flex justify-center gap-2">
            {code.map((digit, index) => (
              <Input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold"
              />
            ))}
          </div>

          <Button
            onClick={handleVerify}
            className="w-full gradient-medical text-primary-foreground hover:opacity-90 transition-opacity"
            disabled={code.some((d) => !d) || isVerifying}
          >
            {isVerifying ? "Vérification..." : "Vérifier"}
          </Button>

          <div className="text-center">
            <button className="text-sm text-primary hover:underline">
              Renvoyer le code
            </button>
          </div>

          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="w-full text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Verification;
