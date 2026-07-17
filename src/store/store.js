import { configureStore } from "@reduxjs/toolkit"
import fileCatalogReducer from "./slice/fileCatalog.slice"
import filterOptionsReducer from "./slice/filterOptions.slice"
import versioningReducer from "./slice/versioning.slice"
import releaseReducer    from "./slice/release.slice"

export const store = configureStore({
  reducer: {
    fileCatalog:   fileCatalogReducer,
    filterOptions: filterOptionsReducer,
    versioning:    versioningReducer,
    release:       releaseReducer,
  },
})
