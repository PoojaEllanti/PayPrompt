import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Boxes,
  PieChart,
  LogOut,
  Home,
  Truck,
  UserCheck,
  ArrowLeft,
} from "lucide-react";

export default function Sidebar({ onClose }) {
  const { role } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut(auth);
    navigate("/login");
  }

  const adminLinks = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Customers", path: "/customers", icon: <Users size={20} /> },
    { name: "Orders", path: "/orders", icon: <ShoppingCart size={20} /> },
    { name: "Inventory", path: "/inventory", icon: <Boxes size={20} /> },
    { name: "Delivery Staff", path: "/admin/delivery-staff", icon: <UserCheck size={20} /> },
    { name: "Assign Deliveries", path: "/admin/assign-deliveries", icon: <Truck size={20} /> },
    { name: "Analytics", path: "/analytics", icon: <PieChart size={20} /> },
  ];

  const customerLinks = [
    { name: "Home", path: "/customer/dashboard", icon: <Home size={20} /> },
    { name: "Orders", path: "/customer/orders", icon: <ShoppingCart size={20} /> },
    { name: "Analytics", path: "/customer/analytics", icon: <PieChart size={20} /> },
    { name: "Account", path: "/customer/account", icon: <Users size={20} /> },
  ];

  const deliveryLinks = [
    { name: "Home", path: "/delivery/dashboard", icon: <Home size={20} /> },
    { name: "Orders", path: "/delivery/orders", icon: <Truck size={20} /> },
    { name: "Analytics", path: "/delivery/analytics", icon: <PieChart size={20} /> },
    { name: "Account", path: "/delivery/account", icon: <Users size={20} /> },
  ];

  const navLinks =
    role === "admin"
      ? adminLinks
      : role === "delivery"
      ? deliveryLinks
      : customerLinks;

  return (
    <div className="bg-white h-full w-64 flex flex-col border-r">

      {/* 🔹 Mobile Close Arrow */}
      <div className="md:hidden flex items-center gap-2 p-4 border-b">
        <button
          onClick={onClose}
          className="text-gray-700"
        >
          <ArrowLeft size={22} />
        </button>
        <span className="font-semibold">Menu</span>
      </div>

      {/* Links */}
      <nav className="flex flex-col gap-1 px-2 mt-4 flex-grow">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            onClick={onClose} // auto-close on mobile
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition
              ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            {link.icon}
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2 mx-2 mb-4 rounded-xl
        text-red-500 hover:bg-red-50 transition"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </div>
  );
}
