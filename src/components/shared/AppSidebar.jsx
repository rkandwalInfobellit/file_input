import { useDispatch, useSelector } from "react-redux"
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
import { PAGE, navigateTo } from "@/store/slice/navigation.slice"
import { selectActivePage } from "@/store/selectors/navigation.selectors"

const NAV_ITEMS = Object.freeze([
  { page: PAGE.FILE_CATALOG,    label: "File Catalog",      icon: FolderOpen },
  { page: PAGE.UPLOAD_VALIDATE, label: "Upload & Validate", icon: Upload },
  { page: PAGE.APPROVALS,       label: "Approvals",         icon: SquareCheckBig },
  { page: PAGE.VERSIONING,      label: "Versioning",        icon: GitBranch },
  { page: PAGE.RELEASE,         label: "Release",           icon: Tag },
  { page: PAGE.CONFIGURATION,   label: "Configuration",     icon: Cog },
])

export function AppSidebar() {
  const dispatch = useDispatch()
  const activePage = useSelector(selectActivePage)

  return (
    <Sidebar collapsible="none">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map(({ page, label, icon: Icon }) => (
                <SidebarMenuItem key={page}>
                  <SidebarMenuButton
                    isActive={activePage === page}
                    onClick={() => dispatch(navigateTo(page))}
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
