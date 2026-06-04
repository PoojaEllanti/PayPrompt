import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { createSubscription } from "../../services/subscriptionService";

export default function AddSubscriptionModal({ onClose }) {
  const { user } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [frequency, setFrequency] = useState("daily");
  const [timeSlot, setTimeSlot] = useState("Morning (9–12 AM)");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!user?.uid) return;

    try {
      setLoading(true);

      await createSubscription({
        customerId: user.uid,
        quantity,
        frequency,
        timeSlot,
      });

      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to create subscription");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-gray-900">
            New Subscription
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
            Quantity (Cans)
          </label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Frequency */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Frequency
          </label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {/* Time Slot */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Time Slot
          </label>
          <select
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option>Morning (9–12 AM)</option>
            <option>Evening (3–7 PM)</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 rounded-lg py-2 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 font-semibold"
          >
            {loading ? "Creating..." : "Create Subscription"}
          </button>
        </div>
      </div>
    </div>
  );
}
