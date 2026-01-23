"use client"

import * as React from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"

import { DevoirCard } from "@/components/calendrier/devoir-card"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { Devoir, DevoirStatus } from "@/types/devoir"
import { devoirStatusLabels } from "@/types/devoir"

const STATUSES: DevoirStatus[] = ["TODO", "IN_PROGRESS", "DONE"]

function DroppableColumn({
  id,
  title,
  count,
  children,
}: {
  id: DevoirStatus
  title: string
  count: number
  children: React.ReactNode
}) {
  const { isOver, setNodeRef } = useDroppable({ id })

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        "bg-muted/20 border-border/60 flex min-h-[380px] flex-col gap-3 p-4 transition",
        isOver && "ring-ring/40 ring-2"
      )}
    >
      <div className="flex items-center justify-between">
        <p className="font-medium">{title}</p>
        <Badge variant="secondary">{count}</Badge>
      </div>
      <div className="flex flex-1 flex-col gap-3">{children}</div>
    </Card>
  )
}

function DraggableDevoirCard({
  devoir,
  onStatusChange,
  onDelete,
}: {
  devoir: Devoir
  onStatusChange: (id: string, status: DevoirStatus) => void
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useDraggable({
      id: devoir.id,
      data: { status: devoir.status },
    })

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0)`
      : undefined,
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "opacity-40")}
      {...listeners}
      {...attributes}
    >
      <DevoirCard
        devoir={devoir}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
      />
    </div>
  )
}

export function DevoirBoard({
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
  const [activeId, setActiveId] = React.useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const grouped = React.useMemo(() => {
    const by: Record<DevoirStatus, Devoir[]> = {
      TODO: [],
      IN_PROGRESS: [],
      DONE: [],
    }
    for (const d of devoirs) by[d.status].push(d)
    return by
  }, [devoirs])

  const activeDevoir = React.useMemo(() => {
    if (!activeId) return null
    return devoirs.find((d) => d.id === activeId) ?? null
  }, [activeId, devoirs])

  if (isLoading && devoirs.length === 0) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-muted/20 border-border/60 p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-10" />
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const active = String(event.active.id)
    const over = event.over?.id ? String(event.over.id) : null
    setActiveId(null)

    if (!over) return
    if (!STATUSES.includes(over as DevoirStatus)) return

    const devoir = devoirs.find((d) => d.id === active)
    if (!devoir) return
    const nextStatus = over as DevoirStatus
    if (devoir.status === nextStatus) return

    onStatusChange(active, nextStatus)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <DroppableColumn id="TODO" title={devoirStatusLabels.TODO} count={grouped.TODO.length}>
          {grouped.TODO.length ? (
            grouped.TODO.map((d) => (
              <DraggableDevoirCard
                key={d.id}
                devoir={d}
                onStatusChange={onStatusChange}
                onDelete={onDelete}
              />
            ))
          ) : (
            <p className="text-muted-foreground text-sm">Rien à faire pour l’instant.</p>
          )}
        </DroppableColumn>

        <DroppableColumn
          id="IN_PROGRESS"
          title={devoirStatusLabels.IN_PROGRESS}
          count={grouped.IN_PROGRESS.length}
        >
          {grouped.IN_PROGRESS.length ? (
            grouped.IN_PROGRESS.map((d) => (
              <DraggableDevoirCard
                key={d.id}
                devoir={d}
                onStatusChange={onStatusChange}
                onDelete={onDelete}
              />
            ))
          ) : (
            <p className="text-muted-foreground text-sm">Aucune tâche en cours.</p>
          )}
        </DroppableColumn>

        <DroppableColumn id="DONE" title={devoirStatusLabels.DONE} count={grouped.DONE.length}>
          {grouped.DONE.length ? (
            grouped.DONE.map((d) => (
              <DraggableDevoirCard
                key={d.id}
                devoir={d}
                onStatusChange={onStatusChange}
                onDelete={onDelete}
              />
            ))
          ) : (
            <p className="text-muted-foreground text-sm">Aucune tâche terminée.</p>
          )}
        </DroppableColumn>
      </div>

      <DragOverlay>
        {activeDevoir ? (
          <div className="w-[420px] max-w-[90vw]">
            <DevoirCard
              devoir={activeDevoir}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              className="shadow-xl"
            />
          </div>
        ) : (
          <div />
        )}
      </DragOverlay>
    </DndContext>
  )
}

