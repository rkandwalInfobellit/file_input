import { ifgApi } from "../api/ifgApi"
import { portalApi } from "../api/portalApi"

// governed_apps and clouds now come from RTK Query cache.
// statuses remain in filterOptions slice (static enum, no API needed).
export const selectFilterOptions = (state) => {
  const cloudsResult = ifgApi.endpoints.getClouds.select()(state)
  const appsResult   = portalApi.endpoints.getApplications.select()(state)

  return {
    governed_apps: (appsResult.data ?? []).map((a) => a.name),
    clouds:        (cloudsResult.data ?? []).map((c) => c.cloud_id),
    categories:    state.category.items.map((c) => c.category_id),
    statuses:      state.filterOptions.statuses,
    fetchStatus:   state.filterOptions.fetchStatus,
  }
}
