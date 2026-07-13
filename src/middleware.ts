import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthRoute = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/signup')
  
  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL('/dashboard', req.nextUrl))
    }
    return
  }

  if (!isLoggedIn && req.nextUrl.pathname !== '/') {
    return Response.redirect(new URL('/login', req.nextUrl))
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
