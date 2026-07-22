import { ifgApi } from "../api/ifgApi"
import { portalApi } from "../api/portalApi"
import { csApi } from "../api/csApi"

// ── Clouds (from RTK Query cache) ────────────────────────────────────────────
export const selectClouds = (state) =>
  ifgApi.endpoints.getClouds.select()(state).data ?? []

export const selectCloudsStatus = (state) => {
  const { isLoading, isSuccess, isError } = ifgApi.endpoints.getClouds.select()(state)
  if (isLoading) return "loading"
  if (isSuccess) return "succeeded"
  if (isError)   return "failed"
  return "idle"
}

export const selectCloudOptions = (state) =>
  (ifgApi.endpoints.getClouds.select()(state).data ?? []).map((c) => ({
    value: c.cloud_id,
    label: c.display_name,
  }))

// ── Applications (from RTK Query cache) ──────────────────────────────────────
export const selectApplications = (state) =>
  portalApi.endpoints.getApplications.select()(state).data ?? []

export const selectApplicationsStatus = (state) => {
  const { isLoading, isSuccess, isError } = portalApi.endpoints.getApplications.select()(state)
  if (isLoading) return "loading"
  if (isSuccess) return "succeeded"
  if (isError)   return "failed"
  return "idle"
}

export const selectApplicationOptions = (state) =>
  (portalApi.endpoints.getApplications.select()(state).data ?? []).map((a) => ({
    value: a.name,
    label: a.display_name,
  }))

// ── Users (from RTK Query cache — no longer stored in slice) ─────────────────
export const selectUsers = (state) =>
  csApi.endpoints.getUsers.select()(state).data?.items ?? []
