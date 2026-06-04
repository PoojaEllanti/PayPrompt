import { useState } from "react";
import { updateCustomer } from "../../services/customerService";

export default function EditCustomerModal({ customer, onClose }) {
  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone);
  const [address, setAddress] = useState(customer.address);
  const [balance, setBalance] = useState(customer.balance);

  async function handleUpdate() {
    await updateCustomer(customer.id, {
      name,
      phone,
      address,
      balance: Number(balance),
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-slate-900 p-5 rounded-xl w-80 text-white">

        <h2 className="text-xl font-semibold mb-4">Edit Customer</h2>

        <input
          className="w-full mb-3 p-2 bg-slate-800 rounded"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full mb-3 p-2 bg-slate-800 rounded"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          className="w-full mb-3 p-2 bg-slate-800 rounded"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <input
          className="w-full mb-3 p-2 bg-slate-800 rounded"
          placeholder="Balance"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
        />

        <div className="flex gap-3">
          <button
            className="bg-slate-700 p-2 rounded w-1/2"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="bg-green-600 p-2 rounded w-1/2"
            onClick={handleUpdate}
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
}
