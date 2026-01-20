import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function DELETE(
  request: Request,
  { params }: { params?: { userId?: string; matiereId?: string } }
) {
  const resolvedParams = params ? await params : undefined
  const userIdFromParams = resolvedParams?.userId
  const matiereIdFromParams = resolvedParams?.matiereId
  const { pathname } = new URL(request.url)
  const parts = pathname.split("/").filter(Boolean)
  const usersIndex = parts.indexOf("users")
  const matieresIndex = parts.indexOf("matieres")
  const userIdFromPath =
    usersIndex !== -1 ? parts[usersIndex + 1] : undefined
  const matiereIdFromPath =
    matieresIndex !== -1 ? parts[matieresIndex + 1] : undefined

  const userId = userIdFromParams ?? userIdFromPath
  const matiereId = matiereIdFromParams ?? matiereIdFromPath

  if (!userId || !matiereId) {
    return NextResponse.json({ error: "Paramètres manquants." }, { status: 400 })
  }

  try {
    await prisma.$transaction([
      prisma.note.deleteMany({ where: { userId, matiereId } }),
      prisma.user.update({
        where: { id: userId },
        data: {
          matieres: {
            disconnect: { id: matiereId },
          },
        },
      }),
    ])
  } catch {
    return NextResponse.json(
      { error: "Impossible de supprimer la matière." },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}
