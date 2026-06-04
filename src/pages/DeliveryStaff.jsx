import { useEffect, useState } from "react";
import {
  addDeliveryStaff,
  getDeliveryStaff,
} from "../services/deliveryService";

export default function DeliveryStaff() {
  const [staff, setStaff] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadStaff() {
    const data = await getDeliveryStaff();
    setStaff(data);
  }

  useEffect(() => {
    loadStaff();
  }, []);

  async function handleAdd() {
    if (!name || !phone) {
      alert("Enter name and phone");
      return;
    }

    try {
      setLoading(true);
      await addDeliveryStaff({ name, phone });
      setName("");
      setPhone("");
      loadStaff();
    } catch (err) {
      console.error(err);
      alert("Failed to add delivery staff");
    } finally {
      setLoading(false);
    }
  }

  return (
  <div className="min-h-screen bg-gray-50 p-8">

    {/* PAGE TITLE */}
    <h1 className="text-2xl font-bold text-gray-900 mb-6">
      Delivery Personnel
    </h1>

    {/* MAIN GRID */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

      {/* ================= LEFT : ADD STAFF ================= */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Add Delivery Staff
        </h2>

        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleAdd}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
        >
          {loading ? "Adding..." : "Add Staff"}
        </button>
      </div>

      {/* ================= RIGHT : ACTIVE STAFF ================= */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Active Staff
        </h2>

        {staff.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-gray-500">
            No delivery staff added yet
          </div>
        ) : (
          <div className="space-y-4">
            {staff.map((s) => (
              <div
                key={s.id}
                className="bg-white border border-gray-200 rounded-xl p-5"
              >
                <p className="font-semibold text-gray-900">
                  {s.name}
                </p>

                <p className="text-sm text-gray-600">
                  📞 {s.phone}
                </p>

                <p className="text-xs font-semibold text-green-600 mt-1">
                  Active
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  </div>
);

}
