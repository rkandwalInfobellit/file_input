import { csClient, amdPortalClient } from "@/lib/apiClient"
import { API_ROUTES } from "@/lib/apiRoutes"

const AuthService = {
  async login(email, password) {
    const { data } = await csClient.post(API_ROUTES.LOGIN, {
      email,
      password: btoa(password),
    })
    return data
  },

  async getUserToken(jwtToken) {
    const { data } = await amdPortalClient.post(
      API_ROUTES.GET_USER_TOKEN,
      { application: "IFG" },
      { headers: { accessToken: `Bearer ${jwtToken}` } }
    )
    return data?.Data
  },
}

export default AuthService
