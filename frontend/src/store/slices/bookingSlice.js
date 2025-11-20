import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

const initialState = {
  bookings: [],
  currentBooking: null,
  isLoading: false,
  error: null
};

export const createBooking = createAsyncThunk('booking/createBooking', async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response.data.booking;
});

export const fetchMyBookings = createAsyncThunk('booking/fetchMyBookings', async () => {
  const response = await api.get('/bookings/my');
  return response.data.bookings || [];
});

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.fulfilled, (state, action) => {
        state.bookings.unshift(action.payload);
        state.currentBooking = action.payload;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.bookings = action.payload;
        state.isLoading = false;
      });
  }
});

export const { clearError } = bookingSlice.actions;
export default bookingSlice.reducer;
