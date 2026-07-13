import { createSlice } from "@reduxjs/toolkit"

export const PAGE = Object.freeze({
  FILE_CATALOG:    "file-catalog",
  UPLOAD_VALIDATE: "upload-validate",
  APPROVALS:       "approvals",
  VERSIONING:      "versioning",
  RELEASE:         "release",
  CONFIGURATION:   "configuration",
})

const navigationSlice = createSlice({
  name: "navigation",
  initialState: {
    activePage: PAGE.FILE_CATALOG,
  },
  reducers: {
    navigateTo(state, action) {
      state.activePage = action.payload
    },
  },
})

export const { navigateTo } = navigationSlice.actions
export default navigationSlice.reducer
