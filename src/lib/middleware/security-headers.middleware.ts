/**
 * Security Headers Middleware
 * Adds security headers to all responses to protect against common web vulnerabilities
 */

import { NextResponse } from 'next/server'

/**
 * Security headers configuration
 */
export const securityHeaders = {
  // Content Security Policy - Prevents XSS attacks
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.cloudinary.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
  
  // Strict Transport Security - Forces HTTPS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // X-Frame-Options - Prevents clickjacking
  'X-Frame-Options': 'DENY',
  
  // X-Content-Type-Options - Prevents MIME sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Referrer Policy - Controls referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions Policy - Controls browser features
  'Permissions-Policy': [
    'geolocation=()',
    'microphone=()',
    'camera=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
  ].join(', '),
  
  // X-XSS-Protection - Legacy XSS protection (for older browsers)
  'X-XSS-Protection': '1; mode=block',
  
  // X-DNS-Prefetch-Control - Controls DNS prefetching
  'X-DNS-Prefetch-Control': 'on',
  
  // Cross-Origin-Embedder-Policy - Prevents loading cross-origin resources
  'Cross-Origin-Embedder-Policy': 'credentialless',
  
  // Cross-Origin-Opener-Policy - Isolates browsing context
  'Cross-Origin-Opener-Policy': 'same-origin',
  
  // Cross-Origin-Resource-Policy - Protects resources from cross-origin access
  'Cross-Origin-Resource-Policy': 'same-origin',
}

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Add all security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}

/**
 * Get security headers for Next.js config
 * This can be used in next.config.js for static headers
 */
export function getSecurityHeadersConfig() {
  return Object.entries(securityHeaders).map(([key, value]) => ({
    key,
    value,
  }))
}

/**
 * Development-friendly CSP (less restrictive for local development)
 */
export const developmentCSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: https: blob:",
  "connect-src 'self' ws: wss:",
  "frame-ancestors 'none'",
].join('; ')

/**
 * Production CSP (more restrictive)
 */
export const productionCSP = securityHeaders['Content-Security-Policy']

/**
 * Get CSP based on environment
 */
export function getCSP(): string {
  return process.env.NODE_ENV === 'production' ? productionCSP : developmentCSP
}

/**
 * Update CSP in security headers based on environment
 */
export function getEnvironmentSecurityHeaders() {
  return {
    ...securityHeaders,
    'Content-Security-Policy': getCSP(),
  }
}
