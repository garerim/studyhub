"use client"

import * as React from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

import { DevoirCard } from "@/components/calendrier/devoir-card"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import type { Devoir, DevoirStatus } from "@/types/devoir"

function dateKey(iso: string) {
  const d = new Date(iso)
  return d.toISOString().slice(0, 10)
}

export function DevoirList({
  devoirs,
  isLoading,
  onStatusChange,
  onDelete,
}: {
  devoirs: Devoir[]
  isLoading: boolean
  onStatusChange: (id: string, status: DevoirStatus) => void
  onDelete: (id: string) => void
}) {
  const grouped = React.useMemo(() => {
    const sorted = [...devoirs].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    )
    const map = new Map<string, Devoir[]>()
    for (const d of sorted) {
      const k = dateKey(d.dueDate)
      if (!map.has(k)) map.set(k, [])
      map.get(k)!.push(d)
    }
    return map
  }, [devoirs])

  if (isLoading && devoirs.length === 0) {
    return (
      <Card className="p-4">
        <div className="space-y-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </Card>
    )
  }

  if (devoirs.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground text-sm">
          Aucun devoir pour l’instant. Clique sur “Nouveau devoir” pour en ajouter un.
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      {Array.from(grouped.entries()).map(([day, items], idx) => {
        const label = format(new Date(day), "PPPP", { locale: fr })
        return (
          <div key={day} className="py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-muted-foreground text-xs">{items.length} devoir(s)</p>
            </div>
            <div className="mt-3 flex flex-col gap-3">
              {items.map((d) => (
                <DevoirCard
                  key={d.id}
                  devoir={d}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                />
              ))}
            </div>
            {idx < grouped.size - 1 ? <Separator className="mt-6" /> : null}
          </div>
        )
      })}
    </Card>
  )
}

