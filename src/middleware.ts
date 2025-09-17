import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
    '/sign-in(.*)',
    '/sso-callback',
    '/api(.*)',
    '/pricing(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
    // Debug logging
    console.log('🔍 Middleware hit:', req.nextUrl.pathname);
    console.log('🔍 Is public route:', isPublicRoute(req));

    if (!isPublicRoute(req)) {
        try {
            await auth.protect();
        } catch (error) {
            // Redirect to sign-in instead of throwing 401
            const signInUrl = new URL('/sign-in', req.url);
            return NextResponse.redirect(signInUrl);
        }
    }
});

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
}