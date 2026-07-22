import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import ReleaseService from "@/services/release.service"

// ---------------------------------------------------------------------------
// Thunks
// ---------------------------------------------------------------------------
export const fetchReleases = createAsyncThunk(
  "release/fetchReleases",
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const data = await ReleaseService.getList({ page, limit })
      return { ...data, requestedPage: page }
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
    releases:      [],
    releasePage:   1,
    releaseTotalPages: 1,
    releaseHasMore:    false,
    fetchStatus:   "idle",

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
    resetReleaseList(state)     { state.releases = []; state.releasePage = 1; state.releaseHasMore = false; state.fetchStatus = "idle" },
    resetDraftFilesStatus(state){ state.draftFetchStatus = "idle" },
    setDraftPage(state, action) { state.draftPage = action.payload },
  },
  extraReducers: (builder) => {
    builder
      // fetchReleases
      .addCase(fetchReleases.pending,   (state)         => { state.fetchStatus = "loading";   state.error = null })
      .addCase(fetchReleases.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded"
        const totalPages  = action.payload.total_pages ?? 1
        const page        = action.payload.requestedPage ?? 1
        state.releasePage       = page
        state.releaseTotalPages = totalPages
        state.releaseHasMore    = page < totalPages
        // Normalise API shape → internal shape used by ReleaseAccordion
        const incoming = (action.payload.items ?? []).map((r) => ({
          id:           r.release_id,
          name:         r.release_name,
          version:      r.release_version,
          type:         r.release_type,
          notes:        r.release_notes,
          status:       r.status,
          displayStatus: r.display_status,
          isActive:     r.is_active,
          createdBy:    r.created_by,
          createdAt:    r.created_at,
          releasedAt:   r.released_at,
          releasedBy:   r.released_by,
          totalItems:   r.total_items,
          files: (r.items ?? []).map((f) => ({
            id:          f.file_id,
            name:        f.file_name,
            categoryId:  f.category_id,
            app:         f.governed_app,
            cloud:       f.cloud,
            version:     f.input_version,
            versionId:   f.version_id,
            isLatest:    f.is_latest_version,
            uiState:     f.ui_state,
            contributor: f.contributor_name ?? f.contributor_email,
            approvedBy:  Array.isArray(f.approvers) ? f.approvers.join(", ") : (f.approvers ?? "—"),
            approvedDate: f.approved_at
              ? new Date(f.approved_at).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })
              : "—",
          })),
        }))
        // Page 1 = fresh load/refresh; subsequent pages = append
        state.releases = page === 1 ? incoming : [...state.releases, ...incoming]
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
      .addCase(createRelease.fulfilled, (state)         => {
        state.createStatus   = "succeeded"
        // Clear list so ReleaseList re-fetches from page 1
        state.releases       = []
        state.releasePage    = 1
        state.releaseHasMore = false
        state.fetchStatus    = "idle"
      })
      .addCase(createRelease.rejected,  (state, action) => { state.createStatus = "failed"; state.error = action.payload })
  },
})

export const { resetCreateStatus, resetDraftFilesStatus, setDraftPage, resetReleaseList } = releaseSlice.actions
export default releaseSlice.reducer
