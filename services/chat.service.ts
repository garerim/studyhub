/**
 * Service métier pour le chat IA
 * Utilise AIService pour les appels IA
 */
import { AIService } from "./ai/ai.service";

export class ChatService {
  /**
   * Génère une réponse de chat avec l'IA
   * @param userId - ID de l'utilisateur
   * @param message - Message de l'utilisateur
   * @returns Réponse de l'IA
   */
  static async generateChatResponse(userId: string, message: string): Promise<string> {
    const aiResponse = await AIService.generateText(userId, {
      taskType: "CHAT",
      prompt: message,
      systemPrompt: "Tu es un assistant pédagogique utile et bienveillant.",
      temperature: 0.7,
      maxTokens: 2000,
    });

    return aiResponse.content;
  }
}
