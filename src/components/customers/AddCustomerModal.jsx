import { useState } from "react";
import { saveCustomer } from "../../services/customerService";


export default function AddCustomerModal({ isOpen, onClose }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("");

  if (!isOpen) return null;

  async function handleAdd() {
    const uid = crypto.randomUUID(); // simple ID for customers

    await saveCustomer(uid, {
      name,
      phone,
      address,
      balance: Number(balance),
      totalOrders: 0,
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-slate-900 p-5 rounded-xl w-80 text-white">

        <h2 className="text-xl font-semibold mb-4">Add Customer</h2>

        <input className="w-full mb-3 p-2 bg-slate-800 rounded" placeholder="Name"
          value={name} onChange={(e) => setName(e.target.value)} />

        <input className="w-full mb-3 p-2 bg-slate-800 rounded" placeholder="Phone"
          value={phone} onChange={(e) => setPhone(e.target.value)} />

        <input className="w-full mb-3 p-2 bg-slate-800 rounded" placeholder="Address"
          value={address} onChange={(e) => setAddress(e.target.value)} />

        <input className="w-full mb-3 p-2 bg-slate-800 rounded" placeholder="Starting Balance"
          value={balance} onChange={(e) => setBalance(e.target.value)} />

        <button
          className="w-full bg-green-600 p-2 rounded"
          onClick={handleAdd}
        >
          Add
        </button>

      </div>
    </div>
  );
}
