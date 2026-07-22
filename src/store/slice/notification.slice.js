import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import NotificationService from "@/services/notification.service"

export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return await NotificationService.fetchInbox({ is_read: false, limit: 20 })
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const markNotificationRead = createAsyncThunk(
  "notifications/markRead",
  async ({ notification_ids, type = "individual" }, { rejectWithValue }) => {
    try {
      await NotificationService.markRead({ notification_ids, type })
      return { notification_ids, type }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const clearNotifications = createAsyncThunk(
  "notifications/clear",
  async ({ notification_ids, type = "individual" }, { rejectWithValue }) => {
    try {
      await NotificationService.clear({ notification_ids, type })
      return { notification_ids, type }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    unreadCount: 0,
    fetchStatus: "idle",
    // per-id optimistic tracking: "reading" | "clearing"
    pendingIds: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload.items ?? []
        state.unreadCount = action.payload.unread_count ?? 0
        state.fetchStatus = "succeeded"
      })
      .addCase(fetchNotifications.pending, (state) => {
        state.fetchStatus = "loading"
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.fetchStatus = "failed"
      })

      // mark read — optimistic: flip is_read immediately, rollback on rejection handled by re-fetch
      .addCase(markNotificationRead.pending, (state, action) => {
        const { notification_ids, type } = action.meta.arg
        if (type === "all") {
          state.items.forEach((n) => { n.is_read = true })
          state.unreadCount = 0
        } else {
          const idSet = new Set(notification_ids)
          state.items.forEach((n) => {
            if (idSet.has(n.notification_id)) {
              n.is_read = true
              state.unreadCount = Math.max(0, state.unreadCount - 1)
            }
          })
        }
      })

      // clear — optimistic remove
      .addCase(clearNotifications.pending, (state, action) => {
        const { notification_ids, type } = action.meta.arg
        if (type === "all") {
          state.unreadCount = 0
          state.items = []
        } else {
          const idSet = new Set(notification_ids)
          const removed = state.items.filter((n) => idSet.has(n.notification_id))
          removed.forEach((n) => { if (!n.is_read) state.unreadCount = Math.max(0, state.unreadCount - 1) })
          state.items = state.items.filter((n) => !idSet.has(n.notification_id))
        }
      })
      // on rejection re-fetch to restore truth
      .addCase(clearNotifications.rejected, (state) => {
        state.fetchStatus = "idle"
      })
      .addCase(markNotificationRead.rejected, (state) => {
        state.fetchStatus = "idle"
      })
  },
})

export default notificationSlice.reducer
