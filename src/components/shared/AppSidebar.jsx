import { useNavigate, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import { FolderOpen, GitBranch, Tag, Cog, ChevronLeft, ChevronRight } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
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

function CollapseButton() {
  const { state, toggleSidebar } = useSidebar()
  const collapsed = state === "collapsed"
  return (
    <button
      onClick={toggleSidebar}
      className="flex w-full items-center justify-center gap-2 rounded-md px-2 py-2 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
    >
      {collapsed ? <ChevronRight className="h-4 w-4 shrink-0" /> : (
        <>
          <ChevronLeft className="h-4 w-4 shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden">Collapse</span>
        </>
      )}
    </button>
  )
}

export function AppSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const moduleKey = Cookies.get("application") || "IFG"

  const enabledFeatures = useSelector((s) => selectEnabledFeatures(s, moduleKey))
  const visibleItems = NAV_ITEMS.filter((item) => enabledFeatures.includes(item.featureName))

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map(({ route, label, subRoutes, icon: Icon }) => {
                const isActive = subRoutes.includes(location.pathname)
                return (
                  <SidebarMenuItem key={route}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => navigate(route)}
                      tooltip={label}
                    >
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <CollapseButton />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
