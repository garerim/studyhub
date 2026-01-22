import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params?: { userId?: string; matiereId?: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = params ? await params : undefined;
  const userIdFromParams = resolvedParams?.userId;
  const matiereIdFromParams = resolvedParams?.matiereId;
  const { pathname } = new URL(request.url);
  const parts = pathname.split("/").filter(Boolean);
  const usersIndex = parts.indexOf("users");
  const matieresIndex = parts.indexOf("matieres");
  const userIdFromPath =
    usersIndex !== -1 ? parts[usersIndex + 1] : undefined;
  const matiereIdFromPath =
    matieresIndex !== -1 ? parts[matieresIndex + 1] : undefined;

  const userId = userIdFromParams ?? userIdFromPath;
  const matiereId = matiereIdFromParams ?? matiereIdFromPath;

  if (!userId || !matiereId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  if (session.user.id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const quizes = await prisma.quiz.findMany({
      where: {
        userId,
        matiereId,
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
          select: {
            id: true,
            score: true,
            totalPoints: true,
            completedAt: true,
            answers: true,
          },
          orderBy: {
            completedAt: "desc",
          },
          take: 1,
        },
        _count: {
          select: {
            attempts: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(quizes);
  } catch (error) {
    console.error("Error fetching quizes:", error);
    return NextResponse.json(
      { error: "Failed to fetch quizes" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params?: { userId?: string; matiereId?: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = params ? await params : undefined;
  const userIdFromParams = resolvedParams?.userId;
  const matiereIdFromParams = resolvedParams?.matiereId;
  const { pathname } = new URL(request.url);
  const parts = pathname.split("/").filter(Boolean);
  const usersIndex = parts.indexOf("users");
  const matieresIndex = parts.indexOf("matieres");
  const userIdFromPath =
    usersIndex !== -1 ? parts[usersIndex + 1] : undefined;
  const matiereIdFromPath =
    matieresIndex !== -1 ? parts[matieresIndex + 1] : undefined;

  const userId = userIdFromParams ?? userIdFromPath;
  const matiereId = matiereIdFromParams ?? matiereIdFromPath;

  if (!userId || !matiereId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  if (session.user.id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, description, isAIGenerated } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const quiz = await prisma.quiz.create({
      data: {
        userId,
        matiereId,
        name,
        description: description || null,
        isAIGenerated: isAIGenerated || false,
      },
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { error: "Failed to create quiz" },
      { status: 500 }
    );
  }
}
