import { AuthProvider, FirestoreProvider } from "reactfire";
import { auth, firestore } from "../lib/firebase-client";

export const FirebaseComponents: React.FC = ({ children }) => {
  return (
    <AuthProvider sdk={auth}>
      <FirestoreProvider sdk={firestore}>{children}</FirestoreProvider>
    </AuthProvider>
  );
};
