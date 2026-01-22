 "use client"

import React, { useEffect, useRef, useState } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import { TextStyle } from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import { Extension } from "@tiptap/core"
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Palette,
  Scale,
  Text,
  Underline as UnderlineIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const FontSize = Extension.create({
  name: "fontSize",
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize?.replace("px", ""),
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {}
              }
              return {
                style: `font-size: ${attributes.fontSize}px`,
              }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) => {
          return chain().setMark("textStyle", { fontSize }).run()
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run()
        },
    }
  },
})

const ResizableImage = Image.extend({
  addAttributes() {
    const parentAttributes = this.parent?.()
    return {
      ...parentAttributes,
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute("width"),
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {}
          }
          return { width: attributes.width }
        },
      },
      height: {
        default: null,
        parseHTML: (element) => element.getAttribute("height"),
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {}
          }
          return { height: attributes.height }
        },
      },
    }
  },
})

const FONT_SIZES = ["12", "14", "16", "18", "20", "24", "28", "32"]

type RichTextEditorProps = {
  content?: string
  onChange?: (content: string) => void
}

export const RichTextEditor = ({ content = "", onChange }: RichTextEditorProps) => {
  const [fontSize, setFontSize] = useState("16")
  const [textColor, setTextColor] = useState("#000000")
  const [imageWidth, setImageWidth] = useState("")
  const [imageHeight, setImageHeight] = useState("")
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextStyle,
      Color,
      FontSize,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      ResizableImage.configure({
        allowBase64: true,
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "min-h-[220px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none [&_p]:leading-6 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_a]:text-primary [&_a]:underline [&_img]:max-w-full [&_img.ProseMirror-selectednode]:ring-2 [&_img.ProseMirror-selectednode]:ring-primary/60",
      },
    },
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (content === current) return
    editor.commands.setContent(content, { emitUpdate: false })
  }, [content, editor])

  const handleSetLink = () => {
    if (!editor) return
    const previousUrl = editor.getAttributes("link").href as string | undefined
    const url = window.prompt("URL du lien", previousUrl || "")

    if (url === null) return
    if (url === "") {
      editor.chain().focus().unsetLink().run()
      return
    }
    editor.chain().focus().setLink({ href: url }).run()
  }

  const handleAddImage = () => {
    fileInputRef.current?.click()
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!editor) return
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const src = typeof reader.result === "string" ? reader.result : ""
      if (!src) return
      editor.chain().focus().setImage({ src }).run()
    }
    reader.readAsDataURL(file)
    event.target.value = ""
  }

  const handleResizeImage = () => {
    if (!editor || !editor.isActive("image")) return
    editor
      .chain()
      .focus()
      .updateAttributes("image", {
        width: imageWidth ? Number(imageWidth) : null,
        height: imageHeight ? Number(imageHeight) : null,
      })
      .run()
  }

  useEffect(() => {
    if (!editor) return
    const updateImageControls = () => {
      if (!editor.isActive("image")) return
      const attrs = editor.getAttributes("image")
      setImageWidth(attrs.width ?? "")
      setImageHeight(attrs.height ?? "")
    }
    editor.on("selectionUpdate", updateImageControls)
    editor.on("transaction", updateImageControls)
    return () => {
      editor.off("selectionUpdate", updateImageControls)
      editor.off("transaction", updateImageControls)
    }
  }, [editor])

  if (!editor) {
    return <div className="text-sm text-muted-foreground">Chargement...</div>
  }

  const isImageSelected = editor.isActive("image")

  return (
    <div className="flex w-full flex-col gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 rounded-md border border-input bg-background/95 p-2 backdrop-blur">
        <Button
          type="button"
          size="icon-sm"
          variant={editor.isActive("bold") ? "secondary" : "outline"}
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Gras"
          title="Gras"
        >
          <Bold />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant={editor.isActive("italic") ? "secondary" : "outline"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Italique"
          title="Italique"
        >
          <Italic />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant={editor.isActive("underline") ? "secondary" : "outline"}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          aria-label="Souligné"
          title="Souligné"
        >
          <UnderlineIcon />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant={editor.isActive("bulletList") ? "secondary" : "outline"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Liste à puce"
          title="Liste à puce"
        >
          <List />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant={editor.isActive("orderedList") ? "secondary" : "outline"}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Liste numérotée"
          title="Liste numérotée"
        >
          <ListOrdered />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant={editor.isActive("heading", { level: 1 }) ? "secondary" : "outline"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          aria-label="Titre 1"
          title="Titre 1"
        >
          <Heading1 />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "outline"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          aria-label="Titre 2"
          title="Titre 2"
        >
          <Heading2 />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant={editor.isActive("heading", { level: 3 }) ? "secondary" : "outline"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          aria-label="Titre 3"
          title="Titre 3"
        >
          <Heading3 />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          onClick={handleSetLink}
          aria-label="Lien"
          title="Lien"
        >
          <Link2 />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          onClick={handleAddImage}
          aria-label="Image"
          title="Image"
        >
          <ImageIcon />
        </Button>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground" htmlFor="rte-color">
            <Palette className="size-4" aria-hidden="true" />
            <span className="sr-only">Couleur</span>
          </label>
          <Input
            id="rte-color"
            type="color"
            className="h-8 w-12 px-1 py-0"
            value={textColor}
            onChange={(event) => {
              const value = event.target.value
              setTextColor(value)
              editor.chain().focus().setColor(value).run()
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground" htmlFor="rte-size">
            <Text className="size-4" aria-hidden="true" />
            <span className="sr-only">Taille</span>
          </label>
          <select
            id="rte-size"
            className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            value={fontSize}
            onChange={(event) => {
              const value = event.target.value
              setFontSize(value)
              if (value === "") {
                editor.chain().focus().unsetFontSize().run()
                return
              }
              editor.chain().focus().setFontSize(value).run()
            }}
          >
            <option value="">Normal</option>
            {FONT_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}px
              </option>
            ))}
          </select>
        </div>
        {isImageSelected && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground" htmlFor="rte-image-width">
              <Scale className="size-4" aria-hidden="true" />
              <span className="sr-only">Taille image</span>
            </label>
            <Input
              id="rte-image-width"
              type="number"
              min="1"
              className="h-8 w-20 px-2"
              placeholder="Largeur"
              value={imageWidth}
              onChange={(event) => setImageWidth(event.target.value)}
            />
            <Input
              id="rte-image-height"
              type="number"
              min="1"
              className="h-8 w-20 px-2"
              placeholder="Hauteur"
              value={imageHeight}
              onChange={(event) => setImageHeight(event.target.value)}
            />
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              onClick={handleResizeImage}
              aria-label="Appliquer taille"
              title="Appliquer taille"
            >
              <Scale />
            </Button>
          </div>
        )}
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
