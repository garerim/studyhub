import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { utapi, extractFileKeyFromUrl } from "@/lib/uploadthing-server"

export const runtime = "nodejs"

const bodySchema = z.object({
  name: z.string().min(1).max(255),
})

export async function PATCH(
  request: Request,
  {
    params,
  }: { params?: { userId?: string; matiereId?: string; fileId?: string } }
) {
  const resolvedParams = params ? await params : undefined
  const userIdFromParams = resolvedParams?.userId
  const matiereIdFromParams = resolvedParams?.matiereId
  const fileIdFromParams = resolvedParams?.fileId
  const { pathname } = new URL(request.url)
  const parts = pathname.split("/").filter(Boolean)
  const usersIndex = parts.indexOf("users")
  const matieresIndex = parts.indexOf("matieres")
  const filesIndex = parts.indexOf("files")
  const userIdFromPath =
    usersIndex !== -1 ? parts[usersIndex + 1] : undefined
  const matiereIdFromPath =
    matieresIndex !== -1 ? parts[matieresIndex + 1] : undefined
  const fileIdFromPath =
    filesIndex !== -1 ? parts[filesIndex + 1] : undefined

  const userId = userIdFromParams ?? userIdFromPath
  const matiereId = matiereIdFromParams ?? matiereIdFromPath
  const fileId = fileIdFromParams ?? fileIdFromPath

  if (!userId || !matiereId || !fileId) {
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
    const updated = await prisma.file.update({
      where: { id: fileId },
      data: {
        name: parsed.data.name,
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
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json(
      { error: "Impossible de modifier le fichier." },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  {
    params,
  }: { params?: { userId?: string; matiereId?: string; fileId?: string } }
) {
  const resolvedParams = params ? await params : undefined
  const userIdFromParams = resolvedParams?.userId
  const matiereIdFromParams = resolvedParams?.matiereId
  const fileIdFromParams = resolvedParams?.fileId
  const { pathname } = new URL(request.url)
  const parts = pathname.split("/").filter(Boolean)
  const usersIndex = parts.indexOf("users")
  const matieresIndex = parts.indexOf("matieres")
  const filesIndex = parts.indexOf("files")
  const userIdFromPath =
    usersIndex !== -1 ? parts[usersIndex + 1] : undefined
  const matiereIdFromPath =
    matieresIndex !== -1 ? parts[matieresIndex + 1] : undefined
  const fileIdFromPath =
    filesIndex !== -1 ? parts[filesIndex + 1] : undefined

  const userId = userIdFromParams ?? userIdFromPath
  const matiereId = matiereIdFromParams ?? matiereIdFromPath
  const fileId = fileIdFromParams ?? fileIdFromPath

  if (!userId || !matiereId || !fileId) {
    return NextResponse.json(
      { error: "Paramètres manquants." },
      { status: 400 }
    )
  }

  try {
    // Récupérer le fichier pour obtenir l'URL
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      select: { url: true },
    })

    if (!file) {
      return NextResponse.json(
        { error: "Fichier introuvable." },
        { status: 404 }
      )
    }

    // Extraire la clé du fichier depuis l'URL UploadThing
    const fileKey = extractFileKeyFromUrl(file.url)

    // Supprimer le fichier sur UploadThing si on a la clé
    if (fileKey) {
      try {
        await utapi.deleteFiles(fileKey)
      } catch (uploadError) {
        // On log l'erreur mais on continue quand même la suppression en base
        // car le fichier pourrait déjà être supprimé ou l'URL pourrait être invalide
        console.error("Erreur lors de la suppression sur UploadThing:", uploadError)
      }
    }

    // Supprimer l'enregistrement en base de données
    await prisma.file.delete({
      where: { id: fileId },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Erreur lors de la suppression du fichier:", error)
    return NextResponse.json(
      { error: "Impossible de supprimer le fichier." },
      { status: 500 }
    )
  }
}
