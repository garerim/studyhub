import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

const createSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  dueDate: z.string().min(1),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  matiereId: z.string().trim().min(1).optional().nullable(),
})

export async function GET(
  request: Request,
  { params }: { params?: { userId?: string } }
) {
  const resolvedParams = params ? await params : undefined
  const userIdFromParams = resolvedParams?.userId
  const { pathname, searchParams } = new URL(request.url)
  const parts = pathname.split("/").filter(Boolean)
  const usersIndex = parts.indexOf("users")
  const userIdFromPath =
    usersIndex !== -1 ? parts[usersIndex + 1] : undefined
  const userId = userIdFromParams ?? userIdFromPath

  if (!userId) {
    return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 400 })
  }

  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const status = searchParams.get("status")
  const matiereId = searchParams.get("matiereId")
  const q = searchParams.get("q")?.trim()

  const statusFilter =
    status && ["TODO", "IN_PROGRESS", "DONE"].includes(status)
      ? (status as "TODO" | "IN_PROGRESS" | "DONE")
      : undefined

  const devoirs = await prisma.devoir.findMany({
    where: {
      userId,
      status: statusFilter,
      matiereId: matiereId || undefined,
      dueDate: {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined,
      },
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
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
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  })

  return NextResponse.json(devoirs)
}

export async function POST(
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
    return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 400 })
  }

  const json = await request.json().catch(() => null)
  const parsed = createSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 })
  }

  const dueDate = new Date(parsed.data.dueDate)
  if (Number.isNaN(dueDate.getTime())) {
    return NextResponse.json({ error: "Date invalide." }, { status: 400 })
  }

  try {
    const created = await prisma.devoir.create({
      data: {
        userId,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        dueDate,
        status: parsed.data.status ?? "TODO",
        matiereId: parsed.data.matiereId ?? null,
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
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création du devoir:", error)
    return NextResponse.json(
      { error: "Impossible d'ajouter le devoir." },
      { status: 500 }
    )
  }
}

