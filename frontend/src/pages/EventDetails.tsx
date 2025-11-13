import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-hot-toast";

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

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventDetailsEvent | null>(null);
  const [loading, setLoading] = useState(true);

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const fetchEvent = async () => {
    try {
      const res = await fetch(`${API_URL}/api/events/${id}`, {
        credentials: "include", // ok even if route is public
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

  useEffect(() => {
    fetchEvent();
  }, [id]);

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
      fetchEvent(); // refresh attendee list + statuses
    } catch (err: any) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

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
                      rsvp.status == "attending"
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

        {/* Edit button for creator (optional, can also stay on Dashboard only) */}
        <div className="mt-4">
          <button
            onClick={() => navigate(`/edit-event/${event.id}`)}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Edit Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
