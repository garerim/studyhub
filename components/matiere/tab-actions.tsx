"use client"

import { Button } from "@/components/ui/button"
import { AddNoteModal } from "@/components/modals/add-note-modal"
import { AddFileModal } from "@/components/modals/add-file-modal"
import { AddQuizModal } from "@/components/add-quiz-modal"

type TabActionsProps = {
  activeTab: string
  userId: string
  matiereId: string
  onNotesAdded: () => void
  onFilesAdded: () => void
  onQuizzesAdded: () => void
}

export function TabActions({
  activeTab,
  userId,
  matiereId,
  onNotesAdded,
  onFilesAdded,
  onQuizzesAdded,
}: TabActionsProps) {
  if (activeTab === "notes") {
    return (
      <AddNoteModal userId={userId} matiereId={matiereId} onAdded={onNotesAdded}>
        <Button type="button">Ajouter une note</Button>
      </AddNoteModal>
    )
  }

  if (activeTab === "fichiers") {
    return (
      <AddFileModal userId={userId} matiereId={matiereId} onAdded={onFilesAdded}>
        <Button type="button">Ajouter un fichier</Button>
      </AddFileModal>
    )
  }

  if (activeTab === "quiz") {
    return (
      <AddQuizModal userId={userId} matiereId={matiereId} onAdded={onQuizzesAdded}>
        <Button type="button">Créer un quiz</Button>
      </AddQuizModal>
    )
  }

  return null
}
