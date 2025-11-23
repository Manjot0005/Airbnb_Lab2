import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import listingsReducer from './listingsSlice';
import bookingsReducer from './bookingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    listings: listingsReducer,
    bookings: bookingsReducer,
  },
});
