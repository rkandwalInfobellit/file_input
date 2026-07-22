import { useSelector } from "react-redux"
import { selectIsEndpointEnabled } from "@/store/slice/permissions.slice"
import Cookies from "js-cookie"

/**
 * Returns true if the given endpoint is permitted for the current user.
 * moduleKey defaults to the "application" cookie value (e.g. "IFG").
 *
 * Usage:
 *   const canApprove = useEndpointPermission("ifgapi/approvals/approve")
 */
export function useEndpointPermission(endpointName, moduleKey) {
  const module = moduleKey ?? Cookies.get("application") ?? "IFG"
  return useSelector((state) => selectIsEndpointEnabled(state, module, endpointName))
}
