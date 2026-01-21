import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"

const bodySchema = z.object({
  matiereId: z.string().min(1),
})

export async function POST(
  request: Request,
  { params }: { params?: { userId?: string } }
) {
  const userIdFromParams = params?.userId
  const userIdFromPath = (() => {
    const pathname = new URL(request.url).pathname
    const parts = pathname.split("/").filter(Boolean)
    const usersIndex = parts.indexOf("users")
    return usersIndex !== -1 ? parts[usersIndex + 1] : undefined
  })()
  const userId = userIdFromParams ?? userIdFromPath
  if (!userId) {
    return NextResponse.json(
      { error: "Utilisateur introuvable." },
      { status: 400 }
    )
  }

  const json = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides." },
      { status: 400 }
    )
  }

  try {
    const userModel = (
      prisma as typeof prisma & {
        user: {
          update: (args: {
            where: { id: string }
            data: { matieres: { connect: { id: string } } }
          }) => Promise<unknown>
        }
      }
    ).user

    await userModel.update({
      where: { id: userId },
      data: {
        matieres: {
          connect: { id: parsed.data.matiereId },
        },
      },
    })
  } catch {
    return NextResponse.json(
      { error: "Impossible d'ajouter la matière." },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}

export async function GET(
  request: Request,
  { params }: { params?: { userId?: string } }
) {
  const userIdFromParams = (await params)?.userId
  const userIdFromPath = (() => {
    const pathname = new URL(request.url).pathname
    const parts = pathname.split("/").filter(Boolean)
    const usersIndex = parts.indexOf("users")
    return usersIndex !== -1 ? parts[usersIndex + 1] : undefined
  })()
  const userId = userIdFromParams ?? userIdFromPath
  if (!userId) {
    return NextResponse.json(
      { error: "Utilisateur introuvable." },
      { status: 400 }
    )
  }

  const matieres = await prisma.$queryRaw<
    { id: string; name: string; type: string }[]
  >`
    SELECT m.id, m.name, m.type
    FROM Matiere AS m
    INNER JOIN _MatiereToUser AS mu ON mu.A = m.id
    WHERE mu.B = ${userId}
    ORDER BY m.name ASC
  `

  return NextResponse.json(matieres)
}
