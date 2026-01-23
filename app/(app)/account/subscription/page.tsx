"use client";

import { useState } from "react";
import { SubscriptionStatusComponent } from "@/components/SubscriptionStatus";
import { useSubscription } from "@/hooks/subscription/useSubscription";
import { useLimits } from "@/hooks/subscription/useLimits";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SubscriptionPage() {
  const router = useRouter();
  const { subscription, isLoading: isLoadingSubscription, cancel, error: subscriptionError } = useSubscription();
  const { limits, isLoading: isLoadingLimits, error: limitsError } = useLimits();
  const [isCanceling, setIsCanceling] = useState(false);

  const handleCancel = async () => {
    try {
      setIsCanceling(true);
      await cancel();
    } catch (err) {
      // L'erreur est déjà gérée par le hook
      console.error("Error canceling subscription:", err);
    } finally {
      setIsCanceling(false);
    }
  };

  const isLoading = isLoadingSubscription || isLoadingLimits;
  const error = subscriptionError || limitsError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Abonnement</h1>
        <p className="text-muted-foreground mt-2">
          Gérez votre abonnement et vos limites
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {subscription && (
          <SubscriptionStatusComponent
            plan={subscription.plan}
            status={subscription.status}
            startedAt={subscription.startedAt}
            onCancel={handleCancel}
            isCanceling={isCanceling}
          />
        )}

        {limits && (
          <Card>
            <CardHeader>
              <CardTitle>Limites IA</CardTitle>
              <CardDescription>Votre utilisation quotidienne</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Plan actuel</p>
                <p className="text-lg font-semibold">{limits.plan}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Quota journalier</p>
                <p className="text-2xl font-bold">
                  {limits.dailyAI === null ? "Illimité" : `${limits.dailyAI} appels`}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Utilisé aujourd'hui</p>
                <p className="text-xl font-semibold">{limits.usedToday} appels</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Restant aujourd'hui</p>
                <p className="text-xl font-semibold">
                  {limits.remainingToday === null
                    ? "Illimité"
                    : `${limits.remainingToday} appels`}
                </p>
              </div>

              {limits.dailyAI !== null && limits.remainingToday !== null && (
                <div className="pt-4">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${Math.min(100, (limits.usedToday / limits.dailyAI) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {limits.usedToday} / {limits.dailyAI} appels utilisés
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => router.push("/pricing")}
        >
          Voir les plans
        </Button>
      </div>
    </div>
  );
}
