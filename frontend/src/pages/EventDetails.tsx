import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { socket } from "../socket";

const API_URL = import.meta.env.VITE_API_URL;

interface EventDetailsEvent {
  id: number;
  title: string;
  description?: string;
  location: string;
  date: string;
  creator?: { id: number; name: string; email: string };
  rsvps?: {
    id: number;
    status: string;
    user?: { id: number; name: string; email: string };
  }[];
}

interface Message {
  id: number;
  text: string;
  createdAt: string;
  user: { id: number; name: string };
}

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventDetailsEvent | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  // let typingTimeout: NodeJS.Timeout | null = null;
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

  // Load logged-in user
  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        credentials: "include",
      });

      const data = await res.json();
      if (data?.user) setCurrentUser(data.user);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEvent = async () => {
    try {
      const res = await fetch(`${API_URL}/api/events/${id}`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to load event");
        return;
      }

      setEvent(data);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong loading the event");
    } finally {
      setLoading(false);
    }
  };

  // Load messages from DB
  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_URL}/api/messages/${id}`, {
        credentials: "include",
      });

      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Load event + user on mount
  useEffect(() => {
    fetchCurrentUser();
    fetchEvent();
  }, [id]);

  // Socket setup
  useEffect(() => {
    if (!id) return;

    // Join event room
    socket.emit("join_event", Number(id));

    // Load existing messages
    fetchMessages();

    // Listen for incoming messages
    socket.on("receive_message", (msg: Message) => {
      setMessages((prev) => {
        // Prevent duplicates by checking ID
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    // Typing indicators
    socket.on("typing_start", ({ user }) => {
      setTypingUsers((prev) => {
        if (prev.includes(user)) return prev;
        return [...prev, user];
      });
    });

    socket.on("typing_stop", ({ user }) => {
      setTypingUsers((prev) => prev.filter((u) => u !== user));
    });

    return () => {
      socket.off("receive_message");
      socket.off("typing_start");
      socket.off("typing_stop");
    };
  }, [id]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    try {
      // Persist message in DB first
      const res = await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: Number(id),
          text: newMessage,
        }),
      });

      // const savedMsg: Message = await res.json();

      if (!res.ok) {
        toast.error("Failed to send message");
        return;
      }

      // Broadcast via socket
      // socket.emit("send_message", savedMsg);

      setNewMessage("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send");
    }
  };

  const handleRsvp = async (status: string) => {
    if (!id) return;

    try {
      const res = await fetch(`${API_URL}/api/rsvps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ eventId: Number(id), status }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to RSVP");
        return;
      }

      toast.success(`You marked this event as ${status}`);
      fetchEvent();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (!currentUser) return;

    // Notify others you're typing
    socket.emit("typing_start", {
      eventId: Number(id),
      user: currentUser.name,
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing_stop", {
        eventId: Number(id),
        user: currentUser.name,
      });
    }, 2000);
  };

  // typingTimeoutRef cleanup
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (loading) {
    return <p className="p-6">Loading event...</p>;
  }

  if (!event) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <p className="mb-4 text-gray-700">Event not found.</p>
        <Link to="/dashboard" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const attending = (event.rsvps ?? []).filter((r) => r.status === "attending");
  const pending = (event.rsvps ?? []).filter((r) => r.status === "pending");
  const declined = (event.rsvps ?? []).filter((r) => r.status === "declined");

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-4">
        <Link to="/dashboard" className="text-blue-600 hover:underline text-sm">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 space-y-4">
        <h1 className="text-3xl font-bold">{event.title}</h1>
        <p className="text-gray-700">{event.description}</p>

        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <span className="font-semibold">Location:</span> {event.location}
          </p>
          <p>
            <span className="font-semibold">Date & Time:</span>{" "}
            {formatDateTime(event.date)}
          </p>
          {event.creator && (
            <p>
              <span className="font-semibold">Created by:</span>{" "}
              {event.creator.name}
            </p>
          )}
          <p>
            <span className="font-semibold">Attending:</span> {attending.length}{" "}
            | Pending: {pending.length} | Declined: {declined.length}
          </p>
        </div>

        {/* RSVP buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => handleRsvp("attending")}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Attend
          </button>
          <button
            onClick={() => handleRsvp("declined")}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Decline
          </button>
        </div>

        {/* Attendees list */}
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold">Attendees</h2>

          {(event.rsvps ?? []).length > 0 && (
            <ul className="divide-y divide-gray-200">
              {event.rsvps!.map((rsvp) => (
                <li
                  key={rsvp.id}
                  className="py-2 flex justify-between items-center"
                >
                  <span>{rsvp.user?.name ?? "Unknown user"}</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      rsvp.status === "attending"
                        ? "bg-green-100 text-green-700"
                        : rsvp.status === "declined"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {rsvp.status.charAt(0).toUpperCase() + rsvp.status.slice(1)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Chat Section */}
        <div className="mt-8 bg-gray-50 p-4 rounded-xl shadow-inner">
          <h2 className="text-xl font-bold mb-3">Event Chat</h2>

          <div className="h-64 overflow-y-auto border rounded p-3 bg-white mb-3">
            {messages.length > 0 ? (
              messages.map((msg) => (
                <div key={msg.id} className="mb-2">
                  <p className="text-sm">
                    <span className="font-semibold">{msg.user.name}</span>{" "}
                    <span className="text-gray-400 text-xs">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </span>
                  </p>
                  <p className="text-gray-800">{msg.text}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">
                No messages yet. Start the conversation!
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {typingUsers.length > 0 && (
              <p className="text-sm text-gray-500 mb-1">
                {typingUsers.join(", ")}{" "}
                {typingUsers.length === 1 ? "is" : "are"} typing...
              </p>
            )}
            <input
              value={newMessage}
              onChange={handleTyping}
              className="flex-1 border rounded px-3 py-2"
              placeholder="Type a message..."
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
