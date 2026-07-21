// Filter options are derived at selector level from the app + category slices.
// This slice is kept only for the FILE_STATUS enum and the fetchStatus
// used by FileCatalog to know when options are ready.
import { createSlice } from "@reduxjs/toolkit"

export const FILE_STATUS = Object.freeze({
  PENDING:            "Pending",
  REVIEW:             "Review",
  PARTIALLY_APPROVED: "Partially Approved",
  APPROVED:           "Approved",
  PARTIALLY_REJECTED: "Partially Rejected",
  REJECTED:           "Rejected",
  ROLLBACK:           "Rollback",
})

const filterOptionsSlice = createSlice({
  name: "filterOptions",
  initialState: {
    statuses:    Object.values(FILE_STATUS),
    fetchStatus: "succeeded",
    error:       null,
  },
  reducers: {},
})

export default filterOptionsSlice.reducer
