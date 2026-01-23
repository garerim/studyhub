import { prisma } from "@/lib/prisma";
import { SubscriptionService } from "./subscription.service";
import { PlanLimitService } from "./planLimit.service";
import { QuotaExceededError } from "@/errors/quotaExceeded.error";
import { NotificationService } from "./notification/notification.service";

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

    // Avertir si quota proche d'être atteint (80%)
    const warningThreshold = Math.floor(dailyLimit * 0.8);
    if (currentCount === warningThreshold) {
      await NotificationService.notify({
        userId,
        type: "QUOTA_WARNING",
        title: "Quota IA presque atteint",
        message: `Vous avez utilisé ${currentCount}/${dailyLimit} appels IA aujourd'hui. Il vous reste ${dailyLimit - currentCount} appels.`,
      }).catch((err) => {
        console.error("Error sending quota warning notification:", err);
      });
    }

    // Bloquer si quota déjà dépassé (avant incrémentation)
    if (currentCount >= dailyLimit) {
      // Notifier avant de lever l'erreur
      await NotificationService.notify({
        userId,
        type: "QUOTA_EXCEEDED",
        title: "Quota IA dépassé",
        message: `Vous avez atteint votre limite de ${dailyLimit} appels IA aujourd'hui (plan ${plan}). Passez à un plan supérieur pour continuer.`,
      }).catch((err) => {
        console.error("Error sending quota exceeded notification:", err);
      });

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
