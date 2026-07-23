import { useLocation } from "react-router-dom"
import Header from "@/components/shared/Header"
import { AppSidebar } from "@/components/shared/AppSidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import ErrorBoundary from "@/components/pages/ErrorBoundary"
import AppRoutes from "@/router/AppRoutes"
import { Toaster } from "@/components/ui/sonner"
import { ROUTES } from "@/lib/routes"
import { isAuthenticated } from "@/lib/auth"

const PUBLIC_ROUTES = [ROUTES.NOT_AUTHORIZED, ROUTES.LOGIN]

export default function App() {
  const location = useLocation()
  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname)

  // Show bare layout for public routes OR when not authenticated.
  // ProtectedRoute handles the redirect for unauthenticated users —
  // we must not render the shell before it gets a chance to.
  if (isPublicRoute || !isAuthenticated()) {
    return (
      <>
        <AppRoutes />
        <Toaster position="bottom-right" richColors />
      </>
    )
  }

  return (
    <main className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <Header />
      <SidebarProvider defaultOpen className="flex-1 min-h-0">
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
