import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
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
