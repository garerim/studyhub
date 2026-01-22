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
import { Label } from "@/components/ui/label"

type AddFileModalProps = {
  userId: string
  matiereId: string
  triggerLabel?: string
  children?: React.ReactNode
  onAdded?: () => void
}

export function AddFileModal({
  userId,
  matiereId,
  triggerLabel = "Ajouter un fichier",
  children,
  onAdded,
}: AddFileModalProps) {
  const [open, setOpen] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [fileName, setFileName] = React.useState("")
  const [uploadedFile, setUploadedFile] = React.useState<{
    url: string
    name: string
    size: number
  } | null>(null)

  const handleUploadComplete = async (res: Array<{ url: string; name: string; size: number }>) => {
    if (!res || res.length === 0) {
      setError("Aucun fichier n'a été uploadé.")
      setIsUploading(false)
      return
    }

    const file = res[0]
    setIsUploading(false)
    setError(null)
    setUploadedFile(file)
    // Pré-remplir le nom avec le nom du fichier original (sans extension)
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "")
    setFileName(nameWithoutExt)
  }

  const handleConfirm = async () => {
    if (!uploadedFile) {
      setError("Aucun fichier n'a été uploadé.")
      return
    }

    if (!fileName.trim()) {
      setError("Le nom du fichier est obligatoire.")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      // Déterminer le type MIME basé sur l'extension du fichier original
      const getMimeType = (originalFileName: string): string => {
        const ext = originalFileName.split(".").pop()?.toLowerCase()
        const mimeTypes: Record<string, string> = {
          pdf: "application/pdf",
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          png: "image/png",
          gif: "image/gif",
          webp: "image/webp",
          svg: "image/svg+xml",
          mp4: "video/mp4",
          mov: "video/quicktime",
          avi: "video/x-msvideo",
          mp3: "audio/mpeg",
          wav: "audio/wav",
          doc: "application/msword",
          docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          xls: "application/vnd.ms-excel",
          xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          ppt: "application/vnd.ms-powerpoint",
          pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          zip: "application/zip",
          txt: "text/plain",
        }
        return mimeTypes[ext || ""] || "application/octet-stream"
      }

      const response = await fetch(
        `/api/users/${userId}/matieres/${matiereId}/files`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: fileName.trim(),
            url: uploadedFile.url,
            size: uploadedFile.size,
            mimeType: getMimeType(uploadedFile.name),
          }),
        }
      )

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null
        throw new Error(payload?.error ?? "Impossible d'ajouter le fichier.")
      }

      onAdded?.()
      setOpen(false)
      resetForm()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue."
      )
    } finally {
      setIsUploading(false)
    }
  }

  const resetForm = React.useCallback(() => {
    setFileName("")
    setUploadedFile(null)
    setError(null)
    setIsUploading(false)
  }, [])

  const handleUploadError = (error: Error) => {
    setError(error.message || "Erreur lors de l'upload du fichier.")
    setIsUploading(false)
    setUploadedFile(null)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        if (!value) {
          resetForm()
        }
      }}
    >
      <DialogTrigger asChild>
        {children ?? <Button type="button">{triggerLabel}</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un fichier</DialogTitle>
          <DialogDescription>
            Télécharge un fichier pour cette matière et choisis un nom.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {!uploadedFile ? (
            <>
              <div className="space-y-2">
                <Label>Fichier</Label>
                <UploadButton
                  endpoint="fileUploader"
                  onClientUploadComplete={handleUploadComplete}
                  onUploadError={handleUploadError}
                  onUploadBegin={() => setIsUploading(true)}
                />
              </div>
              {isUploading && (
                <p className="text-muted-foreground text-sm">
                  Upload en cours...
                </p>
              )}
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="fileName">Nom du fichier</Label>
                <Input
                  id="fileName"
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Nom du fichier"
                  disabled={isUploading}
                />
                <p className="text-muted-foreground text-xs">
                  Fichier uploadé : {uploadedFile.name}
                </p>
              </div>
            </>
          )}
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
        </div>
        {uploadedFile && (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setUploadedFile(null)
                setFileName("")
              }}
              disabled={isUploading}
            >
              Changer de fichier
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={isUploading || !fileName.trim()}
            >
              {isUploading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
