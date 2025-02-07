import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../services/api';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  name: string;
  price: number;
  total_price: number;
}

interface Cart {
  id: string;
  items: CartItem[];
  total_items: number;
  total_amount: number;
}

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
};

export const fetchCart = createAsyncThunk('cart/fetchCart', async (cartId: string) => {
  const response = await api.getCart(cartId);
  return response.data;
});

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ cartId, productId, quantity }: { cartId: string; productId: string; quantity: number }) => {
    const response = await api.addToCart(cartId, productId, quantity);
    return response.data;
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ cartId, itemId, quantity }: { cartId: string; itemId: string; quantity: number }) => {
    const response = await api.updateCartItem(cartId, itemId, quantity);
    return response.data;
  }
);

export const removeCartItem = createAsyncThunk(
  'cart/removeCartItem',
  async ({ cartId, itemId }: { cartId: string; itemId: string }) => {
    await api.removeCartItem(cartId, itemId);
    return itemId;
  }
);

export const checkout = createAsyncThunk(
  'cart/checkout',
  async ({ cartId, shippingAddress }: { cartId: string; shippingAddress: string }) => {
    const response = await api.checkout(cartId, shippingAddress);
    return response.data;
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.cart = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch cart';
      })
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add item to cart';
      })
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        if (state.cart) {
          state.cart = action.payload;
        }
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update cart item';
      })
      .addCase(removeCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.loading = false;
        if (state.cart) {
          state.cart.items = state.cart.items.filter(item => item.id !== action.payload);
          state.cart.total_items = state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
          state.cart.total_amount = state.cart.items.reduce((sum, item) => sum + item.total_price, 0);
        }
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to remove cart item';
      })
      .addCase(checkout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkout.fulfilled, (state) => {
        state.loading = false;
        state.cart = null; // Clear the cart after successful checkout
      })
      .addCase(checkout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to checkout';
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer; 