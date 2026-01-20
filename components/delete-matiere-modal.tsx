"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type DeleteMatiereModalProps = {
  userId: string
  matiereId: string
  matiereName?: string
  triggerLabel?: string
  children?: React.ReactNode
  onDeleted?: () => void
}

export function DeleteMatiereModal({
  userId,
  matiereId,
  matiereName,
  triggerLabel = "Supprimer",
  children,
  onDeleted,
}: DeleteMatiereModalProps) {
  const [open, setOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleDelete = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      const response = await fetch(
        `/api/users/${userId}/matieres/${matiereId}`,
        { method: "DELETE" }
      )
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null
        throw new Error(payload?.error ?? "Impossible de supprimer la matière.")
      }
      onDeleted?.()
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
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children ?? <Button type="button">{triggerLabel}</Button>}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Supprimer la matière{matiereName ? ` "${matiereName}"` : ""} ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Cette action supprimera toutes vos notes associées à cette matière.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Suppression..." : "Supprimer"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
