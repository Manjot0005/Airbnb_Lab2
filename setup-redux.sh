#!/bin/bash
cd frontend/src/store

# Create auth slice
cat > authSlice.js << 'EOF'
import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
    }
  }
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
EOF

echo "Redux files created!"
