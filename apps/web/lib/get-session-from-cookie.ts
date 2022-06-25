import { NextApiRequest } from "next";
import cookie from "cookie";
import * as jwt from "next-auth/jwt";

/**
 * Reads the JWT token from the next-auth session cookie, and returns the
 * session object by decoding the token. Returns null if the JWT token is absent
 * or invalid
 */
export async function getSessionFromCookie({ req }: { req: NextApiRequest }) {
  try {
    // The cookie name differs between http and https urls. Also see here:
    // https://github.com/nextauthjs/next-auth/blob/50fe115df6379fffe3f24408a1c8271284af660b/src/core/lib/cookie.ts#L56-L60
    req.cookies = cookie.parse(req.headers.cookie || "");

    const isSecure = process.env.NEXT_PUBLIC_BASE_URL?.startsWith("https://");
    const cookiePrefix = isSecure ? "__Secure-" : "";
    const sessionToken =
      req.cookies?.[`${cookiePrefix}next-auth.session-token`];

    // decode will throw when the token is invalid
    const decoded = await jwt.decode({
      token: sessionToken,
      secret: String(process.env.NEXT_AUTH_SECRET),
    });

    if (!decoded) return null;

    return {
      user: { id: String(decoded.sub) },
      expires: new Date(Number(decoded.exp) * 1000).toISOString(),
    };
  } catch (error) {
    console.error(error);

    return null;
  }
}
