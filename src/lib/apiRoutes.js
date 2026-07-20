// Paths only — base URLs are set on the axios clients in apiClient.js

export const API_ROUTES = Object.freeze({
  // Auth  (apiClient — VITE_API_URL)
  LOGIN: "/login",

  // Common service  (csClient — VITE_COMMON_SERVICE_URL)
  GET_USER_TOKEN: "/getUserToken",
})
