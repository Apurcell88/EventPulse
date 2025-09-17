import { Link } from "react-router-dom";

import React from "react";

const Nav = () => {
  return (
    <nav className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
      <h1 className="text-2xl font-extrabold tracking-wide drop-shadow-md">
        EventPulse
      </h1>
      <div className="space-x-4">
        <Link
          to="/signup"
          className="px-4 py-2 rounded-lg bg-white text-purple-600 font-semibold hover:bg-purple-100 transition"
        >
          Sign Up
        </Link>
        <Link
          to="/signin"
          className="px-4 py-2 rounded-lg bg-white text-blue-600 font-semibold hover:bg-blue-100 transition"
        >
          Sign In
        </Link>
      </div>
    </nav>
  );
};

export default Nav;
