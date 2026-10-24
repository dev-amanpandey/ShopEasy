import { useEffect, useMemo, useState } from 'react'
import { Package, UserCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { PageHeader } from '../components/DesignSystem'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const Profile = () => {
  const { user, token, updateProfile } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar: '',
  })
  const [orders, setOrders] = useState([])
  const [trackingId, setTrackingId] = useState('')
  const [trackedOrder, setTrackedOrder] = useState(null)
  const [trackingError, setTrackingError] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [isTracking, setIsTracking] = useState(false)
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!user) return
    setFormData((prev) => ({
      ...prev,
      name: user.name || '',
      email: user.email || '',
      avatar: user.avatar || '',
      password: '',
      confirmPassword: '',
    }))
  }, [user])

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return

      setIsLoadingOrders(true)
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/mine`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Could not load your orders')
        }

        setOrders(data.orders || [])
      } catch (err) {
        setOrders([])
      } finally {
        setIsLoadingOrders(false)
      }
    }

    fetchOrders()
  }, [token])

  const avatarInitial = useMemo(() => {
    if (!formData.name) return 'U'
    return formData.name.trim().charAt(0).toUpperCase()
  }, [formData.name])

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 750000) {
      setError('Profile picture must be under 750 KB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, avatar: String(reader.result || '') }))
      setError('')
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsSubmitting(true)

    try {
      await updateProfile({
        name: formData.name,
        email: formData.email,
        password: formData.password || undefined,
        avatar: formData.avatar,
      })
      setSuccess('Profile updated successfully')
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }))
    } catch (err) {
      setError(err.message || 'Could not update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTrackOrder = async (e) => {
    e.preventDefault()
    if (!trackingId.trim() || !token) {
      setTrackingError('Please enter a valid order ID or sign in.')
      return
    }

    setIsTracking(true)
    setTrackingError('')
    setTrackedOrder(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${trackingId.trim()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Order not found')
      }

      setTrackedOrder(data.order)
    } catch (err) {
      setTrackingError(err.message || 'Unable to track your order')
    } finally {
      setIsTracking(false)
    }
  }

  const statusSteps = ['Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered']

  const renderOrderDetails = (order) => {
    if (!order) return null

    const currentIndex = statusSteps.indexOf(order.status)

    return (
      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Tracking number</p>
            <p className="font-semibold text-gray-900">{order.trackingNumber}</p>
          </div>
          <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
            {order.status}
          </span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-5 mb-5">
          {statusSteps.map((step, index) => {
            const isDone = index <= currentIndex
            return (
              <div
                key={step}
                className={`rounded-lg border px-2 py-2 text-center text-xs font-medium ${
                  isDone ? 'border-primary-200 bg-primary-50 text-primary-700' : 'border-gray-200 bg-white text-gray-400'
                }`}
              >
                {step}
              </div>
            )
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Items</h4>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={`${order._id}-${item.id}`} className="flex items-center gap-3 rounded-lg bg-white p-2 border border-gray-200">
                  <img src={item.image} alt={item.name} className="h-12 w-12 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">${(Number(item.price) * Number(item.quantity)).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Shipping & payment</h4>
            <div className="rounded-lg bg-white border border-gray-200 p-3 text-sm text-gray-700 space-y-2">
              <p>
                {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
              </p>
              <p>{order.shippingAddress?.address}</p>
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
              </p>
              <p>{order.shippingAddress?.email}</p>
              <p>Payment: {order.paymentMethod || 'Card'}</p>
              <p className="font-semibold text-gray-900">Total: ${Number(order.total).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
    <PageHeader title="User Dashboard" />
    <div className="max-w-7xl mx-auto px-4 py-10 dashboard-page">

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <section className="xl:col-span-2 bg-white rounded-2xl shadow-md p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <UserCircle className="h-6 w-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="flex flex-col items-center">
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt="Profile"
                    className="h-28 w-28 rounded-full object-cover border-4 border-primary-100"
                  />
                ) : (
                  <div className="h-28 w-28 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-3xl font-bold">
                    {avatarInitial}
                  </div>
                )}

                <label className="mt-4 text-sm font-medium text-primary-700 hover:text-primary-800 cursor-pointer">
                  Update picture
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="md:col-span-2">
              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
              )}
              {success && (
                <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">{success}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      minLength={6}
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      minLength={6}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary px-6 py-2.5 disabled:opacity-70"
                >
                  {isSubmitting ? 'Saving changes...' : 'Save Profile'}
                </button>
              </form>
            </div>
          </div>
        </section>

        <aside className="bg-white rounded-2xl shadow-md p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Package className="h-6 w-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
          </div>

          {isLoadingOrders ? (
            <div className="text-sm text-gray-500">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="rounded-lg bg-gray-50 border border-dashed border-gray-200 p-4 text-sm text-gray-600">
              No orders yet.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const isSelected = selectedOrderId === order._id

                return (
                  <div key={order._id} className="border border-gray-200 rounded-xl p-4">
                    <button
                      type="button"
                      onClick={() => setSelectedOrderId(isSelected ? null : order._id)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <p className="font-semibold text-gray-900">#{order.trackingNumber || order._id.slice(-6)}</p>
                        <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()} · ${Number(order.total).toFixed(2)}
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                      </p>
                    </button>

                    {isSelected && renderOrderDetails(order)}
                  </div>
                )
              })}
            </div>
          )}
        </aside>
      </div>
    </div>
    </>
  )
}

export default Profile
