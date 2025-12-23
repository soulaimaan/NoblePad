import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Get response
  const response = NextResponse.next()

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  
  // Content Security Policy
  const csp = [
    "default-src * 'unsafe-inline' 'unsafe-eval'",
    "script-src * 'unsafe-inline' 'unsafe-eval' https: http: blob: chrome-extension:",
    "style-src * 'unsafe-inline' https: http: blob:",
    "font-src * https: http: data:",
    "img-src * data: https: http: blob:",
    "connect-src * https: http: wss: ws: chrome-extension:",
    "worker-src * blob: 'unsafe-inline'",
    "frame-src * https: http: chrome-extension:",
  ].join('; ')

  // response.headers.set('Content-Security-Policy', csp)

  // Set proper content type for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Content-Type', 'application/json; charset=utf-8')
  }

  // Add cache headers for static assets
  if (request.nextUrl.pathname.match(/\.(js|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}