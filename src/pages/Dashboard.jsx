import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useNavigate } from "react-router-dom";

const PRICE_PER_CAN = 20;

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function loadStats() {
    setLoading(true);

    /* ---------------- CUSTOMERS ---------------- */
    const customersSnap = await getDocs(collection(db, "customers"));
    const customerCount = customersSnap.size;

    /* ---------------- ORDERS ---------------- */
    const ordersSnap = await getDocs(collection(db, "orders"));
    const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    /* ---------------- TODAY FILTER ---------------- */
    const todayStr = new Date().toISOString().slice(0, 10);

    const isToday = (o) => {
      if (!o.createdAt) return false;
      const date = o.createdAt.toDate
        ? o.createdAt.toDate().toISOString()
        : o.createdAt;
      return date.startsWith(todayStr);
    };

    const todaysOrders = orders.filter(isToday);

    /* ---------------- TODAY STATUS COUNTS ---------------- */
    const todaysPending = todaysOrders.filter(
      o =>
        o.status === "pending" ||
        o.status === "accepted" ||
        o.status === "out_for_delivery"
    );

    const todaysDelivered = todaysOrders.filter(
      o => o.status === "delivered"
    );

    const todaysCancelled = todaysOrders.filter(
      o => o.status === "cancelled"
    );

    /* ---------------- TODAY REVENUE ---------------- */
    const todaysCans = todaysDelivered.reduce(
      (sum, o) => sum + Number(o.quantity || 0),
      0
    );

    const todaysRevenue = todaysCans * PRICE_PER_CAN;

    /* ---------------- ALL TIME REVENUE ---------------- */
    const deliveredOrders = orders.filter(o => o.status === "delivered");

    const totalCans = deliveredOrders.reduce(
      (sum, o) => sum + Number(o.quantity || 0),
      0
    );

    const totalRevenue = totalCans * PRICE_PER_CAN;

    /* ---------------- INVENTORY ---------------- */
    let filledCans = 0;
    let emptyCans = 0;
    let lowStock = false;

    const invSnap = await getDoc(doc(db, "inventory", "main"));
    if (invSnap.exists()) {
      const inv = invSnap.data();
      filledCans = inv.filledCans || 0;
      emptyCans = inv.emptyCans || 0;
      lowStock = filledCans < 10;
    }

    setStats({
      customerCount,
      todaysOrders: todaysOrders.length,
      todaysRevenue,
      todaysPending: todaysPending.length,
      todaysDelivered: todaysDelivered.length,
      todaysCancelled: todaysCancelled.length,
      totalRevenue,
      filledCans,
      emptyCans,
      lowStock,
    });

    setLoading(false);
  }

  useEffect(() => {
    loadStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">
            Business overview & real-time operations
          </p>
        </div>

        <button
          onClick={loadStats}
          className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm"
        >
          Refresh
        </button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Customers"
          value={stats.customerCount}
          onClick={() => navigate("/customers")}
        />

        <StatCard
          title="Today’s Orders"
          value={stats.todaysOrders}
          sub={`₹${stats.todaysRevenue} revenue today`}
          onClick={() => navigate("/orders")}
        />

        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue}`}
          onClick={() => navigate("/analytics")}
        />

        <div
          onClick={() => navigate("/inventory")}
          className="bg-white border rounded-2xl p-4 cursor-pointer hover:shadow-sm"
        >
          <p className="text-xs uppercase text-gray-500">Inventory</p>
          <p className="font-semibold">
            Filled: {stats.filledCans} | Empty: {stats.emptyCans}
          </p>
          <p
            className={`text-xs mt-1 ${
              stats.lowStock ? "text-red-500" : "text-green-600"
            }`}
          >
            {stats.lowStock
              ? "Low filled stock – refill needed"
              : "Inventory healthy"}
          </p>
        </div>
      </div>

      {/* TODAY’S ORDER STATUS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusCard
          title="Pending / In Progress (Today)"
          value={stats.todaysPending}
          color="text-orange-500"
          onClick={() => navigate("/orders")}
        />

        <StatusCard
          title="Delivered (Today)"
          value={stats.todaysDelivered}
          color="text-green-600"
          onClick={() => navigate("/orders")}
        />

        <StatusCard
          title="Cancelled (Today)"
          value={stats.todaysCancelled}
          color="text-red-500"
          onClick={() => navigate("/orders")}
        />
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white border rounded-2xl p-4">
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>

        <div className="flex flex-wrap gap-3">
          <ActionBtn label="Go to Orders" onClick={() => navigate("/orders")} />
          <ActionBtn label="Manage Customers" onClick={() => navigate("/customers")} />
          <ActionBtn label="Update Inventory" onClick={() => navigate("/inventory")} />
          <ActionBtn label="View Analytics" onClick={() => navigate("/analytics")} />
          <ActionBtn
            label="Delivery Staff"
            onClick={() => navigate("/admin/delivery-staff")}
          />
          <ActionBtn
            label="Assign Deliveries"
            onClick={() => navigate("/admin/assign-deliveries")}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- UI helpers ---------- */

function StatCard({ title, value, sub, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border rounded-2xl p-4 cursor-pointer hover:shadow-sm"
    >
      <p className="text-xs uppercase text-gray-500">{title}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

function StatusCard({ title, value, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border rounded-2xl p-4 cursor-pointer hover:shadow-sm"
    >
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className={`text-3xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

function ActionBtn({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm"
    >
      {label}
    </button>
  );
}
