import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { ShoppingCart, User } from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { cart } = useSelector((state: RootState) => state.cart);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-800">E-Shop</span>
            </Link>
          </div>

          <div className="flex items-center">
            <Link to="/cart" className="p-2 text-gray-400 hover:text-gray-500 relative">
              <ShoppingCart className="h-6 w-6" />
              {cart && cart.total_items > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-primary rounded-full">
                  {cart.total_items}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="ml-4 flex items-center">
                <Link to="/profile" className="p-2 text-gray-400 hover:text-gray-500">
                  <User className="h-6 w-6" />
                </Link>
                <Link
                  to="/logout"
                  className="ml-4 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
                >
                  Logout
                </Link>
              </div>
            ) : (
              <div className="ml-4 flex items-center">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-primary hover:text-primary/90"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="ml-4 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 