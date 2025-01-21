// middleware.ts
import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";
import {getToken} from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const token = await getToken({req, secret: process.env.NEXTAUTH_SECRET});

    // If no token, user is NOT authenticated
    if (!token) {
        // If this is a page route, redirect to /login
        // If this is an API route, you might want to return an HTTP 401 or 403 response
        const signInPage = new URL("/login", req.url);
        return NextResponse.redirect(signInPage);
    }

    // Optional: You can do role-based checks here
    // if (token.user.role !== "ADMIN") {
    //   return NextResponse.redirect(new URL("/not-authorized", req.url));
    // }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/"]
};
