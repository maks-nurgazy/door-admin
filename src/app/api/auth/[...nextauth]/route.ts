// app/api/auth/[...nextauth]/route.ts
import NextAuth, {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
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
            }
            return token;
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

            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export {handler as GET, handler as POST};
