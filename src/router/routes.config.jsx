import { lazy, Suspense } from "react"
import { Navigate } from "react-router-dom"
import { ROUTES } from "@/lib/routes"
import PageSkeleton from "@/components/pages/PageSkeleton"
import NotFoundPage from "@/components/pages/NotFoundPage"

const FileCatalog    = lazy(() => import("@/components/pages/FileCatalog"))
const Uploadvalidate = lazy(() => import("@/components/shared/Uploadvalidate"))
const Approvals      = lazy(() => import("@/components/pages/Approvals"))
const Versioning     = lazy(() => import("@/components/pages/Versioning"))
const Release        = lazy(() => import("@/components/pages/Release"))
const Configuration  = lazy(() => import("@/components/pages/Configuration"))

function wrap(Component) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Component />
    </Suspense>
  )
}

export const routeConfig = [
  { path: "/",                    element: <Navigate to={ROUTES.FILE_CATALOG} replace /> },
  { path: ROUTES.FILE_CATALOG,    element: wrap(FileCatalog) },
  { path: ROUTES.UPLOAD_VALIDATE, element: wrap(Uploadvalidate) },
  { path: ROUTES.APPROVALS,       element: wrap(Approvals) },
  { path: ROUTES.VERSIONING,      element: wrap(Versioning) },
  { path: ROUTES.RELEASE,         element: wrap(Release) },
  { path: ROUTES.CONFIGURATION,   element: wrap(Configuration) },
  { path: "*",                    element: <NotFoundPage /> },
]
