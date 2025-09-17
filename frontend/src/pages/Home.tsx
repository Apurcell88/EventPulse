import React from "react";
import Nav from "../components/Nav";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <main className="flex flex-col items-center justify-center flex-1 bg-gradient-to-b from-purple-50 via-blue-50 to-white text-center p-6">
        <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          Welcome to EventPulse
        </h2>
        <p className="mt-4 text-xl text-gray-700 max-w-lg">
          Manage your events and RSVPs all in one place with style and ease.
        </p>
        <div className="mt-8 flex space-x-6">
          <a
            href="/signup"
            className="px-8 py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition"
          >
            Sign Up
          </a>
          <a
            href="/signin"
            className="px-8 py-3 bg-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition"
          >
            Sign In
          </a>
        </div>
      </main>
    </div>
  );
};

export default Home;
