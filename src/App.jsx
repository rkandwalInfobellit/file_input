import { lazy, Suspense } from "react"
import { useSelector } from "react-redux"
import { PAGE } from "@/store/slice/navigation.slice"
import { selectActivePage } from "@/store/selectors/navigation.selectors"
import Header from "@/components/shared/Header"
import { AppSidebar } from "@/components/shared/AppSidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import PageSkeleton from "@/components/pages/PageSkeleton"
import ErrorBoundary from "./components/pages/ErrorBoundary"
import { MailXIcon } from "lucide-react"

// Each key maps 1-to-1 with a PAGE enum value — adding a new page = one entry here
const PAGE_COMPONENTS = Object.freeze({
  [PAGE.FILE_CATALOG]: lazy(() => import("./components/pages/FileCatalog")),
  [PAGE.UPLOAD_VALIDATE]: lazy(() => import("./components/shared/Uploadvalidate")),
  [PAGE.APPROVALS]: lazy(() => import("./components/pages/Approvals")),
  [PAGE.VERSIONING]: lazy(() => import("./components/pages/Versioning")),
  [PAGE.RELEASE]: lazy(() => import("./components/pages/Release")),
  [PAGE.CONFIGURATION]: lazy(() => import("./components/pages/Configuration")),
})


export default function App() {
  const activePage = useSelector(selectActivePage)
  const Page = PAGE_COMPONENTS[activePage]

  return (
    <main className="flex flex-col min-h-screen bg-background text-foreground overflow-auto">
      <Header />
      <SidebarProvider>
        <div className="flex flex-1">
          <AppSidebar />
          <div className="flex-1 overflow-auto">
            <ErrorBoundary>
              <Suspense fallback={<PageSkeleton />}>
                <Page />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </SidebarProvider>
    </main>
  )
}

