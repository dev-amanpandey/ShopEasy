import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import { apiRequest } from '../services/api'

const WishlistContext = createContext(null)

const readLocalWishlist = (storageKey) => {
  if (!storageKey || typeof window === 'undefined') return []
  try {
    const savedIds = JSON.parse(window.localStorage.getItem(storageKey) || '[]')
    return Array.isArray(savedIds) ? [...new Set(savedIds.map(String))] : []
  } catch {
    return []
  }
}

const writeLocalWishlist = (storageKey, productIds) => {
  if (!storageKey || typeof window === 'undefined') throw new Error('Could not save your wishlist on this device.')
  window.localStorage.setItem(storageKey, JSON.stringify(productIds))
}

export const WishlistProvider = ({ children }) => {
  const { token, user } = useAuth()
  const [productIds, setProductIds] = useState([])
  const [isLoading, setIsLoading] = useState(Boolean(token))
  const [error, setError] = useState('')
  const [isLocalOnly, setIsLocalOnly] = useState(false)
  const [notice, setNotice] = useState('')
  const requestVersion = useRef(0)
  const userKey = user?.id || user?._id || user?.email || (token ? 'signed-in-user' : '')
  const storageKey = userKey ? `shopeasy:wishlist:${encodeURIComponent(String(userKey))}` : ''

  const loadWishlist = useCallback(async () => {
    const version = ++requestVersion.current
    if (!token) {
      setProductIds([])
      setError('')
      setNotice('')
      setIsLocalOnly(false)
      setIsLoading(false)
      return
    }

    setProductIds([])
    setError('')
    setNotice('')
    setIsLocalOnly(false)
    setIsLoading(true)
    try {
      const data = await apiRequest('/api/auth/wishlist', { token })
      if (version !== requestVersion.current) return

      const serverIds = (data.wishlistProductIds || []).map(String)
      const localIds = readLocalWishlist(storageKey)
      const mergedIds = [...new Set([...serverIds, ...localIds])]
      if (mergedIds.length !== serverIds.length) {
        try {
          const saved = await apiRequest('/api/auth/wishlist', {
            method: 'PUT',
            token,
            body: { productIds: mergedIds },
          })
          if (version !== requestVersion.current) return
          setProductIds((saved.wishlistProductIds || []).map(String))
          window.localStorage.removeItem(storageKey)
        } catch (saveError) {
          if (version !== requestVersion.current) return
          if (saveError.status !== 404) throw saveError
          writeLocalWishlist(storageKey, mergedIds)
          setProductIds(mergedIds)
          setIsLocalOnly(true)
          setNotice('Wishlist is saved on this device because the ShopEasy server does not support wishlist sync yet.')
        }
      } else {
        setProductIds(serverIds)
      }
    } catch (requestError) {
      if (version === requestVersion.current && requestError.status === 404) {
        setProductIds(readLocalWishlist(storageKey))
        setIsLocalOnly(true)
        setNotice('Wishlist is saved on this device because the ShopEasy server does not support wishlist sync yet.')
      } else if (version === requestVersion.current) {
        setError(requestError.message || 'Could not load your wishlist')
      }
    } finally {
      if (version === requestVersion.current) setIsLoading(false)
    }
  }, [storageKey, token])

  useEffect(() => { loadWishlist() }, [loadWishlist])

  const saveProductIds = useCallback(async (nextIds) => {
    if (!token) throw new Error('Sign in to save wishlist items.')
    if (isLoading) throw new Error('Your wishlist is still loading. Please try again shortly.')
    if (error) throw new Error('Could not load your saved wishlist. Reload it before making changes.')
    const version = ++requestVersion.current
    setError('')
    if (isLocalOnly) {
      writeLocalWishlist(storageKey, nextIds)
      setProductIds(nextIds)
      return nextIds
    }
    try {
      const data = await apiRequest('/api/auth/wishlist', {
        method: 'PUT',
        token,
        body: { productIds: nextIds },
      })
      const savedIds = (data.wishlistProductIds || []).map(String)
      if (version === requestVersion.current) setProductIds(savedIds)
      return savedIds
    } catch (requestError) {
      if (requestError.status === 404) {
        writeLocalWishlist(storageKey, nextIds)
        if (version === requestVersion.current) {
          setProductIds(nextIds)
          setIsLocalOnly(true)
          setNotice('Wishlist is saved on this device because the ShopEasy server does not support wishlist sync yet.')
        }
        return nextIds
      }
      if (version === requestVersion.current) setError(requestError.message || 'Could not save your wishlist')
      throw requestError
    }
  }, [error, isLoading, isLocalOnly, storageKey, token])

  const toggleProduct = useCallback(async (productId) => {
    const id = String(productId)
    const nextIds = productIds.includes(id)
      ? productIds.filter((savedId) => savedId !== id)
      : [...productIds, id]
    return saveProductIds(nextIds)
  }, [productIds, saveProductIds])

  const removeProduct = useCallback(async (productId) => {
    const id = String(productId)
    return saveProductIds(productIds.filter((savedId) => savedId !== id))
  }, [productIds, saveProductIds])

  return (
    <WishlistContext.Provider value={{ productIds, isLoading, error, isLocalOnly, notice, toggleProduct, removeProduct, reload: loadWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider')
  return context
}
