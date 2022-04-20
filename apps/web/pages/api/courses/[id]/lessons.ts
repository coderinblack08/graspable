import { NextApiRequest, NextApiResponse } from "next";
import { admin } from "../../../../lib/firebase-admin";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const q = await admin.db
      .collection("lessons")
      .where("courseId", "==", req.query.id)
      .get();
    res.json(admin.reduce(q));
  } catch (error) {
    res.status(500).json(error);
  }
};

export default handler;
