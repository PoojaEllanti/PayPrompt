import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc
} from "firebase/firestore";

import { db } from "../config/firebase";

// --------------------
// DELIVERY STAFF
// --------------------
export async function addDeliveryStaff(data) {
  return await addDoc(collection(db, "delivery_staff"), {
    ...data,
    active: true,
    createdAt: serverTimestamp(),
  });
}

export async function getDeliveryStaff() {
  const snap = await getDocs(collection(db, "delivery_staff"));

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

// --------------------
// ASSIGN DELIVERY
// --------------------
export async function assignDelivery({
  orderId,
  customerId,
  staffId,
}) {
  try {
    // ✅ Get customer profile
    const customerRef = doc(db, "customers", customerId);
    const customerSnap = await getDoc(customerRef);

    // ✅ Get order details
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);

    if (!customerSnap.exists()) {
      throw new Error("Customer not found");
    }

    if (!orderSnap.exists()) {
      throw new Error("Order not found");
    }

    const customer = customerSnap.data();
    const order = orderSnap.data();

    // ✅ Use SAVED ADDRESS from customer profile
    const savedAddress =
      customer.address || "Address not available";

    // ✅ Create delivery
    return await addDoc(collection(db, "deliveries"), {
      orderId,
      customerId,
      deliveryStaffId: staffId,

      status: "assigned",
      assignedAt: serverTimestamp(),

      // 🔥 IMPORTANT
      address: savedAddress,

      // extra info
      quantity: order.quantity || 0,
      timeSlot: order.timeSlot || "",
      paymentStatus:
        order.paymentStatus || "unpaid",
    });
  } catch (err) {
    console.error("Assign delivery error:", err);
    throw err;
  }
}

// --------------------
// GET MY DELIVERIES
// --------------------
export async function getMyDeliveries(staffId) {
  const q = query(
    collection(db, "deliveries"),
    where("deliveryStaffId", "==", staffId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

// --------------------
// MARK DELIVERED
// --------------------
export async function markDelivered(deliveryId) {
  return await updateDoc(
    doc(db, "deliveries", deliveryId),
    {
      status: "delivered",
      deliveredAt: serverTimestamp(),
    }
  );
}