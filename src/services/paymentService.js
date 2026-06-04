import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

/**
 * Dummy payment update (NO REAL PAYMENT)
 */
export async function updatePaymentDummy(orderId, method) {
  if (!orderId || !method) return;

  const orderRef = doc(db, "orders", orderId);

  await updateDoc(orderRef, {
    paymentMethod: method,       // cash | upi | online
    paymentStatus: "unpaid",     // stays unpaid (dummy)
    updatedAt: serverTimestamp(),
  });
}
