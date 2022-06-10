import { auth, firestore } from "firebase-admin";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuid } from "uuid";

if (process.env.NODE_ENV === "development") {
  process.env["FIRESTORE_EMULATOR_HOST"] = "localhost:8080";
  process.env["FIREBASE_AUTH_EMULATOR_HOST"] = "localhost:9099";
}

export const app = initializeApp(
  {
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
      privateKey: (process.env.FIREBASE_ADMIN_KEY || "").replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    }),
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  },
  uuid()
);

export const admin = {
  auth: getAuth(app),
  db: getFirestore(app),
  reduce: (
    data: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
  ) => {
    const result: any[] = [];
    data.forEach((doc) => result.push({ ...doc.data(), id: doc.id }));
    return result;
  },
};

type FirebaseHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
  context: FirebaseContext
) => void;
type FirebaseContext = { uid: string };

export const withFirebaseAuth = (
  func: FirebaseHandler,
  accountType?: "student" | "coach" | "admin"
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    let uid;
    try {
      const token = await admin.auth.verifyIdToken(
        req.headers.authorization ?? ""
      );
      uid = token.uid;
    } catch (e) {
      return res.status(401).end();
    }

    if (accountType) {
      const user = await admin.db.collection("users").doc(uid).get();
      const userData = user.data();
      if (!userData || userData.type !== accountType) {
        return res.status(401).end();
      }
    }

    return func(req, res, { uid });
  };
};
