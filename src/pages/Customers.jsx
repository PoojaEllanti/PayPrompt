import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [subscriptions, setSubscriptions] = useState({});

  async function loadData() {
    const custSnap = await getDocs(collection(db, "customers"));
    const custData = custSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    setCustomers(custData);

    const subSnap = await getDocs(collection(db, "subscriptions"));
    const subMap = {};

    subSnap.docs.forEach((d) => {
      const sub = d.data();
      if (sub.status === "active") {
        subMap[sub.customerId] = sub;
      }
    });

    setSubscriptions(subMap);
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Customers
      </h1>

      <div className="space-y-4">
        {customers.map((customer) => {
          const sub = subscriptions[customer.id];

          return (
            <div
              key={customer.id}
              className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5"
            >
              {/* BASIC INFO */}
              <p className="font-semibold text-gray-900">
                {customer.name || customer.email}
              </p>

              <p className="text-sm text-gray-500 break-all">
                Customer ID: {customer.id}
              </p>

              <div className="mt-2 text-sm text-gray-700 space-y-1">
                <p>Total Orders: {customer.totalOrders || 0}</p>
                <p>Balance: ₹{customer.balance || 0}</p>
              </div>

              {/* SUBSCRIPTION INFO */}
              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-3 md:p-4">
                <p className="font-semibold text-gray-800 mb-1">
                  Subscription
                </p>

                {sub ? (
                  <>
                    <p className="text-emerald-600 font-semibold">
                      Active
                    </p>
                    <p className="text-sm text-gray-700">
                      Frequency: {sub.frequency}
                    </p>
                    <p className="text-sm text-gray-700">
                      Quantity: {sub.quantity}
                    </p>
                    <p className="text-sm text-gray-700">
                      Time Slot: {sub.timeSlot}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">
                    No active subscription
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
