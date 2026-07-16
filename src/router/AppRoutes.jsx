import { useRoutes } from "react-router-dom"
import { routeConfig } from "./routes.config"

export default function AppRoutes() {
  return useRoutes(routeConfig)
}
