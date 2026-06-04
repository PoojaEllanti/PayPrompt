// src/analytics/demandForecast.js

function getDayKey(date) {
  return date.toISOString().slice(0, 10);
}

function mean(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function forecastDemand(orders) {
  const dailyStats = {};

  // -----------------------------
  // 1. Aggregate historical data
  // -----------------------------
  orders.forEach((o) => {
    if (o.status !== "delivered") return;
    if (!o.createdAt) return;

    const date = o.createdAt.toDate
      ? o.createdAt.toDate()
      : new Date(o.createdAt);

    const key = getDayKey(date);

    if (!dailyStats[key]) {
      dailyStats[key] = { orders: 0, quantity: 0 };
    }

    dailyStats[key].orders += 1;
    dailyStats[key].quantity += Number(o.quantity || 0);
  });

  const days = Object.keys(dailyStats).sort();

  if (days.length < 3) {
    return {
      predictedOrders: 0,
      predictedCans: 0,
      confidence: "Low",
    };
  }

  // -----------------------------
  // 2. Moving averages
  // -----------------------------
  const last7 = days.slice(-7).map((d) => dailyStats[d]);
  const last3 = days.slice(-3).map((d) => dailyStats[d]);

  const avgOrders7 = mean(last7.map((d) => d.orders));
  const avgOrders3 = mean(last3.map((d) => d.orders));

  const avgQty7 = mean(last7.map((d) => d.quantity));
  const avgQty3 = mean(last3.map((d) => d.quantity));

  // -----------------------------
  // 3. Trend weighting
  // -----------------------------
  const predictedOrders = Math.round(
    avgOrders3 * 0.6 + avgOrders7 * 0.4
  );

  const predictedCans = Math.round(
    avgQty3 * 0.6 + avgQty7 * 0.4
  );

  // -----------------------------
  // 4. Confidence score
  // -----------------------------
  let confidence = "Low";
  if (days.length >= 14) confidence = "High";
  else if (days.length >= 7) confidence = "Medium";

  return {
    predictedOrders,
    predictedCans,
    confidence,
  };
}
