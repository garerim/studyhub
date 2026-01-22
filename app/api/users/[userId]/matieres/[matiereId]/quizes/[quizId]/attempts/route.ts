import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

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
    const { answers } = body; // { questionId: answerId }

    // Récupérer le quiz avec toutes les questions et réponses
    const quiz = await prisma.quiz.findFirst({
      where: {
        id: quizId,
        userId,
      },
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

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Calculer le score
    let score = 0;
    let totalPoints = 0;

    for (const question of quiz.questions) {
      totalPoints += question.points;
      const userAnswer = answers[question.id];
      
      if (userAnswer) {
        if (question.type === "short-answer") {
          // Pour les réponses courtes, comparer le texte (insensible à la casse)
          const correctAnswer = question.answers.find((a) => a.isCorrect);
          if (correctAnswer) {
            const userText = userAnswer.trim().toLowerCase();
            const correctText = correctAnswer.text.trim().toLowerCase();
            if (userText === correctText) {
              score += question.points;
            }
          }
        } else {
          // Pour les autres types, utiliser l'ID de la réponse
          const selectedAnswer = question.answers.find(
            (a) => a.id === userAnswer
          );
          if (selectedAnswer?.isCorrect) {
            score += question.points;
          }
        }
      }
    }

    // Enregistrer la tentative
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId,
        score,
        totalPoints,
        answers: JSON.stringify(answers),
      },
    });

    return NextResponse.json({
      attempt,
      score,
      totalPoints,
      percentage: totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0,
    });
  } catch (error) {
    console.error("Error submitting quiz attempt:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz attempt" },
      { status: 500 }
    );
  }
}

export async function GET(
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
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        quizId,
        userId,
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    return NextResponse.json(attempts);
  } catch (error) {
    console.error("Error fetching quiz attempts:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz attempts" },
      { status: 500 }
    );
  }
}
