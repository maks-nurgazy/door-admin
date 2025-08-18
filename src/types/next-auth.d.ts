// types/next-auth.d.ts

import { DefaultSession } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
    interface User {
        id: number;
        phone: string;
        username: string;
        role: string;
        firstName: string;
        lastName: string;
        status: string;
        accessToken: string;
        refreshToken: string;
    }

    // Returned by useSession, getSession, etc.
    interface Session extends DefaultSession {
        user: {
            id: number;
            phone: string;
            username: string;
            role: string;
            firstName: string;
            lastName: string;
            status: string;
        };
        accessToken: string;
        refreshToken: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        user: {
            id: number;
            phone: string;
            username: string;
            role: string;
            firstName: string;
            lastName: string;
            status: string;
        };
        accessToken: string;
        refreshToken: string;
    }
}
