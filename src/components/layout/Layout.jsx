import { useState } from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 border-r bg-white">
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform md:hidden
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar onClose={() => setOpen(false)} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full overflow-y-auto">

        {/* Mobile Header */}
        <div className="md:hidden flex items-center gap-3 p-4 bg-white border-b sticky top-0 z-30">
          <button
            onClick={() => setOpen(true)}
            className="text-xl font-bold"
          >
            ☰
          </button>
          <span className="font-semibold">Dashboard</span>
        </div>

        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
