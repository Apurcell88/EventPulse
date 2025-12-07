import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";

const API_URL = import.meta.env.VITE_API_URL;

interface Notification {
  id: number;
  type: string;
  message: string;
  createdAt: string;
  read: boolean;
  event?: {
    id: number;
    title: string;
  } | null;
  actor?: {
    id: number;
    name: string;
  } | null;
}

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      const res = await fetch(`${API_URL}/api/notifications/read-all`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) return;
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle dropdown + refresh when opening
  const handleToggle = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        // refresh when user opens the panel
        fetchNotifications();
      }
      return next;
    });
  };

  useEffect(() => {
    // initial load
    fetchNotifications();

    // live notifications via socket
    socket.on("notification", (notif: Notification) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    return () => {
      socket.off("notification");
    };
  }, []);

  const handleNotificationClick = (notif: Notification) => {
    // mark this one as read locally
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );

    // navigate to event if present
    if (notif.event?.id) {
      navigate(`/events/${notif.event.id}`);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        {/* Simple bell icon */}
        <span className="text-2xl">🔔</span>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-blue-600 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-xs text-gray-500 px-3 py-3">
                No notifications yet.
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`px-3 py-2 text-sm border-b last:border-b-0 cursor-pointer hover:bg-gray-100 ${
                    n.read ? "bg-white" : "bg-blue-50"
                  }`}
                >
                  <p className="font-medium text-purple-500">
                    {n.actor?.name ?? "Someone"}: {n.message}
                    {n.event?.title && (
                      <span className="text-xs text-gray-500">
                        {" "}
                        — {n.event.title}
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
