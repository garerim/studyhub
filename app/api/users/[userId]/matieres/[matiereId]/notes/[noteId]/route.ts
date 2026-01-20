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

export async function PATCH(
  request: Request,
  {
    params,
  }: { params?: { userId?: string; matiereId?: string; noteId?: string } }
) {
  const resolvedParams = params ? await params : undefined
  const userIdFromParams = resolvedParams?.userId
  const matiereIdFromParams = resolvedParams?.matiereId
  const noteIdFromParams = resolvedParams?.noteId
  const { pathname } = new URL(request.url)
  const parts = pathname.split("/").filter(Boolean)
  const usersIndex = parts.indexOf("users")
  const matieresIndex = parts.indexOf("matieres")
  const notesIndex = parts.indexOf("notes")
  const userIdFromPath =
    usersIndex !== -1 ? parts[usersIndex + 1] : undefined
  const matiereIdFromPath =
    matieresIndex !== -1 ? parts[matieresIndex + 1] : undefined
  const noteIdFromPath =
    notesIndex !== -1 ? parts[notesIndex + 1] : undefined

  const userId = userIdFromParams ?? userIdFromPath
  const matiereId = matiereIdFromParams ?? matiereIdFromPath
  const noteId = noteIdFromParams ?? noteIdFromPath

  if (!userId || !matiereId || !noteId) {
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
    const updated = await prisma.note.update({
      where: { id: noteId },
      data: {
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
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json(
      { error: "Impossible de modifier la note." },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  {
    params,
  }: { params?: { userId?: string; matiereId?: string; noteId?: string } }
) {
  const resolvedParams = params ? await params : undefined
  const userIdFromParams = resolvedParams?.userId
  const matiereIdFromParams = resolvedParams?.matiereId
  const noteIdFromParams = resolvedParams?.noteId
  const { pathname } = new URL(request.url)
  const parts = pathname.split("/").filter(Boolean)
  const usersIndex = parts.indexOf("users")
  const matieresIndex = parts.indexOf("matieres")
  const notesIndex = parts.indexOf("notes")
  const userIdFromPath =
    usersIndex !== -1 ? parts[usersIndex + 1] : undefined
  const matiereIdFromPath =
    matieresIndex !== -1 ? parts[matieresIndex + 1] : undefined
  const noteIdFromPath =
    notesIndex !== -1 ? parts[notesIndex + 1] : undefined

  const userId = userIdFromParams ?? userIdFromPath
  const matiereId = matiereIdFromParams ?? matiereIdFromPath
  const noteId = noteIdFromParams ?? noteIdFromPath

  if (!userId || !matiereId || !noteId) {
    return NextResponse.json(
      { error: "Paramètres manquants." },
      { status: 400 }
    )
  }

  try {
    await prisma.note.delete({
      where: { id: noteId },
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { error: "Impossible de supprimer la note." },
      { status: 500 }
    )
  }
}
