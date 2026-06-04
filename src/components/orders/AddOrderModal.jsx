import { useState, useMemo } from "react";
import { createOrder } from "../../services/orderService";
import { useAuth } from "../../context/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";

const PRICE_PER_CAN = 20; // ✅ ₹20 per can

export default function AddOrderModal({ onClose }) {
  const { user } = useAuth();

  const [quantity, setQuantity] = useState("");
  const [timeSlot, setTimeSlot] = useState("Morning (9–12 AM)");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);

  // ✅ Auto calculate amount
  const totalAmount = useMemo(() => {
    const qty = Number(quantity);
    return qty > 0 ? qty * PRICE_PER_CAN : 0;
  }, [quantity]);

  async function handleSubmit() {
    const qty = Number(quantity);

    if (!qty || qty <= 0) {
      alert("Enter a valid quantity");
      return;
    }

    try {
      setLoading(true);

      // 🔹 WALLET LOGIC (uses `balance`)
      if (paymentMethod === "wallet") {
        const customerRef = doc(db, "customers", user.uid);
        const snap = await getDoc(customerRef);

        const walletBalance = Number(snap.data()?.balance || 0);

        if (walletBalance < totalAmount) {
          alert("Insufficient wallet balance");
          setLoading(false);
          return;
        }

        // deduct wallet balance
        await updateDoc(customerRef, {
          balance: walletBalance - totalAmount,
        });
      }

      // 🔹 CREATE ORDER
      await createOrder({
        customerId: user.uid,
        quantity: qty,
        timeSlot,
        total: totalAmount,
        paymentMethod,
        paymentStatus: paymentMethod === "cash" ? "unpaid" : "paid",
        status: "pending",
      });

      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to place order");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">

        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-gray-900">
            Place New Order
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Quantity */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity (Water Cans)
          </label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2"
          />
        </div>

        {/* Amount */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">Amount to Pay</p>
          <p className="text-xl font-bold text-gray-900">
            ₹{totalAmount}
          </p>
        </div>

        {/* Time Slot */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Time Slot
          </label>
          <select
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white"
          >
            <option>Morning (9–12 AM)</option>
            <option>Afternoon (12–3 PM)</option>
            <option>Evening (3–7 PM)</option>
          </select>
        </div>

        {/* Payment Method */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white"
          >
            <option value="cash">Cash on Delivery</option>
            <option value="upi">UPI</option>
            <option value="online">Online</option>
            <option value="wallet">Wallet</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold"
          >
            {loading ? "Placing..." : "Place Order"}
          </button>

          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
