"use client"

import * as React from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { DevoirStatus } from "@/types/devoir"
import { devoirStatusLabels } from "@/types/devoir"

type UserMatiere = { id: string; name: string; type: string }

const NONE_MATIERE_VALUE = "__none__"

export function DevoirDialog({
  open,
  onOpenChange,
  presetDate,
  matieres,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  presetDate?: Date
  matieres: UserMatiere[]
  onCreate: (payload: {
    title: string
    description?: string | null
    dueDate: Date
    status?: DevoirStatus
    matiereId?: string | null
  }) => Promise<void> | void
}) {
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [dueDate, setDueDate] = React.useState<Date | undefined>(presetDate)
  const [status, setStatus] = React.useState<DevoirStatus>("TODO")
  const [matiereId, setMatiereId] = React.useState<string | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) return
    setTitle("")
    setDescription("")
    setDueDate(presetDate ?? new Date())
    setStatus("TODO")
    setMatiereId(null)
    setError(null)
  }, [open, presetDate])

  const canSave = title.trim().length > 0 && !!dueDate && !isSaving

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Nouveau devoir</DialogTitle>
          <DialogDescription>
            Ajoute un devoir à une date, puis fais-le avancer (à faire → en cours → terminé).
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="devoir-title">Titre</Label>
            <Input
              id="devoir-title"
              placeholder="Ex: Exercice 5 page 42"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="devoir-description">Description (optionnel)</Label>
            <Textarea
              id="devoir-description"
              placeholder="Détails, consignes, liens…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Date d'échéance</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {dueDate ? format(dueDate, "PPP", { locale: fr }) : "Choisir une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label>Statut</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as DevoirStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">{devoirStatusLabels.TODO}</SelectItem>
                  <SelectItem value="IN_PROGRESS">
                    {devoirStatusLabels.IN_PROGRESS}
                  </SelectItem>
                  <SelectItem value="DONE">{devoirStatusLabels.DONE}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Matière (optionnel)</Label>
            <Select
              value={matiereId ?? NONE_MATIERE_VALUE}
              onValueChange={(v) => setMatiereId(v === NONE_MATIERE_VALUE ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Aucune" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_MATIERE_VALUE}>Aucune</SelectItem>
                {matieres.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error ? <p className="text-destructive text-sm">{error}</p> : null}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Annuler
          </Button>
          <Button
            disabled={!canSave}
            onClick={async () => {
              if (!dueDate) return
              setIsSaving(true)
              setError(null)
              try {
                await onCreate({
                  title: title.trim(),
                  description: description.trim().length ? description.trim() : null,
                  dueDate,
                  status,
                  matiereId,
                })
                onOpenChange(false)
              } catch {
                setError("Impossible de créer le devoir.")
              } finally {
                setIsSaving(false)
              }
            }}
          >
            {isSaving ? "Ajout..." : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

