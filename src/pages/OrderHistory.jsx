import { useEffect, useState } from "react";
import { getCustomerOrders } from "../services/orderService";
import { useAuth } from "../context/AuthContext";

export default function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getCustomerOrders(user.uid).then(setOrders);
  }, []);

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Order History</h1>
      {orders.map(o => (
        <div key={o.id} className="bg-slate-800 p-4 rounded mb-3">
          <p>Qty: {o.quantity}</p>
          <p>Status: {o.status}</p>
          <p>Total: ₹{o.total}</p>
        </div>
      ))}
    </div>
  );
}
