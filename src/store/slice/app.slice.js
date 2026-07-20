import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import AppService from "@/services/app.service"

export const fetchClouds = createAsyncThunk(
  "app/fetchClouds",
  async (_, { rejectWithValue }) => {
    try {
      return await AppService.fetchClouds()
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch clouds")
    }
  }
)

export const fetchApplications = createAsyncThunk(
  "app/fetchApplications",
  async (_, { rejectWithValue }) => {
    try {
      return await AppService.fetchApplications()
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch applications")
    }
  }
)

export const fetchUsers = createAsyncThunk(
  "app/fetchUsers",
  async ({ page = 1, limit = 10, search = "" } = {}, { rejectWithValue }) => {
    try {
      return await AppService.fetchUsers({ page, limit, search })
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch users")
    }
  }
)

const idle  = { status: "idle",    error: null }
const loading = { status: "loading", error: null }
const failed  = (error) => ({ status: "failed", error })
const done    = { status: "succeeded", error: null }

const initialState = {
  clouds: {
    data: [],
    ...idle,
  },
  applications: {
    data: [],
    ...idle,
  },
  users: {
    items: [],
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    ...idle,
  },
}

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Clouds
    builder
      .addCase(fetchClouds.pending,   (state) => { Object.assign(state.clouds, loading) })
      .addCase(fetchClouds.fulfilled, (state, { payload }) => {
        Object.assign(state.clouds, done)
        state.clouds.data = payload
      })
      .addCase(fetchClouds.rejected,  (state, { payload }) => {
        Object.assign(state.clouds, failed(payload))
      })

    // Applications
    builder
      .addCase(fetchApplications.pending,   (state) => { Object.assign(state.applications, loading) })
      .addCase(fetchApplications.fulfilled, (state, { payload }) => {
        Object.assign(state.applications, done)
        state.applications.data = payload
      })
      .addCase(fetchApplications.rejected,  (state, { payload }) => {
        Object.assign(state.applications, failed(payload))
      })

    // Users
    builder
      .addCase(fetchUsers.pending,   (state) => { Object.assign(state.users, loading) })
      .addCase(fetchUsers.fulfilled, (state, { payload }) => {
        Object.assign(state.users, done)
        state.users.items       = payload.items       ?? []
        state.users.currentPage = payload.current_page ?? 1
        state.users.totalPages  = payload.total_pages  ?? 0
        state.users.totalItems  = payload.total_items  ?? 0
      })
      .addCase(fetchUsers.rejected,  (state, { payload }) => {
        Object.assign(state.users, failed(payload))
      })
  },
})

export default appSlice.reducer
