/**
 * CSRF Token Utilities for Client-Side
 * Provides helpers for fetching and including CSRF tokens in requests
 */

let cachedToken: string | null = null

/**
 * Fetch CSRF token from the server
 */
export async function fetchCSRFToken(): Promise<string> {
  try {
    const response = await fetch('/api/csrf', {
      method: 'GET',
      credentials: 'include',
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch CSRF token')
    }
    
    const data = await response.json()
    
    if (data.success && data.data?.csrfToken) {
      cachedToken = data.data.csrfToken
      return cachedToken as string
    }
    
    throw new Error('Invalid CSRF token response')
  } catch (error) {
    console.error('[CSRF] Error fetching token:', error)
    throw error
  }
}

/**
 * Get CSRF token (from cache or fetch new one)
 */
export async function getCSRFToken(): Promise<string> {
  if (cachedToken) {
    return cachedToken
  }
  
  return fetchCSRFToken()
}

/**
 * Clear cached CSRF token (useful after logout or token expiry)
 */
export function clearCSRFToken(): void {
  cachedToken = null
}

/**
 * Create fetch options with CSRF token
 */
export async function withCSRFToken(
  options: RequestInit = {}
): Promise<RequestInit> {
  const token = await getCSRFToken()
  
  return {
    ...options,
    headers: {
      ...options.headers,
      'x-csrf-token': token,
    },
    credentials: 'include',
  }
}

/**
 * Fetch wrapper that automatically includes CSRF token for state-changing requests
 */
export async function secureFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = options.method?.toUpperCase() || 'GET'
  
  // Add CSRF token for state-changing requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const secureOptions = await withCSRFToken(options)
    return fetch(url, secureOptions)
  }
  
  // For GET requests, just use regular fetch
  return fetch(url, options)
}
