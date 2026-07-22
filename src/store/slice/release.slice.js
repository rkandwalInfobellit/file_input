import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import ReleaseService from "@/services/release.service"

// ---------------------------------------------------------------------------
// Thunks
// ---------------------------------------------------------------------------
export const fetchReleases = createAsyncThunk(
  "release/fetchReleases",
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      return await ReleaseService.getList({ page, limit })
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load releases")
    }
  }
)

export const fetchDraftFiles = createAsyncThunk(
  "release/fetchDraftFiles",
  async ({ page = 1, limit = 50 } = {}, { rejectWithValue }) => {
    try {
      return await ReleaseService.getDraftFiles({ page, limit })
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load draft files")
    }
  }
)

export const createRelease = createAsyncThunk(
  "release/createRelease",
  async (payload, { rejectWithValue }) => {
    try {
      return await ReleaseService.create(payload)
    } catch (err) {
      return rejectWithValue(err.message || "Failed to create release")
    }
  }
)

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------
const releaseSlice = createSlice({
  name: "release",
  initialState: {
    // Release list
    releases:    [],
    fetchStatus: "idle",

    // Draft files (for the Create sheet)
    draftFiles:       [],
    draftPage:        1,
    draftPageCount:   1,
    draftTotal:       0,
    draftLimit:       50,
    draftFetchStatus: "idle",

    createStatus: "idle",
    error:        null,
  },
  reducers: {
    resetCreateStatus(state)    { state.createStatus = "idle" },
    resetDraftFilesStatus(state){ state.draftFetchStatus = "idle" },
    setDraftPage(state, action) { state.draftPage = action.payload },
  },
  extraReducers: (builder) => {
    builder
      // fetchReleases
      .addCase(fetchReleases.pending,   (state)         => { state.fetchStatus = "loading";   state.error = null })
      .addCase(fetchReleases.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded"
        state.releases    = action.payload.items ?? []
      })
      .addCase(fetchReleases.rejected,  (state, action) => { state.fetchStatus = "failed";    state.error = action.payload })

      // fetchDraftFiles
      .addCase(fetchDraftFiles.pending,   (state)         => { state.draftFetchStatus = "loading"; state.error = null })
      .addCase(fetchDraftFiles.fulfilled, (state, action) => {
        state.draftFetchStatus = "succeeded"
        state.draftFiles       = action.payload.items      ?? []
        state.draftPage        = action.payload.page       ?? 1
        state.draftPageCount   = action.payload.pages      ?? 1
        state.draftTotal       = action.payload.total      ?? 0
        state.draftLimit       = action.payload.limit      ?? 50
      })
      .addCase(fetchDraftFiles.rejected,  (state, action) => { state.draftFetchStatus = "failed"; state.error = action.payload })

      // createRelease
      .addCase(createRelease.pending,   (state)         => { state.createStatus = "loading" })
      .addCase(createRelease.fulfilled, (state)         => { state.createStatus = "succeeded" })
      .addCase(createRelease.rejected,  (state, action) => { state.createStatus = "failed"; state.error = action.payload })
  },
})

export const { resetCreateStatus, resetDraftFilesStatus, setDraftPage } = releaseSlice.actions
export default releaseSlice.reducer
