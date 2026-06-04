import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getCustomerOrders } from "../services/orderService";
import {
  getCustomerSubscriptions,
  cancelSubscription,
} from "../services/subscriptionService";
import { generateOrdersFromSubscriptions } from "../services/subscriptionOrderService";
import { db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";

import AddOrderModal from "../components/orders/AddOrderModal";
import AddSubscriptionModal from "../components/subscriptions/AddSubscriptionModal";
import EditSubscriptionModal from "../components/subscriptions/EditSubscriptionModal";
import OrderTracking from "../components/customers/OrderTracking";
import RealtimeNotificationListener from "../components/RealtimeNotificationListener"; // ✅ ADDED
import NotificationDropdown from "../components/notifications/NotificationDropdown";

export default function CustomerDashboard() {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [subscription, setSubscription] = useState(null);

  const [openOrderModal, setOpenOrderModal] = useState(false);
  const [openSubModal, setOpenSubModal] = useState(false);
  const [openEditSubModal, setOpenEditSubModal] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);


  async function loadCustomer() {
    const snap = await getDoc(doc(db, "customers", user.uid));
    if (snap.exists()) {
      setCustomer({ id: snap.id, ...snap.data() });
    }
  }

  async function loadOrders() {
    const data = await getCustomerOrders(user.uid);
    setOrders(data);
  }

  async function loadSubscription() {
    const subs = await getCustomerSubscriptions(user.uid);
    const active = subs.find((s) => s.status === "active");
    setSubscription(active || null);
  }

  useEffect(() => {
    if (!user) return;
    generateOrdersFromSubscriptions();
    loadCustomer();
    loadOrders();
    loadSubscription();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-8">

      {/* ✅ REALTIME NOTIFICATION LISTENER */}
      <RealtimeNotificationListener />

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm">Welcome back</p>
          <h1 className="text-2xl font-bold text-gray-900">
            {customer?.name || user.email}
          </h1>
        </div>

        <div className="relative">
  <button
    onClick={() => setOpenNotif(!openNotif)}
    className="bg-white border border-gray-200 p-3 rounded-full hover:bg-gray-100"
  >
    🔔
  </button>

  <NotificationDropdown
    open={openNotif}
    onClose={() => setOpenNotif(false)}
  />
</div>

      </div>

      {/* ================= QUICK ACTIONS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => setOpenOrderModal(true)}
          className="cursor-pointer bg-blue-600 hover:bg-blue-700 transition p-6 rounded-2xl flex justify-between items-center text-white"
        >
          <div>
            <h3 className="text-lg font-semibold">Order Water</h3>
            <p className="text-sm opacity-90">Place a new order</p>
          </div>
          <span className="text-3xl">💧</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <h3 className="text-gray-600">Wallet Balance</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            ₹{customer?.balance ?? 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <h3 className="text-gray-600">Total Orders</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {orders.length}
          </p>
        </div>
      </div>

      {/* ================= SUBSCRIPTION ================= */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Subscription
          </h2>

          {!subscription && (
            <button
              onClick={() => setOpenSubModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            >
              Subscribe
            </button>
          )}
        </div>

        {subscription ? (
          <div className="space-y-1 text-gray-700">
            <p>Quantity: {subscription.quantity}</p>
            <p className="capitalize">Frequency: {subscription.frequency}</p>
            <p>Time Slot: {subscription.timeSlot}</p>
            <p className="text-green-600 font-semibold">Active</p>

            <div className="flex gap-4 mt-4">
              <button
                className="text-sm text-blue-600 hover:underline"
                onClick={() => setOpenEditSubModal(true)}
              >
                Manage
              </button>

              <button
                className="text-sm text-red-600 hover:underline"
                onClick={async () => {
                  const ok = window.confirm(
                    "Are you sure you want to cancel your subscription?"
                  );
                  if (!ok) return;
                  await cancelSubscription(subscription.id);
                  loadSubscription();
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">
            No active subscription. Enable auto‑delivery.
          </p>
        )}
      </div>

      {/* ================= TRACK ORDER ================= */}
      {orders.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Track Latest Order
          </h2>
          <OrderTracking order={orders[0]} />
        </div>
      )}

      {/* ================= RECENT ORDERS ================= */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Recent Orders
        </h2>

        <div className="space-y-3">
          {orders.slice(0, 3).map((o) => (
            <div
              key={o.id}
              className="bg-white p-5 rounded-2xl border border-gray-200 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-gray-900">
                  Order #{o.id.slice(0, 6)}
                </p>
                <p className="text-sm text-gray-500">
                  Qty: {o.quantity} • {o.timeSlot}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${
                  o.status === "delivered"
                    ? "bg-green-600"
                    : "bg-orange-500"
                }`}
              >
                {o.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ================= MODALS ================= */}
      {openOrderModal && (
        <AddOrderModal
          onClose={() => {
            setOpenOrderModal(false);
            loadOrders();
            loadCustomer();
          }}
        />
      )}

      {openSubModal && (
        <AddSubscriptionModal
          onClose={() => {
            setOpenSubModal(false);
            loadSubscription();
          }}
        />
      )}

      {openEditSubModal && subscription && (
        <EditSubscriptionModal
          subscription={subscription}
          onClose={() => {
            setOpenEditSubModal(false);
            loadSubscription();
          }}
        />
      )}
    </div>
  );
}
