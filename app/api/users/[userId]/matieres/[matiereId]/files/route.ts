import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

const bodySchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  size: z.coerce.number().int().positive(),
  mimeType: z.string().min(1),
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

  const files = await prisma.file.findMany({
    where: { userId, matiereId },
    select: {
      id: true,
      name: true,
      url: true,
      size: true,
      mimeType: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(files)
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
    const created = await prisma.file.create({
      data: {
        userId,
        matiereId,
        name: parsed.data.name,
        url: parsed.data.url,
        size: parsed.data.size,
        mimeType: parsed.data.mimeType,
      },
      select: {
        id: true,
        name: true,
        url: true,
        size: true,
        mimeType: true,
        createdAt: true,
      },
    })
    return NextResponse.json(created, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Impossible d'ajouter le fichier." },
      { status: 500 }
    )
  }
}
