import { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";
import { admin } from "../../../lib/firebase-admin";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const expiresIn = 5 * 24 * 60 * 60 * 1000;
  try {
    const token = await admin.auth.verifyIdToken(req.headers.authorization!);
    if (new Date().getTime() / 1000 - token.auth_time > 5 * 60) {
      return res
        .status(401)
        .json({ error: "A more recent login is required." });
    }
    const cookie = await admin.auth.createSessionCookie(
      req.headers.authorization!,
      { expiresIn }
    );
    res.setHeader(
      "Set-Cookie",
      serialize("jid", cookie as string, {
        path: "/",
        maxAge: expiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
    );
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Unexpected error" });
  }
  return res.status(200).json({ success: true });
};

export default handler;
