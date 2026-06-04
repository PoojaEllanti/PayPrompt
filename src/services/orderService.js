import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { addNotification } from "./notificationService";

export async function createOrder(order) {
  try {
    const qty = Number(order.quantity);

    // 1️⃣ CHECK INVENTORY
    const invRef = doc(db, "inventory", "main");
    const invSnap = await getDoc(invRef);

    if (!invSnap.exists()) {
      throw new Error("Inventory not found");
    }

    const inv = invSnap.data();

    if ((inv.filledCans || 0) < qty) {
      throw new Error("Not enough stock");
    }

    // 2️⃣ UPDATE INVENTORY
    await updateDoc(invRef, {
      filledCans: inv.filledCans - qty,
    });

    // 3️⃣ CREATE ORDER
    const orderRef = await addDoc(collection(db, "orders"), {
      ...order,
      status: "pending",
      paymentStatus: "unpaid",
      createdAt: serverTimestamp(),
    });

    // 4️⃣ UPDATE CUSTOMER STATS (NON‑BLOCKING)
    try {
      await updateDoc(doc(db, "customers", order.customerId), {
        totalOrders: increment(1),
      });
    } catch (err) {
      console.warn("Customer stats update failed", err);
    }

    // 5️⃣ SEND NOTIFICATION (NON‑BLOCKING)
    try {
      await addNotification(
        order.customerId,
        "Your order has been placed successfully"
      );
    } catch (err) {
      console.warn("Notification failed", err);
    }

    // ✅ IMPORTANT
    return orderRef.id;

  } catch (err) {
    console.error("createOrder failed:", err);
    throw err; // UI will show failure ONLY if order truly failed
  }
}

export async function getCustomerOrders(customerId) {
  const q = query(
    collection(db, "orders"),
    where("customerId", "==", customerId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ----------------------------
// GET ALL ORDERS (ADMIN / DELIVERY)
// ----------------------------
export async function getAllOrders() {
  const q = query(
    collection(db, "orders"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateOrderStatus(orderId, status) {
  const orderRef = doc(db, "orders", orderId);
  const snap = await getDoc(orderRef);

  if (!snap.exists()) return;

  const order = snap.data();

  await updateDoc(orderRef, {
    status,
    updatedAt: serverTimestamp(),
  });

  if (order.customerId) {
    await addNotification(
      order.customerId,
      `Your order is now ${status.replace(/_/g, " ")}`
    );
  }
}

export async function cancelOrder(orderId) {
  const orderRef = doc(db, "orders", orderId);
  const snap = await getDoc(orderRef);

  if (!snap.exists()) return;

  const order = snap.data();

  await updateDoc(orderRef, {
    status: "cancelled",
    updatedAt: serverTimestamp(),
  });

  // 🔔 ADD THIS
  if (order.customerId) {
    await addNotification(
      order.customerId,
      "Your order has been cancelled"
    );
  }
}

