import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const fetchProducts = createAsyncThunk('products/fetchProducts', async (queryParams = {}, thunkAPI) => {
  try {
    const { keyword = '', category = '', brand = '', minPrice = '', maxPrice = '', ratings = '', page = 1, sortBy = '', pageSize = 8 } = queryParams;
    let url = `/api/products?keyword=${keyword}&category=${category}&brand=${brand}&minPrice=${minPrice}&maxPrice=${maxPrice}&ratings=${ratings}&page=${page}&sortBy=${sortBy}&pageSize=${pageSize}`;
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response && error.response.data.error ? error.response.data.error : error.message);
  }
});

export const fetchProductDetails = createAsyncThunk('products/fetchProductDetails', async (id, thunkAPI) => {
  try {
    const { data } = await axios.get(`/api/products/${id}`);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response && error.response.data.error ? error.response.data.error : error.message);
  }
});

export const createReview = createAsyncThunk('products/createReview', async ({ productId, review }, thunkAPI) => {
  try {
    const { auth } = thunkAPI.getState();
    const { data } = await axios.post(`/api/products/${productId}/reviews`, review, getAuthConfig(auth.userInfo.token));
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response && error.response.data.error ? error.response.data.error : error.message);
  }
});

// AI Recommendations Thunks
export const fetchSimilarProducts = createAsyncThunk('products/fetchSimilar', async (productId, thunkAPI) => {
  try {
    const { data } = await axios.get(`/api/recommendations/similar/${productId}`);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const fetchAlsoBought = createAsyncThunk('products/fetchAlsoBought', async (productId, thunkAPI) => {
  try {
    const { data } = await axios.get(`/api/recommendations/also-bought/${productId}`);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const fetchUserFeed = createAsyncThunk('products/fetchUserFeed', async (_, thunkAPI) => {
  try {
    const { auth } = thunkAPI.getState();
    const config = auth.userInfo ? getAuthConfig(auth.userInfo.token) : {};
    const { data } = await axios.get('/api/recommendations/user-feed', config);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

// Admin Thunks
export const createProduct = createAsyncThunk('products/createProduct', async (productData, thunkAPI) => {
  try {
    const { auth } = thunkAPI.getState();
    const { data } = await axios.post('/api/products', productData, getAuthConfig(auth.userInfo.token));
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response && error.response.data.error ? error.response.data.error : error.message);
  }
});

export const updateProduct = createAsyncThunk('products/updateProduct', async ({ id, productData }, thunkAPI) => {
  try {
    const { auth } = thunkAPI.getState();
    const { data } = await axios.put(`/api/products/${id}`, productData, getAuthConfig(auth.userInfo.token));
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response && error.response.data.error ? error.response.data.error : error.message);
  }
});

export const deleteProduct = createAsyncThunk('products/deleteProduct', async (id, thunkAPI) => {
  try {
    const { auth } = thunkAPI.getState();
    const { data } = await axios.delete(`/api/products/${id}`, getAuthConfig(auth.userInfo.token));
    return { id, data };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response && error.response.data.error ? error.response.data.error : error.message);
  }
});

const initialState = {
  products: [],
  productDetails: null,
  categories: [],
  brands: [],
  page: 1,
  pages: 1,
  total: 0,
  loading: false,
  error: null,
  reviewSuccess: false,
  reviewError: null,
  recommendations: {
    similar: [],
    alsoBought: [],
    userFeed: [],
    loading: false,
  },
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductDetails: (state) => {
      state.productDetails = null;
    },
    resetReviewState: (state) => {
      state.reviewSuccess = false;
      state.reviewError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
  state.loading = false;

  state.products = action.payload?.products || [];
  state.categories = action.payload?.categories || [];
  state.brands = action.payload?.brands || [];

  state.page = action.payload?.page || 1;
  state.pages = action.payload?.pages || 1;
  state.total = action.payload?.total || 0;
})
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Details
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.productDetails = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Review
      .addCase(createReview.pending, (state) => {
        state.reviewSuccess = false;
        state.reviewError = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.reviewSuccess = true;
        state.productDetails = action.payload.product;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.reviewSuccess = false;
        state.reviewError = action.payload;
      })
      // Similar Recommendations
      .addCase(fetchSimilarProducts.fulfilled, (state, action) => {
        state.recommendations.similar = action.payload;
      })
      // Also Bought Recommendations
      .addCase(fetchAlsoBought.fulfilled, (state, action) => {
        state.recommendations.alsoBought = action.payload;
      })
      // User Feed Recommendations
      .addCase(fetchUserFeed.pending, (state) => {
        state.recommendations.loading = true;
      })
      .addCase(fetchUserFeed.fulfilled, (state, action) => {
        state.recommendations.loading = false;
        state.recommendations.userFeed = action.payload;
      })
      .addCase(fetchUserFeed.rejected, (state) => {
        state.recommendations.loading = false;
      })
      // Admin deletes
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p._id !== action.payload.id);
      });
  },
});

export const { clearProductDetails, resetReviewState } = productSlice.actions;
export default productSlice.reducer;
