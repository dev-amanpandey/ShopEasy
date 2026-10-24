const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const developmentBaseUrl = import.meta.env.DEV ? 'http://localhost:5000' : ''

export const API_BASE_URL = (configuredBaseUrl || developmentBaseUrl).replace(/\/+$/, '')

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const apiRequest = async (path, options = {}) => {
  if (!API_BASE_URL) {
    throw new Error('The backend URL is not configured. Set VITE_API_BASE_URL in the frontend deployment environment and rebuild.')
  }

  const { token, headers: suppliedHeaders, body, ...requestOptions } = options
  const headers = new Headers(suppliedHeaders)
  let requestBody = body

  if (body !== undefined && body !== null && typeof body !== 'string' && !(body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
    requestBody = JSON.stringify(body)
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      headers,
      body: requestBody,
    })
  } catch {
    throw new Error('Could not connect to the ShopEasy server. Check the backend URL, connection, and allowed CORS origins.')
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('shopeasy:unauthorized'))
    }
    throw new ApiError(data?.message || `Request failed with status ${response.status}`, response.status)
  }

  return data
}
