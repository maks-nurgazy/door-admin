// lib/auth.ts
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
                    // POST /auth/login/username
                    const res = await fetch(
                        `${process.env.NEXT_PUBLIC_API_SERVER_BASE_URL}/auth/login/username`,
                        {
                            method: "POST",
                            headers: {"Content-Type": "application/json"},
                            body: JSON.stringify({
                                username: credentials.username,
                                password: credentials.password,
                            }),
                        }
                    );

                    if (!res.ok) {
                        let errorData: any;
                        try {
                            errorData = await res.json();
                        } catch {
                            errorData = {message: "An unknown error occurred"};
                        }

                        throw new Error(errorData.message || "Failed to sign in");
                    }

                    // e.g.
                    // {
                    //   "accessToken": "...",
                    //   "refreshToken": "...",
                    //   "userInfo": {
                    //     "id": 123,
                    //     "phone": "1111111",
                    //     "username": "someUsername",
                    //     "role": "USER",
                    //     "firstName": "John",
                    //     "lastName": "Doe",
                    //     "status": "ACTIVE"
                    //   }
                    // }
                    const data = await res.json();

                    console.log("data: " + data);

                    // Return a user object with everything we need for session
                    return {
                        id: data.userInfo.id,
                        phone: data.userInfo.phone,
                        username: data.userInfo.username,
                        role: data.userInfo.role,
                        firstName: data.userInfo.firstName,
                        lastName: data.userInfo.lastName,
                        status: data.userInfo.status,
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
                    role: user.role,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    status: user.status,
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
                role: token.user.role,
                firstName: token.user.firstName,
                lastName: token.user.lastName,
                status: token.user.status,
            };
            session.accessToken = token.accessToken;
            session.refreshToken = token.refreshToken;
            session.error = token.error;

            return session;
        },
    },
    events: {
        async signOut({ token }) {
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
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_SERVER_BASE_URL}/auth/refresh`,
            {
                headers: { "Content-Type": "application/json" },
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

        return {
            ...token,
            accessToken: refreshedTokens.accessToken,
            accessTokenExpires: Date.now() + 60 * 60 * 1000, // 1 hour
            refreshToken: refreshedTokens.refreshToken ?? token.refreshToken, // Fall back to old refresh token
        };
    } catch (error) {
        console.log("Error refreshing access token", error);

        return {
            ...token,
            error: "RefreshAccessTokenError",
        };
    }
}
