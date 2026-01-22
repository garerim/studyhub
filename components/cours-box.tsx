import Link from "next/link"
import { BookOpen, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DeleteCoursModal } from "@/components/modals/delete-cours-modal"

type CoursBoxCours = {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  createdAt: string
  documents: Array<{
    file: {
      id: string
      name: string
      url: string
    }
  }>
}

type CoursBoxProps = {
  cours: CoursBoxCours
  matiereId: string
  onDeleted: () => void
  userId: string
}

function CoursBox({ cours, matiereId, onDeleted, userId }: CoursBoxProps) {
  return (
    <div className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
      {cours.imageUrl && (
        <div className="relative w-full h-48 border rounded-md overflow-hidden">
          <img
            src={cours.imageUrl}
            alt={cours.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">{cours.name}</h3>
        {cours.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {cours.description}
          </p>
        )}
        {cours.documents && cours.documents.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Documents ({cours.documents.length}):
            </p>
            <div className="flex flex-wrap gap-1">
              {cours.documents.map((doc, idx) => (
                <a
                  key={doc.file.id}
                  href={doc.file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  {doc.file.name}
                  {idx < cours.documents.length - 1 && ", "}
                </a>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            {new Date(cours.createdAt).toLocaleDateString("fr-FR")}
          </p>
          <div className="flex items-center gap-2">
            <Link href={`/matiere/${matiereId}/cours/${cours.id}`}>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="px-2 text-xs"
              >
                <BookOpen className="h-3 w-3 mr-1" />
                Lire
              </Button>
            </Link>
            <Link href={`/matiere/${matiereId}/cours/${cours.id}/edit`}>
              <Button
                type="button"
                size="sm"
                variant="default"
                className="px-2 text-xs"
              >
                <Pencil className="h-3 w-3 mr-1" />
                Éditer
              </Button>
            </Link>
            <DeleteCoursModal
              userId={userId}
              matiereId={matiereId}
              coursId={cours.id}
              coursName={cours.name}
              onDeleted={onDeleted}
            >
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="px-2 text-xs"
              >
                Supprimer
              </Button>
            </DeleteCoursModal>
          </div>
        </div>
      </div>
    </div>
  )
}

export { CoursBox }