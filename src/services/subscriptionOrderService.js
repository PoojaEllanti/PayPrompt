import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

export async function generateOrdersFromSubscriptions(customerId) {
  if (!customerId) return; // ✅ prevents Firestore crash

  try {
    const q = query(
      collection(db, "subscriptions"),
      where("customerId", "==", customerId),
      where("status", "==", "active")
    );

    const snap = await getDocs(q);
    if (snap.empty) return;

    for (const docSnap of snap.docs) {
      const sub = docSnap.data();

      await addDoc(collection(db, "orders"), {
        customerId: sub.customerId,
        quantity: sub.quantity,
        timeSlot: sub.timeSlot,
        status: "pending",

        fromSubscription: true,
        subscriptionId: docSnap.id,
        deliveryDate: new Date().toISOString().split("T")[0],
        createdAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.error("Failed to create order from subscription:", err);
  }
}

