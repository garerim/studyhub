"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NotificationList } from "./NotificationList";
import { useNotifications } from "@/hooks/useNotifications";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  // Charger uniquement le compteur pour le badge
  const { unreadCount, isLoading, refetch } = useNotifications({ limit: 1, unreadOnly: true });

  // Rafraîchir le badge périodiquement pour détecter les nouvelles notifications
  useEffect(() => {
    // Ne pas poller si le popover est ouvert (NotificationList gère déjà le rafraîchissement)
    if (isOpen) {
      return;
    }

    const interval = setInterval(() => {
      refetch();
    }, 30000); // Rafraîchir toutes les 30 secondes

    return () => clearInterval(interval);
  }, [isOpen, refetch]);

  // Rafraîchir quand la fenêtre reprend le focus (utilisateur revient sur l'onglet)
  useEffect(() => {
    const handleFocus = () => {
      if (!isOpen) {
        refetch();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [isOpen, refetch]);

  // Rafraîchir le badge quand le popover se ferme (au cas où des notifications ont été marquées comme lues)
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Rafraîchir le compteur quand le popover se ferme
      setTimeout(() => {
        refetch();
      }, 100);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {isLoading ? (
            <Loader2 className="absolute -top-1 -right-1 h-3 w-3 animate-spin" />
          ) : unreadCount > 0 ? (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          ) : null}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        {/* NotificationList ne se charge que quand le popover est ouvert */}
        {isOpen && <NotificationList />}
      </PopoverContent>
    </Popover>
  );
}
