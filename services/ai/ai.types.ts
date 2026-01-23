/**
 * Types pour le service IA
 */

export type AITaskType = "QUIZ" | "COURSE" | "SUMMARY" | "CHAT";

export interface AIPayload {
  taskType: AITaskType;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
  additionalParams?: Record<string, unknown>;
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIProvider {
  generateText(payload: AIPayload): Promise<AIResponse>;
}
