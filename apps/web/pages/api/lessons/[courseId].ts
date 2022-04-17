import { NextApiRequest, NextApiResponse } from "next";
import { admin } from "../../../lib/firebase-admin";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const data = await admin.db
      .collection("lessons")
      .where("courseId", "==", req.query.courseId)
      .get();
    res.json(admin.reduce(data));
  } catch (error) {
    res.status(500).json(error);
  }
};

export default handler;
