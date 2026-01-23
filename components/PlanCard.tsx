"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import type { SubscriptionPlan } from "@/lib/api/subscription.api";

interface PlanCardProps {
  plan: SubscriptionPlan;
  quota: number | null;
  features: string[];
  isCurrentPlan: boolean;
  isLoading?: boolean;
  onSelect: () => void;
}

const PLAN_NAMES: Record<SubscriptionPlan, string> = {
  FREE: "Gratuit",
  STUDENT: "Étudiant",
  PREMIUM: "Premium",
};

const PLAN_DESCRIPTIONS: Record<SubscriptionPlan, string> = {
  FREE: "Parfait pour commencer",
  STUDENT: "Idéal pour les étudiants",
  PREMIUM: "Accès illimité à toutes les fonctionnalités",
};

export function PlanCard({
  plan,
  quota,
  features,
  isCurrentPlan,
  isLoading = false,
  onSelect,
}: PlanCardProps) {
  const planName = PLAN_NAMES[plan];
  const planDescription = PLAN_DESCRIPTIONS[plan];

  const quotaText =
    quota === null ? "Illimité" : `${quota} appels IA / jour`;

  return (
    <Card className={isCurrentPlan ? "border-primary" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{planName}</CardTitle>
          {isCurrentPlan && (
            <Badge variant="default">Plan actuel</Badge>
          )}
        </div>
        <CardDescription>{planDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-2xl font-bold">{quotaText}</p>
          </div>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={isCurrentPlan ? "outline" : "default"}
          disabled={isCurrentPlan || isLoading || plan === "FREE"}
          onClick={onSelect}
        >
          {isCurrentPlan ? "Plan actuel" : "Choisir ce plan"}
        </Button>
      </CardFooter>
    </Card>
  );
}
