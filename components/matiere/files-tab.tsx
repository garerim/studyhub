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
import { EditFileModal } from "@/components/edit-file-modal"
import { DeleteFileModal } from "@/components/delete-file-modal"
import { Pencil } from "lucide-react"
import type { File } from "@/types/matiere"

type FilesTabProps = {
  userId: string
  matiereId: string
  files: File[]
  isLoading: boolean
  hasError: boolean
  onReload: () => void
}

export function FilesTab({
  userId,
  matiereId,
  files,
  isLoading,
  hasError,
  onReload,
}: FilesTabProps) {
  return (
    <Table>
        <TableCaption>
          {isLoading
            ? "Chargement des fichiers..."
            : hasError
              ? "Impossible de charger les fichiers."
              : files.length === 0
                ? "Aucun fichier pour cette matière."
                : "Liste des fichiers de cette matière."}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Taille</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date d&apos;ajout</TableHead>
            <TableHead className="w-[1%] whitespace-nowrap">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id}>
              <TableCell>
                <div className="group flex items-center gap-2">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {file.name}
                  </a>
                  <EditFileModal
                    userId={userId}
                    matiereId={matiereId}
                    file={{ id: file.id, name: file.name }}
                    onUpdated={onReload}
                  >
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </EditFileModal>
                </div>
              </TableCell>
              <TableCell>{(file.size / 1024).toFixed(2)} KB</TableCell>
              <TableCell>{file.mimeType}</TableCell>
              <TableCell>
                {new Date(file.createdAt).toLocaleDateString("fr-FR")}
              </TableCell>
              <TableCell className="w-[1%] whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    <Button type="button" size="sm" variant="outline" className="px-2 text-xs">
                      Ouvrir
                    </Button>
                  </a>
                  <DeleteFileModal
                    userId={userId}
                    matiereId={matiereId}
                    fileId={file.id}
                    fileName={file.name}
                    onDeleted={onReload}
                  >
                    <Button type="button" size="sm" variant="destructive" className="px-2 text-xs">
                      Supprimer
                    </Button>
                  </DeleteFileModal>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
  )
}
