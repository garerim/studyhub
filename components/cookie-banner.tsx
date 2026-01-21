"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Cookie } from "lucide-react";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "studyhub-cookie-consent";

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà fait un choix (accepted ou rejected)
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    
    if (!consent) {
      // Vérifier si l'utilisateur a fermé la bannière récemment (moins de 24h)
      const closedTimestamp = localStorage.getItem(`${COOKIE_CONSENT_KEY}-closed`);
      if (closedTimestamp) {
        const closedTime = parseInt(closedTimestamp, 10);
        const now = Date.now();
        const hoursSinceClose = (now - closedTime) / (1000 * 60 * 60);
        
        // Si moins de 24h depuis la fermeture, ne pas réafficher
        if (hoursSinceClose < 24) {
          return;
        }
      }
      
      // Attendre un peu avant d'afficher la bannière pour ne pas être trop intrusif
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "rejected");
    setShowBanner(false);
  };

  const handleClose = () => {
    // Fermer sans enregistrer de choix (l'utilisateur pourra revoir la bannière au prochain chargement)
    setShowBanner(false);
    // Enregistrer un timestamp pour éviter de réafficher immédiatement si l'utilisateur recharge la page
    localStorage.setItem(`${COOKIE_CONSENT_KEY}-closed`, Date.now().toString());
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="container mx-auto px-4 pb-4">
        <div className="relative rounded-lg border bg-background/30 backdrop-blur-sm p-4 shadow-lg md:p-6">
          <button
            onClick={handleClose}
            className="absolute right-2 top-2 rounded-sm p-1 text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Fermer"
          >
            <X className="size-4" />
          </button>
          
          <div className="flex flex-col gap-4 pr-8 md:flex-row md:items-center md:gap-6">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Cookie className="size-5 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-sm font-semibold">Gestion des cookies</h3>
                <p className="text-sm text-muted-foreground">
                  Nous utilisons des cookies pour améliorer votre expérience de navigation, 
                  analyser le trafic du site et personnaliser le contenu. En continuant à 
                  naviguer sur ce site, vous acceptez notre utilisation des cookies.{" "}
                  <Link
                    href="/politique-confidentialite"
                    className="font-medium text-primary underline underline-offset-4 hover:no-underline"
                  >
                    En savoir plus
                  </Link>
                </p>
              </div>
            </div>
            
            <div className="flex shrink-0 gap-2 md:flex-col md:gap-2">
              <Button
                onClick={handleAccept}
                size="sm"
                className="w-full md:w-auto"
              >
                Accepter
              </Button>
              <Button
                onClick={handleReject}
                size="sm"
                variant="outline"
                className="w-full md:w-auto"
              >
                Refuser
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
