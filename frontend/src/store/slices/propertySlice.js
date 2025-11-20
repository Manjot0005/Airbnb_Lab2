import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

const initialState = {
  properties: [],
  currentProperty: null,
  favorites: [],
  isLoading: false,
  error: null
};

export const fetchProperties = createAsyncThunk('property/fetchProperties', async (params) => {
  const response = await api.get('/listings', { params });
  return response.data.listings || [];
});

export const fetchFavorites = createAsyncThunk('property/fetchFavorites', async () => {
  const response = await api.get('/favorites');
  return response.data.favorites || [];
});

const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.properties = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.favorites = action.payload;
      });
  }
});

export const { clearError } = propertySlice.actions;
export default propertySlice.reducer;
