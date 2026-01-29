"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

type AiLoadingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animationPath?: string; // Chemin vers le fichier .lottie
};

/**
 * Composant réutilisable pour afficher une animation Lottie pendant les appels IA
 * Aucune logique métier - uniquement UI
 */
export function AiLoadingDialog({
  open,
  onOpenChange,
  animationPath = "/StarLoader.lottie", // Par défaut, cherche AiLoading.lottie dans public/
}: AiLoadingDialogProps) {
  const [error, setError] = React.useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <div className="flex flex-col items-center justify-center space-y-4 py-6">
          {error ? (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Animation non disponible
              </p>
              <div className="flex items-center justify-center">
                <div className="size-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            </div>
          ) : (
            <div className="size-48 flex items-center justify-center">
              {open && animationPath ? (
                <DotLottieReact
                  src={animationPath}
                  loop
                  autoplay
                  onError={(error) => {
                    console.error("Erreur lors du chargement de l'animation:", error);
                    setError("Impossible de charger l'animation");
                  }}
                />
              ) : (
                <div className="size-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              )}
            </div>
          )}
          <div className="text-center space-y-2">
            <DialogDescription className="text-base font-medium">
              Génération en cours…
            </DialogDescription>
            <p className="text-sm text-muted-foreground">
              Vous pouvez fermer cette fenêtre, vous serez notifié une fois terminé.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
