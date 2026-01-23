"use client"

import * as React from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Plus } from "lucide-react"

import { DevoirCard } from "@/components/calendrier/devoir-card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Devoir, DevoirStatus } from "@/types/devoir"

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function DevoirCalendar({
  devoirs,
  isLoading,
  onAddForDay,
  onStatusChange,
  onDelete,
}: {
  devoirs: Devoir[]
  isLoading: boolean
  onAddForDay: (day: Date) => void
  onStatusChange: (id: string, status: DevoirStatus) => void
  onDelete: (id: string) => void
}) {
  const [selected, setSelected] = React.useState<Date | undefined>(new Date())

  const countsByDay = React.useMemo(() => {
    const map = new Map<string, number>()
    for (const d of devoirs) {
      const k = dayKey(new Date(d.dueDate))
      map.set(k, (map.get(k) ?? 0) + 1)
    }
    return map
  }, [devoirs])

  const selectedKey = selected ? dayKey(selected) : null
  const selectedDevoirs = React.useMemo(() => {
    if (!selectedKey) return []
    return devoirs.filter((d) => dayKey(new Date(d.dueDate)) === selectedKey)
  }, [devoirs, selectedKey])

  if (isLoading && devoirs.length === 0) {
    return (
      <Card className="p-4">
        <div className="grid gap-6 sm:grid-cols-[340px,1fr]">
          <div>
            <Skeleton className="h-[320px] w-[320px]" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="flex w-full gap-4">
      {/* grid gap-6 sm:grid-cols-[340px,1fr] */}
      <Card className="w-full h-fit p-2 sm:w-[340px]">
        <Calendar
          className="w-full rounded-md"
          mode="single"
          selected={selected}
          onSelect={setSelected}
          modifiers={{
            hasDevoir: (date) => countsByDay.has(dayKey(date)),
          }}
          modifiersClassNames={{
            hasDevoir:
              "after:content-[''] after:size-1.5 after:rounded-full after:bg-primary after:opacity-90",
          }}
        />
      </Card>

      <Card className="p-4 flex-1">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium">
              {selected ? format(selected, "PPPP", { locale: fr }) : "Sélectionne une date"}
            </p>
            <p className="text-muted-foreground text-xs">
              {selectedDevoirs.length} devoir(s) ce jour
            </p>
          </div>
          <Button
            className="w-full md:w-auto"
            onClick={() => onAddForDay(selected ?? new Date())}
          >
            <Plus className="mr-2 size-4" />
            Ajouter un devoir à cette date
          </Button>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {selectedDevoirs.length ? (
            selectedDevoirs.map((d) => (
                <DevoirCard
                  key={d.id}
                  devoir={d}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                />
            ))
          ) : (
            <p className="text-muted-foreground text-sm">
              Aucun devoir à cette date. Ajoute-en un pour le voir apparaître dans le calendrier.
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}

