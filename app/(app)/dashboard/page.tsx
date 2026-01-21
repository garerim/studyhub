"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

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
} from "@/components/ui/chart"

type Note = {
  id: string
  note: number
  coefficient: number
  date: string
}

type ChartPoint = {
  label: string
  average: number
}

const chartConfig = {
  average: {
    label: "Moyenne générale",
    color: "hsl(var(--chart-1))",
  },
}

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

    const sorted = [...notes].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    let weightedSum = 0
    let coefficientSum = 0
    const points: ChartPoint[] = []

    for (const item of sorted) {
      weightedSum += item.note * item.coefficient
      coefficientSum += item.coefficient
      points.push({
        label: new Date(item.date).toLocaleDateString("fr-FR"),
        average:
          coefficientSum > 0
            ? Number((weightedSum / coefficientSum).toFixed(2))
            : 0,
      })
    }

    return {
      average:
        coefficientSum > 0 ? Number((weightedSum / coefficientSum).toFixed(2)) : 0,
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
            <CardTitle>Évolution de la moyenne</CardTitle>
            <CardDescription>Dernières notes enregistrées</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <LineChart data={chartData} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    labelClassName="text-xs text-muted-foreground"
                  />
                }
              />
              <Line
                dataKey="average"
                type="monotone"
                stroke="var(--color-average)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
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
