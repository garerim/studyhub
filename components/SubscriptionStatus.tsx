"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { SubscriptionPlan, SubscriptionStatus } from "@/lib/api/subscription.api";

interface SubscriptionStatusProps {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startedAt: string | null;
  onCancel: () => Promise<void>;
  isCanceling?: boolean;
}

const PLAN_NAMES: Record<SubscriptionPlan, string> = {
  FREE: "Gratuit",
  STUDENT: "Étudiant",
  PREMIUM: "Premium",
};

const STATUS_LABELS: Record<NonNullable<SubscriptionStatus>, string> = {
  ACTIVE: "Actif",
  CANCELED: "Annulé",
  EXPIRED: "Expiré",
  PAST_DUE: "En retard",
};

const STATUS_VARIANTS: Record<NonNullable<SubscriptionStatus>, "default" | "secondary" | "destructive" | "outline"> = {
  ACTIVE: "default",
  CANCELED: "secondary",
  EXPIRED: "destructive",
  PAST_DUE: "outline",
};

export function SubscriptionStatusComponent({
  plan,
  status,
  startedAt,
  onCancel,
  isCanceling = false,
}: SubscriptionStatusProps) {
  const planName = PLAN_NAMES[plan];
  const isFree = plan === "FREE";
  const isActive = status === "ACTIVE";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Abonnement</CardTitle>
          {status && (
            <Badge variant={STATUS_VARIANTS[status]}>
              {STATUS_LABELS[status]}
            </Badge>
          )}
        </div>
        <CardDescription>Gérez votre abonnement</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Plan actuel</p>
          <p className="text-2xl font-bold">{planName}</p>
        </div>

        {startedAt && (
          <div>
            <p className="text-sm text-muted-foreground">Date de début</p>
            <p className="text-sm font-medium">
              {format(new Date(startedAt), "PPP", { locale: fr })}
            </p>
          </div>
        )}

        {!isFree && isActive && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isCanceling}>
                {isCanceling ? "Annulation..." : "Résilier l'abonnement"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Résilier l'abonnement ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Vous allez perdre l'accès à votre plan {planName} immédiatement.
                  Vous passerez au plan gratuit.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onCancel}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Confirmer la résiliation
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardContent>
    </Card>
  );
}
