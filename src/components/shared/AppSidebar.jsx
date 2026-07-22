import { useNavigate, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import { FolderOpen, GitBranch, Tag, Cog } from "lucide-react"
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
import { selectEnabledFeatures } from "@/store/slice/permissions.slice"
import Cookies from "js-cookie"

const NAV_ITEMS = [
  { route: ROUTES.FILE_CATALOG,  label: "File Management", icon: FolderOpen, featureName: "file_management", subRoutes: [ROUTES.FILE_CATALOG, ROUTES.UPLOAD_VALIDATE] },
  { route: ROUTES.VERSIONING,    label: "Versioning",      icon: GitBranch,  featureName: "versioning",      subRoutes: [ROUTES.VERSIONING] },
  { route: ROUTES.RELEASE,       label: "Release",         icon: Tag,        featureName: "release",         subRoutes: [ROUTES.RELEASE] },
  { route: ROUTES.CONFIGURATION, label: "Configuration",   icon: Cog,        featureName: "configuration",   subRoutes: [ROUTES.CONFIGURATION] },
]

export function AppSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const moduleKey = Cookies.get("application") || "IFG"

  const enabledFeatures = useSelector((state) => selectEnabledFeatures(state, moduleKey))
  const visibleItems = NAV_ITEMS.filter((item) => enabledFeatures.includes(item.featureName))

  return (
    <Sidebar collapsible="none">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map(({ route, label, subRoutes, icon: Icon }) => (
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
