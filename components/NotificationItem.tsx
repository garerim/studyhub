"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { Notification } from "@/lib/api/notifications.api";

const NOTIFICATION_ICONS: Record<string, string> = {
  SUBSCRIPTION_CREATED: "✅",
  SUBSCRIPTION_CANCELED: "❌",
  QUOTA_WARNING: "⚠️",
  QUOTA_EXCEEDED: "🚫",
  AI_SUCCESS: "✨",
  AI_ERROR: "❌",
  QUIZ_GENERATED: "📝",
  COURSE_PROCESSED: "📚",
  INFO: "ℹ️",
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: () => void | Promise<void>;
  compact?: boolean;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  compact = false,
}: NotificationItemProps) {
  const icon = NOTIFICATION_ICONS[notification.type] || "ℹ️";

  const handleMarkAsRead = async () => {
    try {
      // Si onMarkAsRead est fourni, l'utiliser (elle gère déjà le refetch)
      if (onMarkAsRead) {
        await onMarkAsRead();
      } else {
        // Fallback: utiliser l'API directement si onMarkAsRead n'est pas fourni
        const { markNotificationAsRead } = await import("@/lib/api/notifications.api");
        await markNotificationAsRead(notification.id);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  if (compact) {
    return (
      <div
        className={cn(
          "flex gap-3 p-4 transition-colors hover:bg-muted/50",
          !notification.read && "bg-muted/30"
        )}
      >
        <div className="flex-shrink-0 text-lg">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{notification.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {notification.message}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {format(new Date(notification.createdAt), "PPP 'à' HH:mm", { locale: fr })}
              </p>
            </div>
            {!notification.read && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
                onClick={handleMarkAsRead}
              >
                <Check className="h-3 w-3" />
                <span className="sr-only">Marquer comme lu</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn(!notification.read && "border-primary/50")}>
      <div className="flex gap-4 p-4">
        <div className="flex-shrink-0 text-2xl">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{notification.title}</h3>
                {!notification.read && (
                  <span className="h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {notification.message}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {format(new Date(notification.createdAt), "PPP 'à' HH:mm", { locale: fr })}
              </p>
            </div>
            {!notification.read && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAsRead}
              >
                <Check className="mr-1 h-4 w-4" />
                Marquer comme lu
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
