import {
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";

import { db } from "../config/firebase";

const customersRef = collection(db, "customers");
const ordersRef = collection(db, "orders");

// ADMIN DASHBOARD METRICS
export async function getDashboardStats() {
  // customers
  const customerSnap = await getDocs(customersRef);
  const customers = customerSnap.docs.length;

  // total orders
  const orderSnap = await getDocs(ordersRef);
  const orders = orderSnap.docs.map(d => d.data());
  const totalOrders = orders.length;

  // today's revenue
  const today = new Date().toISOString().split("T")[0];

  const todaysRevenue = orders
    .filter(o => o.timestamp.startsWith(today))
    .reduce((sum, o) => sum + o.total, 0);

  // pending orders
  const pending = orders.filter(o => o.status === "pending").length;

  return {
    customers,
    totalOrders,
    todaysRevenue,
    pending
  };
}
