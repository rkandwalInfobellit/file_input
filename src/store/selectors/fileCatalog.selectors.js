export const selectFileCatalogState = (state) => state.fileCatalog

export const selectFilteredFiles = (state) => {
  const { files, search, filters } = state.fileCatalog
  const searchLower = search.toLowerCase()

  return files.filter((f) => {
    if (search && !f.name.toLowerCase().includes(searchLower)) return false
    if (filters.category.length > 0 && !filters.category.includes(f.category)) return false
    if (filters.app.length > 0 && !filters.app.some((a) => f.app.includes(a))) return false
    if (filters.cloud.length > 0 && !filters.cloud.some((c) => f.cloud.includes(c))) return false
    if (filters.status.length > 0 && !filters.status.includes(f.status)) return false
    return true
  })
}
