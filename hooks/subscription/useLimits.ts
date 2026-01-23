"use client";

import { useState, useEffect } from "react";
import { getLimits, type LimitsResponse } from "@/lib/api/limits.api";

export function useLimits() {
  const [limits, setLimits] = useState<LimitsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLimits = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getLimits();
      setLimits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLimits();
  }, []);

  return {
    limits,
    isLoading,
    error,
    refetch: fetchLimits,
  };
}
