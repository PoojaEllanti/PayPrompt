import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

// ----------------------------------
// ADD NOTIFICATION
// ----------------------------------
export async function addNotification(userId, message) {
  if (!userId || !message) return;

  await addDoc(collection(db, "notifications"), {
    userId,
    message,
    read: false,
    createdAt: serverTimestamp(),
  });
}

// ----------------------------------
// GET USER NOTIFICATIONS
// ----------------------------------
export async function getUserNotifications(userId) {
  if (!userId) return [];

  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

// ----------------------------------
// MARK NOTIFICATION AS READ
// ----------------------------------
export async function markNotificationRead(notificationId) {
  if (!notificationId) return;

  await updateDoc(doc(db, "notifications", notificationId), {
    read: true,
  });
}
