/**
 * API helpers pour la gestion des abonnements
 * Structure prête pour intégrer Stripe plus tard
 */

export type SubscriptionPlan = "FREE" | "STUDENT" | "PREMIUM";
export type SubscriptionStatus = "ACTIVE" | "CANCELED" | "EXPIRED" | "PAST_DUE" | null;

export interface SubscriptionResponse {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startedAt: string | null;
}

export interface CreateSubscriptionRequest {
  plan: Exclude<SubscriptionPlan, "FREE">;
}

export interface CreateSubscriptionResponse {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startedAt: string;
  endsAt: string | null;
  canceledAt: string | null;
  provider: string;
  providerSubId: string;
  createdAt: string;
  updatedAt: string;
  notification?: {
    id: string;
    type: string;
    title: string;
    message: string;
  } | null;
}

/**
 * Récupère l'abonnement actif de l'utilisateur
 */
export async function getSubscription(): Promise<SubscriptionResponse> {
  const response = await fetch("/api/subscription", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Erreur inconnue" }));
    throw new Error(error.error || "Erreur lors de la récupération de l'abonnement");
  }

  return response.json();
}

/**
 * Crée un nouvel abonnement
 * Structure prête pour intégrer un checkout Stripe
 */
export async function createSubscription(
  data: CreateSubscriptionRequest
): Promise<CreateSubscriptionResponse> {
  const response = await fetch("/api/subscription/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Erreur inconnue" }));
    throw new Error(error.error || "Erreur lors de la création de l'abonnement");
  }

  return response.json();
}

/**
 * Annule l'abonnement actif
 */
export async function cancelSubscription(): Promise<CreateSubscriptionResponse> {
  const response = await fetch("/api/subscription/cancel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Erreur inconnue" }));
    throw new Error(error.error || "Erreur lors de l'annulation de l'abonnement");
  }

  return response.json();
}
