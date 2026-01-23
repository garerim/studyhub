import { prisma } from "@/lib/prisma";
import { SubscriptionService } from "./subscription.service";
import { PlanLimitService } from "./planLimit.service";
import { QuotaExceededError } from "@/errors/quotaExceeded.error";

/**
 * Service central pour gérer les quotas d'appels IA
 * RÈGLE MÉTIER : Le compteur est journalier (reset automatique par date)
 * RÈGLE MÉTIER : Les routes API ne contiennent AUCUNE logique métier
 * RÈGLE MÉTIER : PREMIUM (dailyAI = null) = accès illimité
 */
export class AIQuotaService {
  /**
   * Normalise une date à 00:00:00 pour le compteur journalier
   */
  private static normalizeDate(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }

  /**
   * Vérifie et incrémente le compteur d'utilisation IA pour un utilisateur
   * @param userId - ID de l'utilisateur
   * @throws {QuotaExceededError} Si le quota est dépassé
   */
  static async checkAndIncrementDailyUsage(userId: string): Promise<void> {
    // Récupérer le plan actif
    const plan = await SubscriptionService.getActivePlan(userId);

    // Récupérer la limite journalière
    const dailyLimit = await PlanLimitService.getDailyLimitForPlan(plan);

    // RÈGLE MÉTIER : PREMIUM (dailyAI = null) = accès illimité
    if (dailyLimit === null) {
      return;
    }

    // Normaliser la date (00:00)
    const today = this.normalizeDate(new Date());

    // Récupérer l'utilisation actuelle
    const currentUsage = await prisma.aIUsageDaily.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    const currentCount = currentUsage?.count ?? 0;

    // Bloquer si quota déjà dépassé (avant incrémentation)
    if (currentCount >= dailyLimit) {
      throw new QuotaExceededError(plan, dailyLimit, currentCount);
    }

    // Incrémenter le compteur
    await prisma.aIUsageDaily.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      create: {
        userId,
        date: today,
        count: 1,
      },
      update: {
        count: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Récupère l'utilisation actuelle pour un utilisateur aujourd'hui
   * @param userId - ID de l'utilisateur
   * @returns Le nombre d'appels IA utilisés aujourd'hui
   */
  static async getCurrentUsage(userId: string): Promise<number> {
    const today = this.normalizeDate(new Date());

    const usage = await prisma.aIUsageDaily.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    return usage?.count ?? 0;
  }
}
