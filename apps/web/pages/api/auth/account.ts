import { NextApiRequest, NextApiResponse } from "next";
import { admin } from "../../../lib/firebase-admin";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { uid } = await admin.auth.verifySessionCookie(req.cookies.jid, true);
    const user = (await admin.db.collection("users").doc(uid).get()).data();
    console.log(user);
    res.status(200).json(user);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

export default handler;
