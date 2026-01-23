/**
 * API helpers pour la gestion des limites IA
 */

export interface LimitsResponse {
  plan: "FREE" | "STUDENT" | "PREMIUM";
  dailyAI: number | null;
  usedToday: number;
  remainingToday: number | null;
}

/**
 * Récupère les limites et l'utilisation actuelle de l'utilisateur
 */
export async function getLimits(): Promise<LimitsResponse> {
  const response = await fetch("/api/limits", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Erreur inconnue" }));
    throw new Error(error.error || "Erreur lors de la récupération des limites");
  }

  return response.json();
}
