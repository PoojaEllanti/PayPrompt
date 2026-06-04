import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function Account() {
  const { user } = useAuth();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  // input states
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [addAmount, setAddAmount] = useState("200");

  const [savingProfile, setSavingProfile] = useState(false);
  const [addingBalance, setAddingBalance] = useState(false);
  const [message, setMessage] = useState("");

  // ================= LOAD CUSTOMER =================
  useEffect(() => {
    if (!user) return;

    async function loadCustomer() {
      try {
        setLoading(true);
        const snap = await getDoc(doc(db, "customers", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setCustomer(data);
          setPhone("");
          setAddress("");
        }
      } catch (err) {
        console.error(err);
        setMessage("Failed to load account");
      } finally {
        setLoading(false);
      }
    }

    loadCustomer();
  }, [user]);

  // ================= SAVE PROFILE =================
  async function handleSaveProfile() {
    try {
      setSavingProfile(true);
      setMessage("");

      await updateDoc(doc(db, "customers", user.uid), {
        phone,
        address,
      });

      // update saved data
      setCustomer((prev) => ({
        ...prev,
        phone,
        address,
      }));

      // clear input boxes
      setPhone("");
      setAddress("");

      setMessage("Profile updated successfully ✅");
    } catch (err) {
      console.error(err);
      setMessage("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  }

  // ================= ADD BALANCE =================
  async function handleAddBalance() {
    const amt = Number(addAmount || 0);
    if (!amt || amt <= 0) {
      alert("Enter a valid amount");
      return;
    }

    try {
      setAddingBalance(true);
      setMessage("");

      const newBalance = (customer.balance || 0) + amt;

      await updateDoc(doc(db, "customers", user.uid), {
        balance: newBalance,
      });

      setCustomer((prev) => ({
        ...prev,
        balance: newBalance,
      }));

      setAddAmount("");
      setMessage(`₹${amt} added to wallet`);
    } catch (err) {
      console.error(err);
      setMessage("Failed to add balance");
    } finally {
      setAddingBalance(false);
    }
  }

  // ================= GUARD =================
  if (!user || loading || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
        Loading account...
      </div>
    );
  }

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
          <p className="text-sm text-gray-500">Manage profile & wallet</p>
        </div>
        <p className="text-sm font-mono text-gray-400">
          {user.uid.slice(0, 8)}…
        </p>
      </div>

      {/* MESSAGE */}
      {message && (
        <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-xl text-sm">
          {message}
        </div>
      )}

      {/* ACCOUNT + WALLET */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* ACCOUNT CARD */}
        <div className="bg-white border rounded-2xl p-6 space-y-1">
          <p className="text-sm text-gray-500">Account</p>

          <p className="text-lg font-semibold text-gray-900">
            {customer.name || "Customer"}
          </p>

          <p className="text-sm text-gray-600">
            {customer.email || user.email}
          </p>

          {(phone || customer.phone) && (
            <p className="text-sm text-gray-700">
              📞 {phone || customer.phone}
            </p>
          )}

          {(address || customer.address) && (
            <p className="text-sm text-gray-700">
              📍 {address || customer.address}
            </p>
          )}
        </div>

        {/* WALLET CARD */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6">
          <p className="text-sm opacity-90">Wallet Balance</p>
          <p className="text-3xl font-bold">
            ₹{Number(customer.balance || 0).toFixed(2)}
          </p>

          <input
            className="mt-4 w-full rounded-xl px-3 py-2 bg-white text-gray-900"
            value={addAmount}
            onChange={(e) => setAddAmount(e.target.value)}
            placeholder="Enter amount"
          />

          <button
            onClick={handleAddBalance}
            disabled={addingBalance}
            className="mt-3 bg-white text-blue-700 font-semibold px-4 py-2 rounded-xl"
          >
            {addingBalance ? "Adding..." : "Add Balance"}
          </button>

          <p className="text-xs opacity-80 mt-2">
            Dummy wallet for testing
          </p>
        </div>
      </div>

      {/* EDIT PROFILE */}
      <div className="bg-white border rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Personal Details</h2>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Phone Number
            </label>
            <input
              className="w-full border rounded-xl px-3 py-2 bg-white text-gray-900"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Address
            </label>
            <textarea
              className="w-full border rounded-xl px-3 py-2 bg-white text-gray-900"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address"
            />
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={savingProfile || (!phone && !address)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl disabled:opacity-50"
        >
          {savingProfile ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
