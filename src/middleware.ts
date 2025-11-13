// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // This middleware is primarily for API routes.
  // For pages, Next.js handles routing.
  if (request.nextUrl.pathname.startsWith('/api')) {
    // You could add request logging or other API-specific logic here.
  }

  // Create a base response to add headers to.
  const response = NextResponse.next();

  // It's generally better to set CORS headers in your API routes themselves
  // or in a dedicated API middleware, as Edge Middleware runs on every request
  // which might be unnecessary. However, if needed globally:
  
  // Example: Setting a more specific origin from an environment variable.
  const origin = process.env.NEXT_PUBLIC_APP_URL || '*';
  
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  return response;
}

// Specify which paths this middleware should run on.
export const config = {
  matcher: '/api/:path*',
};