import { createUploadthing, type FileRouter } from "uploadthing/next"

const f = createUploadthing()

export const ourFileRouter = {
  fileUploader: f({
    pdf: { maxFileSize: "4MB" },
    image: { maxFileSize: "4MB" },
    video: { maxFileSize: "16MB" },
    audio: { maxFileSize: "4MB" },
    blob: { maxFileSize: "4MB" },
  })
    .middleware(async ({ req }) => {
      // Vous pouvez ajouter une vérification d'authentification ici si nécessaire
      return {}
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: "user" }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
