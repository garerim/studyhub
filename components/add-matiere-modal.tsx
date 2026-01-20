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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Matiere = {
  id: string
  name: string
  type: string
}

type AddMatiereModalProps = {
  userId: string
  triggerLabel?: string
  children?: React.ReactNode
  onAdded?: () => void
}

export function AddMatiereModal({
  userId,
  triggerLabel = "Ajouter une matière",
  children,
  onAdded,
}: AddMatiereModalProps) {
  const [open, setOpen] = React.useState(false)
  const [matieres, setMatieres] = React.useState<Matiere[]>([])
  const [selectedMatiereId, setSelectedMatiereId] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const matieresByType = React.useMemo(() => {
    return matieres.reduce<Record<string, Matiere[]>>((acc, matiere) => {
      const key = matiere.type?.trim() || "Autres"
      acc[key] = acc[key] ? [...acc[key], matiere] : [matiere]
      return acc
    }, {})
  }, [matieres])

  React.useEffect(() => {
    if (!open || matieres.length > 0) return

    let isActive = true
    const loadMatieres = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/matieres")
        if (!response.ok) {
          throw new Error("Impossible de charger les matières.")
        }
        const data = (await response.json()) as Matiere[]
        if (isActive) setMatieres(data)
      } catch (err) {
        if (isActive) {
          setError(
            err instanceof Error
              ? err.message
              : "Une erreur est survenue."
          )
        }
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadMatieres()

    return () => {
      isActive = false
    }
  }, [open, matieres.length])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedMatiereId) {
      setError("Sélectionne une matière.")
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      const response = await fetch(`/api/users/${userId}/matieres`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matiereId: selectedMatiereId }),
      })
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null
        throw new Error(
          payload?.error ?? "Impossible d'ajouter la matière."
        )
      }
      onAdded?.()
      setOpen(false)
      setSelectedMatiereId("")
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
          <DialogTitle>Ajouter une matière</DialogTitle>
          <DialogDescription>
            Sélectionne une matière à associer à cet utilisateur.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Select
              value={selectedMatiereId}
              onValueChange={setSelectedMatiereId}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    isLoading ? "Chargement..." : "Choisir une matière"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(matieresByType).map(([type, items]) => (
                  <SelectGroup key={type}>
                    <SelectLabel>{type}</SelectLabel>
                    {items.map((matiere) => (
                      <SelectItem key={matiere.id} value={matiere.id}>
                        {matiere.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting ? "Ajout..." : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
