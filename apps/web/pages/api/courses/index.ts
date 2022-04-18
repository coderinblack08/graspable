import { NextApiRequest, NextApiResponse } from "next";
import { admin } from "../../../lib/firebase-admin";
import { Course, Lesson } from "../../../types";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { uid } = await admin.auth.verifySessionCookie(req.cookies.jid, true);
    let data: any = await admin.db
      .collection("courses")
      .where("userId", "==", uid)
      .get();

    data = await Promise.all(
      admin.reduce(data).map(async (course: Course) => {
        const lessons: Lesson[] = admin.reduce(
          await admin.db
            .collection("lessons")
            .where("courseId", "==", course.id)
            .get()
        );
        return {
          ...course,
          lessons: lessons.sort(
            (a, b) =>
              course.lessons.findIndex((x) => x.id == a.id) -
              course.lessons.findIndex((x) => x.id == b.id)
          ),
        };
      })
    );

    res.json(data);
  } catch (error) {
    res.status(500).json(error);
  }
};

export default handler;
