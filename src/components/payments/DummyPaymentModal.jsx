import { updateOrderStatus } from "../../services/orderService";

export default function DummyPaymentModal({ order, onClose }) {

  async function payNow() {
    await updateOrderStatus(order.id, {
      paymentStatus: "paid"
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl text-black">
        <h2 className="text-xl font-bold mb-4">Dummy Payment</h2>
        <p className="mb-3">Amount: ₹{order.amount}</p>

        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={payNow}
        >
          Pay ₹{order.amount}
        </button>

        <button
          className="mt-2 text-gray-600"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
