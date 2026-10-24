import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../services/api'

const AdminDashboard = () => {
  const { user, token } = useAuth()
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true
    apiRequest('/api/orders/admin/all', { token })
      .then((data) => {
        if (isActive) setOrders(data.orders || [])
      })
      .catch((requestError) => {
        if (isActive) setError(requestError.message || 'Could not load orders')
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => { isActive = false }
  }, [token])

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0)

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
      <p className="text-gray-700 mb-8">
        Welcome, <span className="font-semibold">{user?.name}</span>. This is a protected admin-only area.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-2">Orders Overview</h2>
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          {isLoading ? <p className="text-gray-600 text-sm" role="status">Loading orders…</p> : (
            <>
              <p className="text-gray-600 text-sm">{orders.length} orders · ${totalRevenue.toFixed(2)} total order value</p>
              {orders.slice(0, 5).map((order) => (
                <p key={order._id} className="mt-2 text-sm text-gray-600">
                  {order._id} · {order.status} · ${Number(order.total).toFixed(2)}
                </p>
              ))}
              {!orders.length && !error && <p className="mt-2 text-sm text-gray-600">No orders yet.</p>}
            </>
          )}
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-2">Products</h2>
          <p className="text-gray-600 text-sm">Product management is unavailable because this backend has no product API.</p>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-2">Users</h2>
          <p className="text-gray-600 text-sm">User management is unavailable because this backend has no user administration API.</p>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard


