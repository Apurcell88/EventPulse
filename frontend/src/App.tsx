import { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
// import "./App.css";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Nav from "./components/Nav";
import Dashboard from "./pages/Dashboard";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthRedirect from "./components/AuthRedirect";

export type User = { id: number; name: string; email: string } | null;

function App() {
  const [user, setUser] = useState<User>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.user) setUser(data.user);
      } catch (err) {
        console.error(err);
        setUser(null);
      } finally {
        setLoadingUser(false); // finished checking
      }
    };

    fetchUser();
  }, []);

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Nav user={user} setUser={setUser} />
      <Routes>
        <Route
          path="/"
          element={
            <AuthRedirect user={user}>
              <Home />
            </AuthRedirect>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthRedirect user={user}>
              <SignUp />
            </AuthRedirect>
          }
        />
        <Route
          path="/signin"
          element={
            <AuthRedirect user={user}>
              <SignIn setUser={setUser} />
            </AuthRedirect>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-event"
          element={
            <ProtectedRoute user={user}>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-event/:id"
          element={
            <ProtectedRoute user={user}>
              <EditEvent />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
