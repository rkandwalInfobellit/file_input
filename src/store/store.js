import { configureStore } from "@reduxjs/toolkit"
import navigationReducer from "./slice/navigation.slice"
import fileCatalogReducer from "./slice/fileCatalog.slice"

export const store = configureStore({
  reducer: {
    navigation: navigationReducer,
    fileCatalog: fileCatalogReducer,
  },
})
