"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EditQuizModal } from "@/components/edit-quiz-modal"
import { DeleteQuizModal } from "@/components/delete-quiz-modal"
import { Play, Sparkles, Trophy } from "lucide-react"
import type { Quiz } from "@/types/matiere"

type QuizzesTabProps = {
  userId: string
  matiereId: string
  quizzes: Quiz[]
  isLoading: boolean
  hasError: boolean
  onReload: () => void
  onQuizSelect: (quiz: Quiz) => void
}

export function QuizzesTab({
  userId,
  matiereId,
  quizzes,
  isLoading,
  hasError,
  onReload,
  onQuizSelect,
}: QuizzesTabProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Chargement des quiz...
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="text-center py-8 text-destructive">
        Impossible de charger les quiz.
      </div>
    )
  }

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucun quiz pour cette matière.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz) => {
          const lastAttempt = quiz.attempts[0]
          const bestScore =
            quiz.attempts.length > 0
              ? Math.max(...quiz.attempts.map((a) => (a.score / a.totalPoints) * 100))
              : null

          return (
            <Card key={quiz.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {quiz.name}
                      {quiz.isAIGenerated && (
                        <Sparkles className="size-4 text-primary" />
                      )}
                    </CardTitle>
                    {quiz.description && (
                      <CardDescription className="mt-1">
                        {quiz.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <div>
                    {quiz.questions.length} question{quiz.questions.length > 1 ? "s" : ""}
                  </div>
                  <div>
                    {quiz._count.attempts} tentative{quiz._count.attempts > 1 ? "s" : ""}
                  </div>
                  {lastAttempt && (
                    <div className="mt-2 flex items-center gap-2">
                      <Trophy className="size-4" />
                      <span>
                        Dernier score:{" "}
                        {Math.round((lastAttempt.score / lastAttempt.totalPoints) * 100)}%
                      </span>
                    </div>
                  )}
                  {bestScore !== null && (
                    <div className="text-primary font-medium">
                      Meilleur score: {Math.round(bestScore)}%
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => onQuizSelect(quiz)}
                    disabled={quiz.questions.length === 0}
                  >
                    <Play className="size-4 mr-2" />
                    {quiz.attempts.length > 0 ? "Voir les résultats" : "Passer le quiz"}
                  </Button>
                  <EditQuizModal
                    userId={userId}
                    matiereId={matiereId}
                    quiz={quiz}
                    onUpdated={onReload}
                  />
                  <DeleteQuizModal
                    userId={userId}
                    matiereId={matiereId}
                    quizId={quiz.id}
                    quizName={quiz.name}
                    onDeleted={onReload}
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
  )
}
