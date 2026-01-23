"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type NotificationsResponse,
} from "@/lib/api/notifications.api";

export function useNotifications(options?: { limit?: number; unreadOnly?: boolean }) {
  const [data, setData] = useState<NotificationsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Mémoriser les options pour éviter les re-renders inutiles
  const memoizedOptions = useMemo(
    () => options,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options?.limit, options?.unreadOnly]
  );

  const fetchNotifications = useCallback(async () => {
    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Créer un nouveau AbortController
    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      setError(null);
      const response = await getNotifications(memoizedOptions, abortControllerRef.current.signal);
      
      // Vérifier si la requête n'a pas été annulée
      if (!abortControllerRef.current.signal.aborted) {
        setData(response);
      }
    } catch (err) {
      // Ignorer les erreurs d'annulation
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      if (!abortControllerRef.current?.signal.aborted) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [memoizedOptions]);

  useEffect(() => {
    fetchNotifications();
    
    // Cleanup: annuler la requête si le composant est démonté
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      await fetchNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      throw err;
    }
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
      await fetchNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      throw err;
    }
  }, [fetchNotifications]);

  return {
    notifications: data?.notifications ?? [],
    unreadCount: data?.unreadCount ?? 0,
    isLoading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
