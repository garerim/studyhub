import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

type MatiereRow = {
  id: string
  name: string
  type: string
}

export async function GET() {
  const matiereModel = (
    prisma as typeof prisma & {
      matiere?: {
        findMany: (args: { orderBy: { name: "asc" } }) => Promise<MatiereRow[]>
      }
    }
  ).matiere

  if (!matiereModel) {
    const matieres = await prisma.$queryRaw<MatiereRow[]>`
      SELECT id, name, type FROM Matiere ORDER BY name ASC
    `
    return NextResponse.json(matieres)
  }

  const matieres = await matiereModel.findMany({
    orderBy: { name: "asc" },
  })

  return NextResponse.json(matieres)
}
