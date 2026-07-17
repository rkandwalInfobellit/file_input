import { configureStore } from "@reduxjs/toolkit"
import fileCatalogReducer from "./slice/fileCatalog.slice"
import filterOptionsReducer from "./slice/filterOptions.slice"
import versioningReducer from "./slice/versioning.slice"

export const store = configureStore({
  reducer: {
    fileCatalog:   fileCatalogReducer,
    filterOptions: filterOptionsReducer,
    versioning:    versioningReducer,
  },
})
