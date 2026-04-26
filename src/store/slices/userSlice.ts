import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { authApi, getToken, type User } from "@/lib/api";

export type { User };

export const signupThunk = createAsyncThunk(
  "user/signup",
  async ({ email, password, fullName }: { email: string; password: string; fullName: string }) => {
    return authApi.signup(email, password, fullName);
  },
);

export const signinThunk = createAsyncThunk(
  "user/signin",
  async ({ email, password }: { email: string; password: string }) => {
    return authApi.signin(email, password);
  },
);

export const restoreSessionThunk = createAsyncThunk("user/restoreSession", async () => {
  const token = getToken();
  if (!token) return null;
  return authApi.me();
});

interface UserState {
  current: User | null;
  loading: boolean;
  error: string | null;
}

const userSlice = createSlice({
  name: "user",
  initialState: { current: null, loading: false, error: null } as UserState,
  reducers: {
    logout(state) {
      state.current = null;
      state.error = null;
      authApi.signout();
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signupThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(signupThunk.fulfilled, (state, action: PayloadAction<User>) => { state.loading = false; state.current = action.payload; })
      .addCase(signupThunk.rejected, (state, action) => { state.loading = false; state.error = action.error.message ?? "Signup failed."; });

    builder
      .addCase(signinThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(signinThunk.fulfilled, (state, action: PayloadAction<User>) => { state.loading = false; state.current = action.payload; })
      .addCase(signinThunk.rejected, (state, action) => { state.loading = false; state.error = action.error.message ?? "Sign in failed."; });

    builder
      .addCase(restoreSessionThunk.pending, (state) => { state.loading = true; })
      .addCase(restoreSessionThunk.fulfilled, (state, action) => { state.loading = false; state.current = action.payload; })
      .addCase(restoreSessionThunk.rejected, (state) => { state.loading = false; state.current = null; authApi.signout(); });
  },
});

export const { logout, clearError } = userSlice.actions;
export default userSlice.reducer;