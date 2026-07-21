import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import CategoryService from "@/services/category.service"

export const fetchCategories = createAsyncThunk(
  "category/fetchCategories",
  async ({ page = 1, limit = 10, search = "", is_active } = {}, { rejectWithValue }) => {
    try {
      return await CategoryService.list({ page, limit, search, is_active })
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch categories")
    }
  }
)

export const createCategory = createAsyncThunk(
  "category/createCategory",
  async ({ payload, file }, { rejectWithValue }) => {
    let created = null
    try {
      created = await CategoryService.create(payload)
      if (file && created?.template_upload_url) {
        await CategoryService.uploadTemplate(created.template_upload_url, file)
      }
      return created
    } catch (err) {
      // Rollback: delete the category if it was created but upload failed
      if (created?.category_id) {
        await CategoryService.remove(created.category_id).catch(() => {})
      }
      return rejectWithValue(err.message || "Failed to create category")
    }
  }
)

export const updateCategory = createAsyncThunk(
  "category/updateCategory",
  async (payload, { rejectWithValue }) => {
    try {
      return await CategoryService.update(payload)
    } catch (err) {
      return rejectWithValue(err.message || "Failed to update category")
    }
  }
)

export const deleteCategory = createAsyncThunk(
  "category/deleteCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      await CategoryService.remove(categoryId)
      return categoryId
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete category")
    }
  }
)

export const toggleCategoryActive = createAsyncThunk(
  "category/toggleActive",
  async ({ categoryId, isActive }, { rejectWithValue }) => {
    try {
      await CategoryService.toggleActive(categoryId, isActive)
      return { categoryId, isActive }
    } catch (err) {
      return rejectWithValue(err.message || "Failed to update status")
    }
  }
)

const initialState = {
  items:       [],
  currentPage: 1,
  totalPages:  0,
  totalItems:  0,
  status:      "idle",
  error:       null,
  saving:      false,
  saveError:   null,
}

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    clearSaveError(state) { state.saveError = null },
  },
  extraReducers: (builder) => {
    // List
    builder
      .addCase(fetchCategories.pending, (state) => { state.status = "loading"; state.error = null })
      .addCase(fetchCategories.fulfilled, (state, { payload }) => {
        state.status      = "succeeded"
        state.items       = payload.items       ?? []
        state.currentPage = payload.current_page ?? 1
        state.totalPages  = payload.total_pages  ?? 0
        state.totalItems  = payload.total_items  ?? 0
      })
      .addCase(fetchCategories.rejected, (state, { payload }) => {
        state.status = "failed"
        state.error  = payload
      })

    // Create
    builder
      .addCase(createCategory.pending,   (state) => { state.saving = true;  state.saveError = null })
      .addCase(createCategory.fulfilled, (state) => { state.saving = false })
      .addCase(createCategory.rejected,  (state, { payload }) => { state.saving = false; state.saveError = payload })

    // Update
    builder
      .addCase(updateCategory.pending,   (state) => { state.saving = true;  state.saveError = null })
      .addCase(updateCategory.fulfilled, (state, { payload }) => {
        state.saving = false
        if (payload?.category_id) {
          state.items = state.items.map((item) =>
            item.category_id === payload.category_id ? { ...item, ...payload } : item
          )
        }
      })
      .addCase(updateCategory.rejected,  (state, { payload }) => { state.saving = false; state.saveError = payload })

    // Delete
    builder
      .addCase(deleteCategory.pending,   (state) => { state.saving = true;  state.saveError = null })
      .addCase(deleteCategory.fulfilled, (state, { payload }) => {
        state.saving = false
        state.items  = state.items.filter((item) => item.category_id !== payload)
        state.totalItems = Math.max(0, state.totalItems - 1)
      })
      .addCase(deleteCategory.rejected,  (state, { payload }) => { state.saving = false; state.saveError = payload })

    // Toggle active
    builder
      .addCase(toggleCategoryActive.fulfilled, (state, { payload }) => {
        state.items = state.items.map((item) =>
          item.category_id === payload.categoryId ? { ...item, is_active: payload.isActive } : item
        )
      })
  },
})

export const { clearSaveError } = categorySlice.actions
export default categorySlice.reducer
