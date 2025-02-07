import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Auth API
export const register = async (email: string, password: string, firstName: string, lastName: string) => {
  const response = await api.post('/auth/register', { email, password, firstName, lastName });
  return response.data;
};

export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Products API
export const getProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

export const searchProducts = async (query: string) => {
  const response = await api.get(`/products?search=${query}`);
  return response.data;
};

// Cart API
export const createCart = async () => {
  const response = await api.post('/cart');
  return response.data;
};

export const getCart = async (cartId: string) => {
  const response = await api.get(`/cart/${cartId}`);
  return response.data;
};

export const addToCart = async (cartId: string, productId: string, quantity: number) => {
  const response = await api.post(`/cart/${cartId}/items`, { productId, quantity });
  return response.data;
};

export const updateCartItem = async (cartId: string, itemId: string, quantity: number) => {
  const response = await api.put(`/cart/${cartId}/items/${itemId}`, { quantity });
  return response.data;
};

export const removeCartItem = async (cartId: string, itemId: string) => {
  const response = await api.delete(`/cart/${cartId}/items/${itemId}`);
  return response.data;
};

// Orders API
export const checkout = async (cartId: string, shippingAddress: string) => {
  const response = await api.post(`/cart/${cartId}/checkout`, { shippingAddress });
  return response.data;
};

export const getOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

export const getOrder = async (orderId: string) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

// Error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect on /auth/me endpoint failures
    if (error.response?.status === 401 && !error.config.url.includes('/auth/me')) {
      // Dispatch logout action to clear auth state
      store.dispatch(logout());
      
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api; 