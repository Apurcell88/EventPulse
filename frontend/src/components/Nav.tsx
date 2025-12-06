import { Link, useNavigate } from "react-router-dom";

import { useState } from "react";
import { User } from "../App";

import NotificationBell from "./NotificationBell";

interface NavProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

const Nav = ({ user, setUser }: NavProps) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signout`, {
      method: "POST",
      credentials: "include", // send the cookie
    });
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
      {/* Logo / Brand */}
      <Link to="/" className="font-bold text-xl tracking-tight">
        EventPulse
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {!user && (
          <>
            <Link to="/signin" className="text-sm md:text-base hover:underline">
              Sign In
            </Link>
            <Link
              to="/signup"
              className="text-sm md:text-base px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 transition"
            >
              Sign Up
            </Link>
          </>
        )}

        {user && (
          <>
            {/* Greeting */}
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-sm">
              Hello, <span className="ml-1 font-semibold">{user.name}</span>
            </span>

            {/* Notifications */}
            <NotificationBell />

            {/* Create Event CTA */}
            <Link
              to="/create-event"
              className="text-sm md:text-base px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 transition"
            >
              + Create Event
            </Link>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="text-sm md:text-base px-3 py-1 rounded-full border border-white/40 hover:bg-white/10 transition"
            >
              Sign Out
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Nav;
