export default function CustomerCard({ customer, onEdit, onDelete }) {
  return (
    <div className="bg-slate-800 p-4 rounded-xl text-white flex flex-col gap-2">

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{customer.name}</h3>

        <button
          onClick={() => onDelete(customer.id)}
          className="text-red-500 text-sm"
        >
          Delete
        </button>
      </div>

      <p className="text-sm text-slate-300">Phone: {customer.phone}</p>
      <p className="text-sm text-slate-300">Email: {customer.email}</p>

      <p className="text-sm text-slate-300">
        Balance: ₹{customer.balance}
      </p>

      <p className="text-sm text-slate-300">
        Total Orders: {customer.totalOrders}
      </p>

      <button
        onClick={() => onEdit(customer)}
        className="bg-blue-600 w-full p-2 rounded mt-2"
      >
        Edit
      </button>

    </div>
  );
}
