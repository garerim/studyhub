import { prisma } from "@/lib/prisma";
import { SubscriptionPlan } from "@prisma/client";
import { SubscriptionService } from "./subscription.service";

/**
 * Service pour gérer les limites par plan d'abonnement
 * RÈGLE MÉTIER : Les quotas IA sont définis par plan, pas par utilisateur
 */
export class PlanLimitService {
  /**
   * Récupère la limite journalière d'appels IA pour un plan
   * @param plan - Plan d'abonnement
   * @returns La limite journalière (null = illimité)
   */
  static async getDailyLimitForPlan(plan: SubscriptionPlan): Promise<number | null> {
    const planLimit = await prisma.planLimit.findUnique({
      where: { plan },
    });

    // Si pas de limite définie, retourner null (illimité)
    if (!planLimit) {
      return null;
    }

    return planLimit.dailyAI;
  }

  /**
   * Récupère les limites effectives pour un utilisateur
   * @param userId - ID de l'utilisateur
   * @returns Objet avec plan et dailyAI
   */
  static async getLimitsForUser(userId: string): Promise<{
    plan: SubscriptionPlan;
    dailyAI: number | null;
  }> {
    const plan = await SubscriptionService.getActivePlan(userId);
    const dailyAI = await this.getDailyLimitForPlan(plan);

    return {
      plan,
      dailyAI,
    };
  }
}
