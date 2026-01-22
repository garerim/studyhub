import * as React from "react"
import type { File } from "@/types/matiere"

export function useFiles(userId: string | undefined, matiereId: string | undefined) {
  const [files, setFiles] = React.useState<File[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)

  const loadFiles = React.useCallback(
    async (signal?: AbortSignal) => {
      if (!userId || !matiereId) {
        setFiles([])
        return
      }

      setIsLoading(true)
      setHasError(false)
      try {
        const response = await fetch(
          `/api/users/${userId}/matieres/${matiereId}/files`,
          { signal }
        )
        if (!response.ok) {
          setHasError(true)
          setFiles([])
          return
        }
        const data = (await response.json()) as File[]
        if (!signal?.aborted) setFiles(data)
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
      setFiles([])
      return
    }

    const controller = new AbortController()
    loadFiles(controller.signal)
    return () => controller.abort()
  }, [loadFiles, matiereId, userId])

  return { files, isLoading, hasError, reload: loadFiles }
}
