import { createSlice } from '@reduxjs/toolkit';

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: { items: [], favorites: [] },
  reducers: {
    setBookings: (state, action) => { state.items = action.payload; },
    addFavorite: (state, action) => { state.favorites.push(action.payload); }
  }
});
export const { setBookings, addFavorite } = bookingsSlice.actions;
export default bookingsSlice.reducer;
