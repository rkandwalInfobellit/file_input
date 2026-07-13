import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const CLOUDS = Object.freeze(["AWS", "AZURE", "GCP", "OCI"])

// status values: "pending" | "inReview" | "rejected" | "staged" | "released" | null
const DUMMY_FILES = [
  { id: "aws_rules",                name: "aws_rules.json",                  category: "Business Rules", app: ["CCA"],       cloud: ["AWS"],   version: "v1.1",       status: "pending"  },
  { id: "azure_rules",              name: "azure_rules.json",                category: "Business Rules", app: ["CCA"],       cloud: ["AZURE"], version: "v2.0",       status: null       },
  { id: "gcp_rules",                name: "gcp_rules.json",                  category: "Business Rules", app: ["CCA"],       cloud: ["GCP"],   version: "v1.0",       status: "rejected" },
  { id: "scaler_migration_paths",   name: "scaler_migration_paths.xlsx",     category: "Scaler Data",    app: ["Scaler"],    cloud: [],        version: "v2.9",       status: "pending"  },
  { id: "scaler_perf_improvements", name: "scaler_perf_improvements.xlsx",   category: "Scaler Data",    app: ["Scaler"],    cloud: [],        version: "v1.5",       status: null       },
  { id: "scaler_new_instances_list",name: "scaler_new_instances_list.xlsx",  category: "Scaler Data",    app: ["Scaler"],    cloud: ["AWS"],   version: "v2.1",       status: "inReview" },
  { id: "recommendation_remarks_cca",name:"recommendation_remarks_CCA.xlsx", category: "Remarks",        app: ["CCA"],       cloud: [],        version: "v4.0",       status: "inReview" },
  { id: "recommendation_remarks_eia",name:"recommendation_remarks_EIA.xlsx", category: "Remarks",        app: ["EIA"],       cloud: [],        version: "v2.3",       status: null       },
  { id: "mrd_sept_2025",            name: "MRD_Sept_2025.pdf",               category: "MRD",            app: ["CCA","EIA"], cloud: [],        version: "v1.0",       status: null       },
  { id: "power_carbon_data_epdw",   name: "power_carbon_data_EPDW.xlsx",     category: "System / EPDW",  app: ["EIA"],       cloud: [],        version: "v5.2",       status: null       },
  { id: "h5_cloud_data_aws",        name: "h5_cloud_data_AWS.h5",            category: "System / H5",    app: ["CCA","EIA"], cloud: ["AWS"],   version: "2026-06-15", status: "inReview" },
  { id: "h5_cloud_data_azure",      name: "h5_cloud_data_Azure.h5",          category: "System / H5",    app: ["CCA","EIA"], cloud: ["AZURE"], version: "2026-06-15", status: null       },
  { id: "aws_pricing_pull",         name: "AWS pricing pull",                 category: "Pricing / AWS",  app: ["CCA","EIA"], cloud: ["AWS"],   version: "2026-06-20", status: "staged"   },
]

export const fetchFiles = createAsyncThunk(
  "fileCatalog/fetchFiles",
  async (_params = {}, { rejectWithValue }) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return DUMMY_FILES;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load files");
    }
  }
);

const initialState = {
  files: [],
  fetchStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  search: "",
  filters: {
    category: [], // multi-select → string[]
    app:      [], // multi-select → string[]
    cloud:    [], // multi-select → string[]
    status:   [], // multi-select → string[]
  },
};

const fileCatalogSlice = createSlice({
  name: "fileCatalog",
  initialState,
  reducers: {
    setSearch(state, action)          { state.search = action.payload },
    setCategoryFilter(state, action)  { state.filters.category = action.payload },
    setAppFilter(state, action)       { state.filters.app = action.payload },
    setCloudFilter(state, action)     { state.filters.cloud = action.payload },
    setStatusFilter(state, action)    { state.filters.status = action.payload },
    clearFilters(state) {
      state.filters = { category: [], app: [], cloud: [], status: [] }
      state.search = ""
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFiles.pending,   (state)         => { state.fetchStatus = "loading";   state.error = null })
      .addCase(fetchFiles.fulfilled, (state, action) => { state.fetchStatus = "succeeded"; state.files = action.payload })
      .addCase(fetchFiles.rejected,  (state, action) => { state.fetchStatus = "failed";    state.error = action.payload || action.error.message })
  },
});

export const {
  setSearch,
  setCategoryFilter,
  setAppFilter,
  setCloudFilter,
  setStatusFilter,
  clearFilters,
} = fileCatalogSlice.actions;

export default fileCatalogSlice.reducer;
