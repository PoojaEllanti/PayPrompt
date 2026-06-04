import { useState } from "react";
import { updateOrder } from "../../services/orderService";

export default function EditOrderModal({ order, onClose }) {
  const [qty, setQty] = useState(order.quantity);
  const [slot, setSlot] = useState(order.timeSlot);

  async function handleUpdate() {
    await updateOrder(order.id, {
      quantity: Number(qty),
      timeSlot: slot,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-slate-900 p-5 rounded-xl w-80 text-white">

        <h2 className="text-xl font-semibold mb-4">Edit Order</h2>

        <input
          type="number"
          className="w-full p-2 bg-slate-800 rounded mb-4"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />

        <select
          className="w-full p-2 bg-slate-800 rounded mb-4"
          value={slot}
          onChange={(e) => setSlot(e.target.value)}
        >
          <option>Morning (8–11 AM)</option>
          <option>Afternoon (12–3 PM)</option>
          <option>Evening (4–7 PM)</option>
        </select>

        <div className="flex gap-3">
          <button className="bg-slate-700 p-2 rounded w-1/2" onClick={onClose}>
            Close
          </button>
          <button className="bg-green-600 p-2 rounded w-1/2" onClick={handleUpdate}>
            Save
          </button>
        </div>

      </div>
    </div>
  );
}
