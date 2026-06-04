import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../config/firebase";

export async function createSubscription(data) {
  return await addDoc(collection(db, "subscriptions"), {
    ...data,
    status: "active",
    startDate: serverTimestamp(),
    nextDeliveryDate: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
}

export async function getCustomerSubscriptions(customerId) {
  const q = query(
    collection(db, "subscriptions"),
    where("customerId", "==", customerId)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateSubscriptionStatus(id, status) {
  return await updateDoc(doc(db, "subscriptions", id), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function cancelSubscription(subscriptionId) {
  return await updateDoc(doc(db, "subscriptions", subscriptionId), {
    status: "cancelled",
    updatedAt: serverTimestamp(),
  });
}