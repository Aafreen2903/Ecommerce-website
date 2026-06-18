import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const createPaymentIntent = createAsyncThunk('orders/createPaymentIntent', async (items, thunkAPI) => {
  try {
    const { auth } = thunkAPI.getState();
    const { data } = await axios.post('/api/orders/payment-intent', { items }, getAuthConfig(auth.userInfo.token));
    return data; // returns { clientSecret, totalAmount, isMock }
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response && error.response.data.error ? error.response.data.error : error.message);
  }
});

export const submitOrder = createAsyncThunk('orders/submitOrder', async (orderData, thunkAPI) => {
  try {
    const { auth } = thunkAPI.getState();
    const { data } = await axios.post('/api/orders', orderData, getAuthConfig(auth.userInfo.token));
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response && error.response.data.error ? error.response.data.error : error.message);
  }
});

export const fetchMyOrders = createAsyncThunk('orders/fetchMyOrders', async (_, thunkAPI) => {
  try {
    const { auth } = thunkAPI.getState();
    const { data } = await axios.get('/api/orders/myorders', getAuthConfig(auth.userInfo.token));
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response && error.response.data.error ? error.response.data.error : error.message);
  }
});

export const fetchOrderDetails = createAsyncThunk('orders/fetchDetails', async (id, thunkAPI) => {
  try {
    const { auth } = thunkAPI.getState();
    const { data } = await axios.get(`/api/orders/${id}`, getAuthConfig(auth.userInfo.token));
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response && error.response.data.error ? error.response.data.error : error.message);
  }
});

export const cancelOrder = createAsyncThunk('orders/cancelOrder', async (id, thunkAPI) => {
  try {
    const { auth } = thunkAPI.getState();
    const { data } = await axios.put(`/api/orders/${id}/cancel`, {}, getAuthConfig(auth.userInfo.token));
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response && error.response.data.error ? error.response.data.error : error.message);
  }
});

// Admin orders actions
export const adminFetchAllOrders = createAsyncThunk('orders/adminFetchAll', async (_, thunkAPI) => {
  try {
    const { auth } = thunkAPI.getState();
    const { data } = await axios.get('/api/admin/orders', getAuthConfig(auth.userInfo.token));
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response && error.response.data.error ? error.response.data.error : error.message);
  }
});

export const adminUpdateOrderStatus = createAsyncThunk('orders/adminUpdateStatus', async ({ id, status }, thunkAPI) => {
  try {
    const { auth } = thunkAPI.getState();
    const { data } = await axios.put(`/api/admin/orders/${id}/status`, { orderStatus: status }, getAuthConfig(auth.userInfo.token));
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response && error.response.data.error ? error.response.data.error : error.message);
  }
});

const initialState = {
  orders: [],
  orderDetails: null,
  paymentIntent: null,
  loading: false,
  error: null,
  successCheckout: false,
  adminOrders: [],
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    resetCheckoutState: (state) => {
      state.successCheckout = false;
      state.paymentIntent = null;
      state.error = null;
    },
    clearOrderDetails: (state) => {
      state.orderDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Payment Intent
      .addCase(createPaymentIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentIntent = action.payload;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Submit Order
      .addCase(submitOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.successCheckout = true;
        state.orders.unshift(action.payload);
      })
      .addCase(submitOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch User Orders
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Order Details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.orderDetails = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cancel Order
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.orders = state.orders.map((o) =>
          o._id === action.payload._id ? action.payload : o
        );
        if (state.orderDetails && state.orderDetails._id === action.payload._id) {
          state.orderDetails = action.payload;
        }
      })
      // Admin orders
      .addCase(adminFetchAllOrders.fulfilled, (state, action) => {
        state.adminOrders = action.payload;
      })
      .addCase(adminUpdateOrderStatus.fulfilled, (state, action) => {
        state.adminOrders = state.adminOrders.map((o) =>
          o._id === action.payload._id ? action.payload : o
        );
      });
  },
});

export const { resetCheckoutState, clearOrderDetails } = orderSlice.actions;
export default orderSlice.reducer;
