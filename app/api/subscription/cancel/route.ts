import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { SubscriptionService } from "@/services/subscription.service";
import { NotificationService } from "@/services/notification/notification.service";

/**
 * POST /api/subscription/cancel
 * Annule l'abonnement actif de l'utilisateur
 * RÈGLE MÉTIER : FREE devient effectif immédiatement
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const canceled = await SubscriptionService.cancelActiveSubscription(userId);

    if (!canceled) {
      return NextResponse.json(
        { error: "Aucun abonnement actif à annuler" },
        { status: 404 }
      );
    }

    // Récupérer la dernière notification créée pour l'afficher dans le toast
    const lastNotification = await NotificationService.getUserNotifications(userId, {
      limit: 1,
      unreadOnly: true,
    });

    return NextResponse.json({
      ...canceled,
      notification: lastNotification[0] || null,
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
