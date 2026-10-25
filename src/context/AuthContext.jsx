import { createContext, useContext, useEffect, useState } from 'react'
import { apiRequest } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const isAuthenticated = !!user

  useEffect(() => {
    // Remove credentials left by the previous browser-storage auth implementation.
    try {
      window.localStorage.removeItem('auth_token')
      window.localStorage.removeItem('auth_user')
    } catch {
      // The cookie session remains available when browser storage is disabled.
    }

    const clearSession = () => setUser(null)
    window.addEventListener('shopeasy:unauthorized', clearSession)
    apiRequest('/api/auth/me')
      .then((data) => setUser(data?.user || null))
      .catch(() => setUser(null))
      .finally(() => setIsAuthLoading(false))

    return () => window.removeEventListener('shopeasy:unauthorized', clearSession)
  }, [])

  const signup = async ({ name, email, password }) => {
    const data = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: { name, email, password },
    })
    setUser(data.user)
    return data.user
  }

  const login = async ({ email, password }) => {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    setUser(data.user)
    return data.user
  }

  const updateProfile = async ({ name, email, password, avatar }) => {
    if (!isAuthenticated) throw new Error('Not authorized')
    const payload = { name, email, avatar }
    if (password) payload.password = password
    const data = await apiRequest('/api/auth/profile', {
      method: 'PUT',
      body: payload,
    })
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    setUser(null)
    apiRequest('/api/auth/logout', { method: 'POST' }).catch(() => {})
  }

  const value = {
    user,
    hasSession: isAuthenticated,
    isAuthLoading,
    isAuthenticated,
    signup,
    login,
    updateProfile,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
