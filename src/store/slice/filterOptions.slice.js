import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

// ---------------------------------------------------------------------------
// Enums — use these anywhere in the app instead of raw strings.
// e.g. FILE_CATEGORY.BUSINESS_RULES, FILE_STATUS.PENDING
// ---------------------------------------------------------------------------
export const FILE_CATEGORY = Object.freeze({
  BUSINESS_RULES: "Business Rules",
  SCALER_DATA:    "Scaler Data",
  REMARKS:        "Remarks",
  MRD:            "MRD",
  SYSTEM_EPDW:    "System / EPDW",
  SYSTEM_H5:      "System / H5",
  PRICING_AWS:    "Pricing / AWS",
})

export const APP = Object.freeze({
  CCA:            "CCA",
  EPDW:           "EPDW",
  EIA:            "EIA",
  MEMORY_ADVISOR: "Memory Advisor",
})

export const CLOUD = Object.freeze({
  AWS:   "AWS",
  AZURE: "AZURE",
  GCP:   "GCP",
  OCI:   "OCI",
})

export const FILE_STATUS = Object.freeze({
  PENDING:            "Pending",
  REVIEW:             "Review",
  PARTIALLY_APPROVED: "Partially Approved",
  APPROVED:           "Approved",
  PARTIALLY_REJECTED: "Partially Rejected",
  REJECTED:           "Rejected",
  ROLLBACK:           "Rollback",
})

// ---------------------------------------------------------------------------
// Derived option arrays — built from the enums so they stay in sync.
// These are what get loaded into the filter dropdowns.
// ---------------------------------------------------------------------------
const STATIC_OPTIONS = {
  categories: Object.values(FILE_CATEGORY),
  apps:       Object.values(APP),
  clouds:     Object.values(CLOUD),
  statuses:   Object.values(FILE_STATUS),
}

// ---------------------------------------------------------------------------
// Thunk — swap the body for a real API call when the backend is ready:
//   const res = await fetch("/api/filter-options")
//   return await res.json()
// ---------------------------------------------------------------------------
export const fetchFilterOptions = createAsyncThunk(
  "filterOptions/fetch",
  async (_params, { rejectWithValue }) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 0))
      return STATIC_OPTIONS
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load filter options")
    }
  }
)

const filterOptionsSlice = createSlice({
  name: "filterOptions",
  initialState: {
    categories:  [],
    apps:        [],
    clouds:      [],
    statuses:    [],
    fetchStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error:       null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFilterOptions.pending,   (state)         => { state.fetchStatus = "loading";   state.error = null })
      .addCase(fetchFilterOptions.fulfilled, (state, action) => { state.fetchStatus = "succeeded"; Object.assign(state, action.payload) })
      .addCase(fetchFilterOptions.rejected,  (state, action) => { state.fetchStatus = "failed";    state.error = action.payload || action.error.message })
  },
})

export default filterOptionsSlice.reducer
