import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { ChatService } from "@/services/chat.service";
import { QuotaExceededError } from "@/errors/quotaExceeded.error";

/**
 * POST /api/ai/chat
 * Route exemple pour les appels IA
 * RÈGLE MÉTIER : Les routes API ne contiennent AUCUNE logique métier
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

    // Récupérer le body
    const body = await request.json().catch(() => ({}));
    const { message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message requis" },
        { status: 400 }
      );
    }

    // Générer la réponse avec l'IA (via ChatService)
    const content = await ChatService.generateChatResponse(userId, message);

    const response = {
      content,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    // Gérer l'erreur de quota dépassé
    if (error instanceof QuotaExceededError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          plan: error.plan,
          limit: error.limit,
          currentUsage: error.currentUsage,
        },
        { status: error.statusCode }
      );
    }

    // Autres erreurs
    console.error("Error in AI chat route:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
