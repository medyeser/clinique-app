import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import DownloadForm from "@/components/DownloadForm";

const Index = () => {
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onDownloadClick={() => setIsDownloadOpen(true)} />
      <Hero onDownloadClick={() => setIsDownloadOpen(true)} />
      <Features />
      <Footer />
      <DownloadForm open={isDownloadOpen} onOpenChange={setIsDownloadOpen} />
    </div>
  );
};

export default Index;
