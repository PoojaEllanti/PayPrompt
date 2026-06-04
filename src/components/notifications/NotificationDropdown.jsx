import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";

export default function NotificationDropdown({ open, onClose }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user || !open) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setNotifications(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    });

    return () => unsub();
  }, [user, open]);

  async function markAsRead(id) {
    await updateDoc(doc(db, "notifications", id), {
      read: true,
    });
    onClose();
  }

  if (!open) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border z-50">
      <div className="p-3 border-b font-semibold">Notifications</div>

      {notifications.length === 0 && (
        <p className="p-4 text-sm text-gray-500">No notifications</p>
      )}

      <div className="max-h-96 overflow-y-auto">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => markAsRead(n.id)}
            className={`p-3 text-sm cursor-pointer border-b hover:bg-gray-100
              ${!n.read ? "bg-blue-50 font-medium" : "bg-white"}`}
          >
            {n.message}
          </div>
        ))}
      </div>
    </div>
  );
}
