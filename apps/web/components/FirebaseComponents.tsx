import { AuthProvider, FirestoreProvider, FunctionsProvider } from "reactfire";
import { auth, firestore, functions } from "../lib/firebase-client";

export const FirebaseComponents: React.FC = ({ children }) => {
  return (
    <AuthProvider sdk={auth}>
      <FunctionsProvider sdk={functions}>
        <FirestoreProvider sdk={firestore}>{children}</FirestoreProvider>
      </FunctionsProvider>
    </AuthProvider>
  );
};
