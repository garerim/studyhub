"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"

import { AddNoteModal } from "@/components/modals/add-note-modal"
import { DeleteNoteModal } from "@/components/modals/delete-note-modal"
import { EditNoteModal } from "@/components/modals/edit-note-modal"
import { AddFileModal } from "@/components/modals/add-file-modal"
import { DeleteFileModal } from "@/components/modals/delete-file-modal"
import { EditFileModal } from "@/components/modals/edit-file-modal"
import { AddCoursModal } from "@/components/modals/add-cours-modal"
import { CoursBox } from "@/components/cours-box"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

type Cours = {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  originalText: string | null
  processedText: string | null
  content: string | null
  createdAt: string
  updatedAt: string
  documents: Array<{
    file: {
      id: string
      name: string
      url: string
      size: number
      mimeType: string
    }
  }>
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
  const [cours, setCours] = React.useState<Cours[]>([])
  const [isLoadingCours, setIsLoadingCours] = React.useState(false)
  const [hasErrorCours, setHasErrorCours] = React.useState(false)
  const [matiereName, setMatiereName] = React.useState("")
  const [activeTab, setActiveTab] = React.useState("notes")
  const [coursSearch, setCoursSearch] = React.useState("")

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

  const loadCours = React.useCallback(
    async (signal?: AbortSignal) => {
      if (!userId || !resolvedMatiereId) {
        setCours([])
        return
      }

      setIsLoadingCours(true)
      setHasErrorCours(false)
      try {
        const response = await fetch(
          `/api/users/${userId}/matieres/${resolvedMatiereId}/cours`,
          { signal }
        )
        if (!response.ok) {
          setHasErrorCours(true)
          setCours([])
          return
        }
        const data = (await response.json()) as Cours[]
        if (!signal?.aborted) setCours(data)
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return
        setHasErrorCours(true)
      } finally {
        if (!signal?.aborted) setIsLoadingCours(false)
      }
    },
    [resolvedMatiereId, userId]
  )

  React.useEffect(() => {
    if (!userId || !resolvedMatiereId) {
      setCours([])
      return
    }

    const controller = new AbortController()
    loadCours(controller.signal)
    return () => controller.abort()
  }, [loadCours, resolvedMatiereId, userId])

  // Calcul de la moyenne générale (moyenne pondérée par coefficient)
  const moyenneGenerale = React.useMemo(() => {
    if (notes.length === 0) return null

    const sommeNotesPonderees = notes.reduce(
      (acc, note) => acc + note.note * note.coefficient,
      0
    )
    const sommeCoefficients = notes.reduce(
      (acc, note) => acc + note.coefficient,
      0
    )

    if (sommeCoefficients === 0) return null

    return sommeNotesPonderees / sommeCoefficients
  }, [notes])

  const filteredCours = React.useMemo(() => {
    const query = coursSearch.trim().toLowerCase()
    if (!query) return cours
    return cours.filter((item) => item.name.toLowerCase().includes(query))
  }, [cours, coursSearch])

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
            <TabsTrigger value="cours">Cours</TabsTrigger>
            <TabsTrigger value="exercices">Exercices</TabsTrigger>
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
          ) : activeTab === "cours" ? (
            userId && resolvedMatiereId ? (
              <AddCoursModal
                userId={userId}
                matiereId={resolvedMatiereId}
                onAdded={() => loadCours()}
              >
                <Button type="button">Ajouter un cours</Button>
              </AddCoursModal>
            ) : (
              <Button type="button" disabled>
                Ajouter un cours
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
          {moyenneGenerale !== null && (
            <div className="mb-4">
              <p className="text-lg font-medium">
                Moyenne générale: {moyenneGenerale.toFixed(2)}/20
              </p>
            </div>
          )}
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
        <TabsContent value="cours">
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                value={coursSearch}
                onChange={(event) => setCoursSearch(event.target.value)}
                placeholder="Rechercher un cours"
                className="sm:max-w-xs"
              />
            </div>
            {isLoadingCours ? (
              <p className="text-muted-foreground">Chargement des cours...</p>
            ) : hasErrorCours ? (
              <p className="text-destructive">
                Impossible de charger les cours.
              </p>
            ) : filteredCours.length === 0 ? (
              <p className="text-muted-foreground">
                {cours.length === 0
                  ? "Aucun cours pour cette matière."
                  : "Aucun cours ne correspond à votre recherche."}
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCours.map((c) => (
                  <CoursBox
                    key={c.id}
                    cours={c}
                    matiereId={resolvedMatiereId ?? ""}
                    userId={userId ?? ""}
                    onDeleted={() => loadCours()}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
