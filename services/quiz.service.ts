/**
 * Service métier pour la génération de quiz
 * Utilise AIService pour les appels IA
 */
import { AIService } from "./ai/ai.service";
import { NotificationService } from "./notification/notification.service";
import type { AITaskType } from "./ai/ai.types";

type Question = {
  question: string;
  type: string;
  points: number;
  answers: {
    text: string;
    isCorrect: boolean;
  }[];
};

type GenerateQuizOptions = {
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  numberOfQuestions: number;
  matiereName?: string;
  customPrompt?: string;
};

export class QuizService {
  /**
   * Génère un quiz avec l'IA
   * @param userId - ID de l'utilisateur
   * @param options - Options de génération
   * @returns Tableau de questions générées
   */
  static async generateQuizWithAI(
    userId: string,
    options: GenerateQuizOptions
  ): Promise<Question[]> {
    const { topic, difficulty, numberOfQuestions, matiereName, customPrompt } = options;

    // Construire le prompt
    let prompt = `Génère un quiz de ${numberOfQuestions} questions sur "${topic}"${matiereName ? ` pour ${matiereName}` : ""}.
Niveau: ${difficulty === "easy" ? "facile" : difficulty === "medium" ? "moyen" : "difficile"}
Types: "multiple-choice" (4 réponses) ou "true-false" (Vrai/Faux)`;

    if (customPrompt) {
      prompt += `\n\n${customPrompt}`;
    }

    prompt += `\n\nRéponds UNIQUEMENT en JSON valide (tableau de questions):
[
  {
    "question": "Texte",
    "type": "multiple-choice" ou "true-false",
    "points": 1,
    "answers": [
      {"text": "...", "isCorrect": true/false}
    ]
  }
]`;

    // Appeler AIService (gère automatiquement le quota)
    const aiResponse = await AIService.generateText(userId, {
      taskType: "QUIZ",
      prompt,
      systemPrompt: "Tu génères des quiz éducatifs. Réponds UNIQUEMENT en JSON valide.",
      temperature: 0.7,
      maxTokens: 4000,
    });

    // Nettoyer le markdown si présent
    const jsonContent = aiResponse.content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    // Parser le JSON
    let questions: Question[];
    try {
      const parsed = JSON.parse(jsonContent) as unknown;
      if (Array.isArray(parsed)) {
        questions = parsed as Question[];
      } else if (parsed && typeof parsed === "object") {
        const obj = parsed as Record<string, unknown>;
        questions = (Array.isArray(obj.questions)
          ? obj.questions
          : Array.isArray(obj.quiz)
            ? obj.quiz
            : []) as Question[];
      } else {
        questions = [];
      }
    } catch (error) {
      throw new Error(
        `Could not parse JSON: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    // Valider et nettoyer les questions
    const validatedQuestions = questions
      .slice(0, numberOfQuestions)
      .map((q: Partial<Question> & Record<string, unknown>) => {
        const type = (q.type as string) || "multiple-choice";
        let answers = (Array.isArray(q.answers) ? q.answers : [])
          .map((a: { text?: string; answer?: string; isCorrect?: boolean }) => ({
            text: ((a.text || a.answer || "") as string).trim(),
            isCorrect: a.isCorrect === true,
          }))
          .filter((a) => a.text);

        // Normaliser vrai/faux
        if (type === "true-false" && answers.length !== 2) {
          const isTrueCorrect =
            answers.find((a) => a.text.toLowerCase().includes("vrai"))?.isCorrect ?? false;
          answers = [
            { text: "Vrai", isCorrect: isTrueCorrect },
            { text: "Faux", isCorrect: !isTrueCorrect },
          ];
        } else if (type === "multiple-choice") {
          answers = answers.slice(0, 4);
        }

        return {
          question: ((q.question || q.text || "") as string).trim(),
          type,
          points: (q.points as number) || 1,
          answers: answers.map((a) => ({
            text: a.text,
            isCorrect: a.isCorrect,
          })),
        };
      })
      .filter((q) => q.question && q.answers.length >= 2 && q.answers.some((a) => a.isCorrect));

    if (validatedQuestions.length === 0) {
      throw new Error("No valid questions generated");
    }

    // Notifier l'utilisateur du succès
    await NotificationService.notify({
      userId,
      type: "QUIZ_GENERATED",
      title: "Quiz généré avec succès",
      message: `Votre quiz "${topic}" a été généré avec ${validatedQuestions.length} question(s).`,
    }).catch((err) => {
      console.error("Error sending quiz notification:", err);
    });

    return validatedQuestions;
  }
}
