import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/auth";
import { NotificationService } from "@/services/notification/notification.service";

const markAsReadSchema = z.object({
  notificationId: z.string().min(1).optional(),
  markAll: z.boolean().optional(),
});

/**
 * POST /api/notifications/read
 * Marque une notification ou toutes les notifications comme lues
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
    const parsed = markAsReadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.errors },
        { status: 400 }
      );
    }

    if (parsed.data.markAll) {
      // Marquer toutes les notifications comme lues
      const count = await NotificationService.markAllAsRead(userId);
      return NextResponse.json({ count });
    } else if (parsed.data.notificationId) {
      // Marquer une notification spécifique comme lue
      const notification = await NotificationService.markAsRead(
        parsed.data.notificationId,
        userId
      );
      return NextResponse.json(notification);
    } else {
      return NextResponse.json(
        { error: "notificationId ou markAll requis" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error marking notification as read:", error);
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
