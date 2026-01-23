import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/auth";
import { SubscriptionService } from "@/services/subscription.service";
import { SubscriptionConflictError } from "@/errors/subscription.error";
import { NotificationService } from "@/services/notification/notification.service";

const createSubscriptionSchema = z.object({
  plan: z.enum(["STUDENT", "PREMIUM"]),
});

/**
 * POST /api/subscription/create
 * Crée un nouvel abonnement pour l'utilisateur
 * RÈGLE MÉTIER : Annule toute subscription active existante
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json().catch(() => ({}));
    const parsed = createSubscriptionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.errors },
        { status: 400 }
      );
    }

    // Mock provider pour la démo
    const provider = "mock";
    const providerSubId = `mock_${userId}_${Date.now()}`;

    const subscription = await SubscriptionService.createSubscription(
      userId,
      parsed.data.plan,
      provider,
      providerSubId
    );

    // Récupérer la dernière notification créée pour l'afficher dans le toast
    const lastNotification = await NotificationService.getUserNotifications(userId, {
      limit: 1,
      unreadOnly: true,
    });

    return NextResponse.json(
      {
        ...subscription,
        notification: lastNotification[0] || null,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof SubscriptionConflictError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
        },
        { status: error.statusCode }
      );
    }

    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
