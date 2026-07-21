// governed_apps and clouds come from the app slice (populated by the real API).
// categories come from the category slice (active only).
// statuses are static enums in the filterOptions slice.
export const selectFilterOptions = (state) => ({
  governed_apps: state.app.applications.data.map((a) => a.name),
  clouds:        state.app.clouds.data.map((c) => c.cloud_id),
  categories:    state.category.items.map((c) => c.category_id),
  statuses:      state.filterOptions.statuses,
  fetchStatus:   state.filterOptions.fetchStatus,
})
