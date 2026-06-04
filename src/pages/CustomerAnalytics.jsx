import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";

// 📊 CHART IMPORTS
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/* helpers */
function toDate(val) {
  if (!val) return null;
  if (val.toDate) return val.toDate();
  return new Date(val);
}

function daysBetween(a, b) {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

function preferredSlot(orders) {
  const map = {};
  orders.forEach(o => {
    if (!o.timeSlot) return;
    map[o.timeSlot] = (map[o.timeSlot] || 0) + 1;
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
}

////////////////////// 🧠 AI //////////////////////

// Prediction
function predictNextOrder(orders) {
  if (!orders.length) return { quantity: 1, trend: "stable" };

  let total = 0;
  orders.forEach(o => total += (o.quantity || 0));

  const avg = total / orders.length;

  let trend = "stable";
  if (orders.length >= 2) {
    const last = orders[orders.length - 1].quantity || 0;
    const prev = orders[orders.length - 2].quantity || 0;

    if (last > prev) trend = "increasing";
    else if (last < prev) trend = "decreasing";
  }

  let predicted = avg;
  if (trend === "increasing") predicted *= 1.15;
  if (trend === "decreasing") predicted *= 0.85;

  return {
    quantity: Math.max(1, Math.round(predicted)),
    trend,
  };
}

// Segmentation
function getCustomerSegment(orders) {
  const totalOrders = orders.length;

  if (totalOrders > 30) return "VIP Customer 🏆";
  if (totalOrders >= 10) return "Regular Customer 🙂";
  if (totalOrders >= 1) return "Occasional Customer 👀";

  return "New Customer";
}

//////////////////////////////////////////////////

export default function CustomerAnalytics() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user?.uid) return;

      const q = query(
        collection(db, "orders"),
        where("customerId", "==", user.uid)
      );

      const snap = await getDocs(q);
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }
    load();
  }, [user?.uid]);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading analytics…</div>;
  }

  const delivered = orders.filter(o => o.status === "delivered");

  // ✅ FIXED LAST ORDER
  const lastOrderDate = orders
    .map(o => toDate(o.createdAt || o.updatedAt))
    .filter(Boolean)
    .sort((a, b) => b - a)[0];

  // 🧠 AI
  const prediction = predictNextOrder(orders);
  const segment = getCustomerSegment(orders);

  // 📊 GROUPED GRAPH (FIXED)
  const groupedData = {};

  orders.forEach(order => {
    const date = toDate(order.createdAt)?.toLocaleDateString();
    if (!date) return;

    if (!groupedData[date]) {
      groupedData[date] = 0;
    }

    groupedData[date] += order.quantity || 0;
  });

  const chartData = {
    labels: Object.keys(groupedData),
    datasets: [
      {
        label: "Cans per Day",
        data: Object.values(groupedData),
        backgroundColor: "rgba(59, 130, 246, 0.6)",
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-4">
      <h1 className="text-2xl font-bold">My Analytics</h1>

      <Stat label="Total Orders" value={orders.length} />
      <Stat label="Orders Delivered" value={delivered.length} />
      <Stat label="Preferred Time Slot" value={preferredSlot(orders)} />
      <Stat
        label="Days Since Last Order"
        value={lastOrderDate ? daysBetween(new Date(), lastOrderDate) : "N/A"}
      />

      {/* 🧠 AI */}
      <div className="bg-white border rounded-xl p-4 space-y-2">
        <h2 className="font-semibold text-gray-800">AI Insights</h2>

        <p>🧠 Suggested Order: <b>{prediction.quantity} cans</b></p>
        <p>📈 Trend: <b>{prediction.trend}</b></p>
        <p>👤 Customer Type: <b>{segment}</b></p>
      </div>

      {/* 📊 GRAPH */}
      <div className="bg-white border rounded-xl p-4">
        <h2 className="font-semibold text-gray-800 mb-3">
          Daily Consumption
        </h2>

        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}