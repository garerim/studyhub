import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

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
        attempts: {
          orderBy: {
            completedAt: "desc",
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const { name, description, questions } = body;

    // Vérifier que le quiz existe et appartient à l'utilisateur
    const existingQuiz = await prisma.quiz.findFirst({
      where: {
        id: quizId,
        userId,
      },
    });

    if (!existingQuiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Mettre à jour le quiz
    const quiz = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        name: name || existingQuiz.name,
        description: description !== undefined ? description : existingQuiz.description,
      },
    });

    // Si des questions sont fournies, les mettre à jour
    if (questions && Array.isArray(questions)) {
      // Supprimer les anciennes questions et réponses
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

      // Créer les nouvelles questions
      for (const questionData of questions) {
        const question = await prisma.question.create({
          data: {
            quizId,
            question: questionData.question,
            type: questionData.type || "multiple-choice",
            order: questionData.order || 0,
            points: questionData.points || 1,
            answers: {
              create: questionData.answers?.map((answer: any, index: number) => ({
                text: answer.text,
                isCorrect: answer.isCorrect || false,
                order: index,
              })) || [],
            },
          },
        });
      }
    }

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

    return NextResponse.json(updatedQuiz);
  } catch (error) {
    console.error("Error updating quiz:", error);
    return NextResponse.json(
      { error: "Failed to update quiz" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    // Vérifier que le quiz existe et appartient à l'utilisateur
    const quiz = await prisma.quiz.findFirst({
      where: {
        id: quizId,
        userId,
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Supprimer le quiz (les relations sont en cascade)
    await prisma.quiz.delete({
      where: { id: quizId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return NextResponse.json(
      { error: "Failed to delete quiz" },
      { status: 500 }
    );
  }
}
