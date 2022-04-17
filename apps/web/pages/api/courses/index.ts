import { NextApiRequest, NextApiResponse } from "next";
import { admin } from "../../../lib/firebase-admin";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { uid } = await admin.auth.verifySessionCookie(req.cookies.jid, true);
    const data = await admin.db
      .collection("courses")
      .where("userId", "==", uid)
      .get();
    res.json(admin.reduce(data));
  } catch (error) {
    res.status(500).json(error);
  }
};

export default handler;
