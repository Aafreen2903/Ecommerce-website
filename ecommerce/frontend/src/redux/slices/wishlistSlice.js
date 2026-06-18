import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/auth/wishlist';

const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const fetchWishlist = createAsyncThunk('wishlist/fetchWishlist', async (_, thunkAPI) => {
  try {
    const { auth } = thunkAPI.getState();
    if (!auth.userInfo) return [];
    const { data } = await axios.get(API_URL, getAuthConfig(auth.userInfo.token));
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response && error.response.data.error ? error.response.data.error : error.message);
  }
});

export const toggleWishlistItem = createAsyncThunk('wishlist/toggleItem', async (productId, thunkAPI) => {
  try {
    const { auth } = thunkAPI.getState();
    const { data } = await axios.post(`${API_URL}/${productId}`, {}, getAuthConfig(auth.userInfo.token));
    
    // Refresh wishlist details
    thunkAPI.dispatch(fetchWishlist());
    return data; // returns updated IDs array
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response && error.response.data.error ? error.response.data.error : error.message);
  }
});

const initialState = {
  wishlistItems: [],
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.wishlistItems = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlistItems = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
