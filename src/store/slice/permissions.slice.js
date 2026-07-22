import { createSlice, createSelector } from "@reduxjs/toolkit"

const initialState = {
  // Raw FeaturesData object: { IFG: { role_id, role_name, features: [...] }, ... }
  featuresData: {},
}

const permissionsSlice = createSlice({
  name: "permissions",
  initialState,
  reducers: {
    setPermissions(state, action) {
      state.featuresData = action.payload ?? {}
    },
  },
})

export const { setPermissions } = permissionsSlice.actions
export default permissionsSlice.reducer

// ── Selectors ─────────────────────────────────────────────────────────────────

const selectFeaturesData = (state) => state.permissions.featuresData

// Returns the features array for a module, or [] if missing.
const selectModuleFeatures = createSelector(
  [selectFeaturesData, (_state, moduleKey) => moduleKey],
  (featuresData, moduleKey) => featuresData[moduleKey]?.features ?? [],
)

// isFeatureEnabled(moduleKey, featureName) → boolean
// Fail-closed: returns false when data is absent.
export const selectIsFeatureEnabled = createSelector(
  [selectModuleFeatures, (_state, _moduleKey, featureName) => featureName],
  (features, featureName) => {
    if (!features.length) return false
    const found = features.find((f) => f.name === featureName)
    return found?.enabled === true
  },
)

// getEnabledFeatures(moduleKey) → string[] of enabled feature names
export const selectEnabledFeatures = createSelector(
  [selectModuleFeatures],
  (features) => features.filter((f) => f.enabled).map((f) => f.name),
)

// Normalize an endpoint URL: strip origin, query string, leading slash.
// "https://host/ifgapi/approvals/approve?foo=bar" → "ifgapi/approvals/approve"
function normalizeEndpoint(url = "") {
  try {
    // If it's an absolute URL, extract just the pathname
    const parsed = new URL(url)
    url = parsed.pathname
  } catch {
    // Relative path — use as-is
  }
  return url.replace(/^\/+/, "").split("?")[0]
}

// isEndpointEnabled(moduleKey, endpointUrl) → boolean
// Matches the normalized URL suffix against any endpoint in any feature of the module.
// Fail-closed: returns false when data absent or endpoint not found.
export const selectIsEndpointEnabled = createSelector(
  [selectModuleFeatures, (_state, _moduleKey, endpointUrl) => endpointUrl],
  (features, endpointUrl) => {
    if (!features.length) return false
    const needle = normalizeEndpoint(endpointUrl)
    for (const feature of features) {
      for (const ep of feature.endpoints ?? []) {
        if (normalizeEndpoint(ep.name) === needle) {
          return ep.enabled === true
        }
      }
    }
    // Endpoint not found in permissions list → block (fail-closed)
    return false
  },
)

// Plain function used outside React (e.g. axios interceptor) — pass state directly.
export function isEndpointEnabledFromState(state, moduleKey, endpointUrl) {
  return selectIsEndpointEnabled(state, moduleKey, endpointUrl)
}
