import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import ApprovalDetailService from "@/services/approvalDetail.service"

export const fetchApprovalDetail = createAsyncThunk(
  "approvalDetail/fetch",
  async (versionId, { rejectWithValue }) => {
    try {
      return await ApprovalDetailService.fetch(versionId)
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load approval detail")
    }
  }
)

const initialState = {
  data:        null,   // { file, version, approval, approval_details, version_history, activity_log }
  fetchStatus: "idle",
  error:       null,
}

const approvalDetailSlice = createSlice({
  name: "approvalDetail",
  initialState,
  reducers: {
    clearApprovalDetail(state) {
      state.data        = null
      state.fetchStatus = "idle"
      state.error       = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApprovalDetail.pending,   (state) => { state.fetchStatus = "loading"; state.error = null })
      .addCase(fetchApprovalDetail.fulfilled, (state, { payload }) => {
        state.fetchStatus = "succeeded"
        state.data        = payload
      })
      .addCase(fetchApprovalDetail.rejected,  (state, { payload }) => {
        state.fetchStatus = "failed"
        state.error       = payload
      })
  },
})

export const { clearApprovalDetail } = approvalDetailSlice.actions
export default approvalDetailSlice.reducer

export const selectApprovalDetail = (state) => state.approvalDetail
