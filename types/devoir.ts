export type DevoirStatus = "TODO" | "IN_PROGRESS" | "DONE"

export type DevoirMatiere = {
  id: string
  name: string
  type: string
}

export type Devoir = {
  id: string
  title: string
  description: string | null
  dueDate: string
  status: DevoirStatus
  matiereId: string | null
  createdAt: string
  updatedAt: string
  matiere?: DevoirMatiere | null
}

export const devoirStatusLabels: Record<DevoirStatus, string> = {
  TODO: "À faire",
  IN_PROGRESS: "En cours",
  DONE: "Terminé",
}

