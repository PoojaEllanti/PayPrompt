// src/pages/Inventory.jsx

import { useEffect, useState } from "react";
import {
  addStock,
  increaseEmptyStock,
  exchangeCans,
  getInventory,
  getInventoryHistory,
} from "../services/inventoryService";

export default function Inventory() {
  const [inv, setInv] = useState(null);
  const [history, setHistory] = useState([]);

  const [filled, setFilled] = useState("");
  const [addEmpty, setAddEmpty] = useState("");
  const [returnEmpty, setReturnEmpty] = useState("");
  const [exchange, setExchange] = useState("");

  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      setInv(await getInventory());
      setHistory(await getInventoryHistory());
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading || !inv) {
    return (
      <div className="flex justify-center pt-20 text-gray-500">
        Loading inventory...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border">
          <p className="text-gray-500 text-sm">Filled Cans</p>
          <p className="text-2xl font-semibold text-gray-900">
            {inv.filledCans ?? 0}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border">
          <p className="text-gray-500 text-sm">Empty Cans</p>
          <p className="text-2xl font-semibold text-gray-900">
            {inv.emptyCans ?? 0}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border">
          <p className="text-gray-500 text-sm">Total Cans</p>
          <p className="text-2xl font-semibold text-gray-900">
            {inv.totalCans ?? 0}
          </p>
        </div>
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3">

        {/* Add Stock */}
        <div className="bg-white p-6 rounded-2xl border space-y-3">
          <h3 className="font-semibold text-gray-900">Add Stock</h3>

          <input
            type="number"
            placeholder="Filled"
            className="w-full p-3 border rounded-lg"
            value={filled}
            onChange={(e) => setFilled(e.target.value)}
          />

          <input
            type="number"
            placeholder="Empty"
            className="w-full p-3 border rounded-lg"
            value={addEmpty}
            onChange={(e) => setAddEmpty(e.target.value)}
          />

          <button
            onClick={async () => {
              await addStock(Number(filled || 0), Number(addEmpty || 0));
              setFilled("");
              setAddEmpty("");
              load();
            }}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-lg font-semibold"
          >
            Add Stock
          </button>
        </div>

        {/* Return Empty */}
        <div className="bg-white p-6 rounded-2xl border space-y-3">
          <h3 className="font-semibold text-gray-900">Return Empty</h3>

          <input
            type="number"
            placeholder="Quantity"
            className="w-full p-3 border rounded-lg"
            value={returnEmpty}
            onChange={(e) => setReturnEmpty(e.target.value)}
          />

          <button
            onClick={async () => {
              await increaseEmptyStock(Number(returnEmpty || 0), "Returned");
              setReturnEmpty("");
              load();
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold"
          >
            Return
          </button>
        </div>

        {/* Exchange */}
        <div className="bg-white p-6 rounded-2xl border space-y-3">
          <h3 className="font-semibold text-gray-900">
            Exchange (Empty → Filled)
          </h3>

          <input
            type="number"
            placeholder="Quantity"
            className="w-full p-3 border rounded-lg"
            value={exchange}
            onChange={(e) => setExchange(e.target.value)}
          />

          <button
            onClick={async () => {
              await exchangeCans(Number(exchange || 0));
              setExchange("");
              load();
            }}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-lg font-semibold"
          >
            Exchange
          </button>
        </div>
      </div>

      {/* ================= HISTORY ================= */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Inventory History
        </h2>

        {history.length === 0 ? (
          <p className="text-gray-500 text-sm">No inventory history yet.</p>
        ) : (
          <div className="space-y-3">
            {history.map((h) => (
              <div
                key={h.id}
                className="bg-white p-4 rounded-2xl border"
              >
                <p className="font-semibold text-gray-900">{h.action}</p>
                <p className="text-sm text-gray-600">Qty: {h.quantity}</p>
                <p className="text-xs text-gray-400">
                  {h.timestamp
                    ? new Date(h.timestamp).toLocaleString()
                    : "No timestamp"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
