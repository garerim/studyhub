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
import { Textarea } from "@/components/ui/textarea"

type AddNoteModalProps = {
  userId: string
  matiereId: string
  triggerLabel?: string
  children?: React.ReactNode
  onAdded?: () => void
}

export function AddNoteModal({
  userId,
  matiereId,
  triggerLabel = "Ajouter une note",
  children,
  onAdded,
}: AddNoteModalProps) {
  const [open, setOpen] = React.useState(false)
  const [note, setNote] = React.useState("")
  const [coefficient, setCoefficient] = React.useState("1")
  const [comment, setComment] = React.useState("")
  const [date, setDate] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const resetForm = React.useCallback(() => {
    setNote("")
    setCoefficient("1")
    setComment("")
    setDate("")
    setError(null)
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!note.trim()) {
      setError("La note est obligatoire.")
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      const response = await fetch(
        `/api/users/${userId}/matieres/${matiereId}/notes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            note: Number(note),
            coefficient: coefficient ? Number(coefficient) : undefined,
            comment: comment.trim() || null,
            date: date || undefined,
          }),
        }
      )
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null
        throw new Error(payload?.error ?? "Impossible d'ajouter la note.")
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une note</DialogTitle>
          <DialogDescription>
            Saisis les informations de la note pour cette matière.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Note</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Ex: 15.5"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Coefficient</label>
              <Input
                type="number"
                min="1"
                step="1"
                value={coefficient}
                onChange={(event) => setCoefficient(event.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Commentaire</label>
              <Textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Optionnel"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
          </div>
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Ajout..." : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
