import * as React from "react"
import type { Quiz } from "../types"

export function useQuizzes(userId: string | undefined, matiereId: string | undefined) {
  const [quizzes, setQuizzes] = React.useState<Quiz[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)

  const loadQuizzes = React.useCallback(
    async (signal?: AbortSignal) => {
      if (!userId || !matiereId) {
        setQuizzes([])
        return
      }

      setIsLoading(true)
      setHasError(false)
      try {
        const response = await fetch(
          `/api/users/${userId}/matieres/${matiereId}/quizes`,
          { signal }
        )
        if (!response.ok) {
          setHasError(true)
          setQuizzes([])
          return
        }
        const data = (await response.json()) as Quiz[]
        if (!signal?.aborted) setQuizzes(data)
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return
        setHasError(true)
      } finally {
        if (!signal?.aborted) setIsLoading(false)
      }
    },
    [matiereId, userId]
  )

  React.useEffect(() => {
    if (!userId || !matiereId) {
      setQuizzes([])
      return
    }

    const controller = new AbortController()
    loadQuizzes(controller.signal)
    return () => controller.abort()
  }, [loadQuizzes, matiereId, userId])

  return { quizzes, isLoading, hasError, reload: loadQuizzes }
}
