import { cancelOrder } from "../../services/orderService";
import EditOrderModal from "./EditOrderModal";
import { useState } from "react";

export default function OrderCard({ order }) {
  const [openEdit, setOpenEdit] = useState(false);

  return (
    <div className="bg-slate-800 p-4 rounded-xl text-white">

      <p className="text-lg font-semibold">Qty: {order.quantity}</p>
      <p className="text-sm text-slate-300">Time Slot: {order.timeSlot}</p>
      <p className="text-sm text-slate-400 capitalize">Status: {order.status}</p>

      {/* Buttons only if pending */}
      {order.status === "pending" && (
        <div className="flex gap-3 mt-3">

          <button
            className="bg-blue-600 p-2 rounded w-1/2"
            onClick={() => setOpenEdit(true)}
          >
            Edit
          </button>

          <button
            className="bg-red-600 p-2 rounded w-1/2"
            onClick={() => cancelOrder(order.id)}
          >
            Cancel
          </button>

        </div>
      )}

      {/* Edit Modal */}
      {openEdit && (
        <EditOrderModal
          order={order}
          onClose={() => setOpenEdit(false)}
        />
      )}
    </div>
  );
}
