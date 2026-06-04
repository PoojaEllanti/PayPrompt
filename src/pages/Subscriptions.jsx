import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getCustomerSubscriptions,
  updateSubscriptionStatus,
} from "../services/subscriptionService";

import AddSubscriptionModal from "../components/subscriptions/AddSubscriptionModal";
import EditSubscriptionModal from "../components/subscriptions/EditSubscriptionModal";

export default function Subscriptions() {
  const { user } = useAuth();

  const [subs, setSubs] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);

  async function load() {
    if (!user?.uid) return;
    const data = await getCustomerSubscriptions(user.uid);
    setSubs(data);
  }

  useEffect(() => {
    load();
  }, [user]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          My Subscriptions
        </h1>

        <button
          onClick={() => setOpenAdd(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
        >
          + Add Subscription
        </button>
      </div>

      {/* Empty State */}
      {subs.length === 0 && (
        <p className="text-gray-500">
          You don’t have any subscriptions yet.
        </p>
      )}

      {/* Subscription Cards */}
      {subs.map((sub) => (
        <div
          key={sub.id}
          className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-900">
                Quantity: {sub.quantity}
              </p>
              <p className="text-sm text-gray-600">
                Frequency: {sub.frequency}
              </p>
              <p className="text-sm text-gray-600">
                Time Slot: {sub.timeSlot}
              </p>

              <p
                className={`text-sm font-medium mt-1 ${
                  sub.status === "active"
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                Status: {sub.status}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setSelectedSub(sub);
                  setOpenEdit(true);
                }}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                Manage
              </button>

              {sub.status === "active" && (
                <button
                  onClick={async () => {
                    await updateSubscriptionStatus(sub.id, "paused");
                    load();
                  }}
                  className="text-yellow-600 text-sm font-medium hover:underline"
                >
                  Pause
                </button>
              )}

              {sub.status === "paused" && (
                <button
                  onClick={async () => {
                    await updateSubscriptionStatus(sub.id, "active");
                    load();
                  }}
                  className="text-green-600 text-sm font-medium hover:underline"
                >
                  Resume
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Modals */}
      {openAdd && (
        <AddSubscriptionModal
          onClose={() => {
            setOpenAdd(false);
            load();
          }}
        />
      )}

      {openEdit && selectedSub && (
        <EditSubscriptionModal
          subscription={selectedSub}
          onClose={() => {
            setOpenEdit(false);
            setSelectedSub(null);
            load(); // 🔥 reflects updated quantity
          }}
        />
      )}
    </div>
  );
}
