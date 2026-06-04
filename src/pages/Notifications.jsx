import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getUserNotifications,
  markNotificationRead,
} from "../services/notificationService";

export default function Notifications() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!user) return;
    setLoading(true);
    const data = await getUserNotifications(user.uid);
    setList(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [user]);

  if (loading) {
    return <p className="text-slate-400">Loading notifications...</p>;
  }

  return (
    <div className="p-6 text-white max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>

      {list.length === 0 ? (
        <p className="text-slate-400">No notifications yet</p>
      ) : (
        <div className="flex flex-col gap-3">
          {list.map(n => (
            <div
              key={n.id}
              onClick={async () => {
                if (!n.read) {
                  await markNotificationRead(n.id);
                  load();
                }
              }}
              className={`p-4 rounded-xl cursor-pointer border
                ${n.read
                  ? "bg-slate-800 border-slate-700"
                  : "bg-blue-600/20 border-blue-500"}
              `}
            >
              <p className="text-sm">{n.message}</p>
              <p className="text-xs text-slate-400 mt-1">
                {n.createdAt?.toDate().toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
