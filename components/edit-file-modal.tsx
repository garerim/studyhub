"use client"

import * as React from "react"

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

type FilePayload = {
  id: string
  name: string
}

type EditFileModalProps = {
  userId: string
  matiereId: string
  file: FilePayload
  triggerLabel?: string
  children?: React.ReactNode
  onUpdated?: () => void
}

export function EditFileModal({
  userId,
  matiereId,
  file,
  triggerLabel = "Modifier",
  children,
  onUpdated,
}: EditFileModalProps) {
  const [open, setOpen] = React.useState(false)
  const [fileName, setFileName] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const resetForm = React.useCallback(() => {
    setFileName(file.name)
    setError(null)
  }, [file.name])

  React.useEffect(() => {
    if (open) resetForm()
  }, [open, resetForm])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!fileName.trim()) {
      setError("Le nom du fichier est obligatoire.")
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      const response = await fetch(
        `/api/users/${userId}/matieres/${matiereId}/files/${file.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: fileName.trim(),
          }),
        }
      )
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null
        throw new Error(payload?.error ?? "Impossible de modifier le fichier.")
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le nom du fichier</DialogTitle>
          <DialogDescription>
            Mets à jour le nom du fichier.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fileName">Nom du fichier</Label>
            <Input
              id="fileName"
              type="text"
              value={fileName}
              onChange={(event) => setFileName(event.target.value)}
              placeholder="Nom du fichier"
              disabled={isSubmitting}
            />
          </div>
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Mise à jour..." : "Modifier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
