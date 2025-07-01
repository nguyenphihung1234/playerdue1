// src/admin/pages/ManageGamers.jsx
import React, { useState } from "react";

const mockGamers = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    email: "gamerA@gmail.com",
    phone: "0123 456 789",
    game: "Liên Minh Huyền Thoại",
    rating: 4.8,
    orders: 120,
    revenue: "12,500,000đ",
    status: "online",
  },
  {
    id: 2,
    name: "Trần Thị B",
    email: "gamerB@gmail.com",
    phone: "0987 654 321",
    game: "Valorant",
    rating: 4.5,
    orders: 98,
    revenue: "8,700,000đ",
    status: "offline",
  },
  // thêm nhiều gamer mẫu nếu cần
];

function ManageGamers() {
  const [search, setSearch] = useState("");
  const [gameFilter, setGameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredGamers = mockGamers.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) &&
    (gameFilter === "" || g.game === gameFilter) &&
    (statusFilter === "" || g.status === statusFilter)
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Quản lý Game thủ</h2>

      {/* Bộ lọc */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Tìm theo tên hoặc ID..."
          className="p-2 border rounded-md w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="p-2 border rounded-md" onChange={(e) => setGameFilter(e.target.value)}>
          <option value="">Tất cả trò chơi</option>
          <option value="Liên Minh Huyền Thoại">Liên Minh Huyền Thoại</option>
          <option value="Valorant">Valorant</option>
        </select>
        <select className="p-2 border rounded-md" onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="busy">Bận</option>
        </select>
        <button className="ml-auto bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          Xuất dữ liệu
        </button>
      </div>

      {/* Bảng danh sách */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-md shadow">
          <thead className="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th className="py-3 px-4 text-left">Game thủ</th>
              <th className="py-3 px-4 text-left">Liên hệ</th>
              <th className="py-3 px-4 text-left">Trò chơi</th>
              <th className="py-3 px-4 text-center">Đánh giá</th>
              <th className="py-3 px-4 text-center">Đơn thuê</th>
              <th className="py-3 px-4 text-center">Doanh thu</th>
              <th className="py-3 px-4 text-center">Trạng thái</th>
              <th className="py-3 px-4 text-center">Tác vụ</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {filteredGamers.map((gamer) => (
              <tr key={gamer.id} className="border-t">
                <td className="py-3 px-4">{gamer.name}</td>
                <td className="py-3 px-4">
                  <p>{gamer.email}</p>
                  <p>{gamer.phone}</p>
                </td>
                <td className="py-3 px-4">{gamer.game}</td>
                <td className="py-3 px-4 text-center">{gamer.rating}</td>
                <td className="py-3 px-4 text-center">{gamer.orders}</td>
                <td className="py-3 px-4 text-center">{gamer.revenue}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    gamer.status === "online"
                      ? "bg-green-100 text-green-700"
                      : gamer.status === "offline"
                      ? "bg-gray-200 text-gray-600"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {gamer.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <button className="text-blue-600 hover:underline mr-2">Chi tiết</button>
                  <button className="text-indigo-600 hover:underline mr-2">Sửa</button>
                  <button className="text-red-600 hover:underline">Khóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phân trang (giả lập) */}
      <div className="flex justify-between mt-4 text-sm text-gray-500">
        <p>Hiển thị {filteredGamers.length} / {mockGamers.length} game thủ</p>
        <p>Phân trang sẽ thêm sau</p>
      </div>
    </div>
  );
}

export default ManageGamers;
