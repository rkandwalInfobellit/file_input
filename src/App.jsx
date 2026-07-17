import Header from "@/components/shared/Header"
import { AppSidebar } from "@/components/shared/AppSidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import ErrorBoundary from "@/components/pages/ErrorBoundary"
import AppRoutes from "@/router/AppRoutes"
import { Toaster } from "@/components/ui/sonner"

export default function App() {
  return (
    <main className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <Header />
      <SidebarProvider className="flex-1 min-h-0">
        <div className="flex flex-1 min-h-0">
          <AppSidebar />
          <div className="flex-1 min-h-0 overflow-auto">
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
          </div>
        </div>
      </SidebarProvider>
      <Toaster position="bottom-right" richColors />
    </main>
  )
}
