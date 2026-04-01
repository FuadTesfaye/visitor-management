import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

/**
 * Next.js 16 Proxy (formerly Middleware)
 * Handles authentication, role-based access control, and route redirection.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication for non-logged-in users
  const publicRoutes = ['/login', '/api/auth/login'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Get token from cookies
  const token = request.cookies.get('auth-token')?.value;

  console.log(`[PROXY] ${request.method} ${pathname} - Token: ${token ? 'Present' : 'Missing'}`);

  // 1. Handle Unauthenticated Users
  if (!token) {
    // If not public route, redirect to login
    if (!isPublicRoute && pathname !== '/') {
      console.log(`[PROXY] No token found. Redirecting to login...`);
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    // If at root '/' and not authenticated, stay or redirect? 
    // Usually the root page itself (src/app/page.tsx) will redirect to /login.
    return NextResponse.next();
  }

  // 2. Handle Authenticated Users
  const user = verifyToken(token);
  
  if (!user) {
    console.log(`[PROXY] Invalid token. Clearing cookie and redirecting to login...`);
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('auth-token');
    return response;
  }

  // 3. Prevent logged-in users from seeing the login page or root '/'
  // Only redirect for navigation requests, not API requests
  if (!pathname.startsWith('/api') && (isPublicRoute || pathname === '/')) {
    let dashboardUrl;
    switch (user.role) {
      case 'visitor':
        dashboardUrl = new URL('/visitor/dashboard', request.url);
        break;
      case 'staff':
        dashboardUrl = new URL('/staff/dashboard', request.url);
        break;
      case 'head':
        dashboardUrl = new URL('/head/dashboard', request.url);
        break;
      case 'security':
        dashboardUrl = new URL('/security/dashboard', request.url);
        break;
      case 'superadmin':
        dashboardUrl = new URL('/superadmin/dashboard', request.url);
        break;
      default:
        console.warn(`[PROXY] Unknown user role: ${user.role}`);
        return NextResponse.next();
    }
    console.log(`[PROXY] Authenticated user (${user.role}) redirecting to ${dashboardUrl.pathname}`);
    return NextResponse.redirect(dashboardUrl);
  }

  // 4. Role-Based Access Control (RBAC)
  const rolePrefixes = {
    visitor: '/visitor',
    staff: '/staff',
    head: '/head',
    security: '/security',
    superadmin: '/superadmin',
  };

  for (const [role, prefix] of Object.entries(rolePrefixes)) {
    if (pathname.startsWith(prefix) && user.role !== role) {
      console.warn(`[PROXY] Unauthorized access attempt: User ${user.email} (${user.role}) -> ${pathname}`);
      // Redirect to their own dashboard instead of a generic login
      const myDashboard = new URL(`${prefix}/dashboard`, request.url);
      // Wait, we need to redirect them to *their* correct dashboard
      const correctDashboard = new URL(`/${user.role}/dashboard`, request.url);
      return NextResponse.redirect(correctDashboard);
    }
  }

  // 5. Inject user info into headers for API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', user.userId);
  requestHeaders.set('x-user-role', user.role);
  requestHeaders.set('x-user-email', user.email);
  requestHeaders.set('x-user-name', user.name);
  if (user.branchId) requestHeaders.set('x-user-branch-id', user.branchId);
  if (user.departmentId) requestHeaders.set('x-user-department-id', user.departmentId);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

/**
 * Configure paths that trigger the Proxy
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (assets in the public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth/login).*)',
  ],
};
