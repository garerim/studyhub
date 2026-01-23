/**
 * Service IA - Façade publique obligatoire
 * Responsabilités :
 * - Vérifier le quota avant chaque appel
 * - Router vers le provider IA
 * - Retourner la réponse
 */
import { AIQuotaService } from "../aiQuota.service";
import { MistralProvider } from "./mistral.provider";
import { NotificationService } from "../notification/notification.service";
import type { AIPayload, AIResponse } from "./ai.types";

export class AIService {
  private static provider: MistralProvider | null = null;

  private static getProvider(): MistralProvider {
    if (!this.provider) {
      this.provider = new MistralProvider();
    }
    return this.provider;
  }

  /**
   * Génère du texte avec l'IA
   * Vérifie automatiquement le quota avant l'appel
   * @param userId - ID de l'utilisateur
   * @param payload - Payload pour l'appel IA
   * @returns Réponse de l'IA
   * @throws {QuotaExceededError} Si le quota est dépassé
   */
  static async generateText(userId: string, payload: AIPayload): Promise<AIResponse> {
    // Vérifier et incrémenter le quota (lève QuotaExceededError si dépassé)
    await AIQuotaService.checkAndIncrementDailyUsage(userId);

    try {
      // Router vers le provider IA
      const provider = this.getProvider();
      const response = await provider.generateText(payload);

      // Notifier le succès pour certaines tâches importantes
      if (payload.taskType === "QUIZ" || payload.taskType === "COURSE") {
        // La notification sera envoyée par QuizService ou CourseService
        // pour avoir plus de contexte
      }

      return response;
    } catch (error) {
      // Notifier en cas d'erreur IA
      await NotificationService.notify({
        userId,
        type: "AI_ERROR",
        title: "Erreur lors de l'appel IA",
        message: error instanceof Error ? error.message : "Une erreur est survenue lors de l'appel à l'IA.",
      }).catch((err) => {
        console.error("Error sending AI error notification:", err);
      });

      throw error;
    }
  }
}
