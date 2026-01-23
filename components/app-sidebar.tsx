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
  Trash2,
  Bell,
  type LucideIcon,
  CreditCard,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"

import { AddMatiereModal } from "@/components/modals/add-matiere-modal"
import { DeleteMatiereModal } from "@/components/modals/delete-matiere-modal"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
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
  // { title: "Mes cours", url: "/cours", icon: NotebookPen },
  // { title: "Mes fichiers", url: "/fichiers", icon: Folder },
  { title: "Calendrier", url: "/calendrier", icon: Calendar },
  { title: "Notifications", url: "/notifications", icon: Bell },
]

const subjectItems: SidebarItem[] = [
  // { title: "Mathématiques", url: "/matieres/mathematiques", icon: FolderOpen },
  // { title: "Informatique", url: "/matieres/informatique", icon: FolderOpen },
  // { title: "Littérature", url: "/matieres/litterature", icon: FolderOpen }
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const userId = session?.user?.id
  const [userMatieres, setUserMatieres] = React.useState<UserMatiere[]>([])
  const [isLoadingMatieres, setIsLoadingMatieres] = React.useState(false)

  const loadMatieres = React.useCallback(
    async (signal?: AbortSignal) => {
      if (!userId) {
        setUserMatieres([])
        setIsLoadingMatieres(false)
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
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return
        throw error
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
              <Link href="/dashboard" className="flex items-center gap-2">
                <GraduationCap className="size-7 text-primary" />
                <span className="text-primary font-semibold">StudyHub</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Plateforme</SidebarGroupLabel>
          <SidebarMenu>
            {platformItems.map((item) => {
              const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`);
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
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
            {userMatieres.map((matiere) => {
              const matierePath = `/matiere/${matiere.id}`
              const isActiveMatiere =
                pathname === matierePath || pathname.startsWith(`${matierePath}/`)

              return (
                <SidebarMenuItem key={matiere.id}>
                  <SidebarMenuButton asChild isActive={isActiveMatiere}>
                    <Link href={`/matiere/${matiere.id}`}>
                      <FolderOpen />
                      <span>{matiere.name}</span>
                    </Link>
                  </SidebarMenuButton>
                  <DeleteMatiereModal
                    userId={userId!}
                    matiereId={matiere.id}
                    matiereName={matiere.name}
                    onDeleted={loadMatieres}
                  >
                    <SidebarMenuAction showOnHover className="cursor-pointer">
                      <Trash2 className="text-destructive" />
                      <span className="sr-only">Supprimer la matière</span>
                    </SidebarMenuAction>
                  </DeleteMatiereModal>
                </SidebarMenuItem>
              )
            })}
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
        <SidebarMenuButton asChild isActive={pathname.startsWith("/account/subscription")}>
          <Link href="/account/subscription">
            <CreditCard />
            <span>Abonnement</span>
          </Link>
        </SidebarMenuButton>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
