// import { initializeApp } from "firebase/app";
// import { connectAuthEmulator, getAuth } from "firebase/auth";
// import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
// import { connectStorageEmulator, getStorage } from "firebase/storage";

import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
};

// export const app = initializeApp(firebaseConfig);

// export const db = getFirestore();
// process.env["FIRESTORE_EMULATOR_HOST"] = "localhost:8080";
// connectFirestoreEmulator(db, "localhost", 8080);

// export const auth = getAuth();
// connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });

// export const storage = getStorage();
// connectStorageEmulator(storage, "localhost", 9199);

if (!getApps().length) {
  const app = initializeApp(firebaseConfig);

  const auth = getAuth(app),
    firestore = getFirestore(app),
    functions = getFunctions(app);

  if (typeof window != "undefined" && process.env.NODE_ENV !== "production") {
    console.info("Dev Env Detected: Using Emulators!");
    if (auth.emulatorConfig?.host !== "localhost")
      connectAuthEmulator(auth, "http://localhost:9099", {
        disableWarnings: true,
      });
    // @ts-ignore
    if (!firestore._settings?.host.startsWith("localhost"))
      connectFirestoreEmulator(firestore, "localhost", 8080);
    // @ts-ignore
    if (!functions.emulatorOrigin?.startsWith("localhost"))
      connectFunctionsEmulator(functions, "localhost", 5001);
  }
}

export const app = getApp();
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const functions = getFunctions(app);
