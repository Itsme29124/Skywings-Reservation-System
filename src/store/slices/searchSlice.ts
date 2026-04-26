import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface SearchState {
  origin: string;
  destination: string;
  date: string;
  passengers: number;
}

// Use a date inside the seeded flight range
const initialState: SearchState = {
  origin: "DEL",
  destination: "BOM",
  date: "2026-04-26",
  passengers: 1,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setSearch: (_state, action: PayloadAction<SearchState>) => action.payload,
    setField: <K extends keyof SearchState>(
      state: SearchState,
      action: PayloadAction<{ key: K; value: SearchState[K] }>,
    ) => {
      state[action.payload.key] = action.payload.value;
    },
  },
});

export const { setSearch, setField } = searchSlice.actions;
export default searchSlice.reducer;
