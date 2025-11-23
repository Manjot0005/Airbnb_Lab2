import { createSlice } from '@reduxjs/toolkit';

const listingsSlice = createSlice({
  name: 'listings',
  initialState: { items: [], loading: false },
  reducers: {
    setListings: (state, action) => { state.items = action.payload; state.loading = false; },
    setLoading: (state) => { state.loading = true; }
  }
    setLoading: (state) => { state.loading = true; }
  }
});
export const { setListings, setLoading } = listingsSlice.actions;
export default listingsSlice.reducer;
