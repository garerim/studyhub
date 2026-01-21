import { UTApi } from "uploadthing/server"

export const utapi = new UTApi()

/**
 * Extrait la clé du fichier depuis l'URL UploadThing
 * Les URLs UploadThing ont généralement le format :
 * https://<APP_ID>.ufs.sh/f/<FILE_KEY>
 * https://utfs.io/f/<FILE_KEY>
 * https://uploadthing.com/f/<FILE_KEY>
 * ou parfois juste la clé dans le dernier segment du chemin
 */
export function extractFileKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    
    // Pattern 1: /f/<FILE_KEY> (format standard UploadThing)
    const match = urlObj.pathname.match(/\/f\/([^/?]+)/)
    if (match && match[1]) {
      return match[1]
    }
    
    // Pattern 2: La clé est dans le dernier segment du chemin
    const parts = urlObj.pathname.split("/").filter(Boolean)
    if (parts.length > 0) {
      const lastPart = parts[parts.length - 1]
      // Si c'est une clé valide (pas un nom de fichier avec extension)
      if (lastPart && !lastPart.includes(".")) {
        return lastPart
      }
    }
    
    // Pattern 3: Si l'URL contient "utfs.io" ou "ufs.sh", on essaie d'extraire depuis le hash ou query
    if (urlObj.hostname.includes("utfs.io") || urlObj.hostname.includes("ufs.sh")) {
      // Essayer depuis le hash
      if (urlObj.hash) {
        const hashMatch = urlObj.hash.match(/#([^/?]+)/)
        if (hashMatch && hashMatch[1]) {
          return hashMatch[1]
        }
      }
    }
    
    return null
  } catch {
    return null
  }
}
