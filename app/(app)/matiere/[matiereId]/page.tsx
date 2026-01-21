"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"

import { AddNoteModal } from "@/components/add-note-modal"
import { DeleteNoteModal } from "@/components/delete-note-modal"
import { EditNoteModal } from "@/components/edit-note-modal"
import { AddFileModal } from "@/components/add-file-modal"
import { DeleteFileModal } from "@/components/delete-file-modal"
import { EditFileModal } from "@/components/edit-file-modal"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Note = {
  id: string
  note: number
  comment: string | null
  coefficient: number
  date: string
}

type File = {
  id: string
  name: string
  url: string
  size: number
  mimeType: string
  createdAt: string
}

export default function MatierePage() {
  const { matiereId } = useParams()
  const { data: session } = useSession()
  const userId = session?.user?.id
  const resolvedMatiereId = Array.isArray(matiereId) ? matiereId[0] : matiereId

  const [notes, setNotes] = React.useState<Note[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)
  const [files, setFiles] = React.useState<File[]>([])
  const [isLoadingFiles, setIsLoadingFiles] = React.useState(false)
  const [hasErrorFiles, setHasErrorFiles] = React.useState(false)
  const [matiereName, setMatiereName] = React.useState("")
  const [activeTab, setActiveTab] = React.useState("notes")

  const loadNotes = React.useCallback(
    async (signal?: AbortSignal) => {
      if (!userId || !resolvedMatiereId) {
        setNotes([])
        return
      }

      setIsLoading(true)
      setHasError(false)
      try {
        const response = await fetch(
          `/api/users/${userId}/matieres/${resolvedMatiereId}/notes`,
          { signal }
        )
        if (!response.ok) {
          setHasError(true)
          setNotes([])
          return
        }
        const data = (await response.json()) as Note[]
        if (!signal?.aborted) setNotes(data)
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return
        setHasError(true)
      } finally {
        if (!signal?.aborted) setIsLoading(false)
      }
    },
    [resolvedMatiereId, userId]
  )

  React.useEffect(() => {
    if (!userId || !resolvedMatiereId) {
      setNotes([])
      return
    }

    const controller = new AbortController()
    loadNotes(controller.signal)
    return () => controller.abort()
  }, [loadNotes, resolvedMatiereId, userId])

  React.useEffect(() => {
    if (!resolvedMatiereId) {
      setMatiereName("")
      return
    }

    const controller = new AbortController()
    const loadMatiere = async () => {
      try {
        const response = await fetch(`/api/matieres/${resolvedMatiereId}`, {
          signal: controller.signal,
        })
        if (!response.ok) {
          setMatiereName("")
          return
        }
        const data = (await response.json()) as { name?: string }
        if (!controller.signal.aborted) {
          setMatiereName(data?.name ?? "")
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return
        setMatiereName("")
      }
    }

    loadMatiere()
    return () => controller.abort()
  }, [resolvedMatiereId])

  const loadFiles = React.useCallback(
    async (signal?: AbortSignal) => {
      if (!userId || !resolvedMatiereId) {
        setFiles([])
        return
      }

      setIsLoadingFiles(true)
      setHasErrorFiles(false)
      try {
        const response = await fetch(
          `/api/users/${userId}/matieres/${resolvedMatiereId}/files`,
          { signal }
        )
        if (!response.ok) {
          setHasErrorFiles(true)
          setFiles([])
          return
        }
        const data = (await response.json()) as File[]
        if (!signal?.aborted) setFiles(data)
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return
        setHasErrorFiles(true)
      } finally {
        if (!signal?.aborted) setIsLoadingFiles(false)
      }
    },
    [resolvedMatiereId, userId]
  )

  React.useEffect(() => {
    if (!userId || !resolvedMatiereId) {
      setFiles([])
      return
    }

    const controller = new AbortController()
    loadFiles(controller.signal)
    return () => controller.abort()
  }, [loadFiles, resolvedMatiereId, userId])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Matière - {matiereName}</h1>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TabsList>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="fichiers">Fichiers</TabsTrigger>
          </TabsList>
          {activeTab === "notes" ? (
            userId && resolvedMatiereId ? (
              <AddNoteModal
                userId={userId}
                matiereId={resolvedMatiereId}
                onAdded={() => loadNotes()}
              >
                <Button type="button">Ajouter une note</Button>
              </AddNoteModal>
            ) : (
              <Button type="button" disabled>
                Ajouter une note
              </Button>
            )
          ) : userId && resolvedMatiereId ? (
            <AddFileModal
              userId={userId}
              matiereId={resolvedMatiereId}
              onAdded={() => loadFiles()}
            >
              <Button type="button">Ajouter un fichier</Button>
            </AddFileModal>
          ) : (
            <Button type="button" disabled>
              Ajouter un fichier
            </Button>
          )}
        </div>
        <TabsContent value="notes">
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
                <TableHead className="w-[1%] whitespace-nowrap">
                  Actions
                </TableHead>
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
                        userId={userId ?? ""}
                        matiereId={resolvedMatiereId ?? ""}
                        note={note}
                        onUpdated={() => loadNotes()}
                      >
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="px-2 text-xs"
                        >
                          Modifier
                        </Button>
                      </EditNoteModal>
                      <DeleteNoteModal
                        userId={userId ?? ""}
                        matiereId={resolvedMatiereId ?? ""}
                        noteId={note.id}
                        onDeleted={() => loadNotes()}
                      >
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="px-2 text-xs"
                        >
                          Supprimer
                        </Button>
                      </DeleteNoteModal>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="fichiers">
          <Table>
            <TableCaption>
              {isLoadingFiles
                ? "Chargement des fichiers..."
                : hasErrorFiles
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
                <TableHead>Date d'ajout</TableHead>
                <TableHead className="w-[1%] whitespace-nowrap">
                  Actions
                </TableHead>
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
                        userId={userId ?? ""}
                        matiereId={resolvedMatiereId ?? ""}
                        file={{ id: file.id, name: file.name }}
                        onUpdated={() => loadFiles()}
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
                  <TableCell>
                    {(file.size / 1024).toFixed(2)} KB
                  </TableCell>
                  <TableCell>{file.mimeType}</TableCell>
                  <TableCell>
                    {new Date(file.createdAt).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="w-[1%] whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="px-2 text-xs"
                        >
                          Ouvrir
                        </Button>
                      </a>
                      <DeleteFileModal
                        userId={userId ?? ""}
                        matiereId={resolvedMatiereId ?? ""}
                        fileId={file.id}
                        fileName={file.name}
                        onDeleted={() => loadFiles()}
                      >
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="px-2 text-xs"
                        >
                          Supprimer
                        </Button>
                      </DeleteFileModal>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  )
}
