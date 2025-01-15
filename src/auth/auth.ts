import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {authConfig} from "@/auth/auth.config";
import {axiosClient} from "@/libs/axios";
import {jwtDecode} from "jwt-decode";

export const {
    handlers: {GET, POST},
    auth,
    signIn,
    signOut
} = NextAuth({
    ...authConfig,
    providers: [
        CredentialsProvider({
            credentials: {
                username: {label: "Username", type: "text"},
                password: {label: "Password", type: "password"},
            },
            async authorize(credentials): Promise<any> {
                if (!credentials) {
                    throw new Error("Missing credentials");
                }

                try {
                    const response = await axiosClient.post("/auth/login", {
                        username: credentials.username,
                        password: credentials.password,
                    });

                    const {accessToken, refreshToken, userInfo} = response.data;

                    return {
                        accessToken,
                        refreshToken,
                        username: userInfo.username,
                        fullName: userInfo.fullName,
                        role: userInfo.role,
                    };
                } catch (error: any) {
                    throw new Error(
                        error.response?.data?.message || "Invalid username or password"
                    );
                }
            },
        }),
    ],
    callbacks: {
        jwt: async ({token, account, user}: any) => {
            // user is only available the first time a user signs in authorized

            if (token.accessToken) {
                const decodedToken = jwtDecode(token.accessToken)

                token.accessTokenExpires = decodedToken.exp! * 1000
            }

            if (account && user) {
                return {
                    ...token,
                    accessToken: user.accessToken,
                    refreshToken: user.refreshToken,
                    user
                }
            }

            // Return previous token if the access token has not expired yet
            if (Date.now() < token.accessTokenExpires) {
                return token
            }

            // Access token has expired, try to update it
            return refreshAccessToken(token)
        },
        session: async ({session, token}: any) => {
            if (token) {
                session.accessToken = token.accessToken
                session.user = token.user
            }

            return session
        }
    }
});

async function refreshAccessToken(token: any): Promise<any> {
    try {
        const {data} = await axiosClient.post("/auth/refresh-token", {
            refreshToken: token.refreshToken,
        });

        return data;
    } catch (error: any) {
        console.error("Failed to refresh access token:", error.response?.data);

        return {
            ...token,
            error: "RefreshAccessTokenError",
        };
    }
}
