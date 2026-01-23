"use client";

import { useState, useEffect } from "react";
import {
  getSubscription,
  createSubscription,
  cancelSubscription,
  type SubscriptionResponse,
  type CreateSubscriptionRequest,
} from "@/lib/api/subscription.api";
import { toastFromNotification } from "@/lib/toast";

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getSubscription();
      setSubscription(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const create = async (data: CreateSubscriptionRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await createSubscription(data);
      await fetchSubscription();
      
      // Afficher le toast si une notification a été créée
      if (response.notification) {
        toastFromNotification(
          response.notification.type,
          response.notification.title,
          response.notification.message
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cancel = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await cancelSubscription();
      await fetchSubscription();
      
      // Afficher le toast si une notification a été créée
      if (response.notification) {
        toastFromNotification(
          response.notification.type,
          response.notification.title,
          response.notification.message
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    subscription,
    isLoading,
    error,
    create,
    cancel,
    refetch: fetchSubscription,
  };
}
