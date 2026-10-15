import React, { useState } from "react";
import { 
  Calendar, 
  FileText, 
  DollarSign, 
  Cloud, 
  UserCheck, 
  Stethoscope, 
  Headphones, 
  Building2, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  X,
  KeyRound,
  FileSpreadsheet
} from "lucide-react";

const getBackendUrls = () => {
  if (typeof window !== "undefined") {
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (isLocal) {
      return ["http://localhost:8000", "https://clinique-app-p2o2.onrender.com"];
    }
  }
  return ["https://clinique-app-p2o2.onrender.com", "http://localhost:8000"];
};

const Index = () => {
  // Modal state for download request form
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  // Download code state
  const [accessCode, setAccessCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [downloadSuccessData, setDownloadSuccessData] = useState<{
    clinique_name: string;
    download_url: string;
    access_code: string;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    clinique: "tawfik",
    email: "",
    phone: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [generatedRequestId, setGeneratedRequestId] = useState<number | null>(null);

  // Handle Verify & Download with access code
  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError("");
    setDownloadSuccessData(null);

    const cleanCode = accessCode.trim().toUpperCase();
    if (!cleanCode) {
      // If code is empty, open the request form modal
      setIsFormModalOpen(true);
      return;
    }

    setIsVerifying(true);

    let lastError = "Impossible de joindre le serveur. Vérifiez votre connexion.";
    let success = false;
    const urls = getBackendUrls();

    try {
      for (const baseUrl of urls) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);

          const response = await fetch(`${baseUrl}/api/download-requests/verify-code`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_code: cleanCode }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            setDownloadSuccessData({
              clinique_name: data.clinique_name || "Votre Clinique",
              download_url: data.download_url,
              access_code: cleanCode
            });

            // Trigger download
            let targetUrl = data.download_url;
            if (targetUrl.startsWith("http://localhost:8000") && window.location.hostname !== "localhost") {
              targetUrl = `https://clinique-app-p2o2.onrender.com${targetUrl.replace("http://localhost:8000", "")}`;
            }

            const link = document.createElement("a");
            link.href = targetUrl;
            link.setAttribute("download", "clinique_software.zip");
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            success = true;
            break;
          } else {
            const errData = await response.json().catch(() => ({}));
            lastError = errData.detail || "Code d'accès invalide ou demande non approuvée.";
            break;
          }
        } catch (err: any) {
          lastError = err.name === "AbortError" ? "Délai de connexion dépassé (timeout)." : (err.message || lastError);
        }
      }

      if (!success) {
        setVerifyError(lastError);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle Request submission (from modal or page form)
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess(false);

    const trimmedName = formData.fullName.trim();
    const trimmedEmail = formData.email.trim();

    if (!trimmedName || !trimmedEmail) {
      setSubmitError("Veuillez renseigner votre nom complet et votre adresse email.");
      return;
    }

    const nameParts = trimmedName.split(/\s+/);
    let nom = nameParts.length > 1 ? nameParts.slice(1).join(" ") : nameParts[0];
    let prenom = nameParts.length > 1 ? nameParts[0] : "Dr";

    // Ensure min length 2 for Pydantic schema validation
    if (nom.length < 2) nom = nom + "_";
    if (prenom.length < 2) prenom = prenom + "_";

    setIsSubmitting(true);
    let success = false;
    let lastError = "Erreur lors de l'envoi de la demande. Veuillez réessayer.";
    const urls = getBackendUrls();

    try {
      for (const baseUrl of urls) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);

          const response = await fetch(`${baseUrl}/api/download-requests/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nom: nom,
              prenom: prenom,
              email: trimmedEmail,
              clinique_id: formData.clinique
            }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const resData = await response.json();
            setGeneratedRequestId(resData.id || 1);
            setSubmitSuccess(true);
            setIsFormModalOpen(false);
            success = true;
            break;
          } else {
            const errData = await response.json().catch(() => ({}));
            lastError = errData.detail || lastError;
            break;
          }
        } catch (err: any) {
          lastError = err.name === "AbortError" ? "Délai de connexion dépassé (timeout)." : (err.message || lastError);
        }
      }

      if (!success) {
        setSubmitError(lastError);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ background: "#061B1E", color: "#E8F4F2", fontFamily: "'Instrument Sans', sans-serif", fontSize: "17px", minHeight: "100vh" }}>
      
      {/* Top Hero Radial Gradient */}
      <div style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, #0F4A4C 0%, #061B1E 70%)" }}>
        
        {/* Navigation Bar */}
        <header style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px", padding: "24px 48px", maxWidth: "1264px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "20px", color: "#fff" }}>
            <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden="true">
              <rect width="32" height="32" rx="9" fill="#2DD4BF" />
              <path d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6z" fill="#061B1E" />
            </svg>
            Tech Clinic Manager
          </div>
          <nav style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "28px", fontWeight: 500 }}>
            <a href="#roles" style={{ textDecoration: "none", color: "#E8F4F2", transition: "color 0.2s" }}>Profils</a>
            <a href="#fonctions" style={{ textDecoration: "none", color: "#E8F4F2", transition: "color 0.2s" }}>Fonctionnalités</a>
            <a href="#acces" style={{ textDecoration: "none", color: "#E8F4F2", transition: "color 0.2s" }}>Accès sécurisé</a>
            <button 
              onClick={() => setIsFormModalOpen(true)}
              style={{ font: "inherit", cursor: "pointer", border: 0, textDecoration: "none", color: "#061B1E", background: "#2DD4BF", padding: "12px 22px", borderRadius: "999px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}
            >
              <Download size={16} /> Téléchargement
            </button>
          </nav>
        </header>

        {/* Hero Section */}
        <section style={{ maxWidth: "1264px", margin: "0 auto", padding: "64px 48px 0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "28px" }}>
          <span style={{ border: "1px solid #1F5A5A", background: "#0B3335", color: "#7FE9DA", fontWeight: 600, fontSize: "14px", padding: "8px 18px", borderRadius: "999px", display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={16} /> Logiciel de gestion clinique et médicale
          </span>
          
          <h1 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "clamp(38px, 6vw, 72px)", lineHeight: 1.05, letterSpacing: "-0.03em", color: "#fff", maxWidth: "900px" }}>
            Pilotez votre clinique avec <span style={{ color: "#2DD4BF" }}>précision</span>.
          </h1>
          
          <p style={{ margin: 0, fontSize: "clamp(17px, 2vw, 21px)", lineHeight: 1.55, color: "#9DBAB6", maxWidth: "720px" }}>
            Dossiers patients, rendez-vous, consultations et finances : une plateforme sécurisée et multi-rôles pour polycliniques, cabinets de groupe et centres médicaux.
          </p>
          
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "14px" }}>
            <button 
              onClick={() => setIsFormModalOpen(true)}
              style={{ font: "inherit", cursor: "pointer", border: 0, color: "#061B1E", background: "#2DD4BF", padding: "16px 32px", borderRadius: "999px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}
            >
              Demander un code d'accès <ArrowRight size={18} />
            </button>
            <a href="#fonctions" style={{ textDecoration: "none", color: "#fff", border: "1.5px solid #2B5E60", padding: "15px 32px", borderRadius: "999px", fontWeight: 600 }}>
              Découvrir le logiciel
            </a>
          </div>

          {/* 3D Mockup Container */}
          <div className="persp" style={{ width: "100%", maxWidth: "1080px", marginTop: "40px", position: "relative" }}>
            {/* Floating 3D Chips */}
            <div className="chip3d" style={{ left: "-28px", top: "70px" }}>
              <Calendar size={20} color="#2DD4BF" />
              Rendez-vous confirmé
            </div>
            
            <div className="chip3d" style={{ right: "-28px", top: "190px", animationDelay: "-2s" }}>
              <FileText size={20} color="#2DD4BF" />
              Dossier patient mis à jour
            </div>
            
            <div className="chip3d" style={{ left: "40px", bottom: "60px", animationDelay: "-4s" }}>
              <DollarSign size={20} color="#2DD4BF" />
              Paiement enregistré
            </div>

            {/* 3D Tilt Window with Dashboard */}
            <div className="tilt3d" style={{ background: "#0C2A2E", border: "1px solid #1F4B4E", borderRadius: "20px 20px 0 0", borderBottom: 0, boxShadow: "0 -10px 80px rgba(45,212,191,0.25)", overflow: "hidden", textAlign: "left" }}>
              <div style={{ display: "flex", gap: "7px", padding: "14px 18px", borderBottom: "1px solid #16393D" }}>
                <span style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#2B5E60" }}></span>
                <span style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#2B5E60" }}></span>
                <span style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#2B5E60" }}></span>
              </div>
              <img 
                src="/assets/dashboard.png" 
                alt="Tableau de bord de Tech Clinic Manager : patients, médecins, rendez-vous et revenus" 
                style={{ display: "block", width: "100%", height: "auto", maxHeight: "560px", objectFit: "cover", objectPosition: "top left" }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes("dashboard.png")) {
                    target.src = "/dashboard.png";
                  }
                }}
              />
            </div>
          </div>
        </section>
      </div>

      {/* Key Metric Stats Banner */}
      <section style={{ maxWidth: "1264px", margin: "0 auto", padding: "56px 48px", display: "flex", flexWrap: "wrap", gap: "24px 0" }}>
        <div style={{ flex: "1 1 200px", padding: "8px 24px", borderLeft: "1px solid #16393D" }}>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "34px", color: "#fff", fontWeight: 700 }}>4 profils</div>
          <div style={{ color: "#9DBAB6", fontSize: "15px" }}>Admin, médecin, secrétaire, accueil</div>
        </div>
        <div style={{ flex: "1 1 200px", padding: "8px 24px", borderLeft: "1px solid #16393D" }}>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "34px", color: "#fff", fontWeight: 700 }}>Multi-cliniques</div>
          <div style={{ color: "#9DBAB6", fontSize: "15px" }}>Bases de données séparées</div>
        </div>
        <div style={{ flex: "1 1 200px", padding: "8px 24px", borderLeft: "1px solid #16393D" }}>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "34px", color: "#fff", fontWeight: 700 }}>Cloud-ready</div>
          <div style={{ color: "#9DBAB6", fontSize: "15px" }}>Serveur local ou Cloud</div>
        </div>
        <div style={{ flex: "1 1 200px", padding: "8px 24px", borderLeft: "1px solid #16393D" }}>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "34px", color: "#fff", fontWeight: 700 }}>Accès unique</div>
          <div style={{ color: "#9DBAB6", fontSize: "15px" }}>Un code par clinique</div>
        </div>
      </section>

      {/* Multi-Profiles Section */}
      <section id="roles" style={{ maxWidth: "1264px", margin: "0 auto", padding: "72px 48px", display: "flex", flexDirection: "column", gap: "40px" }}>
        <div style={{ maxWidth: "660px" }}>
          <div style={{ color: "#2DD4BF", fontWeight: 600, marginBottom: "10px" }}>Multi-profils</div>
          <h2 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "clamp(32px, 4vw, 46px)", lineHeight: 1.08, letterSpacing: "-0.02em", color: "#fff" }}>
            Une interface pensée pour chaque métier
          </h2>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
          {/* Admin */}
          <div className="hover-3d-card" style={{ background: "#0C2A2E", border: "1px solid #16393D", borderRadius: "20px", padding: "28px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#0F3D40", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <UserCheck size={26} color="#2DD4BF" />
            </div>
            <h3 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "22px", color: "#fff" }}>Administrateur</h3>
            <p style={{ margin: 0, color: "#9DBAB6", lineHeight: 1.55, fontSize: "16px" }}>
              Vue d'ensemble, utilisateurs, contrats, statistiques globales et supervision des demandes d'accès.
            </p>
          </div>

          {/* Medecin */}
          <div className="hover-3d-card" style={{ background: "#0C2A2E", border: "1px solid #16393D", borderRadius: "20px", padding: "28px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#0F3D40", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Stethoscope size={26} color="#2DD4BF" />
            </div>
            <h3 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "22px", color: "#fff" }}>Médecin</h3>
            <p style={{ margin: 0, color: "#9DBAB6", lineHeight: 1.55, fontSize: "16px" }}>
              Agenda, diagnostics, ordonnances et historique médical complet du patient.
            </p>
          </div>

          {/* Secretaire */}
          <div className="hover-3d-card" style={{ background: "#0C2A2E", border: "1px solid #16393D", borderRadius: "20px", padding: "28px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#0F3D40", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Calendar size={26} color="#2DD4BF" />
            </div>
            <h3 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "22px", color: "#fff" }}>Secrétaire</h3>
            <p style={{ margin: 0, color: "#9DBAB6", lineHeight: 1.55, fontSize: "16px" }}>
              Rendez-vous rapides, planning dynamique, rappels et accueil téléphonique.
            </p>
          </div>

          {/* Agent d'accueil */}
          <div className="hover-3d-card" style={{ background: "#0C2A2E", border: "1px solid #16393D", borderRadius: "20px", padding: "28px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#0F3D40", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Headphones size={26} color="#2DD4BF" />
            </div>
            <h3 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "22px", color: "#fff" }}>Agent d'accueil</h3>
            <p style={{ margin: 0, color: "#9DBAB6", lineHeight: 1.55, fontSize: "16px" }}>
              Arrivées enregistrées, patients orientés, salle d'attente fluide.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fonctions" style={{ maxWidth: "1264px", margin: "0 auto", padding: "72px 48px", display: "flex", flexDirection: "column", gap: "40px" }}>
        <div style={{ maxWidth: "660px" }}>
          <div style={{ color: "#2DD4BF", fontWeight: 600, marginBottom: "10px" }}>Fonctionnalités</div>
          <h2 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "clamp(32px, 4vw, 46px)", lineHeight: 1.08, letterSpacing: "-0.02em", color: "#fff" }}>
            Tout ce qu'il faut au quotidien, au même endroit
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "20px" }}>
          {/* Card 1 */}
          <div className="hover-3d-card" style={{ background: "#0C2A2E", border: "1px solid #16393D", borderRadius: "24px", padding: "36px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <FileText size={32} color="#2DD4BF" />
            <h3 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "26px", color: "#fff", lineHeight: 1.15 }}>Dossier patient 100 % numérisé</h3>
            <p style={{ margin: 0, color: "#9DBAB6", lineHeight: 1.6 }}>
              État civil, coordonnées, antécédents médicaux et chirurgicaux, allergies, notes confidentielles. Historique chronologique des consultations et ordonnances.
            </p>
          </div>

          {/* Card 2 */}
          <div className="hover-3d-card" style={{ background: "#0C2A2E", border: "1px solid #16393D", borderRadius: "24px", padding: "36px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <Calendar size={32} color="#2DD4BF" />
            <h3 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "26px", color: "#fff", lineHeight: 1.15 }}>Rendez-vous sans conflit</h3>
            <p style={{ margin: 0, color: "#9DBAB6", lineHeight: 1.6 }}>
              Calendrier interactif : moins de retards, de doubles réservations et d'oublis. Statuts suivis : en attente, en cours, terminée, annulée.
            </p>
          </div>

          {/* Card 3 */}
          <div className="hover-3d-card" style={{ background: "#0C2A2E", border: "1px solid #16393D", borderRadius: "24px", padding: "36px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <DollarSign size={32} color="#2DD4BF" />
            <h3 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "26px", color: "#fff", lineHeight: 1.15 }}>Pilotage financier</h3>
            <p style={{ margin: 0, color: "#9DBAB6", lineHeight: 1.6 }}>
              Revenus, paiements, contrats des médecins et prestataires, rapports clairs et exportables pour la direction.
            </p>
          </div>

          {/* Card 4 */}
          <div className="hover-3d-card" style={{ background: "#0C2A2E", border: "1px solid #16393D", borderRadius: "24px", padding: "36px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <Cloud size={32} color="#2DD4BF" />
            <h3 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "26px", color: "#fff", lineHeight: 1.15 }}>Multi-cliniques, prêt pour le Cloud</h3>
            <p style={{ margin: 0, color: "#9DBAB6", lineHeight: 1.6 }}>
              Bases de données distinctes par structure ou succursale. Intégrité, confidentialité et synchronisation, sur serveur local ou dans le Cloud.
            </p>
          </div>
        </div>
      </section>

      {/* Access and Download Section */}
      <section id="acces" style={{ maxWidth: "1264px", margin: "0 auto", padding: "72px 48px", display: "flex", flexDirection: "column", gap: "40px" }}>
        <div style={{ maxWidth: "700px" }}>
          <div style={{ color: "#2DD4BF", fontWeight: 600, marginBottom: "10px" }}>Portail web</div>
          <h2 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "clamp(32px, 4vw, 46px)", lineHeight: 1.08, letterSpacing: "-0.02em", color: "#fff" }}>
            Une distribution sécurisée, clinique par clinique
          </h2>
        </div>

        {/* 3 Steps */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ flex: "1 1 260px", display: "flex", flexDirection: "column", gap: "12px", padding: "28px", border: "1px solid #16393D", borderRadius: "20px", background: "#0C2A2E" }}>
            <span style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#2DD4BF", color: "#061B1E", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "20px" }}>1</span>
            <h3 style={{ margin: 0, color: "#fff", fontSize: "20px" }}>Demande de téléchargement</h3>
            <p style={{ margin: 0, color: "#9DBAB6", lineHeight: 1.55 }}>Cliquez sur Télécharger pour remplir le formulaire et envoyer votre demande.</p>
          </div>

          <div style={{ flex: "1 1 260px", display: "flex", flexDirection: "column", gap: "12px", padding: "28px", border: "1px solid #16393D", borderRadius: "20px", background: "#0C2A2E" }}>
            <span style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#2DD4BF", color: "#061B1E", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "20px" }}>2</span>
            <h3 style={{ margin: 0, color: "#fff", fontSize: "20px" }}>Code d'accès unique</h3>
            <p style={{ margin: 0, color: "#9DBAB6", lineHeight: 1.55 }}>Un code propre à votre clinique (Tawfik ou Monji Slim) est attribué.</p>
          </div>

          <div style={{ flex: "1 1 260px", display: "flex", flexDirection: "column", gap: "12px", padding: "28px", border: "1px solid #16393D", borderRadius: "20px", background: "#0C2A2E" }}>
            <span style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#2DD4BF", color: "#061B1E", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "20px" }}>3</span>
            <h3 style={{ margin: 0, color: "#fff", fontSize: "20px" }}>Téléchargement immédiat</h3>
            <p style={{ margin: 0, color: "#9DBAB6", lineHeight: 1.55 }}>Le code valide le téléchargement sécurisé du pack logiciel complet.</p>
          </div>
        </div>

        {/* Live Interactive Download Card */}
        <div style={{ background: "linear-gradient(135deg, #0F4A4C, #0A2F32)", border: "1px solid #1F5A5A", borderRadius: "24px", padding: "36px", display: "flex", flexDirection: "column", gap: "24px" }}>
          
          <div style={{ display: "flex", flexWrap: "wrap", gap: "28px", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <ShieldCheck color="#2DD4BF" size={28} />
                <h3 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "28px", color: "#fff" }}>
                  Télécharger Tech Clinic Manager
                </h3>
              </div>
              <p style={{ margin: 0, color: "#B7D3CF", lineHeight: 1.55 }}>
                Cliquez pour envoyer votre demande de téléchargement ou saisissez directement votre code d'accès si vous l'avez déjà reçu.
              </p>
            </div>

            {/* Action Buttons: 1. Click to open request form, 2. Enter existing code */}
            <div style={{ flex: "1 1 320px", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
              <button 
                onClick={() => setIsFormModalOpen(true)}
                style={{ font: "inherit", fontWeight: 600, color: "#061B1E", background: "#2DD4BF", border: 0, padding: "16px 28px", borderRadius: "999px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 10px 25px rgba(45,212,191,0.3)" }}
              >
                <Download size={20} /> Télécharger le logiciel
              </button>

              <button 
                onClick={() => setShowCodeInput(!showCodeInput)}
                style={{ font: "inherit", fontWeight: 600, color: "#fff", background: "rgba(12,42,46,0.8)", border: "1.5px solid #2B5E60", padding: "15px 24px", borderRadius: "999px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
              >
                <KeyRound size={18} color="#2DD4BF" />
                {showCodeInput ? "Masquer le code" : "J'ai déjà un code d'accès"}
              </button>
            </div>
          </div>

          {/* Collapsible / Optional Code Verification Form */}
          {showCodeInput && (
            <div style={{ borderTop: "1px solid #1F5A5A", paddingTop: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ fontSize: "15px", color: "#7FE9DA", fontWeight: 600 }}>
                Entrez votre code d'accès reçu de l'administrateur :
              </div>
              <form onSubmit={handleDownload} style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "flex-end" }}>
                <label style={{ flex: "1 1 240px", display: "flex", flexDirection: "column", gap: "6px", fontWeight: 600, color: "#fff" }}>
                  Code d'accès unique
                  <input 
                    type="text" 
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="Ex: CLINIC-ABC123" 
                    style={{ font: "inherit", padding: "14px", border: "1px solid #2B5E60", borderRadius: "12px", background: "#061B1E", color: "#fff", outline: "none" }}
                  />
                </label>
                <button 
                  type="submit" 
                  disabled={isVerifying}
                  style={{ font: "inherit", fontWeight: 600, color: "#061B1E", background: "#2DD4BF", border: 0, padding: "14px 26px", borderRadius: "999px", cursor: isVerifying ? "not-allowed" : "pointer", minHeight: "50px", display: "flex", alignItems: "center", gap: "8px", opacity: isVerifying ? 0.7 : 1 }}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 size={20} className="animate-spin" /> Vérification...
                    </>
                  ) : (
                    <>
                      <Download size={20} /> Valider &amp; Télécharger
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Validation Feedback Messages */}
          {verifyError && (
            <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", borderRadius: "12px", padding: "12px 18px", display: "flex", alignItems: "center", gap: "10px", color: "#fca5a5" }}>
              <AlertCircle size={20} />
              <span>{verifyError}</span>
            </div>
          )}

          {downloadSuccessData && (
            <div style={{ background: "rgba(45, 212, 191, 0.15)", border: "1px solid #2DD4BF", borderRadius: "12px", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "8px", color: "#E8F4F2" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: 700, color: "#2DD4BF" }}>
                <CheckCircle2 size={22} />
                <span>Code vérifié avec succès pour {downloadSuccessData.clinique_name} !</span>
              </div>
              <p style={{ margin: 0, fontSize: "15px", color: "#9DBAB6" }}>
                Le téléchargement du logiciel d'installation (.zip) s'est déclenché. Si le téléchargement n'a pas commencé automatiquement,{" "}
                <a href={downloadSuccessData.download_url} target="_blank" rel="noreferrer" style={{ color: "#2DD4BF", fontWeight: 600 }}>
                  cliquez ici pour le lancer manuellement
                </a>.
              </p>
            </div>
          )}
        </div>

        <p style={{ margin: 0, color: "#9DBAB6", display: "flex", alignItems: "center", gap: "8px" }}>
          <Building2 size={18} color="#2DD4BF" />
          Déployé pour <strong style={{ color: "#fff" }}>Clinique Tawfik</strong> et <strong style={{ color: "#fff" }}>Clinique Monji Slim</strong>
        </p>
      </section>

      {/* Interactive Contact / Access Request Form Section */}
      <section id="contact" style={{ maxWidth: "1264px", margin: "0 auto", padding: "40px 48px 96px" }}>
        <div style={{ background: "linear-gradient(135deg, #0F4A4C, #0A2F32)", border: "1px solid #1F5A5A", borderRadius: "28px", padding: "clamp(32px, 5vw, 56px)", display: "flex", flexWrap: "wrap", gap: "40px", alignItems: "center" }}>
          
          {/* Left Column: 3D Cross & Text */}
          <div style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ perspective: "700px", height: "110px", marginBottom: "8px" }}>
              <div className="cross3d">
                <svg width="90" height="90" viewBox="0 0 32 32" style={{ transform: "translateZ(-14px)" }} aria-hidden="true">
                  <path d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6z" fill="#0B6F66" />
                </svg>
                <svg width="90" height="90" viewBox="0 0 32 32" style={{ transform: "translateZ(-9px)" }} aria-hidden="true">
                  <path d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6z" fill="#12877C" />
                </svg>
                <svg width="90" height="90" viewBox="0 0 32 32" style={{ transform: "translateZ(-4px)" }} aria-hidden="true">
                  <path d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6z" fill="#1AA597" />
                </svg>
                <svg width="90" height="90" viewBox="0 0 32 32" style={{ transform: "translateZ(1px)" }} aria-hidden="true">
                  <path d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6z" fill="#1AA597" />
                </svg>
                <svg width="90" height="90" viewBox="0 0 32 32" style={{ transform: "translateZ(6px)" }} aria-hidden="true">
                  <path d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6z" fill="#12877C" />
                </svg>
                <svg width="90" height="90" viewBox="0 0 32 32" style={{ transform: "translateZ(11px)" }} aria-hidden="true">
                  <path d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6z" fill="#2DD4BF" />
                </svg>
                <svg width="90" height="90" viewBox="0 0 32 32" style={{ transform: "translateZ(16px)" }} aria-hidden="true">
                  <path d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6z" fill="#7FE9DA" />
                </svg>
              </div>
            </div>
            
            <h2 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "clamp(30px, 4vw, 42px)", lineHeight: 1.1, letterSpacing: "-0.02em", color: "#fff" }}>
              Contactez-nous &amp; Demandez un accès
            </h2>
            <p style={{ margin: 0, color: "#B7D3CF", lineHeight: 1.55 }}>
              Une question, une démonstration ou une demande d'accès ? Remplissez ce formulaire et notre équipe vous transmettra votre code d'accès au logiciel.
            </p>
          </div>

          {/* Right Column: Live Form */}
          <form onSubmit={handleSubmitRequest} style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontWeight: 600, color: "#fff" }}>
              Nom complet *
              <input 
                type="text" 
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Dr. Mohamed Ben Ali" 
                style={{ font: "inherit", padding: "14px", border: "1px solid #2B5E60", borderRadius: "12px", background: "#061B1E", color: "#fff", outline: "none" }}
              />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontWeight: 600, color: "#fff" }}>
              Clinique / Établissement *
              <select 
                value={formData.clinique}
                onChange={(e) => setFormData({ ...formData, clinique: e.target.value })}
                style={{ font: "inherit", padding: "14px", border: "1px solid #2B5E60", borderRadius: "12px", background: "#061B1E", color: "#fff", outline: "none" }}
              >
                <option value="tawfik" style={{ background: "#061B1E" }}>Clinique Tawfik (Base clinique_db)</option>
                <option value="monji-slim" style={{ background: "#061B1E" }}>Clinique Monji Slim (Base clinique_monji_slim)</option>
              </select>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontWeight: 600, color: "#fff" }}>
              Email professionnel *
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="medecin@clinique.com" 
                style={{ font: "inherit", padding: "14px", border: "1px solid #2B5E60", borderRadius: "12px", background: "#061B1E", color: "#fff", outline: "none" }}
              />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontWeight: 600, color: "#fff" }}>
              Téléphone
              <input 
                type="tel" 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+216 98 765 432" 
                style={{ font: "inherit", padding: "14px", border: "1px solid #2B5E60", borderRadius: "12px", background: "#061B1E", color: "#fff", outline: "none" }}
              />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontWeight: 600, color: "#fff" }}>
              Message ou précisions
              <textarea 
                rows={3} 
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Précisez votre service ou vos besoins particuliers..." 
                style={{ font: "inherit", padding: "14px", border: "1px solid #2B5E60", borderRadius: "12px", background: "#061B1E", color: "#fff", resize: "vertical", outline: "none" }}
              />
            </label>

            {submitError && (
              <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", borderRadius: "12px", padding: "12px", color: "#fca5a5", fontSize: "15px" }}>
                {submitError}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{ font: "inherit", fontWeight: 600, color: "#061B1E", background: "#2DD4BF", border: 0, padding: "16px 28px", borderRadius: "999px", cursor: isSubmitting ? "not-allowed" : "pointer", minHeight: "48px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> Envoi en cours...
                </>
              ) : (
                "Envoyer la demande d'accès"
              )}
            </button>
          </form>

        </div>
      </section>

      {/* POPUP / MODAL: Formulaire de demande de téléchargement */}
      {isFormModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 9999 }}>
          <div style={{ background: "#0C2A2E", border: "1px solid #2DD4BF", borderRadius: "24px", maxWidth: "560px", width: "100%", maxHeight: "90vh", overflowY: "auto", padding: "32px", position: "relative", boxShadow: "0 25px 60px rgba(0,0,0,0.6)" }}>
            <button 
              onClick={() => setIsFormModalOpen(false)}
              style={{ position: "absolute", top: "18px", right: "18px", background: "transparent", border: 0, color: "#9DBAB6", cursor: "pointer" }}
            >
              <X size={24} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(45,212,191,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#2DD4BF" }}>
                <Download size={26} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "24px", color: "#fff" }}>
                  Demande de téléchargement
                </h3>
                <span style={{ fontSize: "14px", color: "#7FE9DA" }}>Tech Clinic Manager</span>
              </div>
            </div>

            <p style={{ margin: "0 0 20px", color: "#9DBAB6", fontSize: "15px", lineHeight: 1.5 }}>
              Remplissez ce formulaire afin de générer votre demande d'accès. Vous recevrez le code d'accès pour débloquer l'installation.
            </p>

            <form onSubmit={handleSubmitRequest} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "5px", fontWeight: 600, color: "#fff", fontSize: "15px" }}>
                Nom complet *
                <input 
                  type="text" 
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Ex: Dr. Mohamed Yesser" 
                  style={{ font: "inherit", padding: "12px", border: "1px solid #2B5E60", borderRadius: "10px", background: "#061B1E", color: "#fff", outline: "none" }}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "5px", fontWeight: 600, color: "#fff", fontSize: "15px" }}>
                Établissement / Clinique *
                <select 
                  value={formData.clinique}
                  onChange={(e) => setFormData({ ...formData, clinique: e.target.value })}
                  style={{ font: "inherit", padding: "12px", border: "1px solid #2B5E60", borderRadius: "10px", background: "#061B1E", color: "#fff", outline: "none" }}
                >
                  <option value="tawfik" style={{ background: "#061B1E" }}>Clinique Tawfik (Base clinique_db)</option>
                  <option value="monji-slim" style={{ background: "#061B1E" }}>Clinique Monji Slim (Base clinique_monji_slim)</option>
                </select>
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "5px", fontWeight: 600, color: "#fff", fontSize: "15px" }}>
                Email professionnel *
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="votre@email.com" 
                  style={{ font: "inherit", padding: "12px", border: "1px solid #2B5E60", borderRadius: "10px", background: "#061B1E", color: "#fff", outline: "none" }}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "5px", fontWeight: 600, color: "#fff", fontSize: "15px" }}>
                Numéro de téléphone
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+216 ..." 
                  style={{ font: "inherit", padding: "12px", border: "1px solid #2B5E60", borderRadius: "10px", background: "#061B1E", color: "#fff", outline: "none" }}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "5px", fontWeight: 600, color: "#fff", fontSize: "15px" }}>
                Message ou précisions (optionnel)
                <textarea 
                  rows={2} 
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Service médical, nombre de postes..." 
                  style={{ font: "inherit", padding: "12px", border: "1px solid #2B5E60", borderRadius: "10px", background: "#061B1E", color: "#fff", resize: "vertical", outline: "none" }}
                />
              </label>

              {submitError && (
                <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", borderRadius: "10px", padding: "10px", color: "#fca5a5", fontSize: "14px" }}>
                  {submitError}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ font: "inherit", fontWeight: 600, color: "#061B1E", background: "#2DD4BF", border: 0, padding: "14px 24px", borderRadius: "999px", cursor: isSubmitting ? "not-allowed" : "pointer", marginTop: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: isSubmitting ? 0.7 : 1 }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Envoi de la demande...
                  </>
                ) : (
                  "Envoyer la demande de téléchargement"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal upon Form Submission */}
      {submitSuccess && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 9999 }}>
          <div style={{ background: "#0C2A2E", border: "1px solid #2DD4BF", borderRadius: "24px", maxWidth: "520px", width: "100%", padding: "36px", position: "relative", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
            <button 
              onClick={() => setSubmitSuccess(false)}
              style={{ position: "absolute", top: "18px", right: "18px", background: "transparent", border: 0, color: "#9DBAB6", cursor: "pointer" }}
            >
              <X size={24} />
            </button>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "16px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(45,212,191,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#2DD4BF" }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "28px", color: "#fff" }}>
                Demande envoyée avec succès !
              </h3>
              <p style={{ margin: 0, color: "#9DBAB6", lineHeight: 1.6, fontSize: "16px" }}>
                Votre demande de téléchargement <strong>(Réf #{generatedRequestId})</strong> pour la clinique sélectionnée a été enregistrée.
                Un code d'accès sera généré pour vous permettre de lancer le téléchargement.
              </p>
              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button 
                  onClick={() => {
                    setSubmitSuccess(false);
                    setShowCodeInput(true);
                    const accesEl = document.getElementById("acces");
                    if (accesEl) accesEl.scrollIntoView({ behavior: "smooth" });
                  }}
                  style={{ font: "inherit", fontWeight: 600, color: "#061B1E", background: "#2DD4BF", border: 0, padding: "14px 24px", borderRadius: "999px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <KeyRound size={18} /> Saisir un code reçu
                </button>
                <button 
                  onClick={() => setSubmitSuccess(false)}
                  style={{ font: "inherit", fontWeight: 600, color: "#fff", background: "transparent", border: "1px solid #2B5E60", padding: "14px 24px", borderRadius: "999px", cursor: "pointer" }}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #16393D", padding: "28px 48px", textAlign: "center", color: "#9DBAB6", fontSize: "15px" }}>
        © {new Date().getFullYear()} Tech Clinic Manager · Développé pour Clinique Tawfik &amp; Clinique Monji Slim · Tous droits réservés.
      </footer>
    </div>
  );
};

export default Index;
