import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";

export default function Payments() {
  const { user, role } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadPayments() {
    setLoading(true);

    const q =
      role === "admin"
        ? query(collection(db, "payments"), orderBy("createdAt", "desc"))
        : query(
            collection(db, "payments"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
          );

    const snap = await getDocs(q);
    setPayments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  useEffect(() => {
    loadPayments();
  }, []);

  if (loading) return <p className="text-slate-400">Loading payments...</p>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Payments</h1>

      {payments.length === 0 ? (
        <p className="text-slate-400">No payments found</p>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <div
              key={p.id}
              className="bg-slate-800 p-4 rounded-xl border border-slate-700"
            >
              <p className="text-sm">
                <span className="text-slate-400">Order:</span> {p.orderId}
              </p>
              <p className="text-sm">
                <span className="text-slate-400">Amount:</span> ₹{p.amount}
              </p>
              <p className="text-sm">
                <span className="text-slate-400">Method:</span> {p.method}
              </p>
              <p className="text-xs text-slate-500">
                {p.createdAt?.toDate().toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
