"use client"

import * as React from "react"
import {
  Calendar,
  Folder,
  FolderOpen,
  GraduationCap,
  Home,
  NotebookPen,
  PlusCircle,
  type LucideIcon,
} from "lucide-react"
import { useSession } from "next-auth/react"

import { AddMatiereModal } from "@/components/add-matiere-modal"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import Link from "next/link"

type SidebarItem = {
  title: string
  url: string
  icon: LucideIcon
  muted?: boolean
}

type UserMatiere = {
  id: string
  name: string
  type: string
}

const platformItems: SidebarItem[] = [
  { title: "Tableau de bord", url: "/dashboard", icon: Home },
  { title: "Mes cours", url: "/cours", icon: NotebookPen },
  { title: "Mes fichiers", url: "/fichiers", icon: Folder },
  { title: "Calendrier", url: "/calendrier", icon: Calendar },
]

const subjectItems: SidebarItem[] = [
  // { title: "Mathématiques", url: "/matieres/mathematiques", icon: FolderOpen },
  // { title: "Informatique", url: "/matieres/informatique", icon: FolderOpen },
  // { title: "Littérature", url: "/matieres/litterature", icon: FolderOpen }
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const [userMatieres, setUserMatieres] = React.useState<UserMatiere[]>([])
  const [isLoadingMatieres, setIsLoadingMatieres] = React.useState(false)

  const loadMatieres = React.useCallback(
    async (signal?: AbortSignal) => {
      if (!userId) {
        setUserMatieres([])
        return
      }

      setIsLoadingMatieres(true)
      try {
        const response = await fetch(`/api/users/${userId}/matieres`, {
          signal,
        })
        if (!response.ok) return
        const data = (await response.json()) as UserMatiere[]
        if (!signal?.aborted) setUserMatieres(data)
      } finally {
        if (!signal?.aborted) setIsLoadingMatieres(false)
      }
    },
    [userId]
  )

  React.useEffect(() => {
    if (!userId) {
      setUserMatieres([])
      return
    }

    const controller = new AbortController()
    loadMatieres(controller.signal)
    return () => controller.abort()
  }, [loadMatieres, userId])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/" className="flex items-center gap-2">
                <GraduationCap className="size-5" />
                <span className="text-base font-semibold">StudyHub</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Plateforme</SidebarGroupLabel>
          <SidebarMenu>
            {platformItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Matières</SidebarGroupLabel>
          <SidebarMenu>
            {isLoadingMatieres && (
              <SidebarMenuItem key="matieres-loading">
                <SidebarMenuButton className="text-muted-foreground" disabled>
                  <FolderOpen />
                  <span>Chargement...</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            {!isLoadingMatieres && userMatieres.length === 0 && (
              <SidebarMenuItem key="matieres-empty">
                <SidebarMenuButton className="text-muted-foreground" disabled>
                  <FolderOpen />
                  <span>Aucune matière</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            {userMatieres.map((matiere) => (
              <SidebarMenuItem key={matiere.id}>
                <SidebarMenuButton>
                  <FolderOpen />
                  <span>{matiere.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            {subjectItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className={item.muted ? "text-muted-foreground" : undefined}
                >
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem key="ajouter-une-matiere">
              {userId ? (
                <AddMatiereModal userId={userId} onAdded={loadMatieres}>
                  <SidebarMenuButton className="text-muted-foreground">
                    <PlusCircle />
                    <span>Ajouter une matière</span>
                  </SidebarMenuButton>
                </AddMatiereModal>
              ) : (
                <SidebarMenuButton
                  className="text-muted-foreground"
                  disabled
                >
                  <PlusCircle />
                  <span>Ajouter une matière</span>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
