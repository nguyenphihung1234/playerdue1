import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "../components/Layout/Header";
import HomePage from "../pages/HomePage";
import BookingPage from "../pages/BookingPage";
import BookingSuccess from "../pages/BookingSuccess";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import Profile from "../components/Profiles/Profile";
import { useUser } from "../contexts/UserContext"; // ✅ dùng hook

function App() {
  const { username, logout } = useUser(); // ✅ dùng context

  return (
    <div className="min-h-screen bg-gray-900 text-white">
        <Header isLoggedIn={!!username} username={username} onLogout={logout} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/booking/:gamerId" element={<BookingPage />} />
        <Route path="/booking/success" element={<BookingSuccess />} />
        <Route path="/profile/:gamerId" element={<Profile />} />
      </Routes>
    </div>
  );
}

export default App;
