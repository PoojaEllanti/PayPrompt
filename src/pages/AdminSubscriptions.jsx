import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

export default function AdminSubscriptions() {
  const [subs, setSubs] = useState([]);

  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "subscriptions"));
      setSubs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    load();
  }, []);

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Subscriptions</h1>

      {subs.length === 0 ? (
        <p className="text-slate-400">No subscriptions yet</p>
      ) : (
        subs.map(sub => (
          <div
            key={sub.id}
            className="bg-slate-800 p-4 rounded-xl mb-3"
          >
            <p className="text-sm text-slate-400">
              Customer: {sub.customerId}
            </p>
            <p>Quantity: {sub.quantity}</p>
            <p>Frequency: {sub.frequency}</p>
            <p>Time Slot: {sub.timeSlot}</p>
            <p>Status: {sub.status}</p>
          </div>
        ))
      )}
    </div>
  );
}
