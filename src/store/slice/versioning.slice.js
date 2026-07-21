import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { apiClient } from "@/lib/apiClient"
import { API_ROUTES } from "@/lib/apiRoutes"

export const fetchVersionFileOptions = createAsyncThunk(
  "versioning/fetchVersionFileOptions",
  async ({ governed_app, cloud, category_id, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get(API_ROUTES.VERSIONS_INPUT, {
        params: { governed_apps: governed_app, clouds: cloud, category_id, page, limit },
      })
      return data?.Data ?? { items: [], current_page: 1, total_pages: 1, total_items: 0 }
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load file options")
    }
  }
)

export const fetchVersionHistory = createAsyncThunk(
  "versioning/fetchVersionHistory",
  async ({ file_id, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get(API_ROUTES.VERSIONS_INPUT, {
        params: { file_id, page, limit },
      })
      return data?.Data ?? null
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load version history")
    }
  }
)

const initialState = {
  // file_options list
  items: [],
  totalItems: 0,
  totalPages: 1,
  currentPage: 1,
  fetchStatus: "idle",
  error: null,

  // history detail for a selected file
  detail: null,
  detailStatus: "idle",
  detailError: null,

  filters: {
    governed_app: null,
    cloud: null,
    category_id: null,
  },
}

const versioningSlice = createSlice({
  name: "versioning",
  initialState,
  reducers: {
    setVersioningAppFilter(state, action) {
      state.filters.governed_app = action.payload
      state.filters.cloud = null
      state.filters.category_id = null
      state.fetchStatus = "idle"
      state.items = []
      state.detail = null
      state.detailStatus = "idle"
    },
    setVersioningCloudFilter(state, action) {
      state.filters.cloud = action.payload
      state.filters.category_id = null
      state.fetchStatus = "idle"
      state.items = []
      state.detail = null
      state.detailStatus = "idle"
    },
    setVersioningCategoryFilter(state, action) {
      state.filters.category_id = action.payload
      state.fetchStatus = "idle"
      state.items = []
      state.detail = null
      state.detailStatus = "idle"
    },
    clearVersionDetail(state) {
      state.detail = null
      state.detailStatus = "idle"
      state.detailError = null
    },
  },
  extraReducers: (builder) => {
    builder
      // file options
      .addCase(fetchVersionFileOptions.pending, (state) => {
        state.fetchStatus = "loading"
        state.error = null
        state.items = []
        state.detail = null
        state.detailStatus = "idle"
      })
      .addCase(fetchVersionFileOptions.fulfilled, (state, action) => {
        const payload = action.payload ?? {}
        state.fetchStatus = "succeeded"
        if (payload.mode === "history") {
          // API returned a single file's history directly
          state.items = []
          state.totalItems = 0
          state.totalPages = 1
          state.detail = payload
          state.detailStatus = "succeeded"
        } else {
          // mode === "file_options" — multiple files to pick from
          state.items = payload.items ?? []
          state.totalItems = payload.total_items ?? 0
          state.totalPages = payload.total_pages ?? 1
          state.currentPage = payload.current_page ?? 1
        }
      })
      .addCase(fetchVersionFileOptions.rejected, (state, action) => {
        state.fetchStatus = "failed"
        state.error = action.payload || action.error.message
      })
      // version history
      .addCase(fetchVersionHistory.pending, (state) => {
        state.detailStatus = "loading"
        state.detailError = null
        state.detail = null
      })
      .addCase(fetchVersionHistory.fulfilled, (state, action) => {
        state.detailStatus = "succeeded"
        state.detail = action.payload
      })
      .addCase(fetchVersionHistory.rejected, (state, action) => {
        state.detailStatus = "failed"
        state.detailError = action.payload || action.error.message
      })
  },
})

export const {
  setVersioningAppFilter,
  setVersioningCloudFilter,
  setVersioningCategoryFilter,
  clearVersionDetail,
} = versioningSlice.actions

export default versioningSlice.reducer
