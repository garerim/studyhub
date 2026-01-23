"use client"

import * as React from "react"
import { UploadButton } from "@/lib/uploadthing"
import { toastFromNotification, handleAPIError } from "@/lib/toast"

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

type AddCoursModalProps = {
  userId: string
  matiereId: string
  triggerLabel?: string
  children?: React.ReactNode
  onAdded?: () => void
}

export function AddCoursModal({
  userId,
  matiereId,
  triggerLabel = "Ajouter un cours",
  children,
  onAdded,
}: AddCoursModalProps) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [originalText, setOriginalText] = React.useState("")
  const [imageUrl, setImageUrl] = React.useState<string | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isProcessing, setIsProcessing] = React.useState(false)

  const resetForm = React.useCallback(() => {
    setName("")
    setDescription("")
    setOriginalText("")
    setImageUrl(null)
    setError(null)
    setIsUploading(false)
    setIsProcessing(false)
  }, [])

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
    setImageUrl(null)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim()) {
      setError("Le nom du cours est obligatoire.")
      return
    }

    // On peut créer un cours même sans texte ni image, mais on ne peut pas le traiter
    if (!originalText.trim() && !imageUrl) {
      // On peut quand même créer le cours, mais on ne le traitera pas
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Créer le cours
      const response = await fetch(
        `/api/users/${userId}/matieres/${matiereId}/cours`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim() || null,
            imageUrl: imageUrl,
            originalText: originalText.trim() || null,
          }),
        }
      )

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null
        throw new Error(payload?.error ?? "Impossible d'ajouter le cours.")
      }

      const cours = await response.json()

      // Si on a du texte original ou une image, traiter avec Mistral
      if (originalText.trim() || imageUrl) {
        setIsProcessing(true)
        try {
          const processResponse = await fetch(`/api/cours/${cours.id}/process`, {
            method: "POST",
          })

          if (!processResponse.ok) {
            const errorData = await processResponse.json().catch(() => ({}));
            // Gérer les erreurs de quota
            if (errorData.code === "QUOTA_EXCEEDED") {
              handleAPIError({
                message: errorData.error || "Quota dépassé",
                code: errorData.code,
              } as unknown as Error);
            } else {
              console.warn(
                "Le cours a été créé mais le traitement avec Mistral a échoué."
              );
            }
          } else {
            const processData = await processResponse.json();
            // Afficher le toast si une notification a été créée
            if (processData.notification) {
              toastFromNotification(
                processData.notification.type,
                processData.notification.title,
                processData.notification.message
              );
            }
          }
        } catch (processError) {
          console.warn(
            "Le cours a été créé mais le traitement avec Mistral a échoué:",
            processError
          )
        } finally {
          setIsProcessing(false)
        }
      }

      onAdded?.()
      setOpen(false)
      resetForm()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        if (!value) resetForm()
      }}
    >
      <DialogTrigger asChild>
        {children ?? <Button type="button">{triggerLabel}</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un cours</DialogTitle>
          <DialogDescription>
            Crée un nouveau cours en renseignant un nom, une description et en
            important une image ou un texte de notes.
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
              placeholder="Ex: Introduction à la programmation"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description du cours (optionnel)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Image (optionnel)</Label>
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
            <Label htmlFor="originalText">
              Texte de notes (optionnel, sera traité par IA)
            </Label>
            <Textarea
              id="originalText"
              value={originalText}
              onChange={(event) => setOriginalText(event.target.value)}
              placeholder="Collez ici vos notes prises en cours..."
              rows={8}
            />
            <p className="text-muted-foreground text-xs">
              Le texte sera automatiquement traité par Mistral pour créer un
              cours structuré.
            </p>
          </div>

          {error ? <p className="text-destructive text-sm">{error}</p> : null}
          <DialogFooter>
            <Button
              type="submit"
              disabled={isSubmitting || isUploading || isProcessing}
            >
              {isProcessing
                ? "Traitement en cours..."
                : isSubmitting
                  ? "Ajout..."
                  : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
