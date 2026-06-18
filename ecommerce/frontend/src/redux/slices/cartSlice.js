import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/cart';

const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Thunk to fetch cart from server
export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, thunkAPI) => {
  try {
    const { auth } = thunkAPI.getState();
    if (!auth.userInfo) return [];
    const { data } = await axios.get(API_URL, getAuthConfig(auth.userInfo.token));
    return data.items; // array of { product, quantity }
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response && error.response.data.error ? error.response.data.error : error.message);
  }
});

// Thunk to sync local cart to server
export const syncCartWithDb = createAsyncThunk('cart/syncCart', async (productsList, thunkAPI) => {
  try {
    const { auth } = thunkAPI.getState();
    if (!auth.userInfo) return productsList;
    
    // Format for backend: [{ product: id, quantity }]
    const formattedList = productsList.map(item => ({
      product: item.product._id || item.product,
      quantity: item.quantity
    }));

    const { data } = await axios.post(API_URL, { items: formattedList }, getAuthConfig(auth.userInfo.token));
    return data.items;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

// Thunk to clear cart
export const clearCartDb = createAsyncThunk('cart/clearCartDb', async (_, thunkAPI) => {
  try {
    const { auth } = thunkAPI.getState();
    if (auth.userInfo) {
      await axios.delete(API_URL, getAuthConfig(auth.userInfo.token));
    }
    return [];
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

const initialState = {
  cartItems: localStorage.getItem('cartItems')
    ? JSON.parse(localStorage.getItem('cartItems'))
    : [],
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload; // { product, quantity }
      const existItem = state.cartItems.find((x) => x.product._id === item.product._id);

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x.product._id === existItem.product._id ? item : x
        );
      } else {
        state.cartItems.push(item);
      }
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    removeFromCart: (state, action) => {
      const id = action.payload;
      state.cartItems = state.cartItems.filter((x) => x.product._id !== id);
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    updateCartQty: (state, action) => {
      const { id, qty } = action.payload;
      state.cartItems = state.cartItems.map((x) =>
        x.product._id === id ? { ...x, quantity: Number(qty) } : x
      );
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem('cartItems');
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload;
        localStorage.setItem('cartItems', JSON.stringify(action.payload));
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Sync Cart
      .addCase(syncCartWithDb.fulfilled, (state, action) => {
        state.cartItems = action.payload;
        localStorage.setItem('cartItems', JSON.stringify(action.payload));
      })
      // Clear Cart Db
      .addCase(clearCartDb.fulfilled, (state, action) => {
        state.cartItems = [];
        localStorage.removeItem('cartItems');
      });
  },
});

export const { addToCart, removeFromCart, updateCartQty, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
