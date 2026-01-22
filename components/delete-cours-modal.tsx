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

type DeleteCoursModalProps = {
  userId: string
  matiereId: string
  coursId: string
  coursName?: string
  triggerLabel?: string
  children?: React.ReactNode
  onDeleted?: () => void
}

export function DeleteCoursModal({
  userId,
  matiereId,
  coursId,
  coursName,
  triggerLabel = "Supprimer",
  children,
  onDeleted,
}: DeleteCoursModalProps) {
  const [open, setOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleDelete = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      const response = await fetch(
        `/api/users/${userId}/matieres/${matiereId}/cours/${coursId}`,
        { method: "DELETE" }
      )
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null
        throw new Error(payload?.error ?? "Impossible de supprimer le cours.")
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
          <AlertDialogTitle>Supprimer le cours ?</AlertDialogTitle>
          <AlertDialogDescription>
            {coursName
              ? `Êtes-vous sûr de vouloir supprimer le cours "${coursName}" ?`
              : "Êtes-vous sûr de vouloir supprimer ce cours ?"}
            <br />
            Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Annuler</AlertDialogCancel>
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
