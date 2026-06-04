import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";

// 📊 CHART
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

/* -------- helpers -------- */
function toDate(val) {
  if (!val) return null;
  if (val.toDate) return val.toDate();
  return new Date(val);
}

/* -------- component -------- */
export default function DeliveryAnalytics() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    async function load() {
      if (!user?.uid) return;

      const q = query(
        collection(db, "deliveries"),
        where("deliveryStaffId", "==", user.uid)
      );

      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      setDeliveries(data);

      // 📊 GROUP BY DATE
      const grouped = {};
      data.forEach(d => {
        const date = toDate(d.createdAt || d.updatedAt)?.toLocaleDateString();
        if (!date) return;

        if (!grouped[date]) grouped[date] = 0;
        grouped[date] += 1;
      });

      setChartData({
        labels: Object.keys(grouped),
        datasets: [
          {
            label: "Deliveries per Day",
            data: Object.values(grouped),
            backgroundColor: "rgba(34,197,94,0.6)",
            borderRadius: 6,
          },
        ],
      });

      setLoading(false);
    }

    load();
  }, [user?.uid]);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading analytics…</div>;
  }

  const completed = deliveries.filter(d => d.status === "delivered").length;
  const pending = deliveries.length - completed;

  const rate =
    deliveries.length === 0
      ? 0
      : Math.round((completed / deliveries.length) * 100);

  // 🧠 SIMPLE AI INSIGHT
  let performance = "Average 🙂";
  if (rate >= 80) performance = "Excellent 🚀";
  else if (rate >= 50) performance = "Good 👍";
  else performance = "Needs Improvement ⚠️";

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-4">
      <h1 className="text-2xl font-bold">Delivery Performance</h1>

      {/* STATS */}
      <Stat label="Assigned Deliveries" value={deliveries.length} />
      <Stat label="Completed Deliveries" value={completed} />
      <Stat label="Pending Deliveries" value={pending} />
      <Stat label="Completion Rate" value={`${rate}%`} />

      {/* 🧠 AI INSIGHT */}
      <div className="bg-white border rounded-xl p-4">
        <h2 className="font-semibold text-gray-800 mb-2">
          Performance Insight
        </h2>
        <p>Your delivery performance is: <b>{performance}</b></p>
      </div>

      {/* 📊 GRAPH */}
      {chartData && (
        <div className="bg-white border rounded-xl p-4">
          <h2 className="font-semibold text-gray-800 mb-3">
            Daily Deliveries
          </h2>

          <Bar data={chartData} />
        </div>
      )}
    </div>
  );
}

/* -------- small card -------- */
function Stat({ label, value }) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}