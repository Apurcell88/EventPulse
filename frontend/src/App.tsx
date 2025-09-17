import { useState } from "react";
import { BrowserRouter } from "react-router-dom";
// import "./App.css";
import Home from "./pages/Home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Future routes */}
        {/* <Route path="/signup" element={<SignUp />} /> */}
        {/* <Route path="/signin" element={<SignIn />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
