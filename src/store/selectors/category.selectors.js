export const selectCategories    = (state) => state.category.items
export const selectCategoryStatus = (state) => state.category.status
export const selectCategoryError  = (state) => state.category.error
export const selectCategoryMeta   = (state) => ({
  currentPage: state.category.currentPage,
  totalPages:  state.category.totalPages,
  totalItems:  state.category.totalItems,
})
export const selectCategorySaving    = (state) => state.category.saving
export const selectCategorySaveError = (state) => state.category.saveError
