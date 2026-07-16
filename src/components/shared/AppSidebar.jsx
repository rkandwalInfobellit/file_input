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
  { route: ROUTES.FILE_CATALOG,    label: "File Catalog",      icon: FolderOpen },
  { route: ROUTES.UPLOAD_VALIDATE, label: "Upload & Validate", icon: Upload },
  { route: ROUTES.APPROVALS,       label: "Approvals",         icon: SquareCheckBig },
  { route: ROUTES.VERSIONING,      label: "Versioning",        icon: GitBranch },
  { route: ROUTES.RELEASE,         label: "Release",           icon: Tag },
  { route: ROUTES.CONFIGURATION,   label: "Configuration",     icon: Cog },
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
              {NAV_ITEMS.map(({ route, label, icon: Icon }) => (
                <SidebarMenuItem key={route}>
                  <SidebarMenuButton
                    isActive={location.pathname === route}
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
