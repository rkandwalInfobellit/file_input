// ── Clouds ────────────────────────────────────────────────────────────────────
export const selectClouds         = (state) => state.app.clouds.data
export const selectCloudsStatus   = (state) => state.app.clouds.status
export const selectCloudsError    = (state) => state.app.clouds.error
export const selectCloudsLoading  = (state) => state.app.clouds.status === "loading"

// Derived: [{ value: "AWS", label: "Amazon Web Services" }, ...]
export const selectCloudOptions   = (state) =>
  state.app.clouds.data.map((c) => ({ value: c.cloud_id, label: c.display_name }))

// ── Applications ──────────────────────────────────────────────────────────────
export const selectApplications        = (state) => state.app.applications.data
export const selectApplicationsStatus  = (state) => state.app.applications.status
export const selectApplicationsError   = (state) => state.app.applications.error
export const selectApplicationsLoading = (state) => state.app.applications.status === "loading"

// Derived: [{ value: "CCA", label: "EPYC Cloud Cost Advisory" }, ...]
export const selectApplicationOptions  = (state) =>
  state.app.applications.data.map((a) => ({ value: a.name, label: a.display_name }))

// ── Users ─────────────────────────────────────────────────────────────────────
export const selectUsers        = (state) => state.app.users.items
export const selectUsersStatus  = (state) => state.app.users.status
export const selectUsersError   = (state) => state.app.users.error
export const selectUsersLoading = (state) => state.app.users.status === "loading"
export const selectUsersMeta    = (state) => ({
  currentPage: state.app.users.currentPage,
  totalPages:  state.app.users.totalPages,
  totalItems:  state.app.users.totalItems,
})
