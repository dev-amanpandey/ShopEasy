import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PackageCheck, Truck, MapPin, Search } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../services/api'

const statusSteps = ['Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered']

const OrderTracking = () => {
  const { token } = useAuth()
  const location = useLocation()
  const [trackingId, setTrackingId] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const queryOrderId = params.get('id')

    if (queryOrderId) {
      setTrackingId(queryOrderId)
      fetchOrder(queryOrderId)
    }
  }, [location.search])

  const fetchOrder = async (id) => {
    if (!id || !token) {
      setError('Please sign in to track your order.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const data = await apiRequest(`/api/orders/${encodeURIComponent(id)}`, { token })

      setOrder(data.order)
    } catch (err) {
      setError(err.message || 'Unable to find order')
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  const currentStatusIndex = useMemo(() => {
    if (!order) return -1
    return statusSteps.indexOf(order.status)
  }, [order])

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchOrder(trackingId)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-primary-600">Order tracking</p>
            <h1 className="text-3xl font-bold text-gray-900">Track your shipment</h1>
          </div>
          <Link to="/products" className="btn-secondary inline-flex items-center">
            Continue Shopping
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="Enter order ID"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary px-6 py-3 disabled:opacity-70">
            {loading ? 'Tracking...' : 'Track Order'}
          </button>
        </form>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {order && (
          <div className="space-y-8">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-500">Tracking number</p>
                  <h2 className="text-xl font-bold text-gray-900">{order.trackingNumber}</h2>
                </div>
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                  {order.status}
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-5">
              {statusSteps.map((status, index) => {
                const isDone = index <= currentStatusIndex
                return (
                  <div
                    key={status}
                    className={`rounded-xl border p-4 ${isDone ? 'border-primary-200 bg-primary-50 text-primary-700' : 'border-gray-200 bg-white text-gray-400'}`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      {index === 0 && <PackageCheck className="h-5 w-5" />}
                      {index === 1 && <PackageCheck className="h-5 w-5" />}
                      {index === 2 && <Truck className="h-5 w-5" />}
                      {index === 3 && <Truck className="h-5 w-5" />}
                      {index === 4 && <MapPin className="h-5 w-5" />}
                    </div>
                    <p className="text-sm font-semibold">{status}</p>
                  </div>
                )
              })}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-gray-200 p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Order details</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between"><dt className="text-gray-500">Order ID</dt><dd className="font-medium text-gray-900">{order._id}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-500">Placed</dt><dd className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleString()}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-500">Total</dt><dd className="font-medium text-gray-900">${Number(order.total).toFixed(2)}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-500">Payment</dt><dd className="font-medium text-gray-900">{order.paymentMethod}</dd></div>
                </dl>
              </div>

              <div className="rounded-xl border border-gray-200 p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Shipping address</h3>
                <p className="text-sm text-gray-700">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  <br />
                  {order.shippingAddress.address}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  <br />
                  {order.shippingAddress.email}
                  {order.shippingAddress.phone ? ` | ${order.shippingAddress.phone}` : ''}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Items</h3>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={`${order._id}-${item.id}`} className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderTracking
