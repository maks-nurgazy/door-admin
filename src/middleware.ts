import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { LOGIN, PUBLIC_ROUTES } from '@/libs/routes';

const SECRET = process.env.AUTH_SECRET;

export async function middleware(request: any) {
    const { nextUrl } = request;

    // Extract the token using getToken
    const token = await getToken({ req: request, secret: SECRET });
    const isAuthenticated = !!token;

    // Check if the route is public
    const isPublicRoute = PUBLIC_ROUTES.some(route => nextUrl.pathname.startsWith(route));

    if (!isAuthenticated && !isPublicRoute) {
        return NextResponse.redirect(new URL(LOGIN, nextUrl));
    }

    // Allow the request to proceed
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
