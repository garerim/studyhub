import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

const bodySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  originalText: z.string().optional().nullable(),
  processedText: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  fileIds: z.array(z.string()).optional(),
})

export async function GET(
  request: Request,
  {
    params,
  }: { params?: { userId?: string; matiereId?: string; coursId?: string } }
) {
  const resolvedParams = params ? await params : undefined
  const userIdFromParams = resolvedParams?.userId
  const matiereIdFromParams = resolvedParams?.matiereId
  const coursIdFromParams = resolvedParams?.coursId
  const { pathname } = new URL(request.url)
  const parts = pathname.split("/").filter(Boolean)
  const usersIndex = parts.indexOf("users")
  const matieresIndex = parts.indexOf("matieres")
  const coursIndex = parts.indexOf("cours")
  const userIdFromPath =
    usersIndex !== -1 ? parts[usersIndex + 1] : undefined
  const matiereIdFromPath =
    matieresIndex !== -1 ? parts[matieresIndex + 1] : undefined
  const coursIdFromPath =
    coursIndex !== -1 ? parts[coursIndex + 1] : undefined

  const userId = userIdFromParams ?? userIdFromPath
  const matiereId = matiereIdFromParams ?? matiereIdFromPath
  const coursId = coursIdFromParams ?? coursIdFromPath

  if (!userId || !matiereId || !coursId) {
    return NextResponse.json(
      { error: "Paramètres manquants." },
      { status: 400 }
    )
  }

  try {
    const cours = await prisma.cours.findFirst({
      where: { id: coursId, userId, matiereId },
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

    if (!cours) {
      return NextResponse.json(
        { error: "Cours introuvable." },
        { status: 404 }
      )
    }

    return NextResponse.json(cours)
  } catch (error) {
    console.error("Erreur lors de la récupération du cours:", error)
    return NextResponse.json(
      { error: "Impossible de récupérer le cours." },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  {
    params,
  }: { params?: { userId?: string; matiereId?: string; coursId?: string } }
) {
  const resolvedParams = params ? await params : undefined
  const userIdFromParams = resolvedParams?.userId
  const matiereIdFromParams = resolvedParams?.matiereId
  const coursIdFromParams = resolvedParams?.coursId
  const { pathname } = new URL(request.url)
  const parts = pathname.split("/").filter(Boolean)
  const usersIndex = parts.indexOf("users")
  const matieresIndex = parts.indexOf("matieres")
  const coursIndex = parts.indexOf("cours")
  const userIdFromPath =
    usersIndex !== -1 ? parts[usersIndex + 1] : undefined
  const matiereIdFromPath =
    matieresIndex !== -1 ? parts[matieresIndex + 1] : undefined
  const coursIdFromPath =
    coursIndex !== -1 ? parts[coursIndex + 1] : undefined

  const userId = userIdFromParams ?? userIdFromPath
  const matiereId = matiereIdFromParams ?? matiereIdFromPath
  const coursId = coursIdFromParams ?? coursIdFromPath

  if (!userId || !matiereId || !coursId) {
    return NextResponse.json(
      { error: "Paramètres manquants." },
      { status: 400 }
    )
  }

  // Vérifier que le cours appartient à l'utilisateur
  const existingCours = await prisma.cours.findFirst({
    where: { id: coursId, userId, matiereId },
  })

  if (!existingCours) {
    return NextResponse.json(
      { error: "Cours introuvable." },
      { status: 404 }
    )
  }

  const json = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 })
  }

  try {
    // Mettre à jour les documents si fileIds est fourni
    if (parsed.data.fileIds !== undefined) {
      // Supprimer tous les documents existants
      await prisma.coursDocument.deleteMany({
        where: { coursId },
      })
      // Créer les nouveaux documents
      if (parsed.data.fileIds.length > 0) {
        await prisma.coursDocument.createMany({
          data: parsed.data.fileIds.map((fileId) => ({
            coursId,
            fileId,
          })),
          skipDuplicates: true,
        })
      }
    }

    // Mettre à jour le cours
    const updated = await prisma.cours.update({
      where: { id: coursId },
      data: {
        ...(parsed.data.name !== undefined && { name: parsed.data.name }),
        ...(parsed.data.description !== undefined && {
          description: parsed.data.description,
        }),
        ...(parsed.data.imageUrl !== undefined && {
          imageUrl: parsed.data.imageUrl,
        }),
        ...(parsed.data.originalText !== undefined && {
          originalText: parsed.data.originalText,
        }),
        ...(parsed.data.processedText !== undefined && {
          processedText: parsed.data.processedText,
        }),
        ...(parsed.data.content !== undefined && {
          content: parsed.data.content,
        }),
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
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Erreur lors de la modification du cours:", error)
    return NextResponse.json(
      { error: "Impossible de modifier le cours." },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  {
    params,
  }: { params?: { userId?: string; matiereId?: string; coursId?: string } }
) {
  const resolvedParams = params ? await params : undefined
  const userIdFromParams = resolvedParams?.userId
  const matiereIdFromParams = resolvedParams?.matiereId
  const coursIdFromParams = resolvedParams?.coursId
  const { pathname } = new URL(request.url)
  const parts = pathname.split("/").filter(Boolean)
  const usersIndex = parts.indexOf("users")
  const matieresIndex = parts.indexOf("matieres")
  const coursIndex = parts.indexOf("cours")
  const userIdFromPath =
    usersIndex !== -1 ? parts[usersIndex + 1] : undefined
  const matiereIdFromPath =
    matieresIndex !== -1 ? parts[matieresIndex + 1] : undefined
  const coursIdFromPath =
    coursIndex !== -1 ? parts[coursIndex + 1] : undefined

  const userId = userIdFromParams ?? userIdFromPath
  const matiereId = matiereIdFromParams ?? matiereIdFromPath
  const coursId = coursIdFromParams ?? coursIdFromPath

  if (!userId || !matiereId || !coursId) {
    return NextResponse.json(
      { error: "Paramètres manquants." },
      { status: 400 }
    )
  }

  try {
    // Vérifier que le cours appartient à l'utilisateur
    const existingCours = await prisma.cours.findFirst({
      where: { id: coursId, userId, matiereId },
    })

    if (!existingCours) {
      return NextResponse.json(
        { error: "Cours introuvable." },
        { status: 404 }
      )
    }

    // Supprimer le cours (les documents seront supprimés automatiquement grâce à onDelete: Cascade)
    await prisma.cours.delete({
      where: { id: coursId },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Erreur lors de la suppression du cours:", error)
    return NextResponse.json(
      { error: "Impossible de supprimer le cours." },
      { status: 500 }
    )
  }
}
