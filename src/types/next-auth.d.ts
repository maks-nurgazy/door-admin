import type {DefaultSession, DefaultUser} from "next-auth";

declare module "next-auth" {
    interface User extends DefaultUser {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
    }

    interface Session {
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
        } & DefaultSession['user'];
    }
}
