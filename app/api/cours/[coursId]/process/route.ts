import { NextResponse } from "next/server"
import { marked } from "marked"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"

import { prisma } from "@/lib/prisma"
import { CourseService } from "@/services/course.service"
import { QuotaExceededError } from "@/errors/quotaExceeded.error"

export const runtime = "nodejs"

export async function POST(
  request: Request,
  { params }: { params?: { coursId?: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Non authentifié" },
      { status: 401 }
    )
  }

  const userId = session.user.id
  const resolvedParams = params ? await params : undefined
  const coursIdFromParams = resolvedParams?.coursId
  const { pathname } = new URL(request.url)
  const parts = pathname.split("/").filter(Boolean)
  const coursIndex = parts.indexOf("cours")
  const coursIdFromPath =
    coursIndex !== -1 ? parts[coursIndex + 1] : undefined

  const coursId = coursIdFromParams ?? coursIdFromPath

  if (!coursId) {
    return NextResponse.json(
      { error: "Paramètres manquants." },
      { status: 400 }
    )
  }

  try {
    // Récupérer le cours et vérifier la propriété
    const cours = await prisma.cours.findUnique({
      where: { id: coursId },
      select: {
        id: true,
        userId: true,
        name: true,
        originalText: true,
        processedText: true,
        imageUrl: true,
      },
    })

    if (!cours) {
      return NextResponse.json(
        { error: "Cours introuvable." },
        { status: 404 }
      )
    }

    if (cours.userId !== userId) {
      return NextResponse.json(
        { error: "Non autorisé." },
        { status: 403 }
      )
    }

    if (!cours.originalText && !cours.imageUrl) {
      return NextResponse.json(
        { error: "Aucun texte ou image à traiter." },
        { status: 400 }
      )
    }

    // Traiter le cours avec l'IA (via CourseService)
    let processedText: string;
    try {
      const model = cours.imageUrl
        ? process.env.MISTRAL_VISION_MODEL ||
          process.env.MISTRAL_MODEL ||
          "pixtral-12b-2409"
        : process.env.MISTRAL_MODEL || "mistral-large-latest";

      processedText = await CourseService.processCourseWithAI(userId, {
        originalText: cours.originalText,
        imageUrl: cours.imageUrl,
        model,
      });

      // Convertir le markdown en HTML avec marked
      let content = ""
      try {
        content = marked.parse(processedText, {
          breaks: true,
          gfm: true,
        }) as string
      } catch (markdownError) {
        console.warn("Erreur lors de la conversion markdown, utilisation du format basique:", markdownError)
        // Fallback: conversion basique en HTML
        content = processedText
          .split("\n\n")
          .filter((p: string) => p.trim())
          .map((p: string) => `<p>${p.trim().replace(/\n/g, "<br>")}</p>`)
          .join("")
      }

      // Mettre à jour le cours avec le texte traité et le contenu HTML
      const updated = await prisma.cours.update({
        where: { id: coursId },
        data: {
          processedText,
          content: content || null,
        },
        select: {
          id: true,
          processedText: true,
          content: true,
        },
      })

      return NextResponse.json(updated)
    } catch (aiError) {
      console.error("Erreur lors du traitement avec l'IA:", aiError)
      
      // Gérer l'erreur de quota dépassé
      if (aiError instanceof QuotaExceededError) {
        return NextResponse.json(
          {
            error: aiError.message,
            code: aiError.code,
            plan: aiError.plan,
            limit: aiError.limit,
            currentUsage: aiError.currentUsage,
          },
          { status: aiError.statusCode }
        );
      }

      return NextResponse.json(
        {
          error:
            aiError instanceof Error
              ? aiError.message
              : "Impossible de traiter le texte. Vérifiez la configuration Mistral et la clé API.",
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Erreur lors du traitement du cours:", error)
    return NextResponse.json(
      { error: "Impossible de traiter le cours." },
      { status: 500 }
    )
  }
}
