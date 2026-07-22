import { apiClient, csClient, amdPortalClient } from "@/lib/apiClient"

const clientMap = {
  ifg:    apiClient,
  cs:     csClient,
  portal: amdPortalClient,
}

/**
 * RTK Query baseQuery that delegates to the existing ApiClient instances.
 * Reuses auth interceptors, paramsSerializer, and error normalisation already
 * wired on each client — no new auth logic here.
 *
 * Usage in createApi:
 *   baseQuery: axiosBaseQuery("ifg")
 */
export function axiosBaseQuery(clientKey = "ifg") {
  const client = clientMap[clientKey]

  return async ({ url, method = "get", params, body, data: bodyData }) => {
    try {
      const payload = bodyData ?? body
      let response
      // axios.delete doesn't take a body as 2nd arg — it goes in config.data
      if (method === "delete") {
        response = await client.delete(url, { params, data: payload })
      } else if (method === "get") {
        response = await client.get(url, { params })
      } else {
        response = await client[method](url, payload, { params })
      }
      return { data: response.data }
    } catch (err) {
      return {
        error: {
          status: err.response?.status ?? "FETCH_ERROR",
          data:   err.message ?? "Request failed",
        },
      }
    }
  }
}
