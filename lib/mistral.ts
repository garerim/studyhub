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

export async function generateQuizWithAI(
  options: GenerateQuizOptions
): Promise<Question[]> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error("MISTRAL_API_KEY is not configured");
  }

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

  // Appel API
  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "mistral-medium-latest",
      messages: [
        {
          role: "system",
          content: "Tu génères des quiz éducatifs. Réponds UNIQUEMENT en JSON valide.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Mistral API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("No content in Mistral response");
  }

  // Nettoyer le markdown si présent
  const jsonContent = content
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
      questions = (Array.isArray(obj.questions) ? obj.questions : Array.isArray(obj.quiz) ? obj.quiz : []) as Question[];
    } else {
      questions = [];
    }
  } catch (error) {
    throw new Error(`Could not parse JSON: ${error instanceof Error ? error.message : "Unknown error"}`);
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
        const isTrueCorrect = answers.find((a) => a.text.toLowerCase().includes("vrai"))?.isCorrect ?? false;
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

  return validatedQuestions;
}
