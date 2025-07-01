import React from "react";
import { Routes, Route, useLocation } from "react-router-dom"; // ⬅️ thêm useLocation
import Header from "../components/Layout/Header";
import HomePage from "../pages/HomePage";
import BookingPage from "../pages/BookingPage";
import BookingSuccess from "../pages/BookingSuccess";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import Profile from "../components/Profiles/Profile";
import { useUser } from "../contexts/UserContext";
import AdminDashboard from "../admin/AdminDashboard";
import ManageGamers from "../admin/ManageGamers"; // ✅ import trang quản lý game thủ

function App() {
  const { username, logout } = useUser();
  const location = useLocation(); // ⬅️ lấy path hiện tại

  // Kiểm tra nếu đang ở đường dẫn bắt đầu bằng "/admin"
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* ❌ Ẩn header nếu là trang admin */}
      {!isAdminRoute && (
        <Header isLoggedIn={!!username} username={username} onLogout={logout} />
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/booking/:gamerId" element={<BookingPage />} />
        <Route path="/booking/success" element={<BookingSuccess />} />
        <Route path="/profile/:gamerId" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/manage-gamers" element={<ManageGamers />} />

      </Routes>
    </div>
  );
}

export default App;
