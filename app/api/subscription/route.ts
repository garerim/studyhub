import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { SubscriptionService } from "@/services/subscription.service";

/**
 * GET /api/subscription
 * Retourne le plan d'abonnement actif de l'utilisateur
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
    const subscription = await SubscriptionService.getActiveSubscription(userId);
    const plan = await SubscriptionService.getActivePlan(userId);

    return NextResponse.json({
      plan,
      status: subscription?.status ?? null,
      startedAt: subscription?.startedAt ?? null,
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
