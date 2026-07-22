import axios from "axios"
import Cookies from "js-cookie"
import { isEndpointEnabledFromState } from "@/store/slice/permissions.slice"

// Injected after the Redux store is created to avoid a circular import.
// Call injectStore(store) once in main.jsx (or store.js bootstrap).
let _store = null
export function injectStore(store) {
  _store = store
}

class ApiClient {
  #client
  #moduleKey // truthy only on clients that participate in permission checks

  constructor(baseURL, defaultHeaders = {}) {
    // Clients that carry an "Appname" header are IFG-scoped and get endpoint blocking.
    this.#moduleKey = defaultHeaders.Appname ?? null

    this.#client = axios.create({
      baseURL,
      paramsSerializer: (params) => {
        const parts = []
        for (const [key, val] of Object.entries(params)) {
          if (Array.isArray(val)) {
            val.forEach((v) => parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`))
          } else {
            parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
          }
        }
        return parts.join("&")
      },
    })

    // Attach jwt_token + any instance-level default headers to every request
    this.#client.interceptors.request.use((config) => {
      const token = Cookies.get("jwt_token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      Object.assign(config.headers, defaultHeaders)
      return config
    })

    // Endpoint-permission guard — runs only for IFG-scoped clients
    if (this.#moduleKey) {
      const moduleKey = this.#moduleKey
      this.#client.interceptors.request.use((config) => {
        if (!_store) return config

        // Only check endpoints that belong to the IFG feature tree (ifgapi/* paths).
        // Auth and infrastructure paths (/login, /users/list, etc.) are never
        // in the permissions tree and must always pass through.
        const normalizedUrl = config.url?.replace(/^\/+/, "") ?? ""
        if (!normalizedUrl.startsWith("ifgapi/")) return config

        // Skip RBAC when permissions haven't been loaded yet (pre-login state).
        const featuresData = _store.getState().permissions?.featuresData ?? {}
        if (!featuresData[moduleKey]) return config

        const allowed = isEndpointEnabledFromState(_store.getState(), moduleKey, config.url)
        if (!allowed) {
          if (import.meta.env.DEV) {
            console.warn(
              `[RBAC] Blocked request — endpoint not permitted: ${config.url} (module: ${moduleKey})`
            )
          }
          return Promise.reject({
            status: 403,
            message: "Endpoint not permitted",
            blocked: true,
          })
        }
        return config
      })
    }

    // Normalize error shape so callers always get err.message
    this.#client.interceptors.response.use(
      (res) => res,
      (err) => {
        // Pass through our own structured blocked-request rejection unchanged
        if (err?.blocked) return Promise.reject(err)
        const message =
          err.response?.data?.Message ||
          err.response?.data?.message ||
          err.message ||
          "Request failed"
        return Promise.reject(new Error(message))
      }
    )
  }

  get(url, config)           { return this.#client.get(url, config) }
  post(url, data, config)    { return this.#client.post(url, data, config) }
  put(url, data, config)     { return this.#client.put(url, data, config) }
  patch(url, data, config)   { return this.#client.patch(url, data, config) }
  delete(url, config)        { return this.#client.delete(url, config) }
}

// VITE_API_URL          → IFG backend  (5003) — clouds, files, etc.
export const apiClient        = new ApiClient(import.meta.env.VITE_API_URL, { Appname: "IFG" })

// VITE_COMMON_SERVICE_API_URL → internal API  (5002) — users, login
export const csClient         = new ApiClient(import.meta.env.VITE_COMMON_SERVICE_API_URL)

// VITE_COMMON_SERVICE_URL     → AMD portal (dev.epycadvisory.amd.com) — applications, getUserToken
export const amdPortalClient  = new ApiClient(import.meta.env.VITE_COMMON_SERVICE_URL)
