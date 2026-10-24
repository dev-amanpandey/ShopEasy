import { createContext, useContext, useState, useEffect } from 'react'
import { apiRequest } from '../services/api'

const AuthContext = createContext(null)

const readStoredUser = () => {
  if (typeof window === 'undefined') return null
  try {
    return JSON.parse(window.localStorage.getItem('auth_user') || 'null')
  } catch {
    return null
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    return readStoredUser()
  })
  const [token, setToken] = useState(() => {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem('auth_token')
  })
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (user) {
      window.localStorage.setItem('auth_user', JSON.stringify(user))
    } else {
      window.localStorage.removeItem('auth_user')
    }
  }, [user])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (token) {
      window.localStorage.setItem('auth_token', token)
    } else {
      window.localStorage.removeItem('auth_token')
    }
  }, [token])

  useEffect(() => {
    const clearExpiredSession = () => {
      setUser(null)
      setToken(null)
    }

    window.addEventListener('shopeasy:unauthorized', clearExpiredSession)
    return () => window.removeEventListener('shopeasy:unauthorized', clearExpiredSession)
  }, [])

  useEffect(() => {
    const initializeAuth = async () => {
      if (!token) {
        setIsAuthLoading(false)
        return
      }

      try {
        const data = await apiRequest('/api/auth/me', { token })

        if (!data?.user) throw new Error('Could not restore your session')

        setUser(data.user)
      } catch (error) {
        if (error.status === 401) {
          setUser(null)
          setToken(null)
        }
      } finally {
        setIsAuthLoading(false)
      }
    }

    initializeAuth()
  }, [token])

  const signup = async ({ name, email, password }) => {
    const data = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: { name, email, password },
    })

    setUser(data.user)
    setToken(data.token)
    return data.user
  }

  const login = async ({ email, password }) => {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })

    setUser(data.user)
    setToken(data.token)
    return data.user
  }

  const updateProfile = async ({ name, email, password, avatar }) => {
    if (!token) {
      throw new Error('Not authorized')
    }

    const payload = { name, email, avatar }

    if (password) {
      payload.password = password
    }

    const data = await apiRequest('/api/auth/profile', {
      method: 'PUT',
      token,
      body: payload,
    })

    setUser(data.user)
    return data.user
  }

  const logout = () => {
    setUser(null)
    setToken(null)
  }

  const value = {
    user,
    token,
    isAuthLoading,
    isAuthenticated: !!user,
    signup,
    login,
    updateProfile,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)


