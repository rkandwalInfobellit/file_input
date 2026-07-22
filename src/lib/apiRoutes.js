// Paths only — base URLs are set on the axios clients in apiClient.js

export const API_ROUTES = Object.freeze({
  // Auth  (apiClient — VITE_API_URL)
  LOGIN: "/login",

  // Users  (apiClient — VITE_API_URL)
  USERS_LIST: "/users/list",

  // IFG API  (ifgClient — VITE_IFG_API_URL)
  CLOUDS_LIST: "/ifgapi/clouds/list",

  // Catalog  (apiClient — VITE_API_URL)
  CATALOG_LIST:          "/ifgapi/catalog/list",
  FILE_UPLOAD_SUBMIT:    "/ifgapi/file-upload/submit",
  APPROVALS_DETAIL:      "/ifgapi/approvals/detail",
  APPROVALS_APPROVE:     "/ifgapi/approvals/approve",
  APPROVALS_REVIEW:      "/ifgapi/approvals/review",

  // Categories  (apiClient — VITE_API_URL)
  CATEGORIES_LIST:   "/ifgapi/categories/list",
  CATEGORIES_DETAIL: "/ifgapi/categories/detail",
  CATEGORIES_CREATE: "/ifgapi/categories/create",
  CATEGORIES_UPDATE: "/ifgapi/categories/update",
  CATEGORIES_DELETE: "/ifgapi/categories/delete",

  // Versioning
  VERSIONS_INPUT: "/ifgapi/versions/input",

  // Release
  RELEASE_DRAFT_FILES: "/ifgapi/release/draft/files",
  RELEASE_CREATE:      "/ifgapi/release/create",
  RELEASE_LIST:        "/ifgapi/release/list",

  // Notifications
  NOTIFICATIONS_INBOX: "/ifgapi/notifications/inbox",
  NOTIFICATIONS_READ:  "/ifgapi/notifications/read",
  NOTIFICATIONS_CLEAR: "/ifgapi/notifications/clear",

  // Common service  (csClient — VITE_COMMON_SERVICE_URL)
  GET_USER_TOKEN: "/getUserToken",
  APPLICATIONS: "/csapi/applications",
})
