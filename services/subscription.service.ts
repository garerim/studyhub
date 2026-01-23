import { prisma } from "@/lib/prisma";
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { SubscriptionConflictError } from "@/errors/subscription.error";

/**
 * Service pour gérer les abonnements utilisateurs
 * RÈGLE MÉTIER : Un utilisateur sans abonnement actif est FREE
 * RÈGLE MÉTIER : Il ne doit JAMAIS exister de Subscription FREE en base
 * RÈGLE MÉTIER : Un seul abonnement ACTIVE maximum par utilisateur
 */
export class SubscriptionService {
  /**
   * Récupère l'abonnement actif d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @returns L'abonnement actif ou null si aucun
   */
  static async getActiveSubscription(userId: string) {
    return await prisma.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        // Vérifier que l'abonnement n'est pas expiré
        OR: [
          { endsAt: null },
          { endsAt: { gte: new Date() } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Récupère le plan d'abonnement actif d'un utilisateur
   * RÈGLE MÉTIER : Retourne FREE si aucun abonnement actif
   * @param userId - ID de l'utilisateur
   * @returns Le plan actif (FREE par défaut)
   */
  static async getActivePlan(userId: string): Promise<SubscriptionPlan> {
    const subscription = await this.getActiveSubscription(userId);
    return subscription?.plan ?? "FREE";
  }

  /**
   * Crée un nouvel abonnement pour un utilisateur
   * RÈGLE MÉTIER : Annule toute subscription active existante
   * RÈGLE MÉTIER : Empêche la création d'un abonnement FREE
   * @param userId - ID de l'utilisateur
   * @param plan - Plan d'abonnement (STUDENT ou PREMIUM uniquement)
   * @param provider - Provider de paiement (ex: "stripe", "mock")
   * @param providerSubId - ID de l'abonnement chez le provider
   * @returns L'abonnement créé
   */
  static async createSubscription(
    userId: string,
    plan: Exclude<SubscriptionPlan, "FREE">,
    provider: string,
    providerSubId: string
  ) {
    // RÈGLE MÉTIER : Empêcher la création d'un abonnement FREE
    if (plan === "FREE") {
      throw new SubscriptionConflictError("Impossible de créer un abonnement FREE");
    }

    // Vérifier l'unicité du providerSubId
    const existingProviderSub = await prisma.subscription.findUnique({
      where: { providerSubId },
    });

    if (existingProviderSub) {
      throw new SubscriptionConflictError(
        `Un abonnement avec l'ID provider ${providerSubId} existe déjà`
      );
    }

    // RÈGLE MÉTIER : Annuler toute subscription active existante
    await prisma.subscription.updateMany({
      where: {
        userId,
        status: "ACTIVE",
      },
      data: {
        status: "CANCELED",
        canceledAt: new Date(),
      },
    });

    // Créer le nouvel abonnement
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        plan,
        status: "ACTIVE",
        priceCents: 0, // Sera mis à jour par le provider
        currency: "EUR",
        provider,
        providerSubId,
      },
    });

    return subscription;
  }

  /**
   * Annule l'abonnement actif d'un utilisateur
   * RÈGLE MÉTIER : FREE devient effectif immédiatement
   * @param userId - ID de l'utilisateur
   * @returns L'abonnement annulé ou null si aucun abonnement actif
   */
  static async cancelActiveSubscription(userId: string) {
    const activeSubscription = await this.getActiveSubscription(userId);

    if (!activeSubscription) {
      return null;
    }

    const canceled = await prisma.subscription.update({
      where: { id: activeSubscription.id },
      data: {
        status: "CANCELED",
        canceledAt: new Date(),
      },
    });

    return canceled;
  }
}
