"use client"

import * as React from "react"
import { CalendarDays, KanbanSquare, ListChecks, Plus } from "lucide-react"
import { useSession } from "next-auth/react"

import { DevoirBoard } from "@/components/calendrier/devoir-board"
import { DevoirCalendar } from "@/components/calendrier/devoir-calendar"
import { DevoirDialog } from "@/components/calendrier/devoir-dialog"
import { DevoirList } from "@/components/calendrier/devoir-list"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { Devoir, DevoirStatus } from "@/types/devoir"

type UserMatiere = { id: string; name: string; type: string }

function upsertDevoir(list: Devoir[], devoir: Devoir) {
  const idx = list.findIndex((d) => d.id === devoir.id)
  if (idx === -1) return [devoir, ...list]
  const copy = list.slice()
  copy[idx] = devoir
  return copy
}

export function DevoirsPage() {
  const { data: session } = useSession()
  const userId = session?.user?.id

  const [devoirs, setDevoirs] = React.useState<Devoir[]>([])
  const devoirsRef = React.useRef<Devoir[]>([])
  const [matieres, setMatieres] = React.useState<UserMatiere[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)

  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [dialogPresetDate, setDialogPresetDate] = React.useState<Date | undefined>(
    undefined
  )

  const load = React.useCallback(
    async (signal?: AbortSignal) => {
      if (!userId) {
        setDevoirs([])
        setMatieres([])
        return
      }
      setIsLoading(true)
      setHasError(false)
      try {
        const [devoirsRes, matieresRes] = await Promise.all([
          fetch(`/api/users/${userId}/devoirs`, { signal }),
          fetch(`/api/users/${userId}/matieres`, { signal }),
        ])

        if (!devoirsRes.ok) throw new Error("devoirs")
        const devoirsData = (await devoirsRes.json()) as Devoir[]
        if (!signal?.aborted) setDevoirs(devoirsData)

        if (matieresRes.ok) {
          const matieresData = (await matieresRes.json()) as UserMatiere[]
          if (!signal?.aborted) setMatieres(matieresData)
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return
        setHasError(true)
      } finally {
        if (!signal?.aborted) setIsLoading(false)
      }
    },
    [userId]
  )

  React.useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  React.useEffect(() => {
    devoirsRef.current = devoirs
  }, [devoirs])

  const createDevoir = React.useCallback(
    async (payload: {
      title: string
      description?: string | null
      dueDate: Date
      status?: DevoirStatus
      matiereId?: string | null
    }) => {
      if (!userId) return
      const res = await fetch(`/api/users/${userId}/devoirs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: payload.title,
          description: payload.description ?? null,
          dueDate: payload.dueDate.toISOString(),
          status: payload.status,
          matiereId: payload.matiereId ?? null,
        }),
      })
      if (!res.ok) throw new Error("create")
      const created = (await res.json()) as Devoir
      setDevoirs((prev) => upsertDevoir(prev, created))
    },
    [userId]
  )

  const patchDevoir = React.useCallback(
    async (id: string, patch: Partial<Omit<Devoir, "id">>) => {
      if (!userId) return
      const res = await fetch(`/api/users/${userId}/devoirs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(patch.title !== undefined ? { title: patch.title } : {}),
          ...(patch.description !== undefined ? { description: patch.description } : {}),
          ...(patch.dueDate !== undefined ? { dueDate: patch.dueDate } : {}),
          ...(patch.status !== undefined ? { status: patch.status } : {}),
          ...(patch.matiereId !== undefined ? { matiereId: patch.matiereId } : {}),
        }),
      })
      if (!res.ok) throw new Error("patch")
      const updated = (await res.json()) as Devoir
      setDevoirs((prev) => upsertDevoir(prev, updated))
    },
    [userId]
  )

  const changeStatus = React.useCallback(
    (id: string, status: DevoirStatus) => {
      const previous = devoirsRef.current

      // optimistic update
      setDevoirs((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status } : d))
      )

      patchDevoir(id, { status }).catch(() => {
        // revert on failure
        setDevoirs(previous)
      })
    },
    [patchDevoir]
  )

  const deleteDevoir = React.useCallback(
    async (id: string) => {
      if (!userId) return
      const res = await fetch(`/api/users/${userId}/devoirs/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("delete")
      setDevoirs((prev) => prev.filter((d) => d.id !== id))
    },
    [userId]
  )

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Liste des devoirs
          </h1>
          <p className={cn("text-muted-foreground text-sm", hasError && "text-destructive")}>
            {hasError
              ? "Impossible de charger les devoirs."
              : "Ajoute tes devoirs dans un calendrier et gère-les par statut."}
          </p>
        </div>

        <Button
          onClick={() => {
            setDialogPresetDate(undefined)
            setIsDialogOpen(true)
          }}
          disabled={!userId}
          className="w-full md:w-auto"
        >
          <Plus className="mr-2 size-4" />
          Nouveau devoir
        </Button>
      </div>

      <Tabs defaultValue="board" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-fit">
          <TabsTrigger value="board" className="gap-2">
            <KanbanSquare className="size-4" />
            Toutes les tâches
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <ListChecks className="size-4" />
            Par échéance
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <CalendarDays className="size-4" />
            Vue calendrier
          </TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="mt-4">
          <DevoirBoard
            devoirs={devoirs}
            isLoading={isLoading}
            onStatusChange={changeStatus}
            onDelete={(id) => deleteDevoir(id)}
          />
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <DevoirList
            devoirs={devoirs}
            isLoading={isLoading}
            onStatusChange={changeStatus}
            onDelete={(id) => deleteDevoir(id)}
          />
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <DevoirCalendar
            devoirs={devoirs}
            isLoading={isLoading}
            onAddForDay={(day) => {
              setDialogPresetDate(day)
              setIsDialogOpen(true)
            }}
            onStatusChange={changeStatus}
            onDelete={(id) => deleteDevoir(id)}
          />
        </TabsContent>
      </Tabs>

      <DevoirDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        matieres={matieres}
        presetDate={dialogPresetDate}
        onCreate={createDevoir}
      />
    </div>
  )
}

