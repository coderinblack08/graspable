import { serialize } from "cookie";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (_: NextApiRequest, res: NextApiResponse) => {
  try {
    res.setHeader(
      "Set-Cookie",
      serialize("jid", "", {
        path: "/",
        expires: new Date(0),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
    );
  } catch (e) {
    return res.status(500).json({ error: "Unexpected error" });
  }
  return res.status(200).json({ success: true });
};

export default handler;
