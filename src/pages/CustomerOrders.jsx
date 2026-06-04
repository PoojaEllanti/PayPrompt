import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getCustomerOrders, cancelOrder } from "../services/orderService";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export default function CustomerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!user) return;
    setLoading(true);
    const data = await getCustomerOrders(user.uid);
    setOrders(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [user]);

  // 💳 PAYMENT FUNCTION
  function handlePayment(order) {
    const amount = (order.quantity || 1) * 20; // ✅ ₹20 per can

    console.log("ORDER ID:", order.id); // 🔍 DEBUG

    const options = {
      key: "rzp_test_SZQ2zFMXDgPYpR",
      amount: amount * 100, // convert to paise
      currency: "INR",
      name: "PayPrompt",
      description: "Order Payment",

      handler: async function (response) {
        console.log("Payment success:", response);

        try {
          await updateDoc(doc(db, "orders", order.id), {
            paymentStatus: "paid",
            paymentId: response.razorpay_payment_id,
            amount: amount,
          });

          console.log("✅ Firestore updated");

          alert("Payment Successful ✅");
          load();
        } catch (err) {
          console.error("❌ Firestore update failed:", err);
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  if (loading) {
    return <div className="p-6 text-gray-500">Loading orders...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-sm text-gray-500">
          View and manage your orders
        </p>
      </div>

      {/* EMPTY STATE */}
      {orders.length === 0 && (
        <div className="bg-white border rounded-xl p-6 text-gray-500">
          No orders found.
        </div>
      )}

      {/* ORDERS LIST */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white border rounded-2xl p-5 flex flex-col gap-2"
          >
            <div className="flex justify-between items-center">
              <p className="font-semibold text-gray-900">
                Order #{order.id.slice(0, 6)}
              </p>

              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  order.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : order.status === "delivered"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {order.status}
              </span>
            </div>

            <div className="text-sm text-gray-700">
              <p>Quantity: <b>{order.quantity}</b></p>
              <p>Time Slot: <b>{order.timeSlot}</b></p>

              <p className="text-xs text-gray-500 mt-1">
                Payment:{" "}
                {order.paymentStatus === "paid"
                  ? `Paid ✅ (₹${order.amount || 0})`
                  : "Not Paid"}
              </p>
            </div>

            {/* CANCEL BUTTON */}
            {order.status === "pending" && (
              <button
                onClick={async () => {
                  await cancelOrder(order.id);
                  load();
                }}
                className="mt-2 w-fit px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold"
              >
                Cancel Order
              </button>
            )}

            {/* 💳 PAY BUTTON */}
            {order.paymentStatus !== "paid" && (
              <button
                onClick={() => handlePayment(order)}
                className="mt-2 w-fit px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
              >
                Pay ₹{(order.quantity || 1) * 20}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}