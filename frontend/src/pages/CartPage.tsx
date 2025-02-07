import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import { AppDispatch, RootState } from '../store';
import { updateCartItem, removeCartItem, checkout } from '../store/slices/cartSlice';

export default function CartPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { cart, loading, error } = useSelector((state: RootState) => state.cart);
  const [shippingAddress, setShippingAddress] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  if (!cart) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Your Cart</h1>
        <div className="text-center text-gray-500">Your cart is empty</div>
      </div>
    );
  }

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    try {
      await dispatch(
        updateCartItem({
          cartId: cart.id,
          itemId,
          quantity,
        })
      ).unwrap();
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await dispatch(
        removeCartItem({
          cartId: cart.id,
          itemId,
        })
      ).unwrap();
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleCheckout = async () => {
    if (!shippingAddress) {
      alert('Please enter a shipping address');
      return;
    }

    try {
      setCheckoutLoading(true);
      await dispatch(
        checkout({
          cartId: cart.id,
          shippingAddress,
        })
      ).unwrap();
      navigate('/orders');
    } catch (error) {
      console.error('Failed to checkout:', error);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Your Cart</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center space-x-4 border-b border-gray-200 py-4"
            >
              <img
                src={item.image_url}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-md"
              />
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                <p className="text-gray-500">${item.price}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1 || loading}
                    className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-gray-900 font-medium">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    disabled={loading}
                    className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-medium text-gray-900">${item.total_price}</p>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={loading}
                  className="text-red-500 hover:text-red-600 mt-2"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Items ({cart.total_items})</span>
                <span>${cart.total_amount}</span>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <label htmlFor="shipping-address" className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Address
                </label>
                <textarea
                  id="shipping-address"
                  rows={3}
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Enter your shipping address"
                />
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-lg font-medium">
                  <span>Total</span>
                  <span>${cart.total_amount}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading || loading || cart.items.length === 0}
                className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 