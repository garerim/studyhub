import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

const bodySchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  originalText: z.string().optional().nullable(),
  fileIds: z.array(z.string()).optional().default([]),
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

  const cours = await prisma.cours.findMany({
    where: { userId, matiereId },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        originalText: true,
        processedText: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        documents: {
        select: {
          file: {
            select: {
              id: true,
              name: true,
              url: true,
              size: true,
              mimeType: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(cours)
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
    const created = await prisma.cours.create({
      data: {
        userId,
        matiereId,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        imageUrl: parsed.data.imageUrl ?? null,
        originalText: parsed.data.originalText ?? null,
        documents: {
          create: parsed.data.fileIds?.map((fileId) => ({
            fileId,
          })) ?? [],
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        originalText: true,
        processedText: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        documents: {
          select: {
            file: {
              select: {
                id: true,
                name: true,
                url: true,
                size: true,
                mimeType: true,
              },
            },
          },
        },
      },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création du cours:", error)
    return NextResponse.json(
      { error: "Impossible d'ajouter le cours." },
      { status: 500 }
    )
  }
}
