export const selectFileCatalogState = (state) => state.fileCatalog

export const selectFileById = (id) => (state) =>
  state.fileCatalog.files.find((f) => f.id === id) ?? null

// Raw counts (unaffected by search/column filters) for tab badges
export const selectTabCounts = (state) => {
  const files = state.fileCatalog.files
  return {
    all: files.length,
    mine: files.filter((f) => f.isOwner).length,
    requests: files.filter((f) => f.isApprover).length,
  }
}

// Files filtered by active tab + search + column filters
export const selectFilteredFiles = (state) => {
  const { files, activeTab, search, filters } = state.fileCatalog
  const searchLower = search.toLowerCase()

  return files.filter((f) => {
    // Tab gate
    if (activeTab === "mine" && !f.isOwner) return false
    if (activeTab === "requests" && !f.isApprover) return false

    // Search + column filters
    if (search && !f.name.toLowerCase().includes(searchLower)) return false
    if (filters.category.length > 0 && !filters.category.includes(f.category)) return false
    if (filters.app.length > 0 && !filters.app.some((a) => f.app.includes(a))) return false
    if (filters.cloud.length > 0 && !filters.cloud.some((c) => f.cloud.includes(c))) return false
    if (filters.status.length > 0 && !filters.status.includes(f.status)) return false

    return true
  })
}
