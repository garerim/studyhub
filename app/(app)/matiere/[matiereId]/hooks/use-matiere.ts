import * as React from "react"

export function useMatiere(matiereId: string | undefined) {
  const [name, setName] = React.useState("")

  React.useEffect(() => {
    if (!matiereId) {
      setName("")
      return
    }

    const controller = new AbortController()
    const loadMatiere = async () => {
      try {
        const response = await fetch(`/api/matieres/${matiereId}`, {
          signal: controller.signal,
        })
        if (!response.ok) {
          setName("")
          return
        }
        const data = (await response.json()) as { name?: string }
        if (!controller.signal.aborted) {
          setName(data?.name ?? "")
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return
        setName("")
      }
    }

    loadMatiere()
    return () => controller.abort()
  }, [matiereId])

  return name
}
