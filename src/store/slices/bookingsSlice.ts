import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { bookingsApi, type Booking } from "@/lib/api";

export type { Booking };
export type { Passenger } from "@/lib/api";

// ── Async thunks ──────────────────────────────────────────────────────────────

export const fetchBookingsThunk = createAsyncThunk("bookings/fetch", async () => {
  return bookingsApi.list();
});

export const fetchAllBookingsThunk = createAsyncThunk("bookings/fetchAll", async () => {
  return bookingsApi.listAll();
});

export const addBookingThunk = createAsyncThunk(
  "bookings/add",
  async (payload: Parameters<typeof bookingsApi.create>[0]) => {
    return bookingsApi.create(payload);
  },
);

export const cancelBookingThunk = createAsyncThunk("bookings/cancel", async (pnr: string) => {
  return bookingsApi.cancel(pnr);
});

export const rescheduleBookingThunk = createAsyncThunk(
  "bookings/reschedule",
  async ({ pnr, flightId }: { pnr: string; flightId: string }) => {
    return bookingsApi.reschedule(pnr, flightId);
  },
);

export const checkInBookingThunk = createAsyncThunk("bookings/checkIn", async (pnr: string) => {
  return bookingsApi.checkIn(pnr);
});

// ── Slice ─────────────────────────────────────────────────────────────────────

interface BookingsState {
  items: Booking[];
  loading: boolean;
  error: string | null;
}

function upsert(items: Booking[], updated: Booking): Booking[] {
  const idx = items.findIndex((b) => b.pnr === updated.pnr);
  if (idx === -1) return [...items, updated];
  const copy = [...items];
  copy[idx] = updated;
  return copy;
}

const bookingsSlice = createSlice({
  name: "bookings",
  initialState: { items: [], loading: false, error: null } as BookingsState,
  reducers: {
    clearBookings(state) {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    // fetch
    builder
      .addCase(fetchBookingsThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchBookingsThunk.fulfilled, (state, action: PayloadAction<Booking[]>) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchBookingsThunk.rejected, (state, action) => { state.loading = false; state.error = action.error.message ?? "Failed to load bookings."; });

    // fetchAll (admin)
    builder
      .addCase(fetchAllBookingsThunk.fulfilled, (state, action: PayloadAction<Booking[]>) => { state.items = action.payload; });

    // add
    builder
      .addCase(addBookingThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addBookingThunk.fulfilled, (state, action: PayloadAction<Booking>) => { state.loading = false; state.items = upsert(state.items, action.payload); })
      .addCase(addBookingThunk.rejected, (state, action) => { state.loading = false; state.error = action.error.message ?? "Booking failed."; });

    // cancel
    builder
      .addCase(cancelBookingThunk.fulfilled, (state, action: PayloadAction<Booking>) => { state.items = upsert(state.items, action.payload); })
      .addCase(cancelBookingThunk.rejected, (state, action) => { state.error = action.error.message ?? "Cancel failed."; });

    // reschedule
    builder
      .addCase(rescheduleBookingThunk.fulfilled, (state, action: PayloadAction<Booking>) => { state.items = upsert(state.items, action.payload); })
      .addCase(rescheduleBookingThunk.rejected, (state, action) => { state.error = action.error.message ?? "Reschedule failed."; });

    // check in
    builder
      .addCase(checkInBookingThunk.fulfilled, (state, action: PayloadAction<Booking>) => { state.items = upsert(state.items, action.payload); })
      .addCase(checkInBookingThunk.rejected, (state, action) => { state.error = action.error.message ?? "Check-in failed."; });
  },
});

export const { clearBookings } = bookingsSlice.actions;
export default bookingsSlice.reducer;