"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"

import { AddCoursModal } from "@/components/modals/add-cours-modal"
import { CoursBox } from "@/components/cours-box"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TakeQuizModal } from "@/components/take-quiz-modal"
import { MatiereHeader } from "@/components/matiere/matiere-header"
import { TabActions } from "@/components/matiere/tab-actions"
import { NotesTab } from "@/components/matiere/notes-tab"
import { FilesTab } from "@/components/matiere/files-tab"
import { QuizzesTab } from "@/components/matiere/quizzes-tab"
import { useNotes } from "@/hooks/matiere/use-notes"
import { useFiles } from "@/hooks/matiere/use-files"
import { useQuizzes } from "@/hooks/matiere/use-quizzes"
import { useMatiere } from "@/hooks/matiere/use-matiere"
import type { Quiz } from "@/types/matiere"

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

  const [selectedQuiz, setSelectedQuiz] = React.useState<Quiz | null>(null)
  const [isQuizModalOpen, setIsQuizModalOpen] = React.useState(false)
  const [cours, setCours] = React.useState<Cours[]>([])
  const [isLoadingCours, setIsLoadingCours] = React.useState(false)
  const [hasErrorCours, setHasErrorCours] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("notes")
  const [coursSearch, setCoursSearch] = React.useState("")

  const matiereName = useMatiere(resolvedMatiereId)
  const { notes, isLoading, hasError, reload: reloadNotes } = useNotes(userId, resolvedMatiereId)
  const { files, isLoading: isLoadingFiles, hasError: hasErrorFiles, reload: reloadFiles } = useFiles(userId, resolvedMatiereId)
  const { quizzes, isLoading: isLoadingQuizzes, hasError: hasErrorQuizzes, reload: reloadQuizzes } = useQuizzes(userId, resolvedMatiereId)

  if (!userId || !resolvedMatiereId) {
    return null
  }

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
      <MatiereHeader name={matiereName} />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TabsList>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="fichiers">Fichiers</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
            <TabsTrigger value="cours">Cours</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <TabActions
              activeTab={activeTab}
              userId={userId}
              matiereId={resolvedMatiereId}
              onNotesAdded={reloadNotes}
              onFilesAdded={reloadFiles}
              onQuizzesAdded={reloadQuizzes}
            />
            {activeTab === "cours" ? (
              <AddCoursModal
                userId={userId}
                matiereId={resolvedMatiereId}
                onAdded={() => loadCours()}
              >
                <Button type="button">Ajouter un cours</Button>
              </AddCoursModal>
            ) : null}
          </div>
        </div>
        <TabsContent value="notes">
          {moyenneGenerale !== null && (
            <div className="mb-4">
              <p className="text-lg font-medium">
                Moyenne générale: {moyenneGenerale.toFixed(2)}/20
              </p>
            </div>
          )}
          <NotesTab
            userId={userId}
            matiereId={resolvedMatiereId}
            notes={notes}
            isLoading={isLoading}
            hasError={hasError}
            onReload={reloadNotes}
          />
        </TabsContent>
        <TabsContent value="fichiers">
          <FilesTab
            userId={userId}
            matiereId={resolvedMatiereId}
            files={files}
            isLoading={isLoadingFiles}
            hasError={hasErrorFiles}
            onReload={reloadFiles}
          />
        </TabsContent>
        <TabsContent value="quiz">
          <QuizzesTab
            userId={userId}
            matiereId={resolvedMatiereId}
            quizzes={quizzes}
            isLoading={isLoadingQuizzes}
            hasError={hasErrorQuizzes}
            onReload={reloadQuizzes}
            onQuizSelect={(quiz) => {
              setSelectedQuiz(quiz)
              setIsQuizModalOpen(true)
            }}
          />
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
      {selectedQuiz && (
        <TakeQuizModal
          userId={userId}
          matiereId={resolvedMatiereId}
          quiz={selectedQuiz}
          previousAttempt={
            selectedQuiz.attempts[0]
              ? {
                  id: selectedQuiz.attempts[0].id,
                  score: selectedQuiz.attempts[0].score,
                  totalPoints: selectedQuiz.attempts[0].totalPoints,
                  completedAt: selectedQuiz.attempts[0].completedAt,
                  answers: selectedQuiz.attempts[0].answers,
                }
              : null
          }
          open={isQuizModalOpen}
          onOpenChange={setIsQuizModalOpen}
          onCompleted={() => {
            reloadQuizzes()
            setIsQuizModalOpen(false)
          }}
        />
      )}
    </div>
  )
}
