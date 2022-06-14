import { AuthProvider, FirestoreProvider, FunctionsProvider } from "reactfire";
import { auth, firestore, functions } from "../lib/firebase-client";
import React from "react";

export const FirebaseComponents: React.FC = ({ children }) => {
  return (
    <AuthProvider sdk={auth}>
      <FunctionsProvider sdk={functions}>
        <FirestoreProvider sdk={firestore}>{children as any}</FirestoreProvider>
      </FunctionsProvider>
    </AuthProvider>
  );
};
