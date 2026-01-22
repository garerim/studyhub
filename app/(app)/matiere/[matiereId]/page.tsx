"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TakeQuizModal } from "@/components/take-quiz-modal"
import { MatiereHeader } from "./components/matiere-header"
import { TabActions } from "./components/tab-actions"
import { NotesTab } from "./components/notes-tab"
import { FilesTab } from "./components/files-tab"
import { QuizzesTab } from "./components/quizzes-tab"
import { useNotes } from "./hooks/use-notes"
import { useFiles } from "./hooks/use-files"
import { useQuizzes } from "./hooks/use-quizzes"
import { useMatiere } from "./hooks/use-matiere"
import type { Quiz } from "./types"

export default function MatierePage() {
  const { matiereId } = useParams()
  const { data: session } = useSession()
  const userId = session?.user?.id
  const resolvedMatiereId = Array.isArray(matiereId) ? matiereId[0] : matiereId

  const [selectedQuiz, setSelectedQuiz] = React.useState<Quiz | null>(null)
  const [isQuizModalOpen, setIsQuizModalOpen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("notes")

  const matiereName = useMatiere(resolvedMatiereId)
  const { notes, isLoading, hasError, reload: reloadNotes } = useNotes(userId, resolvedMatiereId)
  const { files, isLoading: isLoadingFiles, hasError: hasErrorFiles, reload: reloadFiles } = useFiles(userId, resolvedMatiereId)
  const { quizzes, isLoading: isLoadingQuizzes, hasError: hasErrorQuizzes, reload: reloadQuizzes } = useQuizzes(userId, resolvedMatiereId)

  if (!userId || !resolvedMatiereId) {
    return null
  }

  return (
    <div className="space-y-4">
      <MatiereHeader name={matiereName} />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TabsList>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="fichiers">Fichiers</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
          </TabsList>
          <TabActions
            activeTab={activeTab}
            userId={userId}
            matiereId={resolvedMatiereId}
            onNotesAdded={reloadNotes}
            onFilesAdded={reloadFiles}
            onQuizzesAdded={reloadQuizzes}
          />
        </div>
        <TabsContent value="notes">
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
