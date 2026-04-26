import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import searchReducer from "./slices/searchSlice";
import bookingsReducer from "./slices/bookingsSlice";
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    search: searchReducer,
    bookings: bookingsReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
