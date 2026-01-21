import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET(
  request: Request,
  { params }: { params?: { userId?: string } }
) {
  const resolvedParams = params ? await params : undefined
  const userIdFromParams = resolvedParams?.userId
  const { pathname } = new URL(request.url)
  const parts = pathname.split("/").filter(Boolean)
  const usersIndex = parts.indexOf("users")
  const userIdFromPath =
    usersIndex !== -1 ? parts[usersIndex + 1] : undefined
  const userId = userIdFromParams ?? userIdFromPath

  if (!userId) {
    return NextResponse.json(
      { error: "Utilisateur introuvable." },
      { status: 400 }
    )
  }

  const notes = await prisma.note.findMany({
    where: { userId },
    select: {
      id: true,
      note: true,
      comment: true,
      coefficient: true,
      date: true,
      matiereId: true,
    },
    orderBy: { date: "desc" },
  })

  return NextResponse.json(notes)
}
