import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/admin';

const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const fetchAnalytics = createAsyncThunk('admin/fetchAnalytics', async (_, thunkAPI) => {
  try {
    const { auth } = thunkAPI.getState();
    const { data } = await axios.get(`${API_URL}/analytics`, getAuthConfig(auth.userInfo.token));
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response && error.response.data.error ? error.response.data.error : error.message);
  }
});

export const fetchUsers = createAsyncThunk('admin/fetchUsers', async (_, thunkAPI) => {
  try {
    const { auth } = thunkAPI.getState();
    const { data } = await axios.get(`${API_URL}/users`, getAuthConfig(auth.userInfo.token));
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response && error.response.data.error ? error.response.data.error : error.message);
  }
});

export const toggleBlockUser = createAsyncThunk('admin/toggleBlock', async ({ id, isBlocked }, thunkAPI) => {
  try {
    const { auth } = thunkAPI.getState();
    const { data } = await axios.put(`${API_URL}/users/${id}/block`, { isBlocked }, getAuthConfig(auth.userInfo.token));
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response && error.response.data.error ? error.response.data.error : error.message);
  }
});

export const deleteUser = createAsyncThunk('admin/deleteUser', async (id, thunkAPI) => {
  try {
    const { auth } = thunkAPI.getState();
    const { data } = await axios.delete(`${API_URL}/users/${id}`, getAuthConfig(auth.userInfo.token));
    return { id, data };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response && error.response.data.error ? error.response.data.error : error.message);
  }
});

const initialState = {
  analytics: null,
  users: [],
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminState: (state) => {
      state.analytics = null;
      state.users = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle Block User
      .addCase(toggleBlockUser.fulfilled, (state, action) => {
        state.users = state.users.map((u) =>
          u._id === action.payload._id ? { ...u, isBlocked: action.payload.isBlocked } : u
        );
      })
      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload.id);
      });
  },
});

export const { clearAdminState } = adminSlice.actions;
export default adminSlice.reducer;
