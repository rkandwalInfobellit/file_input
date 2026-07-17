import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { FILE_STATUS } from "./filterOptions.slice"

// ---------------------------------------------------------------------------
// Dummy releases — each has a manifest of files snapshotted at release time
// ---------------------------------------------------------------------------
const DUMMY_RELEASES = [
  {
    id: "rel-001",
    name: "Release v7.0.1",
    type: "bugfix",
    status: "active",
    date: "07/10/2026",
    tag: "REC-7-2026-06-*",
    files: [
      { id: "aws_rules",                name: "aws_rules.json",                app: "CCA", cloud: "AWS",   version: "v1.1", contributor: "Contributor 1", approvedDate: "2024-06-12", approvedBy: "Approver 1, 2" },
      { id: "azure_rules",              name: "azure_rules.json",              app: "CCA", cloud: "Azure", version: "v2.0", contributor: "Contributor 2", approvedDate: "2024-06-10", approvedBy: "Approver 1" },
      { id: "gcp_rules",                name: "gcp_rules.json",                app: "CCA", cloud: "GCP",   version: "v1.0", contributor: "Contributor 3", approvedDate: "2024-06-08", approvedBy: "Approver 2" },
      { id: "scaler_migration_paths",   name: "scaler_migration_paths.xlsx",   app: "CCA", cloud: "—",     version: "v2.9", contributor: "Contributor 4", approvedDate: "2024-06-05", approvedBy: "Approver 1" },
      { id: "recommendation_remarks_cca", name: "recommendation_remarks_CCA.xlsx", app: "CCA", cloud: "—", version: "v4.0", contributor: "Contributor 5", approvedDate: "2024-06-01", approvedBy: "Approver 1" },
    ],
  },
  {
    id: "rel-002",
    name: "Release v7.1.1",
    type: "minor",
    status: "released",
    date: "07/11/2026",
    tag: "REC-7-2026-07-1",
    files: [
      { id: "aws_rules",   name: "aws_rules.json",   app: "CCA", cloud: "AWS",   version: "v1.2", contributor: "Contributor 1", approvedDate: "2024-07-01", approvedBy: "Approver 1" },
      { id: "gcp_rules",   name: "gcp_rules.json",   app: "CCA", cloud: "GCP",   version: "v1.1", contributor: "Contributor 3", approvedDate: "2024-07-02", approvedBy: "Approver 2" },
    ],
  },
  {
    id: "rel-003",
    name: "Release v7.1.1",
    type: "minor",
    status: "released",
    date: "07/12/2026",
    tag: "REC-7-2026-07-2",
    files: [
      { id: "azure_rules", name: "azure_rules.json", app: "CCA", cloud: "Azure", version: "v2.1", contributor: "Contributor 2", approvedDate: "2024-07-10", approvedBy: "Approver 1" },
    ],
  },
  {
    id: "rel-004",
    name: "Release v7.1.1",
    type: "minor",
    status: "released",
    date: "07/13/2026",
    tag: "REC-7-2026-07-3",
    files: [],
  },
  {
    id: "rel-005",
    name: "Release v7.1.1",
    type: "minor",
    status: "released",
    date: "07/14/2026",
    tag: "REC-7-2026-07-4",
    files: [],
  },
  {
    id: "rel-006",
    name: "Release v7.1.1",
    type: "minor",
    status: "released",
    date: "07/15/2026",
    tag: "REC-7-2026-07-5",
    files: [],
  },
]

// ---------------------------------------------------------------------------
// Fetch releases thunk
// ---------------------------------------------------------------------------
export const fetchReleases = createAsyncThunk(
  "release/fetchReleases",
  async (_, { rejectWithValue }) => {
    try {
      await new Promise((r) => setTimeout(r, 300))
      return DUMMY_RELEASES
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load releases")
    }
  }
)

// ---------------------------------------------------------------------------
// Create release thunk
// ---------------------------------------------------------------------------
export const createRelease = createAsyncThunk(
  "release/createRelease",
  async (payload, { getState, rejectWithValue }) => {
    try {
      await new Promise((r) => setTimeout(r, 400))
      const releases = getState().release.releases
      const id = `rel-${String(releases.length + 1).padStart(3, "0")}`
      return { id, ...payload, status: "active", date: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) }
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
    releases: [],
    fetchStatus: "idle",
    createStatus: "idle",
    error: null,
  },
  reducers: {
    resetCreateStatus(state) { state.createStatus = "idle" },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReleases.pending,   (state)         => { state.fetchStatus  = "loading";   state.error = null })
      .addCase(fetchReleases.fulfilled, (state, action) => { state.fetchStatus  = "succeeded"; state.releases = action.payload })
      .addCase(fetchReleases.rejected,  (state, action) => { state.fetchStatus  = "failed";    state.error = action.payload })
      .addCase(createRelease.pending,   (state)         => { state.createStatus = "loading" })
      .addCase(createRelease.fulfilled, (state, action) => {
        state.createStatus = "succeeded"
        // All previously active releases become released
        state.releases.forEach((r) => { if (r.status === "active") r.status = "released" })
        state.releases.unshift(action.payload)
      })
      .addCase(createRelease.rejected,  (state, action) => { state.createStatus = "failed";    state.error = action.payload })
  },
})

export const { resetCreateStatus } = releaseSlice.actions
export default releaseSlice.reducer
