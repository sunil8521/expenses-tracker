import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./user";

const store = configureStore({
  reducer: {
    [authSlice.name]: authSlice.reducer,
  },
});

export default store;
