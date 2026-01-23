/**
 * Erreur métier levée lorsque le quota d'appels IA est dépassé
 */
export class QuotaExceededError extends Error {
  public readonly statusCode: number = 429;
  public readonly code: string = "QUOTA_EXCEEDED";

  constructor(
    public readonly plan: string,
    public readonly limit: number | null,
    public readonly currentUsage: number
  ) {
    const message =
      limit === null
        ? "Quota illimité mais erreur inattendue"
        : `Quota journalier dépassé: ${currentUsage}/${limit} appels (plan: ${plan})`;
    super(message);
    this.name = "QuotaExceededError";
  }
}
