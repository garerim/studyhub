"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";
import { Loader2, CheckCheck } from "lucide-react";
import { NotificationItem } from "./NotificationItem";

export function NotificationList() {
  const { notifications, unreadCount, isLoading, error, markAsRead, markAllAsRead, refetch } =
    useNotifications({ limit: 50 });

  // Rafraîchir périodiquement quand la liste est ouverte
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000); // Rafraîchir toutes les 30 secondes

    return () => clearInterval(interval);
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-destructive">
        Erreur : {error}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Aucune notification
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold">Notifications</h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="h-8 text-xs"
          >
            <CheckCheck className="mr-1 h-3 w-3" />
            Tout marquer comme lu
          </Button>
        )}
      </div>
      <ScrollArea className="h-[400px]">
        <div className="divide-y">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              compact
              onMarkAsRead={() => markAsRead(notification.id)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
