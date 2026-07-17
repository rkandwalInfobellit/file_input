import { useNavigate, useLocation } from "react-router-dom"
import {
  SquareCheckBig,
  FolderOpen,
  Upload,
  GitBranch,
  Tag,
  Cog,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ROUTES } from "@/lib/routes"

const NAV_ITEMS = Object.freeze([
  { route: ROUTES.FILE_CATALOG,    label: "File Management",      icon: FolderOpen, subRoutes:[ROUTES.FILE_CATALOG, ROUTES.UPLOAD_VALIDATE] }, 
  { route: ROUTES.VERSIONING,      label: "Versioning",        icon: GitBranch, subRoutes:[ROUTES.VERSIONING] },
  { route: ROUTES.RELEASE,         label: "Release",           icon: Tag, subRoutes:[ROUTES.RELEASE] },
  { route: ROUTES.CONFIGURATION,   label: "Configuration",     icon: Cog, subRoutes:[ROUTES.CONFIGURATION] },
])

export function AppSidebar() {
  const navigate = useNavigate()
  const location = useLocation()


  return (
    <Sidebar collapsible="none">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map(({ route, label, subRoutes, icon: Icon }) => (
                <SidebarMenuItem key={route}>
                  <SidebarMenuButton
                    isActive={subRoutes.includes(location.pathname)}
                    onClick={() => navigate(route)}
                  >
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
