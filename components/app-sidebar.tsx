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
} from "lucide-react"

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

const platformItems = [
  { title: "Tableau de bord", url: "/dashboard", icon: Home },
  { title: "Mes cours", url: "/cours", icon: NotebookPen },
  { title: "Mes fichiers", url: "/fichiers", icon: Folder },
  { title: "Calendrier", url: "/calendrier", icon: Calendar },
]

const subjectItems = [
  { title: "Mathématiques", url: "/matieres/mathematiques", icon: FolderOpen },
  { title: "Informatique", url: "/matieres/informatique", icon: FolderOpen },
  { title: "Littérature", url: "/matieres/litterature", icon: FolderOpen },
  {
    title: "Ajouter une matière",
    url: "/matieres/nouvelle",
    icon: PlusCircle,
    muted: true,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
