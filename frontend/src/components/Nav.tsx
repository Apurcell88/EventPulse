import { Link, useNavigate } from "react-router-dom";

import { useState } from "react";
import { User } from "../App";

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
    <nav className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
      <Link to="/" className="font-bold text-xl">
        EventPulse
      </Link>
      <div className="space-x-4">
        {!user && (
          <>
            <Link to="/signin" className="hover:underline">
              Sign In
            </Link>
            <Link to="/signup" className="hover:underline">
              Sign Up
            </Link>
          </>
        )}
        {user && (
          <>
            <span>Hello, {user.name}</span>
            <Link to="/create-event" className="hover:underline">
              + Create Event
            </Link>
            <button
              onClick={handleSignOut}
              className="text-red-600 hover:underline"
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
