import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

const bodySchema = z.object({
  note: z.coerce.number(),
  coefficient: z.coerce.number().int().positive().optional().default(1),
  comment: z.string().trim().max(500).optional().nullable(),
  date: z.string().optional(),
})

export async function GET(
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
    return NextResponse.json(
      { error: "Paramètres manquants." },
      { status: 400 }
    )
  }

  const notes = await prisma.note.findMany({
    where: { userId, matiereId },
    select: {
      id: true,
      note: true,
      comment: true,
      coefficient: true,
      date: true,
    },
    orderBy: { date: "desc" },
  })

  return NextResponse.json(notes)
}

export async function POST(
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
    return NextResponse.json(
      { error: "Paramètres manquants." },
      { status: 400 }
    )
  }

  const json = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 })
  }

  try {
    const created = await prisma.note.create({
      data: {
        userId,
        matiereId,
        note: parsed.data.note,
        coefficient: parsed.data.coefficient,
        comment: parsed.data.comment ?? null,
        date: parsed.data.date ? new Date(parsed.data.date) : undefined,
      },
      select: {
        id: true,
        note: true,
        comment: true,
        coefficient: true,
        date: true,
      },
    })
    return NextResponse.json(created, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Impossible d'ajouter la note." },
      { status: 500 }
    )
  }
}
