import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useFirestore, useUser } from "reactfire";

type TUser = { email: string; name: string };

export function useUserData() {
  const { data: user } = useUser();
  const db = useFirestore();
  const [data, setData] = useState<TUser | null>(null);

  useEffect(() => {
    let unsubscribe;
    if (user) {
      const ref = doc(db, "users", user.uid);
      unsubscribe = onSnapshot(ref, (doc) => setData(doc.data() as TUser));
    } else {
      setData(null);
    }
    return unsubscribe;
  }, [user, db]);

  return { uid: user?.uid, auth: user, ...data };
}
