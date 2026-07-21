import { configureStore } from "@reduxjs/toolkit"
import fileCatalogReducer    from "./slice/fileCatalog.slice"
import filterOptionsReducer  from "./slice/filterOptions.slice"
import versioningReducer     from "./slice/versioning.slice"
import releaseReducer        from "./slice/release.slice"
import appReducer            from "./slice/app.slice"
import categoryReducer       from "./slice/category.slice"
import approvalDetailReducer from "./slice/approvalDetail.slice"

export const store = configureStore({
  reducer: {
    fileCatalog:    fileCatalogReducer,
    filterOptions:  filterOptionsReducer,
    versioning:     versioningReducer,
    release:        releaseReducer,
    app:            appReducer,
    category:       categoryReducer,
    approvalDetail: approvalDetailReducer,
  },
})
