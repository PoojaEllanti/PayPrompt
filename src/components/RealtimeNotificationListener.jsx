import { useEffect, useRef } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function RealtimeNotificationListener() {
  const { user } = useAuth();
  const initialLoad = useRef(true);

  useEffect(() => {
    if (!user) return;

    console.log("🔔 Notification listener active for:", user.uid);

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // 🚫 Skip old notifications on first load
      if (initialLoad.current) {
        initialLoad.current = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();

          if (data.read === false) {
            toast.success(data.message, {
              duration: 4000,
              position: "top-right",
            });
          }
        }
      });
    });

    return () => unsubscribe();
  }, [user]);

  return null;
}
