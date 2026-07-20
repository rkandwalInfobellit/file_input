import axios from "axios"
import Cookies from "js-cookie"

class ApiClient {
  #client

  constructor(baseURL) {
    this.#client = axios.create({ baseURL })

    // Attach jwt_token to every request if present
    this.#client.interceptors.request.use((config) => {
      const token = Cookies.get("jwt_token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Normalize error shape so callers always get err.message
    this.#client.interceptors.response.use(
      (res) => res,
      (err) => {
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

export const apiClient    = new ApiClient(import.meta.env.VITE_API_URL)
export const csClient     = new ApiClient(import.meta.env.VITE_COMMON_SERVICE_URL)
