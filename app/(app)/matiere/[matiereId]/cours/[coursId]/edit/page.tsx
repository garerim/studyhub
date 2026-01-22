"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { marked } from "marked"
import { RichTextEditor } from "@/components/rich-text-editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"

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
}

export default function EditCoursPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const userId = session?.user?.id
  const matiereId = Array.isArray(params.matiereId)
    ? params.matiereId[0]
    : params.matiereId
  const coursId = Array.isArray(params.coursId) ? params.coursId[0] : params.coursId

  const [cours, setCours] = React.useState<Cours | null>(null)
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [content, setContent] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!userId || !matiereId || !coursId) {
      setIsLoading(false)
      return
    }

    const loadCours = async () => {
      try {
        const response = await fetch(
          `/api/users/${userId}/matieres/${matiereId}/cours/${coursId}`,
          { method: "GET" }
        )
        if (!response.ok) {
          setError("Impossible de charger le cours.")
          setIsLoading(false)
          return
        }
        const data = (await response.json()) as Cours
        setCours(data)
        setName(data.name)
        setDescription(data.description ?? "")
        
        // Si on a du contenu HTML, l'utiliser, sinon convertir le processedText (markdown) en HTML
        let initialContent = data.content ?? ""
        if (!initialContent && data.processedText) {
          try {
            initialContent = marked.parse(data.processedText, {
              breaks: true,
              gfm: true,
            }) as string
          } catch (error) {
            console.warn("Erreur lors de la conversion markdown:", error)
            initialContent = data.processedText
          }
        }
        setContent(initialContent)
      } catch (err) {
        setError("Une erreur est survenue lors du chargement.")
      } finally {
        setIsLoading(false)
      }
    }

    loadCours()
  }, [userId, matiereId, coursId])

  const handleSave = async () => {
    if (!userId || !matiereId || !coursId) return

    if (!name.trim()) {
      setError("Le nom du cours est obligatoire.")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/users/${userId}/matieres/${matiereId}/cours/${coursId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim() || null,
            content: content || null,
          }),
        }
      )

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null
        throw new Error(payload?.error ?? "Impossible de sauvegarder le cours.")
      }

      router.push(`/matiere/${matiereId}?tab=cours`)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue."
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  if (!cours) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-destructive">Cours introuvable.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/matiere/${matiereId}?tab=cours`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-2xl font-semibold">Éditer le cours</h1>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom du cours *</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom du cours"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description du cours (optionnel)"
          />
        </div>

        <div className="space-y-2">
          <Label>Contenu du cours</Label>
          <RichTextEditor content={content} onChange={setContent} />
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/matiere/${matiereId}?tab=cours`)}
          >
            Annuler
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      </div>
    </div>
  )
}
