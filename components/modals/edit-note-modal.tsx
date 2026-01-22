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

type NotePayload = {
  id: string
  note: number
  coefficient: number
  comment: string | null
  date: string
}

type EditNoteModalProps = {
  userId: string
  matiereId: string
  note: NotePayload
  triggerLabel?: string
  children?: React.ReactNode
  onUpdated?: () => void
}

export function EditNoteModal({
  userId,
  matiereId,
  note,
  triggerLabel = "Modifier",
  children,
  onUpdated,
}: EditNoteModalProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")
  const [coefficient, setCoefficient] = React.useState("1")
  const [comment, setComment] = React.useState("")
  const [date, setDate] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const resetForm = React.useCallback(() => {
    setValue(note.note.toString())
    setCoefficient(note.coefficient.toString())
    setComment(note.comment ?? "")
    setDate(note.date ? note.date.split("T")[0] : "")
    setError(null)
  }, [note])

  React.useEffect(() => {
    if (open) resetForm()
  }, [open, resetForm])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!value.trim()) {
      setError("La note est obligatoire.")
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      const response = await fetch(
        `/api/users/${userId}/matieres/${matiereId}/notes/${note.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            note: Number(value),
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
        throw new Error(payload?.error ?? "Impossible de modifier la note.")
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
          <DialogTitle>Modifier la note</DialogTitle>
          <DialogDescription>
            Mets à jour les informations de la note.
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
                value={value}
                onChange={(event) => setValue(event.target.value)}
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
              {isSubmitting ? "Mise à jour..." : "Modifier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
