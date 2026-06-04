import { useEffect, useState } from "react";
import { getAllOrders, updateOrderStatus } from "../services/orderService";
import {
  getDeliveryStaff,
  assignDelivery,
} from "../services/deliveryService";

export default function AssignDeliveries() {
  const [orders, setOrders] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState({});

  async function loadData() {
    const ordersData = await getAllOrders();
    const pendingOrders = ordersData.filter(
      (o) => o.status === "pending" || o.status === "accepted"
    );
    setOrders(pendingOrders);

    const staffData = await getDeliveryStaff();
    setStaff(staffData);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAssign(order) {
    const staffId = selectedStaff[order.id];
    if (!staffId) {
      alert("Select delivery staff");
      return;
    }

    try {
      await assignDelivery({
        orderId: order.id,
        customerId: order.customerId,
        staffId,
      });

      await updateOrderStatus(order.id, "out_for_delivery");
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to assign order");
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Assign Orders to Delivery Staff
      </h1>

      {orders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-gray-500">
          🎉 No pending orders
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="bg-white border border-gray-200 rounded-2xl p-5"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    Order #{o.id.slice(0, 6)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Customer: {o.customerId}
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                  {o.status.toUpperCase()}
                </span>
              </div>

              {/* DETAILS */}
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 mb-4">
                <p>
                  <span className="text-gray-500">Quantity:</span>{" "}
                  {o.quantity}
                </p>
                <p>
                  <span className="text-gray-500">Time Slot:</span>{" "}
                  {o.timeSlot}
                </p>
              </div>

              {/* ASSIGN */}
              <div className="flex gap-3">
                <select
                  className="flex-1 border border-gray-300 p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedStaff[o.id] || ""}
                  onChange={(e) =>
                    setSelectedStaff((prev) => ({
                      ...prev,
                      [o.id]: e.target.value,
                    }))
                  }
                >
                  <option value="">Select delivery staff</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleAssign(o)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-xl font-semibold"
                >
                  Assign
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
