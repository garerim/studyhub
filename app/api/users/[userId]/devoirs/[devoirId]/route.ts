import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

const patchSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  dueDate: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  matiereId: z.string().trim().min(1).optional().nullable(),
})

function resolvePathParams(request: Request) {
  const { pathname } = new URL(request.url)
  const parts = pathname.split("/").filter(Boolean)
  const usersIndex = parts.indexOf("users")
  const devoirsIndex = parts.indexOf("devoirs")
  const userId = usersIndex !== -1 ? parts[usersIndex + 1] : undefined
  const devoirId = devoirsIndex !== -1 ? parts[devoirsIndex + 1] : undefined
  return { userId, devoirId }
}

export async function GET(
  request: Request,
  { params }: { params?: { userId?: string; devoirId?: string } }
) {
  const resolvedParams = params ? await params : undefined
  const fromParams = {
    userId: resolvedParams?.userId,
    devoirId: resolvedParams?.devoirId,
  }
  const fromPath = resolvePathParams(request)
  const userId = fromParams.userId ?? fromPath.userId
  const devoirId = fromParams.devoirId ?? fromPath.devoirId

  if (!userId || !devoirId) {
    return NextResponse.json({ error: "Paramètres manquants." }, { status: 400 })
  }

  const devoir = await prisma.devoir.findFirst({
    where: { id: devoirId, userId },
    select: {
      id: true,
      title: true,
      description: true,
      dueDate: true,
      status: true,
      matiereId: true,
      createdAt: true,
      updatedAt: true,
      matiere: { select: { id: true, name: true, type: true } },
    },
  })

  if (!devoir) {
    return NextResponse.json({ error: "Devoir introuvable." }, { status: 404 })
  }

  return NextResponse.json(devoir)
}

export async function PATCH(
  request: Request,
  { params }: { params?: { userId?: string; devoirId?: string } }
) {
  const resolvedParams = params ? await params : undefined
  const fromParams = {
    userId: resolvedParams?.userId,
    devoirId: resolvedParams?.devoirId,
  }
  const fromPath = resolvePathParams(request)
  const userId = fromParams.userId ?? fromPath.userId
  const devoirId = fromParams.devoirId ?? fromPath.devoirId

  if (!userId || !devoirId) {
    return NextResponse.json({ error: "Paramètres manquants." }, { status: 400 })
  }

  const json = await request.json().catch(() => null)
  const parsed = patchSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 })
  }

  const existing = await prisma.devoir.findFirst({
    where: { id: devoirId, userId },
    select: { id: true },
  })
  if (!existing) {
    return NextResponse.json({ error: "Devoir introuvable." }, { status: 404 })
  }

  const dueDate = parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined
  if (parsed.data.dueDate && Number.isNaN(dueDate?.getTime())) {
    return NextResponse.json({ error: "Date invalide." }, { status: 400 })
  }

  try {
    const updated = await prisma.devoir.update({
      where: { id: devoirId },
      data: {
        title: parsed.data.title,
        description:
          parsed.data.description === undefined ? undefined : parsed.data.description,
        dueDate,
        status: parsed.data.status,
        matiereId:
          parsed.data.matiereId === undefined ? undefined : parsed.data.matiereId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        dueDate: true,
        status: true,
        matiereId: true,
        createdAt: true,
        updatedAt: true,
        matiere: { select: { id: true, name: true, type: true } },
      },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Erreur lors de la modification du devoir:", error)
    return NextResponse.json(
      { error: "Impossible de modifier le devoir." },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params?: { userId?: string; devoirId?: string } }
) {
  const resolvedParams = params ? await params : undefined
  const fromParams = {
    userId: resolvedParams?.userId,
    devoirId: resolvedParams?.devoirId,
  }
  const fromPath = resolvePathParams(request)
  const userId = fromParams.userId ?? fromPath.userId
  const devoirId = fromParams.devoirId ?? fromPath.devoirId

  if (!userId || !devoirId) {
    return NextResponse.json({ error: "Paramètres manquants." }, { status: 400 })
  }

  const existing = await prisma.devoir.findFirst({
    where: { id: devoirId, userId },
    select: { id: true },
  })
  if (!existing) {
    return NextResponse.json({ error: "Devoir introuvable." }, { status: 404 })
  }

  try {
    await prisma.devoir.delete({ where: { id: devoirId } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Erreur lors de la suppression du devoir:", error)
    return NextResponse.json(
      { error: "Impossible de supprimer le devoir." },
      { status: 500 }
    )
  }
}

