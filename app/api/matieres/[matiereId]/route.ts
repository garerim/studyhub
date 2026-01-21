import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

type MatiereRow = {
  id: string
  name: string
  type: string
}

export async function GET(
  request: Request,
  { params }: { params?: { matiereId?: string } }
) {
  const resolvedParams = params ? await params : undefined
  const matiereIdFromParams = resolvedParams?.matiereId
  const { pathname } = new URL(request.url)
  const parts = pathname.split("/").filter(Boolean)
  const matieresIndex = parts.indexOf("matieres")
  const matiereIdFromPath =
    matieresIndex !== -1 ? parts[matieresIndex + 1] : undefined

  const matiereId = matiereIdFromParams ?? matiereIdFromPath
  if (!matiereId) {
    return NextResponse.json({ error: "Paramètre manquant." }, { status: 400 })
  }

  const matiereModel = (
    prisma as typeof prisma & {
      matiere?: {
        findUnique: (args: {
          where: { id: string }
          select: { id: true; name: true; type: true }
        }) => Promise<MatiereRow | null>
      }
    }
  ).matiere

  if (matiereModel) {
    const matiere = await matiereModel.findUnique({
      where: { id: matiereId },
      select: { id: true, name: true, type: true },
    })
    if (!matiere) {
      return NextResponse.json({ error: "Matière introuvable." }, { status: 404 })
    }
    return NextResponse.json(matiere)
  }

  const rows = await prisma.$queryRaw<MatiereRow[]>`
    SELECT id, name, type FROM Matiere WHERE id = ${matiereId} LIMIT 1
  `
  const matiere = rows[0]
  if (!matiere) {
    return NextResponse.json({ error: "Matière introuvable." }, { status: 404 })
  }
  return NextResponse.json(matiere)
}
