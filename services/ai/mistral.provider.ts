/**
 * Provider Mistral - Logique HTTP uniquement
 * Ne connaît ni le user, ni le quota, ni les abonnements
 */
import type { AIProvider, AIPayload, AIResponse } from "./ai.types";

export class MistralProvider implements AIProvider {
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.mistral.ai/v1/chat/completions";
  private readonly defaultModel = "mistral-medium-latest";

  constructor() {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      throw new Error("MISTRAL_API_KEY is not configured");
    }
    this.apiKey = apiKey;
  }

  async generateText(payload: AIPayload): Promise<AIResponse> {
    const {
      prompt,
      systemPrompt,
      temperature = 0.7,
      maxTokens = 4000,
      model = this.defaultModel,
      additionalParams,
    } = payload;

    // Si additionalParams contient des messages (pour les images), les utiliser directement
    let messages: Array<{ role: string; content: unknown }>;
    if (additionalParams?.messages && Array.isArray(additionalParams.messages)) {
      messages = additionalParams.messages as Array<{ role: string; content: unknown }>;
      if (systemPrompt) {
        messages.unshift({
          role: "system",
          content: systemPrompt,
        });
      }
    } else {
      // Format standard texte uniquement
      messages = [];
      if (systemPrompt) {
        messages.push({
          role: "system",
          content: systemPrompt,
        });
      }
      messages.push({
        role: "user",
        content: prompt,
      });
    }

    const requestBody: Record<string, unknown> = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    };

    // Ajouter les autres paramètres additionnels (sauf messages déjà traité)
    if (additionalParams) {
      const { messages: _, ...restParams } = additionalParams;
      Object.assign(requestBody, restParams);
    }

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Mistral API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("No content in Mistral response");
    }

    return {
      content,
      model: data.model || model,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens || 0,
            completionTokens: data.usage.completion_tokens || 0,
            totalTokens: data.usage.total_tokens || 0,
          }
        : undefined,
    };
  }
}
