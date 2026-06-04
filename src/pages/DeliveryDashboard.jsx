import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import LiveMap from "../components/LiveMap";

const PRICE_PER_CAN = 20;

export default function DeliveryDashboard() {
  const { user } = useAuth();

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH DELIVERIES ================= */
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "deliveries"),
      where("deliveryStaffId", "==", user.uid)
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
    if (!user?.uid || deliveries.length === 0) return;

    const active = deliveries.find(
      (d) => d.status !== "delivered"
    );

    if (!active) return;

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        try {
          await updateDoc(doc(db, "deliveries", active.id), {
            location: {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            },
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          console.error("GPS update failed:", err);
        }
      },
      (err) => console.error(err),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [deliveries, user?.uid]);

  /* ================= MARK DELIVERED ================= */
  async function markDelivered(id) {
    try {
      await updateDoc(doc(db, "deliveries", id), {
        status: "delivered",
        deliveredAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
      alert("Failed");
    }
  }

  /* ================= ADDRESS TO COORDINATES ================= */
  function getCustomerLocation(address) {
    if (!address) return null;

    // SRM / Kattankulathur fixed project location
    if (address.toLowerCase().includes("srm")) {
      return {
        lat: 12.8230,
        lng: 80.0444,
      };
    }

    // fallback
    return {
      lat: 13.0827,
      lng: 80.2707,
    };
  }

  /* ================= UI ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-8">
        Delivery Dashboard
      </h1>

      {deliveries.length === 0 && (
        <div className="bg-white p-6 rounded-2xl border text-gray-500">
          No deliveries assigned 🚚
        </div>
      )}

      <div className="space-y-6">
        {deliveries.map((d) => {
          const qty = Number(d.quantity || 0);
          const total = qty * PRICE_PER_CAN;

          const customerLocation = getCustomerLocation(
            d.address
          );

          return (
            <div
              key={d.id}
              className="bg-white rounded-2xl border p-6 shadow-sm"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold">
                  Order #{d.orderId?.slice(0, 6)}
                </h2>

                <span
                  className={`px-4 py-1 rounded-full text-sm font-semibold ${
                    d.status === "delivered"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {d.status?.toUpperCase()}
                </span>
              </div>

              {/* DETAILS */}
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p>📦 Quantity: <b>{qty}</b></p>
                  <p>💰 Amount Paid: <b>₹{total}</b></p>
                </div>

                <div>
                  <p>⏰ Slot: <b>{d.timeSlot}</b></p>
                  <p>💳 Payment: <b>{d.paymentStatus || "Paid"}</b></p>
                </div>
              </div>

              {/* ADDRESS */}
              <div className="mt-5 bg-gray-50 p-4 rounded-xl">
                <p className="font-semibold">
                  📍 Delivery Address
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  {d.address}
                </p>
              </div>

              {/* OPEN MAP */}
              <div className="mt-4">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    d.address
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 font-semibold hover:underline"
                >
                  📍 Open in Maps
                </a>
              </div>

              {/* LIVE TRACKING MAP */}
              <div className="mt-5">
                {d.location && customerLocation ? (
                  <LiveMap
                    deliveryLocation={d.location}
                    customerLocation={customerLocation}
                  />
                ) : (
                  <div className="bg-blue-50 text-blue-600 px-4 py-3 rounded-xl text-sm">
                    Waiting for live tracking...
                  </div>
                )}
              </div>

              {/* BUTTON */}
              {d.status !== "delivered" && (
                <button
                  onClick={() => markDelivered(d.id)}
                  className="mt-5 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold"
                >
                  Mark Delivered
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}