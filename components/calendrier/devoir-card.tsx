"use client"

import * as React from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CheckCircle2, Clock3, MoreHorizontal, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { Devoir, DevoirStatus } from "@/types/devoir"
import { devoirStatusLabels } from "@/types/devoir"

function statusBadgeVariant(status: DevoirStatus) {
  switch (status) {
    case "TODO":
      return "secondary"
    case "IN_PROGRESS":
      return "default"
    case "DONE":
      return "outline"
  }
}

function statusIcon(status: DevoirStatus) {
  switch (status) {
    case "TODO":
      return <Clock3 className="size-4 text-muted-foreground" />
    case "IN_PROGRESS":
      return <Clock3 className="size-4 text-primary" />
    case "DONE":
      return <CheckCircle2 className="size-4 text-emerald-500" />
  }
}

export function DevoirCard({
  devoir,
  onStatusChange,
  onDelete,
  className,
}: {
  devoir: Devoir
  onStatusChange: (id: string, status: DevoirStatus) => void
  onDelete: (id: string) => void
  className?: string
}) {
  const due = new Date(devoir.dueDate)
  const isDone = devoir.status === "DONE"

  return (
    <div
      className={cn(
        "bg-card/60 border-border/60 hover:bg-card/80 hover:border-border rounded-xl border p-3 transition",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{statusIcon(devoir.status)}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className={cn("font-medium leading-5", isDone && "line-through opacity-70")}>
                {devoir.title}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {format(due, "PPP", { locale: fr })}
                {devoir.matiere?.name ? ` • ${devoir.matiere.name}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={statusBadgeVariant(devoir.status)}>
                {devoirStatusLabels[devoir.status]}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Changer le statut</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => onStatusChange(devoir.id, "TODO")}>
                        {devoirStatusLabels.TODO}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onStatusChange(devoir.id, "IN_PROGRESS")}
                      >
                        {devoirStatusLabels.IN_PROGRESS}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onStatusChange(devoir.id, "DONE")}>
                        {devoirStatusLabels.DONE}
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(devoir.id)}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {devoir.description ? (
            <p className="text-muted-foreground mt-2 line-clamp-3 text-sm">
              {devoir.description}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

