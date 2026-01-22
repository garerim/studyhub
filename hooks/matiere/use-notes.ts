import * as React from "react"
import type { Note } from "@/types/matiere"

export function useNotes(userId: string | undefined, matiereId: string | undefined) {
  const [notes, setNotes] = React.useState<Note[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)

  const loadNotes = React.useCallback(
    async (signal?: AbortSignal) => {
      if (!userId || !matiereId) {
        setNotes([])
        return
      }

      setIsLoading(true)
      setHasError(false)
      try {
        const response = await fetch(
          `/api/users/${userId}/matieres/${matiereId}/notes`,
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
    [matiereId, userId]
  )

  React.useEffect(() => {
    if (!userId || !matiereId) {
      setNotes([])
      return
    }

    const controller = new AbortController()
    loadNotes(controller.signal)
    return () => controller.abort()
  }, [loadNotes, matiereId, userId])

  return { notes, isLoading, hasError, reload: loadNotes }
}
