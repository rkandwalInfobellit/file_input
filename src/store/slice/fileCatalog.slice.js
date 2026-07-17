import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { FILE_CATEGORY, APP, CLOUD, FILE_STATUS } from "./filterOptions.slice"

// isOwner: true  → uploaded by the current user ("My Files")
// isApprover: true → current user is an assigned approver ("Requests")
const DUMMY_FILES = [
  // ── My Files (isOwner) ─ one per status so every state is visible ────────
  {
    id: "aws_rules", name: "aws_rules.json",
    category: FILE_CATEGORY.BUSINESS_RULES, app: [APP.CCA], cloud: [CLOUD.AWS],
    version: "v1.2", status: FILE_STATUS.PENDING,
    approver: "John Smith", contributor: "You",
    file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf",
    isOwner: true, isApprover: false,
    submittedBy: "You", submittedAt: "21 Jun 14:32",
    description: "Updated Turin preference rule for AWS: added fallback to Genoa when Turin not available in region. Added 3 new SKU exclusions for disk-attached instances.",
    versions: [
      { version: "v1.2.0", status: FILE_STATUS.PENDING,  submittedBy: "Contributor A", approvedBy: "Approver 2 (partial)", submittedAt: "21 Jun 2026", approvedAt: null,         taggedRelease: null,          changeNotes: "Turin fallback rule; 3 new SKU exclusions", file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
      { version: "v1.1.1", status: "Released",            submittedBy: "Contributor A", approvedBy: "Approver 1, Approver 2", submittedAt: "10 Jun 2026", approvedAt: "10 Jun 2026", taggedRelease: "Release v1.2.0", changeNotes: "Added GCP Genoa priority rules",             file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf", isCurrent: true },
      { version: "v1.1.0", status: "Superseded",          submittedBy: "Contributor A", approvedBy: "Approver 1",            submittedAt: "01 Jun 2026", approvedAt: "01 Jun 2026", taggedRelease: "Release v1.0.0", changeNotes: "Initial AWS rule set",                        file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
    ],
  },
  {
    id: "azure_rules", name: "azure_rules.json",
    category: FILE_CATEGORY.BUSINESS_RULES, app: [APP.CCA], cloud: [CLOUD.AZURE],
    version: "v2.0", status: FILE_STATUS.REVIEW,
    approver: "Jane Doe", contributor: "You",
    file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf",
    isOwner: true, isApprover: false,
    submittedBy: "You", submittedAt: "18 Jun 09:10",
    description: "Added Azure region coverage for West Europe and updated SKU mapping.",
    versions: [
      { version: "v2.0.0", status: FILE_STATUS.REVIEW,  submittedBy: "You",          approvedBy: null,          submittedAt: "18 Jun 2026", approvedAt: null,         taggedRelease: null,          changeNotes: "West Europe + North Europe zone coverage", file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
      { version: "v1.9.0", status: "Released",           submittedBy: "You",          approvedBy: "Jane Doe",    submittedAt: "02 Jun 2026", approvedAt: "03 Jun 2026", taggedRelease: "Release v1.1.0", changeNotes: "Updated SKU mapping for Standard_D series",  file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf", isCurrent: true },
      { version: "v1.8.0", status: "Superseded",         submittedBy: "Contributor B", approvedBy: "Jane Doe",    submittedAt: "15 May 2026", approvedAt: "16 May 2026", taggedRelease: "Release v1.0.0", changeNotes: "Initial Azure rule set",                    file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
    ],
  },
  {
    id: "gcp_rules", name: "gcp_rules.json",
    category: FILE_CATEGORY.BUSINESS_RULES, app: [APP.CCA], cloud: [CLOUD.GCP],
    version: "v1.0", status: FILE_STATUS.PARTIALLY_APPROVED,
    approver: "John Smith", contributor: "You",
    file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf",
    isOwner: true, isApprover: false,
    submittedBy: "You", submittedAt: "15 Jun 11:45",
    description: "Initial GCP business rules file. Covers us-central1 and us-east1 regions.",
  },
  {
    id: "scaler_migration_paths", name: "scaler_migration_paths.xlsx",
    category: FILE_CATEGORY.SCALER_DATA, app: [APP.CCA], cloud: [],
    version: "v2.9", status: FILE_STATUS.APPROVED,
    approver: "John Smith", contributor: "You",
    file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf",
    isOwner: true, isApprover: false,
    submittedBy: "You", submittedAt: "10 Jun 08:00",
    description: "Migration paths update for Q3 scaler rollout.",
  },
  {
    id: "scaler_perf_improvements", name: "scaler_perf_improvements.xlsx",
    category: FILE_CATEGORY.SCALER_DATA, app: [APP.CCA], cloud: [],
    version: "v1.5", status: FILE_STATUS.PARTIALLY_REJECTED,
    approver: "Jane Doe", contributor: "You",
    file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf",
    isOwner: true, isApprover: false,
    submittedBy: "You", submittedAt: "08 Jun 16:20",
    description: "Performance improvements for high-memory SKU selection algorithm.",
  },
  {
    id: "scaler_new_instances_list", name: "scaler_new_instances_list.xlsx",
    category: FILE_CATEGORY.SCALER_DATA, app: [APP.CCA], cloud: [CLOUD.AWS],
    version: "v2.1", status: FILE_STATUS.REJECTED,
    approver: "John Smith", contributor: "You",
    file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf",
    isOwner: true, isApprover: false,
    submittedBy: "You", submittedAt: "05 Jun 13:55",
    description: "New instance types for AWS us-east-2 added to scaler list.",
  },
  {
    id: "recommendation_remarks_cca", name: "recommendation_remarks_CCA.xlsx",
    category: FILE_CATEGORY.REMARKS, app: [APP.CCA], cloud: [],
    version: "v4.0", status: FILE_STATUS.ROLLBACK,
    approver: "Jane Doe", contributor: "You",
    file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf",
    isOwner: true, isApprover: false,
    submittedBy: "You", submittedAt: "01 Jun 10:30",
    description: "CCA recommendation remarks for June release cycle.",
  },

  // ── Requests (isApprover) ─ files submitted by others that I must approve ─
  {
    id: "recommendation_remarks_eia", name: "recommendation_remarks_EIA.xlsx",
    category: FILE_CATEGORY.REMARKS, app: [APP.EIA], cloud: [],
    version: "v2.3", status: FILE_STATUS.PENDING,
    approver: "You", contributor: "Contributor A",
    file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf",
    isOwner: false, isApprover: true,
    submittedBy: "Contributor A", submittedAt: "20 Jun 11:00",
    description: "EIA recommendation remarks update for June cycle. Adjusted thresholds for carbon intensity scoring.",
    versions: [
      { version: "v2.3.0", status: FILE_STATUS.PENDING, submittedBy: "Contributor A", approvedBy: null,          submittedAt: "20 Jun 2026", approvedAt: null,         taggedRelease: null,           changeNotes: "Carbon intensity threshold adjustments",   file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
      { version: "v2.2.0", status: "Released",           submittedBy: "Contributor A", approvedBy: "You",         submittedAt: "05 Jun 2026", approvedAt: "06 Jun 2026", taggedRelease: "Release v2.0.0", changeNotes: "Updated EIA scoring weights",               file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf", isCurrent: true },
      { version: "v2.1.0", status: "Superseded",         submittedBy: "Contributor B", approvedBy: "You",         submittedAt: "20 May 2026", approvedAt: "21 May 2026", taggedRelease: "Release v1.5.0", changeNotes: "Initial EIA remarks file",                  file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
    ],
  },
  {
    id: "mrd_sept_2025", name: "MRD_Sept_2025.pdf",
    category: FILE_CATEGORY.MRD, app: [APP.CCA, APP.EIA], cloud: [],
    version: "v1.0", status: FILE_STATUS.REVIEW,
    approver: "You", contributor: "Contributor B",
    file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf",
    isOwner: false, isApprover: true,
    submittedBy: "Contributor B", submittedAt: "19 Jun 09:45",
    description: "September 2025 Market Requirements Document — initial draft for review.",
  },
  {
    id: "power_carbon_data_epdw", name: "power_carbon_data_EPDW.xlsx",
    category: FILE_CATEGORY.SYSTEM_EPDW, app: [APP.EIA], cloud: [],
    version: "v5.2", status: FILE_STATUS.PARTIALLY_APPROVED,
    approver: "You", contributor: "Contributor A",
    file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf",
    isOwner: false, isApprover: true,
    submittedBy: "Contributor A", submittedAt: "17 Jun 15:20",
    description: "Power and carbon data refresh from EPDW pipeline — Q2 actuals.",
  },
  {
    id: "h5_cloud_data_aws", name: "h5_cloud_data_AWS.h5",
    category: FILE_CATEGORY.SYSTEM_H5, app: [APP.CCA, APP.EIA], cloud: [CLOUD.AWS],
    version: "v8.2", status: FILE_STATUS.PARTIALLY_REJECTED,
    approver: "You", contributor: "Contributor C",
    file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf",
    isOwner: false, isApprover: true,
    submittedBy: "Contributor C", submittedAt: "14 Jun 12:00",
    description: "H5 cloud data update for AWS — includes new availability zone coverage.",
  },
  {
    id: "h5_cloud_data_azure", name: "h5_cloud_data_Azure.h5",
    category: FILE_CATEGORY.SYSTEM_H5, app: [APP.CCA, APP.EIA], cloud: [CLOUD.AZURE],
    version: "v5.2.7", status: FILE_STATUS.APPROVED,
    approver: "You", contributor: "Contributor B",
    file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf",
    isOwner: false, isApprover: true,
    submittedBy: "Contributor B", submittedAt: "12 Jun 17:05",
    description: "H5 cloud data for Azure — West Europe and North Europe zones added.",
  },
  {
    id: "aws_pricing_pull", name: "AWS pricing pull",
    category: FILE_CATEGORY.PRICING_AWS, app: [APP.CCA, APP.EIA], cloud: [CLOUD.AWS, CLOUD.AZURE],
    version: "v9.89", status: FILE_STATUS.ROLLBACK,
    approver: "You", contributor: "Contributor A",
    file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf",
    isOwner: false, isApprover: true,
    submittedBy: "Contributor A", submittedAt: "10 Jun 08:30",
    description: "AWS pricing pull — automated ingestion from AWS Price List API. Rolled back due to incorrect spot pricing entries.",
  },
]

export const fetchFiles = createAsyncThunk(
  "fileCatalog/fetchFiles",
  async (_params = {}, { rejectWithValue }) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400))
      return DUMMY_FILES
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load files")
    }
  }
)

const initialState = {
  files: [],
  fetchStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  activeTab: "all",   // 'all' | 'mine' | 'requests'
  search: "",
  filters: {
    category: [],
    app: [],
    cloud: [],
    status: [],
  },
}

const fileCatalogSlice = createSlice({
  name: "fileCatalog",
  initialState,
  reducers: {
    setActiveTab(state, action) { state.activeTab = action.payload },
    setSearch(state, action) { state.search = action.payload },
    setCategoryFilter(state, action) { state.filters.category = action.payload },
    setAppFilter(state, action) { state.filters.app = action.payload },
    setCloudFilter(state, action) { state.filters.cloud = action.payload },
    setStatusFilter(state, action) { state.filters.status = action.payload },
    clearFilters(state) {
      state.filters = { category: [], app: [], cloud: [], status: [] }
      state.search = ""
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFiles.pending, (state) => { state.fetchStatus = "loading"; state.error = null })
      .addCase(fetchFiles.fulfilled, (state, action) => { state.fetchStatus = "succeeded"; state.files = action.payload })
      .addCase(fetchFiles.rejected, (state, action) => { state.fetchStatus = "failed"; state.error = action.payload || action.error.message })
  },
})

export const {
  setActiveTab,
  setSearch,
  setCategoryFilter,
  setAppFilter,
  setCloudFilter,
  setStatusFilter,
  clearFilters,
} = fileCatalogSlice.actions

export default fileCatalogSlice.reducer
