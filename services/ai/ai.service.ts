/**
 * Service IA - Façade publique obligatoire
 * Responsabilités :
 * - Vérifier le quota avant chaque appel
 * - Router vers le provider IA
 * - Retourner la réponse
 */
import { AIQuotaService } from "../aiQuota.service";
import { MistralProvider } from "./mistral.provider";
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

    // Router vers le provider IA
    const provider = this.getProvider();
    return provider.generateText(payload);
  }
}
