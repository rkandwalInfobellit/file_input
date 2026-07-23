import { configureStore } from "@reduxjs/toolkit"
import Cookies from "js-cookie"
import LZString from "lz-string"
import permissionsReducer   from "./slice/permissions.slice"
import fileCatalogReducer    from "./slice/fileCatalog.slice"
import filterOptionsReducer  from "./slice/filterOptions.slice"
import versioningReducer     from "./slice/versioning.slice"
import releaseReducer        from "./slice/release.slice"
import appReducer            from "./slice/app.slice"
import categoryReducer       from "./slice/category.slice"
import approvalDetailReducer from "./slice/approvalDetail.slice"
import notificationReducer   from "./slice/notification.slice"

// RTK Query API slices — endpoints are injected per-feature via injectEndpoints
import { ifgApi }    from "./api/ifgApi"
import { csApi }     from "./api/csApi"
import { portalApi } from "./api/portalApi"

// Import endpoint modules so their injectEndpoints calls register before first use
import "./api/endpoints/app.endpoints"
import "./api/endpoints/catalog.endpoints"
import "./api/endpoints/notification.endpoints"
import "./api/endpoints/category.endpoints"
import "./api/endpoints/versioning.endpoints"
import "./api/endpoints/release.endpoints"
import "./api/endpoints/approvalDetail.endpoints"

// Read permissions from cookie synchronously so the store is already populated
// before the first render — prevents the redirect-to-not-authorized on refresh.
function loadPermissionsFromCookie() {
  try {
    const compressed = Cookies.get("IFG_features")
    if (!compressed) return undefined
    const json = LZString.decompressFromEncodedURIComponent(compressed)
    const features = json ? JSON.parse(json) : []
    const moduleKey = Cookies.get("application") || "IFG"
    return { featuresData: { [moduleKey]: { features } } }
  } catch {
    return undefined
  }
}

const cookiePermissions = loadPermissionsFromCookie()

export const store = configureStore({
  ...(cookiePermissions && { preloadedState: { permissions: cookiePermissions } }),
  reducer: {
    permissions:    permissionsReducer,

    // Legacy slices (UI filter state — not replaced by RTK Query)
    fileCatalog:    fileCatalogReducer,
    filterOptions:  filterOptionsReducer,
    versioning:     versioningReducer,
    release:        releaseReducer,
    app:            appReducer,
    category:       categoryReducer,
    approvalDetail: approvalDetailReducer,
    notifications:  notificationReducer,

    // RTK Query reducers
    [ifgApi.reducerPath]:    ifgApi.reducer,
    [csApi.reducerPath]:     csApi.reducer,
    [portalApi.reducerPath]: portalApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(ifgApi.middleware)
      .concat(csApi.middleware)
      .concat(portalApi.middleware),
})
