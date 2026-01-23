/**
 * Erreur métier levée lors d'un conflit d'abonnement
 */
export class SubscriptionConflictError extends Error {
  public readonly statusCode: number = 409;
  public readonly code: string = "SUBSCRIPTION_CONFLICT";

  constructor(message: string = "Conflit d'abonnement") {
    super(message);
    this.name = "SubscriptionConflictError";
  }
}
