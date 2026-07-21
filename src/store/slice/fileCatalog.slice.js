import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import CatalogService from "@/services/catalog.service"

export const fetchFiles = createAsyncThunk(
  "fileCatalog/fetchFiles",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await CatalogService.list(params)
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load files")
    }
  }
)

const TAB_VALUES = ["all", "my_files", "requests"]

export const fetchTabCounts = createAsyncThunk(
  "fileCatalog/fetchTabCounts",
  async (_, { rejectWithValue }) => {
    try {
      const results = await Promise.all(
        TAB_VALUES.map((tab) => CatalogService.list({ tab, page: 1, limit: 1 }))
      )
      return Object.fromEntries(TAB_VALUES.map((tab, i) => [tab, results[i].total_items ?? 0]))
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load tab counts")
    }
  }
)

const initialState = {
  files:       [],
  fetchStatus: "idle",
  error:       null,
  currentPage: 1,
  totalPages:  0,
  totalItems:  0,
  tabCounts:   { all: null, my_files: null, requests: null },
  // query params tracked here so components can read them
  activeTab:   "all",
  search:      "",
  filters: {
    governed_app: [],
    cloud:        [],
    category:     [],
    status:       [],
  },
}

const fileCatalogSlice = createSlice({
  name: "fileCatalog",
  initialState,
  reducers: {
    setActiveTab(state, action)     { state.activeTab = action.payload },
    setSearch(state, action)        { state.search    = action.payload },
    setAppFilter(state, action)     { state.filters.governed_app = action.payload },
    setCloudFilter(state, action)   { state.filters.cloud        = action.payload },
    setCategoryFilter(state, action){ state.filters.category     = action.payload },
    setStatusFilter(state, action)  { state.filters.status       = action.payload },
    clearFilters(state) {
      state.filters = { governed_app: [], cloud: [], category: [], status: [] }
      state.search  = ""
    },
  },
  extraReducers: (builder) => {
    builder
      // Keep stale files visible while reloading — only update status
      .addCase(fetchFiles.pending,   (state) => { state.fetchStatus = "loading"; state.error = null })
      .addCase(fetchFiles.fulfilled, (state, { payload }) => {
        state.fetchStatus = "succeeded"
        state.files       = payload.items       ?? []
        state.currentPage = payload.current_page ?? 1
        state.totalPages  = payload.total_pages  ?? 0
        state.totalItems  = payload.total_items  ?? 0
      })
      .addCase(fetchFiles.rejected,  (state, { payload }) => {
        state.fetchStatus = "failed"
        state.error       = payload || "Failed to load files"
      })

    builder
      .addCase(fetchTabCounts.fulfilled, (state, { payload }) => {
        state.tabCounts = payload
      })
  },
})

export const {
  setActiveTab,
  setSearch,
  setAppFilter,
  setCloudFilter,
  setCategoryFilter,
  setStatusFilter,
  clearFilters,
} = fileCatalogSlice.actions

export const selectTabCounts = (state) => state.fileCatalog.tabCounts

export default fileCatalogSlice.reducer
