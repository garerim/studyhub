"use client"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EditNoteModal } from "@/components/modals/edit-note-modal"
import { DeleteNoteModal } from "@/components/modals/delete-note-modal"
import type { Note } from "@/types/matiere"

type NotesTabProps = {
  userId: string
  matiereId: string
  notes: Note[]
  isLoading: boolean
  hasError: boolean
  onReload: () => void
}

export function NotesTab({
  userId,
  matiereId,
  notes,
  isLoading,
  hasError,
  onReload,
}: NotesTabProps) {
  return (
    <Table>
        <TableCaption>
          {isLoading
            ? "Chargement des notes..."
            : hasError
              ? "Impossible de charger les notes."
              : notes.length === 0
                ? "Aucune note pour cette matière."
                : "Liste des notes de cette matière."}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Note</TableHead>
            <TableHead>Coefficient</TableHead>
            <TableHead>Commentaire</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-[1%] whitespace-nowrap">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notes.map((note) => (
            <TableRow key={note.id}>
              <TableCell>{note.note.toFixed(2)}</TableCell>
              <TableCell>{note.coefficient}</TableCell>
              <TableCell>{note.comment || "-"}</TableCell>
              <TableCell>
                {new Date(note.date).toLocaleDateString("fr-FR")}
              </TableCell>
              <TableCell className="w-[1%] whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <EditNoteModal
                    userId={userId}
                    matiereId={matiereId}
                    note={note}
                    onUpdated={onReload}
                  >
                    <Button type="button" size="sm" variant="outline" className="px-2 text-xs">
                      Modifier
                    </Button>
                  </EditNoteModal>
                  <DeleteNoteModal
                    userId={userId}
                    matiereId={matiereId}
                    noteId={note.id}
                    onDeleted={onReload}
                  >
                    <Button type="button" size="sm" variant="destructive" className="px-2 text-xs">
                      Supprimer
                    </Button>
                  </DeleteNoteModal>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
  )
}
