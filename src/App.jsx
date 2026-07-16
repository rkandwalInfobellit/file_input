import Header from "@/components/shared/Header"
import { AppSidebar } from "@/components/shared/AppSidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import ErrorBoundary from "@/components/pages/ErrorBoundary"
import AppRoutes from "@/router/AppRoutes"

export default function App() {
  return (
    <main className="flex flex-col min-h-screen bg-background text-foreground overflow-auto">
      <Header />
      <SidebarProvider>
        <div className="flex flex-1">
          <AppSidebar />
          <div className="flex-1 overflow-auto">
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
          </div>
        </div>
      </SidebarProvider>
    </main>
  )
}
