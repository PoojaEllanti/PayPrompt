import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";

export default function DeliveryAccount() {
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // edit form state
  const [phone, setPhone] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [status, setStatus] = useState("active");

  const ref = doc(db, "delivery_staff", user.uid);

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    async function load() {
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setProfile(snap.data());
      } else {
        // create empty profile if missing
        await setDoc(ref, {
          email: user.email,
          status: "active",
        });
        setProfile({ email: user.email, status: "active" });
      }

      setLoading(false);
    }

    load();
  }, [user.uid]);

  /* ================= SAVE ================= */
  async function save() {
    await updateDoc(ref, {
      phone,
      vehicleType,
      vehicleNumber,
      status,
    });

    // refresh displayed profile
    setProfile(prev => ({
      ...prev,
      phone,
      vehicleType,
      vehicleNumber,
      status,
    }));

    // clear inputs ✅
    setPhone("");
    setVehicleType("");
    setVehicleNumber("");
    setStatus("active");
  }

  if (loading || !profile) {
    return <div className="p-6 text-gray-500">Loading account...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">My Account</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* ================= LEFT : PROFILE ================= */}
        <div className="bg-white border rounded-2xl p-6 space-y-4">
          <div>
            <p className="text-xs text-gray-500">ROLE</p>
            <p className="font-semibold">Delivery Staff</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">EMAIL</p>
            <p className="font-medium">{profile.email}</p>
          </div>

          {/* ✅ SAVED DETAILS BOXES */}
          {profile.phone && (
            <Info label="Phone" value={profile.phone} />
          )}
          {profile.vehicleType && (
            <Info label="Vehicle Type" value={profile.vehicleType} />
          )}
          {profile.vehicleNumber && (
            <Info label="Vehicle Number" value={profile.vehicleNumber} />
          )}
          {profile.status && (
            <Info label="Status" value={profile.status} />
          )}

          <button
            onClick={logout}
            className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
          >
            Logout
          </button>
        </div>

        {/* ================= RIGHT : EDIT FORM ================= */}
        <div className="bg-white border rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">🚚 Vehicle Details</h2>

          <Input
            label="Phone Number"
            value={phone}
            onChange={setPhone}
          />

          <Input
            label="Vehicle Type"
            value={vehicleType}
            onChange={setVehicleType}
            placeholder="Bike / Van"
          />

          <Input
            label="Vehicle Number"
            value={vehicleNumber}
            onChange={setVehicleNumber}
            placeholder="TN01AB1234"
          />

          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="w-full border rounded-lg p-2"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            onClick={save}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

function Info({ label, value }) {
  return (
    <div className="border rounded-lg p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }) {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <input
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="w-full border rounded-lg p-2"
      />
    </div>
  );
}
