import {
  collection,
  getDocs
} from "firebase/firestore";

import { db } from "../config/firebase";

const ordersRef = collection(db, "orders");
const customersRef = collection(db, "customers");

// -------------------------------------------
// SEGMENTATION
// -------------------------------------------
export async function getCustomerSegments() {
  const customers = await getDocs(customersRef);
  const orders = await getDocs(ordersRef);

  const orderData = orders.docs.map(d => ({ id: d.id, ...d.data() }));
  const customerData = customers.docs.map(d => ({ id: d.id, ...d.data() }));

  const segments = {
    VIP: [],
    Regular: [],
    Occasional: [],
    Inactive: [],
    AtRisk: [],
  };

  const now = new Date();

  for (const c of customerData) {
    const userOrders = orderData.filter(o => o.customerId === c.id);
    const totalOrders = userOrders.length;
    const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);

    let lastOrderDate = null;
    if (userOrders.length > 0) {
      lastOrderDate = new Date(userOrders[0].timestamp);
    }

    const inactiveDays =
      lastOrderDate ? (now - lastOrderDate) / (1000 * 60 * 60 * 24) : 999;

    if (totalOrders >= 10 && totalSpent >= 100) segments.VIP.push(c);
    else if (totalOrders >= 5 && inactiveDays <= 30) segments.Regular.push(c);
    else if (totalOrders > 0) segments.Occasional.push(c);
    else segments.Inactive.push(c);

    if (c.balance < 0) segments.AtRisk.push(c);
  }

  return segments;
}

// -------------------------------------------
// SALES FORECASTING (simple growth model)
// -------------------------------------------
export async function getSalesForecast() {
  const snap = await getDocs(ordersRef);
  const data = snap.docs.map(d => d.data());

  const grouped = {};

  data.forEach(order => {
    const date = order.timestamp.split("T")[0];
    if (!grouped[date]) grouped[date] = 0;
    grouped[date] += order.total;
  });

  const sortedDates = Object.keys(grouped).sort();
  const values = sortedDates.map(d => grouped[d]);

  if (values.length < 2) {
    return {
      predictedRevenue: 0,
      growthRate: 0,
      confidence: "low"
    };
  }

  const last = values[values.length - 1];
  const prev = values[values.length - 2];

  const growth = (last - prev) / prev;
  const prediction = last * (1 + growth);

  return {
    predictedRevenue: Math.round(prediction),
    growthRate: growth,
    confidence: "medium"
  };
}
