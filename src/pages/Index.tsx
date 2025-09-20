import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import PortfolioPreview from "@/components/PortfolioPreview";
import About from "@/components/About";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { SEOHead } from "@/components/SEOHead";
import { AccessibilityFeatures, useKeyboardAccessibility } from "@/components/AccessibilityFeatures";

const Index = () => {
  useKeyboardAccessibility();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Produtora Viva",
    "description": "Fotografia e videografia profissional para casamentos, aniversários e eventos",
    "image": "/hero-wedding.jpg",
    "url": window.location.origin,
    "telephone": "+5545999887766",
    "email": "info@produtoraviva.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Foz do Iguaçu",
      "addressRegion": "PR",
      "addressCountry": "BR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -25.5163,
      "longitude": -54.5854
    },
    "openingHours": "Mo-Fr 09:00-18:00, Sa 09:00-15:00",
    "priceRange": "$$",
    "serviceArea": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": -25.5163,
        "longitude": -54.5854
      },
      "geoRadius": "50000"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Serviços de Fotografia e Videografia",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Fotografia de Casamento",
            "description": "Cobertura completa de casamentos com fotografia profissional"
          }
        },
        {
          "@type": "Offer", 
          "itemOffered": {
            "@type": "Service",
            "name": "Videografia de Eventos",
            "description": "Filmagem cinematográfica para eventos especiais"
          }
        }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead structuredData={structuredData} />
      <AccessibilityFeatures />
      <Navigation />
      <main>
        <Hero />
        <PortfolioPreview />
        <About />
        <Services />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;