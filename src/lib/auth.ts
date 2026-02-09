// lib/auth.ts
// Admin Authentication Configuration for NextAuth.js
// Uses the /admin/auth endpoints for admin-only authentication
import {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 hours
    },
    jwt: {
        maxAge: 24 * 60 * 60, // 24 hours
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: {label: "Username", type: "text"},
                password: {label: "Password", type: "password"},
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                try {
                    const apiUrl = `${process.env.NEXT_PUBLIC_API_SERVER_BASE_URL}/admin/auth/login`;
                    console.log("Login API URL:", apiUrl);

                    // POST /admin/auth/login - Admin authentication endpoint
                    const res = await fetch(apiUrl, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json",
                        },
                        body: JSON.stringify({
                            username: credentials.username,
                            password: credentials.password,
                        }),
                    });

                    console.log("Login response status:", res.status);

                    if (!res.ok) {
                        const errorText = await res.text();
                        console.error("Login error response:", errorText);

                        let errorMessage = "Failed to sign in";
                        try {
                            const errorData = JSON.parse(errorText);
                            errorMessage = errorData.message || errorData.error || errorMessage;
                        } catch {
                            errorMessage = errorText || errorMessage;
                        }

                        throw new Error(errorMessage);
                    }

                    // Response structure:
                    // {
                    //   "accessToken": "...",
                    //   "refreshToken": "...",
                    //   "userInfo": {
                    //     "id": 1,
                    //     "username": "admin",
                    //     "firstName": "System",
                    //     "lastName": "Administrator",
                    //     "status": "ACTIVE",
                    //     "phone": "+1234567890",
                    //     "roles": [{ id, name, description, permissions: [...] }],
                    //     "permissions": [{ id, name, description, resource, action }]
                    //   }
                    // }
                    const data = await res.json();

                    console.log("Login response:", data);

                    // Return a user object with everything we need for session
                    return {
                        id: data.userInfo.id,
                        phone: data.userInfo.phone,
                        username: data.userInfo.username,
                        firstName: data.userInfo.firstName,
                        lastName: data.userInfo.lastName,
                        status: data.userInfo.status,
                        roles: data.userInfo.roles || [],
                        permissions: data.userInfo.permissions || [],
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                    };
                } catch (error: any) {
                    console.error("Authorize error:", error);
                    throw new Error(error?.message || "Something went wrong");
                }
            },
        }),
    ],
    callbacks: {
        async jwt({token, user}) {
            // If user is set, this is the first call after `authorize`
            if (user) {
                token.user = {
                    id: user.id as any,
                    phone: user.phone,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    status: user.status,
                    roles: user.roles,
                    permissions: user.permissions,
                };
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken;
                token.accessTokenExpires = Date.now() + 60 * 60 * 1000; // 1 hour
            }

            // Return previous token if the access token has not expired yet
            if (Date.now() < (token.accessTokenExpires as number)) {
                return token;
            }

            // Access token has expired, try to update it
            return refreshAccessToken(token);
        },

        async session({session, token}) {
            // Copy data from token to session
            session.user = {
                id: token.user.id,
                phone: token.user.phone,
                username: token.user.username,
                firstName: token.user.firstName,
                lastName: token.user.lastName,
                status: token.user.status,
                roles: token.user.roles,
                permissions: token.user.permissions,
            };
            session.accessToken = token.accessToken;
            session.refreshToken = token.refreshToken;
            session.error = token.error;

            return session;
        },
    },
    events: {
        async signOut({}) {
            // Clean up any stored tokens on sign out
            if (typeof window !== "undefined") {
                localStorage.removeItem("next-auth.session-token");
                localStorage.removeItem("next-auth.csrf-token");
                sessionStorage.removeItem("next-auth.session-token");
                sessionStorage.removeItem("next-auth.csrf-token");
            }
        },
    },
};

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(token: any) {
    try {
        // POST /admin/auth/refresh-token - Admin token refresh endpoint
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_SERVER_BASE_URL}/admin/auth/refresh-token`,
            {
                headers: {"Content-Type": "application/json"},
                method: "POST",
                body: JSON.stringify({
                    refreshToken: token.refreshToken,
                }),
            }
        );

        const refreshedTokens = await response.json();

        if (!response.ok) {
            throw refreshedTokens;
        }

        // The refresh endpoint returns the same AdminLoginResponse structure
        return {
            ...token,
            accessToken: refreshedTokens.accessToken,
            accessTokenExpires: Date.now() + 60 * 60 * 1000, // 1 hour
            refreshToken: refreshedTokens.refreshToken ?? token.refreshToken,
            // Update user info if provided
            user: refreshedTokens.userInfo ? {
                id: refreshedTokens.userInfo.id,
                phone: refreshedTokens.userInfo.phone,
                username: refreshedTokens.userInfo.username,
                firstName: refreshedTokens.userInfo.firstName,
                lastName: refreshedTokens.userInfo.lastName,
                status: refreshedTokens.userInfo.status,
                roles: refreshedTokens.userInfo.roles || token.user.roles,
                permissions: refreshedTokens.userInfo.permissions || token.user.permissions,
            } : token.user,
        };
    } catch (error) {
        console.log("Error refreshing access token", error);

        return {
            ...token,
            error: "RefreshAccessTokenError",
        };
    }
}
