import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { QuizService } from "@/services/quiz.service";
import { QuotaExceededError } from "@/errors/quotaExceeded.error";
import { NotificationService } from "@/services/notification/notification.service";

export async function POST(
  request: Request,
  { params }: { params?: { userId?: string; matiereId?: string; quizId?: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = params ? await params : undefined;
  const userIdFromParams = resolvedParams?.userId;
  const quizIdFromParams = resolvedParams?.quizId;
  const { pathname } = new URL(request.url);
  const parts = pathname.split("/").filter(Boolean);
  const usersIndex = parts.indexOf("users");
  const quizesIndex = parts.indexOf("quizes");
  const userIdFromPath =
    usersIndex !== -1 ? parts[usersIndex + 1] : undefined;
  const quizIdFromPath =
    quizesIndex !== -1 ? parts[quizesIndex + 1] : undefined;

  const userId = userIdFromParams ?? userIdFromPath;
  const quizId = quizIdFromParams ?? quizIdFromPath;

  if (!userId || !quizId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  if (session.user.id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { topic, difficulty, numberOfQuestions, customPrompt } = body;

    // Vérifier que le quiz existe et récupérer la matière
    const quiz = await prisma.quiz.findFirst({
      where: {
        id: quizId,
        userId,
      },
      include: {
        matiere: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }
    // TODO: Intégrer avec une API IA réelle (OpenAI, etc.)
    // Pour l'instant, on génère des questions exemple
    // const generatedQuestions = generateExampleQuestions(
    //   topic || quiz.name,
    //   difficulty || "medium",
    //   numberOfQuestions || 5
    // );
    // Générer les questions avec l'IA (via QuizService)
    let generatedQuestions;
    try {
      generatedQuestions = await QuizService.generateQuizWithAI(userId, {
        topic: topic || quiz.name,
        difficulty: (difficulty as "easy" | "medium" | "hard") || "medium",
        numberOfQuestions: numberOfQuestions || 5,
        matiereName: quiz.matiere?.name,
        customPrompt: customPrompt || undefined,
      });
    } catch (aiError) {
      console.error("Error generating quiz with AI:", aiError);
      
      // Gérer l'erreur de quota dépassé
      if (aiError instanceof QuotaExceededError) {
        return NextResponse.json(
          {
            error: aiError.message,
            code: aiError.code,
            plan: aiError.plan,
            limit: aiError.limit,
            currentUsage: aiError.currentUsage,
          },
          { status: aiError.statusCode }
        );
      }

      return NextResponse.json(
        {
          error:
            aiError instanceof Error
              ? aiError.message
              : "Failed to generate quiz with AI. Please check your MISTRAL_API_KEY configuration.",
        },
        { status: 500 }
      );
    }

    // Supprimer les anciennes questions
    await prisma.answer.deleteMany({
      where: {
        question: {
          quizId,
        },
      },
    });
    await prisma.question.deleteMany({
      where: { quizId },
    });

    // Créer les nouvelles questions générées
    for (let i = 0; i < generatedQuestions.length; i++) {
      const q = generatedQuestions[i];
      await prisma.question.create({
        data: {
          quizId,
          question: q.question,
          type: q.type,
          order: i,
          points: q.points,
          answers: {
            create: q.answers.map((answer: { text: string; isCorrect: boolean }, index: number) => ({
              text: answer.text,
              isCorrect: answer.isCorrect,
              order: index,
            })),
          },
        },
      });
    }

    // Marquer le quiz comme généré par IA
    await prisma.quiz.update({
      where: { id: quizId },
      data: { isAIGenerated: true },
    });

    const updatedQuiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            answers: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    // Récupérer la dernière notification créée pour l'afficher dans le toast
    const lastNotification = await NotificationService.getUserNotifications(userId, {
      limit: 1,
      unreadOnly: true,
    });

    return NextResponse.json({
      ...updatedQuiz,
      notification: lastNotification[0] || null,
    });
  } catch (error) {
    console.error("Error generating quiz:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate quiz",
      },
      { status: 500 }
    );
  }
}
// Fonction temporaire pour générer des questions exemple
// À remplacer par une vraie intégration IA
// function generateExampleQuestions(
//   topic: string,
//   difficulty: string,
//   count: number
// ) {
//   const questions = [];
//   for (let i = 1; i <= count; i++) {
//     questions.push({
//       question: `Question ${i} sur ${topic} (${difficulty})`,
//       type: "multiple-choice",
//       points: 1,
//       answers: [
//         { text: "Réponse correcte", isCorrect: true },
//         { text: "Réponse incorrecte 1", isCorrect: false },
//         { text: "Réponse incorrecte 2", isCorrect: false },
//         { text: "Réponse incorrecte 3", isCorrect: false },
//       ],
//     });
//   }
//   return questions;
// }
