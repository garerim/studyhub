import { NextResponse } from "next/server"
import { marked } from "marked"

import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function POST(
  request: Request,
  { params }: { params?: { coursId?: string } }
) {
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
    // Récupérer le cours
    const cours = await prisma.cours.findUnique({
      where: { id: coursId },
      select: {
        id: true,
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

    if (!cours.originalText && !cours.imageUrl) {
      return NextResponse.json(
        { error: "Aucun texte ou image à traiter." },
        { status: 400 }
      )
    }

    // Appeler Mistral pour traiter le texte et/ou l'image
    const apiKey = process.env.MISTRAL_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "Clé Mistral manquante (MISTRAL_API_KEY)." },
        { status: 500 }
      )
    }

    const model = cours.imageUrl
      ? process.env.MISTRAL_VISION_MODEL ||
        process.env.MISTRAL_MODEL ||
        "pixtral-12b-2409"
      : process.env.MISTRAL_MODEL || "mistral-large-latest"

    // Construire le prompt selon ce qui est disponible
    let prompt = `Tu es un assistant pédagogique. Transforme les informations suivantes en un cours structuré, clair et détaillé. Organise les informations de manière logique, ajoute des explications si nécessaire, et formate le texte de manière professionnelle.

`

    if (cours.originalText) {
      prompt += `Notes originales (texte):
${cours.originalText}

`
    }

    if (cours.imageUrl) {
      prompt += `Une image de notes est également fournie. Analyse-la et intègre son contenu dans le cours structuré.

`
    }

    prompt += `Cours structuré:`

    try {
      const messageParts: Array<
        { type: "text"; text: string } | { type: "image_url"; image_url: string }
      > = [{ type: "text", text: prompt }]

      if (cours.imageUrl) {
        try {
          const imageResponse = await fetch(cours.imageUrl)
          if (imageResponse.ok) {
            const imageBuffer = await imageResponse.arrayBuffer()
            const imageBase64 = Buffer.from(imageBuffer).toString("base64")
            const imageMimeType =
              imageResponse.headers.get("content-type") || "image/jpeg"
            messageParts.push({
              type: "image_url",
              image_url: `data:${imageMimeType};base64,${imageBase64}`,
            })
          }
        } catch (imageError) {
          console.warn("Impossible de charger l'image pour le traitement:", imageError)
          if (!cours.originalText) {
            throw new Error(
              "Impossible de charger l'image et aucun texte disponible."
            )
          }
        }
      }

      const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "user",
              content: messageParts,
            },
          ],
          temperature: 0.2,
        }),
      })

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "")
        throw new Error(
          `Mistral API error: ${response.status} ${response.statusText} ${errorBody}`
        )
      }

      const data = await response.json()
      const messageContent = data?.choices?.[0]?.message?.content
      const processedText = Array.isArray(messageContent)
        ? messageContent.map((part: { text?: string }) => part.text || "").join("")
        : typeof messageContent === "string"
          ? messageContent
          : ""

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
    } catch (mistralError) {
      console.error("Erreur lors de l'appel à Mistral:", mistralError)
      return NextResponse.json(
        {
          error:
            "Impossible de traiter le texte. Vérifiez la configuration Mistral et la clé API.",
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
