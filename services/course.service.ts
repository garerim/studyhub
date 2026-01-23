/**
 * Service métier pour le traitement de cours
 * Utilise AIService pour les appels IA
 */
import { AIService } from "./ai/ai.service";
import { NotificationService } from "./notification/notification.service";

type ProcessCourseOptions = {
  originalText?: string | null;
  imageUrl?: string | null;
  model?: string;
};

export class CourseService {
  /**
   * Traite un cours avec l'IA (texte et/ou image)
   * @param userId - ID de l'utilisateur
   * @param options - Options de traitement
   * @returns Texte traité par l'IA
   */
  static async processCourseWithAI(
    userId: string,
    options: ProcessCourseOptions
  ): Promise<string> {
    const { originalText, imageUrl, model } = options;

    if (!originalText && !imageUrl) {
      throw new Error("Aucun texte ou image à traiter");
    }

    // Construire le prompt
    let prompt = `Tu es un assistant pédagogique. Transforme les informations suivantes en un cours structuré, clair et détaillé. Organise les informations de manière logique, ajoute des explications si nécessaire, et formate le texte de manière professionnelle.

`;

    if (originalText) {
      prompt += `Notes originales (texte):
${originalText}

`;
    }

    if (imageUrl) {
      prompt += `Une image de notes est également fournie. Analyse-la et intègre son contenu dans le cours structuré.

`;
    }

    prompt += `Cours structuré:`;

    // Préparer les paramètres additionnels pour Mistral (support images)
    const additionalParams: Record<string, unknown> = {};
    const messageParts: Array<
      { type: "text"; text: string } | { type: "image_url"; image_url: string }
    > = [{ type: "text", text: prompt }];

    if (imageUrl) {
      try {
        const imageResponse = await fetch(imageUrl);
        if (imageResponse.ok) {
          const imageBuffer = await imageResponse.arrayBuffer();
          const imageBase64 = Buffer.from(imageBuffer).toString("base64");
          const imageMimeType = imageResponse.headers.get("content-type") || "image/jpeg";
          messageParts.push({
            type: "image_url",
            image_url: `data:${imageMimeType};base64,${imageBase64}`,
          });
        }
      } catch (imageError) {
        console.warn("Impossible de charger l'image pour le traitement:", imageError);
        if (!originalText) {
          throw new Error("Impossible de charger l'image et aucun texte disponible.");
        }
      }
    }

    // Si on a des images, utiliser le format messages avec content array
    if (messageParts.length > 1) {
      additionalParams.messages = [
        {
          role: "user",
          content: messageParts,
        },
      ];
    }

    // Appeler AIService (gère automatiquement le quota)
    const aiResponse = await AIService.generateText(userId, {
      taskType: "COURSE",
      prompt: messageParts.length === 1 ? prompt : "", // Vide si on utilise messages dans additionalParams
      systemPrompt: undefined,
      temperature: 0.2,
      model: model || undefined,
      additionalParams: Object.keys(additionalParams).length > 0 ? additionalParams : undefined,
    });

    // Extraire le contenu
    const processedText = Array.isArray(aiResponse.content)
      ? aiResponse.content.map((part: { text?: string }) => part.text || "").join("")
      : typeof aiResponse.content === "string"
        ? aiResponse.content
        : "";

    await NotificationService.notify({
      userId,
      type: "COURSE_PROCESSED",
      title: "Cours traité avec succès",
      message: `Votre cours a été traité avec succès.`,
    }).catch((err) => {
      console.error("Error sending course processed notification:", err);
    });

    return processedText;
  }
}
