// types/next-auth.d.ts

import { DefaultSession } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

export interface PermissionDto {
    id: number;
    name: string;
    description: string;
    resource: string;
    action: string;
}

export interface RoleDto {
    id: number;
    name: string;
    description: string;
    permissions: PermissionDto[];
}

declare module "next-auth" {
    interface User {
        id: number;
        phone: string;
        username: string;
        firstName: string;
        lastName: string;
        status: string;
        roles: RoleDto[];
        permissions: PermissionDto[];
        accessToken: string;
        refreshToken: string;
    }

    // Returned by useSession, getSession, etc.
    interface Session extends DefaultSession {
        user: {
            id: number;
            phone: string;
            username: string;
            firstName: string;
            lastName: string;
            status: string;
            roles: RoleDto[];
            permissions: PermissionDto[];
        };
        accessToken: string;
        refreshToken: string;
        error?: "RefreshAccessTokenError";
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        user: {
            id: number;
            phone: string;
            username: string;
            firstName: string;
            lastName: string;
            status: string;
            roles: RoleDto[];
            permissions: PermissionDto[];
        };
        accessToken: string;
        refreshToken: string;
        accessTokenExpires: number;
        error?: "RefreshAccessTokenError";
    }
}
