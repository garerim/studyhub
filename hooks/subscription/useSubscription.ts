"use client";

import { useState, useEffect } from "react";
import {
  getSubscription,
  createSubscription,
  cancelSubscription,
  type SubscriptionResponse,
  type CreateSubscriptionRequest,
} from "@/lib/api/subscription.api";

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
      await createSubscription(data);
      await fetchSubscription();
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
      await cancelSubscription();
      await fetchSubscription();
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
