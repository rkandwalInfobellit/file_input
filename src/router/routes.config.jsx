import { lazy, Suspense } from "react"
import { Navigate } from "react-router-dom"
import { ROUTES } from "@/lib/routes"
import PageSkeleton from "@/components/pages/PageSkeleton"
import NotFoundPage from "@/components/pages/NotFoundPage"
import NotAuthorizedPage from "@/components/pages/NotAuthorizedPage"
import InternalLoginPage from "@/components/pages/InternalLoginPage"
import ProtectedRoute from "@/router/ProtectedRoute"

const FileCatalog    = lazy(() => import("@/components/pages/FileCatalog"))
const FileDetail     = lazy(() => import("@/components/pages/FileDetail"))
const Uploadvalidate = lazy(() => import("@/components/shared/Uploadvalidate"))
const Approvals      = lazy(() => import("@/components/pages/Approvals"))
const Versioning     = lazy(() => import("@/components/pages/Versioning"))
const Release        = lazy(() => import("@/components/pages/Release"))
const Configuration  = lazy(() => import("@/components/pages/Configuration"))

function wrap(Component, featureName) {
  return (
    <ProtectedRoute featureName={featureName}>
      <Suspense fallback={<PageSkeleton />}>
        <Component />
      </Suspense>
    </ProtectedRoute>
  )
}

export const routeConfig = [
  { path: "/",                    element: <Navigate to={ROUTES.FILE_CATALOG} replace /> },
  { path: ROUTES.FILE_CATALOG,    element: wrap(FileCatalog,    "file_management") },
  { path: "/file/:id",            element: wrap(FileDetail,     "file_management") },
  { path: ROUTES.UPLOAD_VALIDATE, element: wrap(Uploadvalidate, "file_management") },
  { path: ROUTES.APPROVALS,       element: wrap(Approvals,      "versioning") },
  { path: ROUTES.VERSIONING,      element: wrap(Versioning,     "versioning") },
  { path: ROUTES.RELEASE,         element: wrap(Release,        "release") },
  { path: ROUTES.CONFIGURATION,   element: wrap(Configuration,  "configuration") },
  { path: ROUTES.NOT_AUTHORIZED,  element: <NotAuthorizedPage /> },
  { path: ROUTES.LOGIN,           element: <InternalLoginPage /> },
  { path: "*",                    element: <ProtectedRoute><NotFoundPage /></ProtectedRoute> },
]
