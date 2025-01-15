import {SessionOptions} from "next-auth";

export const authConfig = {
    session: {
        strategy: 'jwt',
        maxAge: 24 * 60 * 60
    } as Partial<SessionOptions>,
    providers: []
}
