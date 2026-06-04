import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";

export default function MyDeliveries() {
  const { user } = useAuth();

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= GET DELIVERIES ================= */
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "deliveries"),
      where("deliveryStaffId", "==", user.uid),
      where("status", "!=", "delivered")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        setDeliveries(list);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user?.uid]);

  /* ================= LIVE GPS TRACKING ================= */
  useEffect(() => {
    if (deliveries.length === 0) return;

    const activeDelivery = deliveries[0];

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        try {
          await updateDoc(doc(db, "deliveries", activeDelivery.id), {
            location: {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            },
            updatedAt: new Date(),
          });
        } catch (err) {
          console.error("GPS update failed:", err);
        }
      },
      (err) => console.log(err),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [deliveries]);

  /* ================= DELIVERED ================= */
  async function markDelivered(deliveryId) {
    try {
      await updateDoc(doc(db, "deliveries", deliveryId), {
        status: "delivered",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to mark delivered");
    }
  }

  /* ================= UI ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading deliveries...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">
        My Deliveries
      </h1>

      {deliveries.length === 0 && (
        <div className="bg-white p-6 rounded-xl border text-center text-gray-500">
          No deliveries assigned 🚚
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {deliveries.map((d) => (
          <div
            key={d.id}
            className="bg-white rounded-2xl border p-5"
          >
            <div className="flex justify-between mb-3">
              <div>
                <p className="text-sm text-gray-500">Order</p>
                <p className="font-bold">
                  #{d.orderId?.slice(0, 6)}
                </p>
              </div>

              <span className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-semibold">
                {d.status?.toUpperCase()}
              </span>
            </div>

            <div className="space-y-1 text-sm">
              <p>Quantity: {d.quantity}</p>
              <p>Time Slot: {d.timeSlot}</p>
              <p>Address: {d.address}</p>
            </div>

            <button
              onClick={() => markDelivered(d.id)}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl"
            >
              Mark Delivered
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}