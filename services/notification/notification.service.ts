/**
 * Service de notifications - Point d'entrée unique
 * RÈGLE MÉTIER : Les notifications sont déclenchées UNIQUEMENT depuis les services métier
 * RÈGLE MÉTIER : Les routes API et pages UI ne contiennent aucune logique de notification
 */
import { prisma } from "@/lib/prisma";
import type { CreateNotificationParams, Notification } from "./notification.types";

export class NotificationService {
  /**
   * Crée une notification pour un utilisateur
   * @param params - Paramètres de la notification
   * @returns La notification créée
   */
  static async notify(params: CreateNotificationParams): Promise<Notification> {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        read: false,
      },
    });

    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type as CreateNotificationParams["type"],
      title: notification.title,
      message: notification.message,
      read: notification.read,
      createdAt: notification.createdAt,
    };
  }

  /**
   * Marque une notification comme lue
   * @param notificationId - ID de la notification
   * @param userId - ID de l'utilisateur (vérification de sécurité)
   * @returns La notification mise à jour
   */
  static async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId, // Vérification de sécurité
      },
      data: {
        read: true,
      },
    });

    if (notification.count === 0) {
      throw new Error("Notification not found or unauthorized");
    }

    const updated = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!updated) {
      throw new Error("Notification not found");
    }

    return {
      id: updated.id,
      userId: updated.userId,
      type: updated.type as CreateNotificationParams["type"],
      title: updated.title,
      message: updated.message,
      read: updated.read,
      createdAt: updated.createdAt,
    };
  }

  /**
   * Marque toutes les notifications d'un utilisateur comme lues
   * @param userId - ID de l'utilisateur
   * @returns Nombre de notifications mises à jour
   */
  static async markAllAsRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return result.count;
  }

  /**
   * Récupère les notifications d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @param options - Options de récupération
   * @returns Liste des notifications
   */
  static async getUserNotifications(
    userId: string,
    options?: {
      limit?: number;
      unreadOnly?: boolean;
    }
  ): Promise<Notification[]> {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(options?.unreadOnly ? { read: false } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: options?.limit,
    });

    return notifications.map((n) => ({
      id: n.id,
      userId: n.userId,
      type: n.type as CreateNotificationParams["type"],
      title: n.title,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt,
    }));
  }

  /**
   * Compte les notifications non lues d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @returns Nombre de notifications non lues
   */
  static async getUnreadCount(userId: string): Promise<number> {
    return await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }
}
