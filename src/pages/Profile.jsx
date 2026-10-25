import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useRef } from 'react'
import { Heart, Package, UserCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { PageHeader } from '../components/DesignSystem'
import { apiRequest } from '../services/api'
import { formatINR } from '../utils/currency'
import { useWishlist } from '../context/WishlistContext'
import { products } from '../data/products'

const Profile = () => {
  const { user, hasSession, updateProfile } = useAuth()
  const { productIds, isLoading: isLoadingWishlist, error: wishlistError, notice: wishlistNotice, removeProduct, reload: reloadWishlist } = useWishlist()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar: '',
  })
  const [orders, setOrders] = useState([])
  const [activeSection, setActiveSection] = useState('profile')
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)
  const [orderError, setOrderError] = useState('')
  const [orderActionMessage, setOrderActionMessage] = useState('')
  const [orderActionError, setOrderActionError] = useState('')
  const [actingOrderId, setActingOrderId] = useState('')
  const [isUpdatingWishlist, setIsUpdatingWishlist] = useState(false)
  const [wishlistActionError, setWishlistActionError] = useState('')
  const ordersRequestVersion = useRef(0)
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

  const loadOrders = useCallback(async () => {
    const version = ++ordersRequestVersion.current
    if (!hasSession) {
      setOrders([])
      setOrderError('Please sign in to view your orders.')
      setIsLoadingOrders(false)
      return
    }

    setIsLoadingOrders(true)
    setOrderError('')
    try {
      const data = await apiRequest('/api/orders/mine')
      if (version === ordersRequestVersion.current) setOrders(data.orders || [])
    } catch (err) {
      if (version === ordersRequestVersion.current) {
        setOrders([])
        setOrderError(err.message || 'Could not load your orders')
      }
    } finally {
      if (version === ordersRequestVersion.current) setIsLoadingOrders(false)
    }
  }, [hasSession])

  useEffect(() => { loadOrders() }, [loadOrders])

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

  const handleOrderAction = async (order, action) => {
    setActingOrderId(order._id)
    setOrderActionError('')
    setOrderActionMessage('')
    try {
      const actionData = await apiRequest(`/api/orders/${encodeURIComponent(order._id)}/${action}`, { method: 'POST' })
      if (actionData.order) setOrders((current) => current.map((savedOrder) => savedOrder._id === order._id ? actionData.order : savedOrder))
      try {
        const detailData = await apiRequest(`/api/orders/${encodeURIComponent(order._id)}`)
        setOrders((current) => current.map((savedOrder) => savedOrder._id === order._id ? detailData.order : savedOrder))
      } catch {
        const savedStatus = actionData.order?.status || 'updated'
        setOrderActionMessage(`The action was saved. The order's saved status is ${savedStatus}, but a fresh detail could not be loaded.`)
        return
      }
      setOrderActionMessage(action === 'cancel'
        ? `Order ${order._id} was cancelled.`
        : `Return request for order ${order._id} was saved. No refund has been processed.`)
    } catch (err) {
      setOrderActionError(err.message || 'Could not update this order')
    } finally {
      setActingOrderId('')
    }
  }

  const handleWishlistRemove = async (productId) => {
    setWishlistActionError('')
    setIsUpdatingWishlist(true)
    try {
      await removeProduct(productId)
    } catch (err) {
      setWishlistActionError(err.message || 'Could not remove this item')
    } finally {
      setIsUpdatingWishlist(false)
    }
  }

  const wishlistProducts = products.filter((product) => productIds.includes(String(product.id)))
  const orderAddress = (address = {}) => [
    `${address.firstName || ''} ${address.lastName || ''}`.trim(),
    address.address,
    [address.city, address.state, address.zipCode].filter(Boolean).join(', '),
  ].filter(Boolean).join(', ')
  const canCancelOrder = (order) => ['Processing', 'Packed'].includes(order.status)
  const canRequestReturn = (order) => {
    if (order.status !== 'Delivered' || !order.deliveredAt || order.returnRequest) return false
    return Date.now() <= new Date(order.deliveredAt).getTime() + 7 * 24 * 60 * 60 * 1000
  }

  return (
    <>
    <PageHeader title="User Dashboard" />
    <div className="max-w-7xl mx-auto px-4 py-10 dashboard-page">

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <section className="xl:col-span-2 bg-white rounded-2xl shadow-md p-6 md:p-8">
          {activeSection === 'profile' && <>
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
          </>}
          {activeSection === 'orders' && <>
            <div className="mb-6 flex items-center gap-3"><Package className="h-6 w-6 text-primary-600" /><h2 className="text-2xl font-bold text-gray-900">My Orders</h2></div>
            {orderActionError && <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">{orderActionError}</p>}
            {orderActionMessage && <p className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700" role="status">{orderActionMessage}</p>}
            {isLoadingOrders ? <p className="text-sm text-gray-500" role="status">Loading your ordersâ€¦</p> : orderError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert"><p>{orderError}</p><button type="button" onClick={loadOrders} className="mt-3 underline">Try again</button></div>
            ) : orders.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-5 text-sm text-gray-600"><p>You havenâ€™t placed any orders yet.</p><Link to="/products" className="mt-3 inline-block text-primary-600 underline">Browse products</Link></div>
            ) : (
              <div className="space-y-5">{orders.map((order) => (
                <article key={order._id} className="rounded-xl border border-gray-200 p-4 md:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 pb-4">
                    <div className="min-w-0"><p className="text-xs uppercase tracking-wide text-gray-500">Order number</p><p className="break-all font-semibold text-gray-900">{order._id}</p><p className="mt-1 text-sm text-gray-600">Placed {new Date(order.createdAt).toLocaleDateString()}</p>{order.deliveredAt && <p className="text-sm text-gray-600">Delivered {new Date(order.deliveredAt).toLocaleDateString()}</p>}</div>
                    <span className="inline-flex rounded-full border border-gray-200 px-3 py-1 text-sm font-medium text-gray-900">{order.status}</span>
                  </div>
                  <div className="grid gap-5 py-4 md:grid-cols-2">
                    <div><h3 className="mb-3 font-semibold text-gray-900">Items</h3><ul className="space-y-3">{order.items?.map((item) => (
                      <li key={`${order._id}-${item.id}`} className="flex min-w-0 items-center gap-3"><img src={item.image} alt="" className="h-14 w-14 flex-none object-cover" /><div className="min-w-0 flex-1"><p className="break-words font-medium text-gray-900">{item.name}</p><p className="text-sm text-gray-500">Qty: {item.quantity} Â· {formatINR(item.price)} each</p></div><p className="text-right text-sm font-semibold text-gray-900">{formatINR(Number(item.price) * Number(item.quantity))}</p></li>
                    ))}</ul></div>
                    <div><h3 className="mb-3 font-semibold text-gray-900">Shipping address</h3><p className="text-sm leading-6 text-gray-600">{orderAddress(order.shippingAddress)}</p>{order.shippingAddress?.phone && <p className="text-sm text-gray-600">{order.shippingAddress.phone}</p>}<p className="mt-3 font-semibold text-gray-900">Order total: {formatINR(order.total)}</p></div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4 text-sm"><div><p className="font-medium text-gray-900">Tracking: {order.trackingNumber || 'Not available'}</p>{order.status !== 'Cancelled' && <Link to={`/track-order?id=${encodeURIComponent(order._id)}`} className="mt-1 inline-block text-primary-600 underline">View tracking details</Link>}</div><div className="flex flex-wrap gap-2">
                    {canCancelOrder(order) && <button type="button" onClick={() => handleOrderAction(order, 'cancel')} disabled={actingOrderId === order._id} className="rounded border border-gray-300 px-3 py-2 text-gray-900 disabled:opacity-60">{actingOrderId === order._id ? 'Please waitâ€¦' : 'Cancel order'}</button>}
                    {order.status === 'Delivered' && !order.returnRequest && canRequestReturn(order) && <button type="button" onClick={() => handleOrderAction(order, 'return')} disabled={actingOrderId === order._id} className="rounded border border-primary-600 px-3 py-2 text-primary-700 disabled:opacity-60">{actingOrderId === order._id ? 'Please waitâ€¦' : 'Request return'}</button>}
                  </div></div>
                  {order.status === 'Delivered' && !order.deliveredAt && <p className="mt-3 text-sm text-gray-500">Delivery date is unavailable, so return eligibility cannot be confirmed. Please contact support.</p>}
                  {order.status === 'Delivered' && order.deliveredAt && !order.returnRequest && !canRequestReturn(order) && <p className="mt-3 text-sm text-gray-500">The 7-day return window has closed.</p>}
                  {order.returnRequest && <p className="mt-3 rounded bg-gray-50 p-3 text-sm text-gray-700">Return request {order.returnRequest.status?.toLowerCase()} on {new Date(order.returnRequest.requestedAt).toLocaleDateString()}. This is a request only; no refund has been processed.</p>}
                  {order.cancelledAt && <p className="mt-3 text-sm text-gray-500">Cancelled on {new Date(order.cancelledAt).toLocaleDateString()}.</p>}
                </article>
              ))}</div>
            )}
          </>}
          {activeSection === 'wishlist' && <>
            <div className="mb-6 flex items-center gap-3"><Heart className="h-6 w-6 text-primary-600" /><h2 className="text-2xl font-bold text-gray-900">Wishlist</h2></div>
            {wishlistNotice && <p className="mb-4 border border-primary-600/30 bg-primary-100/10 p-3 text-sm text-gray-700" role="status">{wishlistNotice}</p>}
            {(wishlistError || wishlistActionError) && <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">{wishlistActionError || wishlistError}</p>}
            {isLoadingWishlist ? <p className="text-sm text-gray-500" role="status">Loading your wishlistâ€¦</p> : wishlistError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert"><p>{wishlistError}</p><button type="button" onClick={reloadWishlist} className="mt-3 underline">Try again</button></div>
            ) : wishlistProducts.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-5 text-sm text-gray-600"><p>Your wishlist is empty. Save products youâ€™d like to revisit.</p><Link to="/products" className="mt-3 inline-block text-primary-600 underline">Browse products</Link></div>
            ) : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{wishlistProducts.map((product) => (
              <article key={product.id} className="flex min-w-0 items-center gap-4 border border-gray-200 p-4"><Link to={`/products/${product.id}`} className="h-20 w-20 flex-none overflow-hidden"><img src={product.image} alt={product.name} className="h-full w-full object-cover" /></Link><div className="min-w-0 flex-1"><Link to={`/products/${product.id}`} className="break-words font-semibold text-gray-900 hover:text-primary-600">{product.name}</Link><p className="mt-1 text-primary-600">{formatINR(product.price)}</p><button type="button" onClick={() => handleWishlistRemove(product.id)} disabled={isUpdatingWishlist} className="mt-2 text-sm text-gray-600 underline disabled:opacity-60">Remove</button></div></article>
            ))}</div>}
          </>}
        </section>

        <aside className="bg-white rounded-2xl shadow-md p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <UserCircle className="h-6 w-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          </div>
          <nav className="flex flex-col gap-2" aria-label="Dashboard sections">
            {[
              ['profile', 'Profile', UserCircle],
              ['orders', 'My Orders', Package],
              ['wishlist', 'Wishlist', Heart],
            ].map(([section, label, Icon]) => (
              <button key={section} type="button" onClick={() => setActiveSection(section)} aria-current={activeSection === section ? 'page' : undefined}
                className={`flex items-center gap-3 border px-4 py-3 text-left transition-colors ${activeSection === section ? 'border-primary-600 bg-primary-100 text-primary-700' : 'border-gray-200 text-gray-700 hover:border-primary-600'}`}>
                <Icon className="h-5 w-5 flex-none" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </aside>
      </div>
    </div>
    </>
  )
}

export default Profile
