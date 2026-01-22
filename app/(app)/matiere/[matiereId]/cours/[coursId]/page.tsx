"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { marked } from "marked"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit } from "lucide-react"

type Cours = {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  originalText: string | null
  processedText: string | null
  content: string | null
  createdAt: string
  updatedAt: string
  documents: Array<{
    file: {
      id: string
      name: string
      url: string
      size: number
      mimeType: string
    }
  }>
}

export default function ViewCoursPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const userId = session?.user?.id
  const matiereId = Array.isArray(params.matiereId)
    ? params.matiereId[0]
    : params.matiereId
  const coursId = Array.isArray(params.coursId) ? params.coursId[0] : params.coursId

  const [cours, setCours] = React.useState<Cours | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [htmlContent, setHtmlContent] = React.useState<string>("")

  React.useEffect(() => {
    if (!userId || !matiereId || !coursId) {
      setIsLoading(false)
      return
    }

    const loadCours = async () => {
      try {
        const response = await fetch(
          `/api/users/${userId}/matieres/${matiereId}/cours/${coursId}`,
          { method: "GET" }
        )
        if (!response.ok) {
          setError("Impossible de charger le cours.")
          setIsLoading(false)
          return
        }
        const data = (await response.json()) as Cours
        setCours(data)
        if (data.content) {
          setHtmlContent(data.content)
        } else if (data.processedText) {
          try {
            setHtmlContent(
              marked.parse(data.processedText, {
                breaks: true,
                gfm: true,
              }) as string
            )
          } catch (error) {
            console.warn("Erreur lors de la conversion markdown:", error)
            setHtmlContent(data.processedText)
          }
        } else {
          setHtmlContent("")
        }
      } catch (err) {
        setError("Une erreur est survenue lors du chargement.")
      } finally {
        setIsLoading(false)
      }
    }

    loadCours()
  }, [userId, matiereId, coursId])

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  if (!cours || error) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-destructive">{error || "Cours introuvable."}</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/matiere/${matiereId}?tab=cours`)}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/matiere/${matiereId}?tab=cours`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{cours.name}</h1>
            {cours.description && (
              <p className="text-muted-foreground mt-2">{cours.description}</p>
            )}
          </div>
        </div>
        <Link href={`/matiere/${matiereId}/cours/${coursId}/edit`}>
          <Button type="button" variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Éditer
          </Button>
        </Link>
      </div>

      {cours.imageUrl && (
        <div className="relative w-full max-w-4xl mx-auto">
          <img
            src={cours.imageUrl}
            alt={cours.name}
            className="w-full h-auto rounded-lg border shadow-sm"
          />
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {htmlContent ? (
          <div
            dangerouslySetInnerHTML={{ __html: htmlContent }}
            className="text-base leading-relaxed [&_p]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_a]:text-primary [&_a]:underline [&_img]:max-w-full"
          />
        ) : (
          <p className="text-muted-foreground italic">
            Aucun contenu disponible pour ce cours.
          </p>
        )}
      </div>

      {cours.documents && cours.documents.length > 0 && (
        <div className="max-w-4xl mx-auto space-y-4">
          <h2 className="text-2xl font-semibold">Documents associés</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {cours.documents.map((doc) => (
              <div
                key={doc.file.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">{doc.file.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {(doc.file.size / 1024).toFixed(2)} KB • {doc.file.mimeType}
                    </p>
                  </div>
                  <a
                    href={doc.file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button type="button" variant="outline" size="sm">
                      Ouvrir
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto pt-8 border-t">
        <p className="text-sm text-muted-foreground">
          Créé le {new Date(cours.createdAt).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          {cours.updatedAt !== cours.createdAt && (
            <>
              {" • "}
              Modifié le{" "}
              {new Date(cours.updatedAt).toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </>
          )}
        </p>
      </div>
    </div>
  )
}
