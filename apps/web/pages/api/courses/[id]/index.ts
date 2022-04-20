import { NextApiRequest, NextApiResponse } from "next";
import { admin } from "../../../../lib/firebase-admin";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const q = await admin.db.doc(`courses/${req.query.id}`).get();
    res.json({ ...q.data(), id: q.id });
  } catch (error) {
    res.status(500).json(error);
  }
};

export default handler;
