import { Navigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { isAuthenticated } from "@/lib/auth"
import { selectIsFeatureEnabled } from "@/store/slice/permissions.slice"
import Cookies from "js-cookie"

export default function ProtectedRoute({ children, featureName }) {
  const moduleKey = Cookies.get("application") || "IFG"
  const featureEnabled = useSelector((state) =>
    featureName ? selectIsFeatureEnabled(state, moduleKey, featureName) : true
  )

  if (!isAuthenticated()) {
    return <Navigate to="/not-authorized" replace />
  }

  if (featureName && !featureEnabled) {
    return <Navigate to="/not-authorized" replace />
  }

  return children
}
