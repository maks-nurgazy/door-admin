import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = process.env.NEXT_PUBLIC_API_SERVER_BASE_URL || "";

export async function serverFetch(
    path: string,
    init?: RequestInit
): Promise<Response> {
    // 1. Get the server session, which contains the access token (if user is logged in)
    const session = await getServerSession(authOptions);

    const headers: HeadersInit = {
        ...(init?.headers || {}),
    };

    // 3. If we have an access token, add it as a Bearer token
    if (session?.accessToken) {
        (headers as Record<string, string>)["Authorization"] = `Bearer ${session.accessToken}`;
    }

    return fetch(`${BASE_URL}/${path}`, {
        ...init,
        headers,
    });
}
