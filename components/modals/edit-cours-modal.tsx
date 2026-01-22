"use client"

import * as React from "react"
import { UploadButton } from "@/lib/uploadthing"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

type CoursPayload = {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  originalText: string | null
  processedText: string | null
  createdAt: string
  updatedAt: string
  documents?: Array<{
    file: {
      id: string
      name: string
      url: string
      size: number
      mimeType: string
    }
  }>
}

type EditCoursModalProps = {
  userId: string
  matiereId: string
  cours: CoursPayload
  triggerLabel?: string
  children?: React.ReactNode
  onUpdated?: () => void
}

export function EditCoursModal({
  userId,
  matiereId,
  cours,
  triggerLabel = "Modifier",
  children,
  onUpdated,
}: EditCoursModalProps) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [originalText, setOriginalText] = React.useState("")
  const [processedText, setProcessedText] = React.useState("")
  const [imageUrl, setImageUrl] = React.useState<string | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isProcessing, setIsProcessing] = React.useState(false)

  const resetForm = React.useCallback(() => {
    setName(cours.name)
    setDescription(cours.description ?? "")
    setOriginalText(cours.originalText ?? "")
    setProcessedText(cours.processedText ?? "")
    setImageUrl(cours.imageUrl)
    setError(null)
    setIsUploading(false)
    setIsProcessing(false)
  }, [cours])

  React.useEffect(() => {
    if (open) resetForm()
  }, [open, resetForm])

  const handleUploadComplete = async (
    res: Array<{ url: string; name: string; size: number }>
  ) => {
    if (!res || res.length === 0) {
      setError("Aucun fichier n'a été uploadé.")
      setIsUploading(false)
      return
    }

    const file = res[0]
    setIsUploading(false)
    setError(null)
    setImageUrl(file.url)
  }

  const handleUploadError = (error: Error) => {
    setError(error.message || "Erreur lors de l'upload de l'image.")
    setIsUploading(false)
  }

  const handleProcessText = async () => {
    if (!originalText.trim()) {
      setError("Veuillez d'abord saisir un texte de notes.")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch(`/api/cours/${cours.id}/process`, {
        method: "POST",
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null
        throw new Error(
          payload?.error ??
            "Impossible de traiter le texte. Vérifiez la configuration Mistral."
        )
      }

      const data = await response.json()
      setProcessedText(data.processedText || "")
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue."
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim()) {
      setError("Le nom du cours est obligatoire.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/users/${userId}/matieres/${matiereId}/cours/${cours.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim() || null,
            imageUrl: imageUrl,
            originalText: originalText.trim() || null,
            processedText: processedText.trim() || null,
          }),
        }
      )

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null
        throw new Error(payload?.error ?? "Impossible de modifier le cours.")
      }

      onUpdated?.()
      setOpen(false)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? <Button type="button">{triggerLabel}</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le cours</DialogTitle>
          <DialogDescription>
            Mets à jour les informations du cours.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du cours *</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            {!imageUrl ? (
              <UploadButton
                endpoint="fileUploader"
                onClientUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                onUploadBegin={() => setIsUploading(true)}
              />
            ) : (
              <div className="space-y-2">
                <div className="relative w-full h-48 border rounded-md overflow-hidden">
                  <img
                    src={imageUrl}
                    alt="Image uploadée"
                    className="w-full h-full object-contain"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setImageUrl(null)}
                  disabled={isUploading}
                >
                  Changer d'image
                </Button>
              </div>
            )}
            {isUploading && (
              <p className="text-muted-foreground text-sm">
                Upload en cours...
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="originalText">Texte de notes original</Label>
            <Textarea
              id="originalText"
              value={originalText}
              onChange={(event) => setOriginalText(event.target.value)}
              rows={6}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleProcessText}
                disabled={isProcessing || !originalText.trim()}
              >
                {isProcessing
                  ? "Traitement en cours..."
                  : "Traiter avec Mistral"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="processedText">Texte traité (cours structuré)</Label>
            <Textarea
              id="processedText"
              value={processedText}
              onChange={(event) => setProcessedText(event.target.value)}
              rows={10}
            />
          </div>

          {error ? <p className="text-destructive text-sm">{error}</p> : null}
          <DialogFooter>
            <Button
              type="submit"
              disabled={isSubmitting || isUploading || isProcessing}
            >
              {isSubmitting ? "Mise à jour..." : "Modifier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
