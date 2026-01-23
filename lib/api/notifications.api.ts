/**
 * API helpers pour les notifications
 */

export type NotificationType =
  | "SUBSCRIPTION_CREATED"
  | "SUBSCRIPTION_CANCELED"
  | "QUOTA_WARNING"
  | "QUOTA_EXCEEDED"
  | "AI_SUCCESS"
  | "AI_ERROR"
  | "QUIZ_GENERATED"
  | "COURSE_PROCESSED"
  | "INFO";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

/**
 * Récupère les notifications de l'utilisateur
 */
export async function getNotifications(
  options?: {
    limit?: number;
    unreadOnly?: boolean;
  },
  signal?: AbortSignal
): Promise<NotificationsResponse> {
  const params = new URLSearchParams();
  if (options?.limit) {
    params.append("limit", options.limit.toString());
  }
  if (options?.unreadOnly) {
    params.append("unreadOnly", "true");
  }

  const response = await fetch(`/api/notifications?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    signal,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Erreur inconnue" }));
    throw new Error(error.error || "Erreur lors de la récupération des notifications");
  }

  return response.json();
}

/**
 * Marque une notification comme lue
 */
export async function markNotificationAsRead(notificationId: string): Promise<Notification> {
  const response = await fetch("/api/notifications/read", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ notificationId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Erreur inconnue" }));
    throw new Error(error.error || "Erreur lors du marquage de la notification");
  }

  return response.json();
}

/**
 * Marque toutes les notifications comme lues
 */
export async function markAllNotificationsAsRead(): Promise<{ count: number }> {
  const response = await fetch("/api/notifications/read", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ markAll: true }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Erreur inconnue" }));
    throw new Error(error.error || "Erreur lors du marquage des notifications");
  }

  return response.json();
}
