import { Link } from 'react-router-dom'
import { Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { PageHeader, QuantityStepper } from '../components/DesignSystem'
import { formatINR } from '../utils/currency'

const Cart = () => {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="cart-empty max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
          <Link
            to="/products"
            className="btn-primary text-lg px-8 py-3 inline-flex items-center"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
    <PageHeader title="Shopping Cart" description={`${items.length} items in your cart`} />
    <div className="cart-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="cart-layout">
        {/* Cart Items */}
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.id} className="cart-item bg-white rounded-lg shadow-md p-6">
              <div className="cart-item-content">
                <div className="flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                </div>
                
                <div className="cart-item-details flex-1 space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-gray-600 text-sm">{item.category}</p>
                  <p className="text-xl font-bold text-primary-600">{formatINR(item.price)}</p>
                </div>

                <div className="cart-item-controls">
                  {/* Quantity Controls */}
                  <QuantityStepper value={item.quantity} min={0} onChange={(quantity) => updateQuantity(item.id, quantity)} />

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-lg font-semibold">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Clear Cart Button */}
          <div className="text-center">
            <button
              onClick={clearCart}
              className="text-red-500 hover:text-red-700 font-medium"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="cart-summary">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span className="font-medium">{formatINR(getTotalPrice())}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {getTotalPrice() >= 4000 ? 'Free' : formatINR(499)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">{formatINR(getTotalPrice() * 0.18)}</span>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatINR(getTotalPrice() + (getTotalPrice() >= 4000 ? 0 : 499) + (getTotalPrice() * 0.18))}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Link
                to="/checkout"
                className="w-full btn-primary text-center block py-3"
              >
                Proceed to Checkout
              </Link>
              <Link
                to="/products"
                className="w-full btn-secondary text-center block py-3"
              >
                Continue Shopping
              </Link>
            </div>

            {/* Security Badges */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>SSL Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default Cart
