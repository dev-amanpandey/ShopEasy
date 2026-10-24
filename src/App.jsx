import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import OrderTracking from './pages/OrderTracking'
import AdminDashboard from './pages/AdminDashboard'
import { AboutPage, CategoriesPage, ContactPage, FAQPage, OrderConfirmationPage, PolicyPage } from './pages/DesignPages'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/shipping" element={<PolicyPage type="Shipping" />} />
              <Route path="/returns" element={<PolicyPage type="Returns" />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route
                path="/order-confirmation"
                element={
                  <ProtectedRoute>
                    <OrderConfirmationPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/cart" element={<Cart />} />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/track-order"
                element={
                  <ProtectedRoute>
                    <OrderTracking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
            </Routes>
          </Layout>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
