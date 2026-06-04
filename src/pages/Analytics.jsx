import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

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

const PRICE_PER_CAN = 20;

/* ---------------- HELPERS ---------------- */
function daysBetween(a, b) {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

function toDate(val) {
  if (!val) return null;
  if (typeof val === "string") return new Date(val);
  if (val.toDate) return val.toDate();
  return null;
}

/* ---------------- AI LOGIC ---------------- */
function predictPeakSlot(orders) {
  const map = {};
  orders.forEach(o => {
    if (!o.timeSlot) return;
    map[o.timeSlot] = (map[o.timeSlot] || 0) + Number(o.quantity || 0);
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
}

function computeCustomerChurn(customers, orders) {
  const now = new Date();

  return customers.map(c => {
    const custOrders = orders.filter(o => o.customerId === c.id);

    if (custOrders.length === 0) {
      return {
        customerId: c.id,
        name: c.name || "Unknown",
        risk: "High",
        probability: 0.9,
      };
    }

    const lastOrder = custOrders
      .map(o => toDate(o.createdAt || o.updatedAt))
      .filter(Boolean)
      .sort((a, b) => b - a)[0];

    const days = lastOrder ? daysBetween(now, lastOrder) : 999;

    if (days > 60)
      return { customerId: c.id, name: c.name, risk: "High", probability: 0.85 };

    if (days > 30)
      return { customerId: c.id, name: c.name, risk: "Medium", probability: 0.55 };

    return { customerId: c.id, name: c.name, risk: "Low", probability: 0.2 };
  });
}

/* ---------------- COMPONENT ---------------- */
export default function Analytics() {
  const [loading, setLoading] = useState(true);

  const [overview, setOverview] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [trends, setTrends] = useState(null);
  const [churn, setChurn] = useState(null);
  const [customerChurn, setCustomerChurn] = useState([]);
  const [peakSlot, setPeakSlot] = useState(null);

  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const ordersSnap = await getDocs(collection(db, "orders"));
      const customersSnap = await getDocs(collection(db, "customers"));

      const orders = ordersSnap.docs.map(d => ({ ...d.data(), id: d.id }));
      const customers = customersSnap.docs.map(d => ({ ...d.data(), id: d.id }));

      computeOverview(orders);
      computeForecast(orders);
      computeTrends(orders);

      const churnScores = computeCustomerChurn(customers, orders);
      setCustomerChurn(churnScores);

      const highRiskCount = churnScores.filter(c => c.risk === "High").length;

      setChurn({
        churnRisk: customers.length
          ? Math.round((highRiskCount / customers.length) * 100)
          : 0,
      });

      setPeakSlot(
        predictPeakSlot(orders.filter(o => o.status === "delivered"))
      );

      // 📊 GRAPH (DAILY REVENUE)
      const grouped = {};

      orders.forEach(o => {
        const date = toDate(o.createdAt || o.updatedAt)?.toLocaleDateString();
        if (!date) return;

        if (!grouped[date]) grouped[date] = 0;

        grouped[date] += (o.quantity || 0) * PRICE_PER_CAN;
      });

      setChartData({
        labels: Object.keys(grouped),
        datasets: [
          {
            label: "Daily Revenue (₹)",
            data: Object.values(grouped),
            backgroundColor: "rgba(59,130,246,0.6)",
            borderRadius: 6,
          },
        ],
      });

      setLoading(false);
    }

    load();
  }, []);

  /* ---------------- METRICS ---------------- */
  function computeOverview(orders) {
    const delivered = orders.filter(o => o.status === "delivered");

    const totalCans = delivered.reduce(
      (s, o) => s + Number(o.quantity || 0),
      0
    );

    const revenue = totalCans * PRICE_PER_CAN;

    setOverview({
      totalOrders: orders.length,
      totalRevenue: revenue,
      avgOrderValue: delivered.length
        ? revenue / delivered.length
        : 0,
    });
  }

  function computeForecast(orders) {
    const now = new Date();
    const delivered = orders.filter(o => o.status === "delivered");

    let lastWeek = 0;
    let prevWeek = 0;

    delivered.forEach(o => {
      const dt = toDate(o.createdAt || o.updatedAt);
      if (!dt) return;

      const days = daysBetween(now, dt);
      if (days <= 6) lastWeek += Number(o.quantity || 0);
      else if (days <= 13) prevWeek += Number(o.quantity || 0);
    });

    const growth = prevWeek ? (lastWeek - prevWeek) / prevWeek : 0;

    setForecast({
      predictedOrders: Math.round(lastWeek * (1 + growth)),
      confidence:
        lastWeek + prevWeek >= 20 ? "High" :
        lastWeek + prevWeek >= 10 ? "Medium" : "Low",
    });
  }

  function computeTrends(orders) {
    const now = new Date();
    const delivered = orders.filter(o => o.status === "delivered");

    let recent = 0;
    let older = 0;

    delivered.forEach(o => {
      const dt = toDate(o.createdAt || o.updatedAt);
      if (!dt) return;

      const days = daysBetween(now, dt);
      if (days <= 6) recent += Number(o.quantity || 0);
      else if (days <= 13) older += Number(o.quantity || 0);
    });

    const trend = older ? ((recent - older) / older) * 100 : 0;

    setTrends({
      revenueTrend: trend,
      direction: trend >= 0 ? "Upward 📈" : "Downward 📉",
    });
  }

  /* ---------------- UI ---------------- */
  if (loading || !overview || !forecast || !trends || !churn) {
    return <div className="p-6 text-gray-500">Loading analytics...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-6">
      <h1 className="text-2xl font-bold">Admin Analytics</h1>

      {/* OVERVIEW */}
      <div className="grid md:grid-cols-3 gap-4">
        <Stat label="Total Revenue" value={`₹${overview.totalRevenue}`} />
        <Stat label="Total Orders" value={overview.totalOrders} />
        <Stat label="Avg Order Value" value={`₹${overview.avgOrderValue.toFixed(0)}`} />
      </div>

      {/* FORECAST */}
      <div className="grid md:grid-cols-2 gap-4">
        <Stat label="Predicted Cans (Next Week)" value={forecast.predictedOrders} />
        <Stat label="Peak Delivery Slot" value={peakSlot} />
      </div>

      {/* TRENDS */}
      <div className="grid md:grid-cols-2 gap-4">
        <Stat
          label="Revenue Trend"
          value={`${trends.direction} (${trends.revenueTrend.toFixed(1)}%)`}
        />
        <Stat label="Churn Risk" value={`${churn.churnRisk}% high-risk users`} />
      </div>

      {/* 📊 GRAPH */}
      {chartData && (
        <div className="bg-white border rounded-2xl p-4">
          <h2 className="font-semibold mb-3">Daily Revenue Trend</h2>
          <Bar data={chartData} />
        </div>
      )}

      {/* CUSTOMER CHURN */}
      <div className="bg-white border rounded-2xl p-4">
        <h2 className="font-semibold mb-3">Customer Churn Risk</h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th>Customer</th>
              <th>Probability</th>
              <th>Risk</th>
            </tr>
          </thead>

          <tbody>
            {customerChurn.map(c => (
              <tr key={c.customerId} className="border-b">
                <td className="py-2 font-medium">{c.name}</td>
                <td>{Math.round(c.probability * 100)}%</td>
                <td className={
                  c.risk === "High"
                    ? "text-red-600 font-semibold"
                    : c.risk === "Medium"
                    ? "text-yellow-500 font-semibold"
                    : "text-green-600 font-semibold"
                }>
                  {c.risk}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- CARD ---------------- */
function Stat({ label, value }) {
  return (
    <div className="bg-white border rounded-2xl p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}