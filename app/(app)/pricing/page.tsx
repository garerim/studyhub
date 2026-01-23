"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlanCard } from "@/components/PlanCard";
import { useSubscription } from "@/hooks/subscription/useSubscription";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { SubscriptionPlan } from "@/lib/api/subscription.api";

const PLAN_FEATURES: Record<SubscriptionPlan, string[]> = {
  FREE: [
    "5 appels IA par jour",
    "Génération de quiz basique",
    "Support communautaire",
  ],
  STUDENT: [
    "50 appels IA par jour",
    "Génération de quiz avancée",
    "Cours personnalisés",
    "Support prioritaire",
  ],
  PREMIUM: [
    "Appels IA illimités",
    "Toutes les fonctionnalités",
    "Cours personnalisés avancés",
    "Support prioritaire 24/7",
    "Analyses détaillées",
  ],
};

const PLAN_QUOTAS: Record<SubscriptionPlan, number | null> = {
  FREE: 5,
  STUDENT: 50,
  PREMIUM: null,
};

export default function PricingPage() {
  const router = useRouter();
  const { subscription, isLoading: isLoadingSubscription, create, error } = useSubscription();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (plan === "FREE") {
      return;
    }

    try {
      setIsCreating(true);
      setSelectedPlan(plan);
      await create({ plan });
      router.push("/account/subscription");
    } catch (err) {
      // L'erreur est déjà gérée par le hook
      console.error("Error creating subscription:", err);
    } finally {
      setIsCreating(false);
      setSelectedPlan(null);
    }
  };

  const currentPlan = subscription?.plan ?? "FREE";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tarifs</h1>
        <p className="text-muted-foreground mt-2">
          Choisissez le plan qui correspond à vos besoins
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {(["FREE", "STUDENT", "PREMIUM"] as SubscriptionPlan[]).map((plan) => {
          const isCurrentPlan = plan === currentPlan;
          const isCreatingThisPlan = isCreating && selectedPlan === plan;

          return (
            <PlanCard
              key={plan}
              plan={plan}
              quota={PLAN_QUOTAS[plan]}
              features={PLAN_FEATURES[plan]}
              isCurrentPlan={isCurrentPlan}
              isLoading={isLoadingSubscription || isCreatingThisPlan}
              onSelect={() => handleSelectPlan(plan)}
            />
          );
        })}
      </div>

      <div className="mt-4 text-center text-sm text-muted-foreground">
        <p>Tous les plans peuvent être annulés à tout moment.</p>
      </div>
    </div>
  );
}
