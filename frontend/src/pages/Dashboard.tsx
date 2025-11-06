import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Navigate, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

interface Event {
  id: number;
  title: string;
  description?: string;
  location: string;
  date: string;
  creator?: { id: number; name: string; email: string };
}

interface Rsvp {
  id: number;
  status: string;
  event: Event;
}

interface DashboardData {
  myEvents: Event[];
  myRsvps: Rsvp[];
  otherEvents: Event[];
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/dashboard`, {
        credentials: "include",
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Failed to load dashboard");
        return;
      }

      setData(json);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong loading the dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRsvp = async (eventId: number, status: string) => {
    try {
      const res = await fetch(`${API_URL}/api/rsvps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ eventId, status }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to RSVP");
        return;
      }

      toast.success(`You marked this event as ${status}`);

      fetchDashboard();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const handleDelete = async (eventId: number) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const res = await fetch(`${API_URL}/api/events/${eventId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to delete event");
        return;
      }

      toast.success("Event deleted!");
      fetchDashboard(); // refresh dashboard
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  if (loading) return <p className="p-6">Loading dashboard...</p>;

  if (!data) return <p className="p-6">No dashboard data available.</p>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12">
      {/* My Events */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-indigo-600">My Events</h2>
        {data.myEvents.length > 0 ? (
          <ul className="space-y-3">
            {data.myEvents.map((event) => (
              <li
                key={event.id}
                className="p-4 border rounded-lg shadow-sm bg-white"
              >
                <h3 className="font-semibold text-lg">{event.title}</h3>
                <p className="text-grat-600">{event.description}</p>
                <p className="text-sm text-gray-500">
                  📍 {event.location} | 🗓{" "}
                  {new Date(event.date).toLocaleDateString()}
                </p>
                <div className="mt-3 space-x-2">
                  <button
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:b-yellow-600"
                    onClick={() => navigate(`/edit-event/${event.id}`)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={() => handleDelete(event.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">You haven't created any events yet.</p>
        )}
      </section>

      {/* RSVP'd Events */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-purple-600">
          Events I RSVP'd To
        </h2>
        {data.myRsvps.length > 0 ? (
          <ul className="space-y-3">
            {data.myRsvps.map((rsvp) => (
              <li
                key={rsvp.id}
                className="p-4 border rounded-lg shadow-sm bg-white"
              >
                <h3 className="font-semibold text-lg">{rsvp.event.title}</h3>
                <p className="text-gray-600">{rsvp.event.description}</p>
                <p className="text-sm test-gray-500">
                  Status: {rsvp.status} | 📍 {rsvp.event.location} | 🗓{" "}
                  {new Date(rsvp.event.date).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">You haven't RSVP'd to any events yet.</p>
        )}
      </section>

      {/* Other Users' Events */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-blue-600">
          Other People's Events
        </h2>
        {data.otherEvents.length > 0 ? (
          <ul className="space-y-3">
            {data.otherEvents.map((event) => (
              <li
                key={event.id}
                className="p-4 border rounded-lg shadow-sm bg-white"
              >
                <h3 className="font-semibold text-lg">{event.title}</h3>
                <p className="text-gray-600">{event.description}</p>
                <p className="text-sm text-gray-500">
                  Created by: {event.creator?.name} | 📍 {event.location} | 🗓{" "}
                  {new Date(event.date).toLocaleDateString()}
                </p>
                <div className="mt-3 space-x-2">
                  <button
                    onClick={() => handleRsvp(event.id, "attending")}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Attend
                  </button>
                  <button
                    onClick={() => handleRsvp(event.id, "declined")}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No events from other users yet.</p>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
