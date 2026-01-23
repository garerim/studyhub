import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { PlanLimitService } from "@/services/planLimit.service";
import { AIQuotaService } from "@/services/aiQuota.service";

/**
 * GET /api/limits
 * Retourne les limites et l'utilisation actuelle de l'utilisateur
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Récupérer les limites
    const limits = await PlanLimitService.getLimitsForUser(userId);

    // Récupérer l'utilisation actuelle
    const usedToday = await AIQuotaService.getCurrentUsage(userId);

    // Calculer le reste disponible
    const remainingToday =
      limits.dailyAI === null
        ? null // Illimité
        : Math.max(0, limits.dailyAI - usedToday);

    return NextResponse.json({
      plan: limits.plan,
      dailyAI: limits.dailyAI,
      usedToday,
      remainingToday,
    });
  } catch (error) {
    console.error("Error fetching limits:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
