import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import LiveMap from "../LiveMap";

export default function OrderTracking({ order }) {
  const [delivery, setDelivery] = useState(null);

  if (!order) return null;

  const steps = ["pending", "accepted", "out_for_delivery", "delivered"];
  const currentIndex = steps.indexOf(order.status);

  /* ================= GET LIVE DELIVERY ================= */
  useEffect(() => {
    const q = query(
      collection(db, "deliveries"),
      where("orderId", "==", order.id)
    );

    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setDelivery({
          id: snap.docs[0].id,
          ...snap.docs[0].data(),
        });
      }
    });

    return () => unsub();
  }, [order.id]);

  return (
    <div className="bg-white border rounded-2xl p-5 mt-4">
      <p className="font-semibold text-gray-900 mb-4">
        Order Tracking
      </p>

      {/* ================= STATUS TRACKER ================= */}
      <div className="flex items-center justify-between gap-2 mb-6">
        {steps.map((step, index) => {
          const active = index <= currentIndex;
          const completed = index < currentIndex;

          return (
            <div
              key={step}
              className="flex-1 flex flex-col items-center"
            >
              <div className="w-full h-2 rounded-full bg-gray-200">
                <div
                  className={`h-2 rounded-full transition-all ${
                    active
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                  style={{
                    width: active ? "100%" : "0%",
                  }}
                />
              </div>

              <p
                className={`mt-2 text-xs font-medium capitalize ${
                  active
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              >
                {step.replace(/_/g, " ")}
              </p>

              <div
                className={`mt-1 h-2 w-2 rounded-full ${
                  completed
                    ? "bg-green-500"
                    : active
                    ? "bg-green-400"
                    : "bg-gray-300"
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* ================= LIVE MAP ================= */}
      {delivery?.location &&
        delivery?.customerLocation && (
          <LiveMap
            deliveryLocation={delivery.location}
            customerLocation={delivery.customerLocation}
          />
        )}

      {!delivery && (
        <p className="text-sm text-gray-500 mt-2">
          Delivery not assigned yet 🚚
        </p>
      )}
    </div>
  );
}