"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

type Note = {
  id: string
  note: number
  coefficient: number
  date: string
  matiereId: string
}

type ChartPoint = {
  label: string
  average: number
}

const chartConfig = {
  average: {
    label: "Moyenne générale",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export default function Page() {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const [notes, setNotes] = React.useState<Note[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)

  React.useEffect(() => {
    if (!userId) {
      setNotes([])
      return
    }

    const controller = new AbortController()
    const loadNotes = async () => {
      setIsLoading(true)
      setHasError(false)
      try {
        const response = await fetch(`/api/users/${userId}/notes`, {
          signal: controller.signal,
        })
        if (!response.ok) {
          setHasError(true)
          setNotes([])
          return
        }
        const data = (await response.json()) as Note[]
        if (!controller.signal.aborted) setNotes(data)
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return
        setHasError(true)
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    loadNotes()
    return () => controller.abort()
  }, [userId])

  const { average, totalNotes, chartData } = React.useMemo(() => {
    if (notes.length === 0) {
      return { average: 0, totalNotes: 0, chartData: [] as ChartPoint[] }
    }

    // Fonction pour calculer la moyenne d'une matière
    const calculateMatiereAverage = (matiereNotes: Note[]): number => {
      if (matiereNotes.length === 0) return 0
      
      let weightedSum = 0
      let coefficientSum = 0
      
      for (const note of matiereNotes) {
        weightedSum += note.note * note.coefficient
        coefficientSum += note.coefficient
      }
      
      return coefficientSum > 0 ? weightedSum / coefficientSum : 0
    }

    // Fonction pour calculer la moyenne générale à partir des moyennes de matières
    const calculateGeneralAverage = (
      matiereAverages: Map<string, { average: number; totalCoefficient: number }>
    ): number => {
      if (matiereAverages.size === 0) return 0
      
      let weightedSum = 0
      let coefficientSum = 0
      
      for (const { average, totalCoefficient } of matiereAverages.values()) {
        weightedSum += average * totalCoefficient
        coefficientSum += totalCoefficient
      }
      
      return coefficientSum > 0 ? weightedSum / coefficientSum : 0
    }

    // Grouper les notes par jour
    const notesByDay = new Map<string, Note[]>()
    
    for (const note of notes) {
      const date = new Date(note.date)
      // Normaliser la date pour ignorer l'heure (garder seulement jour/mois/année)
      const dayKey = date.toISOString().split('T')[0]
      
      if (!notesByDay.has(dayKey)) {
        notesByDay.set(dayKey, [])
      }
      notesByDay.get(dayKey)!.push(note)
    }

    // Trier les jours par ordre chronologique
    const sortedDays = Array.from(notesByDay.keys()).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    )

    // Calculer la moyenne cumulative pour chaque jour
    const allProcessedNotes: Note[] = []
    const points: ChartPoint[] = []

    for (const dayKey of sortedDays) {
      const dayNotes = notesByDay.get(dayKey)!
      
      // Ajouter toutes les notes de ce jour aux notes traitées
      allProcessedNotes.push(...dayNotes)
      
      // Grouper les notes par matière
      const notesByMatiere = new Map<string, Note[]>()
      for (const note of allProcessedNotes) {
        if (!notesByMatiere.has(note.matiereId)) {
          notesByMatiere.set(note.matiereId, [])
        }
        notesByMatiere.get(note.matiereId)!.push(note)
      }
      
      // Calculer la moyenne de chaque matière
      const matiereAverages = new Map<string, { average: number; totalCoefficient: number }>()
      for (const [matiereId, matiereNotes] of notesByMatiere.entries()) {
        const matiereAverage = calculateMatiereAverage(matiereNotes)
        const totalCoefficient = matiereNotes.reduce(
          (sum, note) => sum + note.coefficient,
          0
        )
        matiereAverages.set(matiereId, {
          average: matiereAverage,
          totalCoefficient,
        })
      }
      
      // Calculer la moyenne générale à partir des moyennes de matières
      const dayAverage = calculateGeneralAverage(matiereAverages)

      points.push({
        label: new Date(dayKey).toLocaleDateString("fr-FR"),
        average: Number(dayAverage.toFixed(2)),
      })
    }

    // Calculer la moyenne générale finale (toutes les notes)
    const notesByMatiere = new Map<string, Note[]>()
    for (const note of notes) {
      if (!notesByMatiere.has(note.matiereId)) {
        notesByMatiere.set(note.matiereId, [])
      }
      notesByMatiere.get(note.matiereId)!.push(note)
    }
    
    const matiereAverages = new Map<string, { average: number; totalCoefficient: number }>()
    for (const [matiereId, matiereNotes] of notesByMatiere.entries()) {
      const matiereAverage = calculateMatiereAverage(matiereNotes)
      const totalCoefficient = matiereNotes.reduce(
        (sum, note) => sum + note.coefficient,
        0
      )
      matiereAverages.set(matiereId, {
        average: matiereAverage,
        totalCoefficient,
      })
    }
    
    const finalAverage = calculateGeneralAverage(matiereAverages)

    return {
      average: Number(finalAverage.toFixed(2)),
      totalNotes: notes.length,
      chartData: points,
    }
  }, [notes])

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nombre de notes</CardTitle>
            <CardDescription>Total pour cet utilisateur</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {isLoading ? "..." : totalNotes}
            </div>
            {hasError ? (
              <p className="text-destructive mt-2 text-sm">
                Impossible de charger les notes.
              </p>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Moyenne générale</CardTitle>
            <CardDescription>Moyenne pondérée par coefficient</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {isLoading ? "..." : average.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle>Évolution de la moyenne générale</CardTitle>
            <CardDescription>Dernières notes enregistrées</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                dataKey="average"
                type="natural"
                fill="var(--color-average)"
                fillOpacity={0.4}
                stroke="var(--color-average)"
                dot={{ r: 4, fill: "var(--color-average)" }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ChartContainer>
          {!isLoading && chartData.length === 0 ? (
            <p className="text-muted-foreground mt-4 text-sm">
              Aucune note pour afficher la courbe.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
