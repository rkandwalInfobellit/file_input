import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

// Fetches versions for all files that match the active filters.
// In production swap the body for a real API call with filter params.
export const fetchVersions = createAsyncThunk(
  "versioning/fetchVersions",
  async (_, { getState, rejectWithValue }) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const { filters } = getState().versioning
      const allFiles = getState().fileCatalog.files

      const matched = allFiles.filter((f) => {
        if (filters.category.length > 0 && !filters.category.includes(f.category))          return false
        if (filters.app.length > 0      && !filters.app.some((a) => f.app.includes(a)))     return false
        if (filters.cloud.length > 0    && !filters.cloud.some((c) => f.cloud.includes(c))) return false
        return true
      })

      // Flatten all versions from matched files, tagging each with its file info
      const versions = matched.flatMap((f) =>
        (f.versions ?? []).map((v) => ({ ...v, _fileId: f.id, _fileName: f.name, _fileLabel: `${f.app.join("/")} · ${f.category}` }))
      )

      return { versions, fileCount: matched.length }
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load versions")
    }
  }
)

const initialState = {
  versions: [],
  fileCount: 0,
  fetchStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  filters: {
    category: [],
    app: [],
    cloud: [],
    status: [],
  },
}

const versioningSlice = createSlice({
  name: "versioning",
  initialState,
  reducers: {
    setVersioningCategoryFilter(state, action) { state.filters.category = action.payload; state.fetchStatus = "idle" },
    setVersioningAppFilter(state, action)      { state.filters.app      = action.payload; state.fetchStatus = "idle" },
    setVersioningCloudFilter(state, action)    { state.filters.cloud    = action.payload; state.fetchStatus = "idle" },
    setVersioningStatusFilter(state, action)   { state.filters.status   = action.payload },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVersions.pending, (state) => {
        state.fetchStatus = "loading"
        state.error = null
        state.versions = []
        state.fileCount = 0
      })
      .addCase(fetchVersions.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded"
        state.versions = action.payload.versions
        state.fileCount = action.payload.fileCount
      })
      .addCase(fetchVersions.rejected, (state, action) => {
        state.fetchStatus = "failed"
        state.error = action.payload || action.error.message
      })
  },
})

export const {
  setVersioningCategoryFilter,
  setVersioningAppFilter,
  setVersioningCloudFilter,
  setVersioningStatusFilter,
} = versioningSlice.actions

export default versioningSlice.reducer
