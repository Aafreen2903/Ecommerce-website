import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/auth';

// Helper to set headers
const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const login = createAsyncThunk('auth/login', async ({ email, password }, thunkAPI) => {
  try {
    const { data } = await axios.post(`${API_URL}/login`, { email, password });
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  } catch (error) {
    const message = error.response && error.response.data.error
      ? error.response.data.error
      : error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const register = createAsyncThunk('auth/register', async ({ name, email, password }, thunkAPI) => {
  try {
    const { data } = await axios.post(`${API_URL}/register`, { name, email, password });
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  } catch (error) {
    const message = error.response && error.response.data.error
      ? error.response.data.error
      : error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (userData, thunkAPI) => {
  try {
    const { auth } = thunkAPI.getState();
    const { data } = await axios.put(`${API_URL}/profile`, userData, getAuthConfig(auth.userInfo.token));
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  } catch (error) {
    const message = error.response && error.response.data.error
      ? error.response.data.error
      : error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

const initialState = {
  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('userInfo');
      localStorage.removeItem('cartItems'); // clear cart cache on logout
      state.userInfo = null;
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
