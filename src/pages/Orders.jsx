import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../config/firebase";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [staff, setStaff] = useState([]);
  const [deliveries, setDeliveries] = useState({});
  const [loading, setLoading] = useState(true);


  useEffect(() => {
  Object.values(deliveries).forEach(async (d) => {
    if (d.status === "delivered") {
      try {
        await updateDoc(doc(db, "orders", d.orderId), {
          status: "delivered",
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.error("Admin sync failed:", err);
      }
    }
  });
}, [deliveries]);


  /* REALTIME LISTENERS */
  useEffect(() => {
    const unsubOrders = onSnapshot(
      query(collection(db, "orders"), orderBy("createdAt", "desc")),
      (snap) => {
        setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }
    );

    const unsubStaff = onSnapshot(
      collection(db, "delivery_staff"),
      (snap) => {
        setStaff(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    );

    const unsubDeliveries = onSnapshot(
      collection(db, "deliveries"),
      (snap) => {
        const map = {};
        snap.docs.forEach(d => {
          const data = d.data();
          map[data.orderId] = { id: d.id, ...data };
        });
        setDeliveries(map);
      }
    );

    return () => {
      unsubOrders();
      unsubStaff();
      unsubDeliveries();
    };
  }, []);

  async function assignDelivery(order, staffObj) {
    const now = serverTimestamp();

    await addDoc(collection(db, "deliveries"), {
      orderId: order.id,
      customerId: order.customerId,
      deliveryStaffId: staffObj.userId,
      status: "out_for_delivery",
      assignedAt: now,
      updatedAt: now,
      quantity: order.quantity,
      timeSlot: order.timeSlot,
      address: order.address || "",
    });

    await updateDoc(doc(db, "orders", order.id), {
      status: "out_for_delivery",
      updatedAt: now,
    });
  }

  if (loading) return <div className="p-6">Loading…</div>;

  return (
  <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
    <h1 className="text-2xl font-bold mb-4 md:mb-6">
      Orders
    </h1>

    {orders.map((o) => {
      const delivery = deliveries[o.id];

      return (
        <div
          key={o.id}
          className="bg-white p-4 md:p-5 rounded-xl mb-4 border"
        >
          <div className="flex justify-between items-center">
            <p className="font-semibold break-all">
              Order #{o.id.slice(0, 6)}
            </p>

            <span className="text-xs md:text-sm font-semibold">
              {o.status?.toUpperCase()}
            </span>
          </div>

          <div className="mt-2 text-sm text-gray-700">
            <p>Qty: <b>{o.quantity}</b></p>
            <p>Slot: <b>{o.timeSlot}</b></p>
          </div>

          {delivery && (
            <p className="text-blue-600 mt-2 text-sm break-all">
              Assigned to {delivery.deliveryStaffId}
            </p>
          )}
        </div>
      );
    })}
  </div>
);

}
