export const selectFileCatalogState = (state) => state.fileCatalog
export const selectFiles            = (state) => state.fileCatalog.files
export const selectFileCatalogMeta  = (state) => ({
  currentPage: state.fileCatalog.currentPage,
  totalPages:  state.fileCatalog.totalPages,
  totalItems:  state.fileCatalog.totalItems,
})

export const selectFileById = (id) => (state) =>
  state.fileCatalog.files.find((f) => f.file_id === id) ?? null
