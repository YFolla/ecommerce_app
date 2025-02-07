import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppDispatch, RootState } from './store';
import { getCurrentUser } from './store/slices/authSlice';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, initialized } = useSelector((state: RootState) => state.auth);

  if (loading || !initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { initialized } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Only check current user once when the app first loads
    if (!initialized) {
      dispatch(getCurrentUser()).catch(() => {
        // Silently handle rejection - the slice will handle the error state
      });
    }
  }, [dispatch, initialized]);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/cart"
              element={
                <PrivateRoute>
                  <CartPage />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App; 