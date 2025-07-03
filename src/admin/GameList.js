// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.

import React, { useState, useEffect } from "react";
import * as echarts from "echarts";
import AdminLayout from "./AdminLayout";
import axiosInstance from '../api/axiosConfig';

const GameListPage = () => {
  const [activeTab, setActiveTab] = useState("danhSach");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Tất cả");
  const [selectedGameType, setSelectedGameType] = useState("Tất cả");
  const [selectedStatus, setSelectedStatus] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);
  const [games, setGames] = useState([]);
  const [gameCategories, setGameCategories] = useState(["Tất cả"]);
  const [gameStatuses, setGameStatuses] = useState(["Tất cả"]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    description: '',
    category: '',
    platform: '',
    status: '',
    imageUrl: '',
    websiteUrl: '',
    requirements: '',
    hasRoles: false,
    availableRoles: '',
    availableRanks: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    description: '',
    category: '',
    platform: '',
    status: '',
    imageUrl: '',
    websiteUrl: '',
    requirements: '',
    hasRoles: false,
    availableRoles: '',
    availableRanks: '',
  });
  const [isAdding, setIsAdding] = useState(false);

  const fetchGames = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axiosInstance.get('/games', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGames(res.data);
      const categories = Array.from(new Set(res.data.map(g => g.category).filter(Boolean)));
      setGameCategories(["Tất cả", ...categories]);
      const statuses = Array.from(new Set(res.data.map(g => g.status).filter(Boolean)));
      setGameStatuses(["Tất cả", ...statuses]);
    } catch (err) {
      alert('Có lỗi khi tải danh sách game!');
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    // Chỉ khởi tạo biểu đồ khi DOM đã sẵn sàng và tab thống kê đang hiển thị
    if (activeTab !== "thongKe") return;

    const gameTypeDom = document.getElementById("gameTypeChart");
    const playerStatsDom = document.getElementById("playerStatsChart");
    if (!gameTypeDom || !playerStatsDom) return;

    const gameTypeChart = echarts.init(gameTypeDom);
    const gameTypeOption = {
      animation: false,
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} ({d}%)",
      },
      legend: {
        orient: "vertical",
        left: "left",
        data: ["Hành động", "Chiến thuật", "Nhập vai", "Thể thao", "Giải đố"],
      },
      series: [
        {
          type: "pie",
          radius: "70%",
          center: ["50%", "60%"],
          data: [
            { value: 35, name: "Hành động", itemStyle: { color: "#4F6AFF" } },
            { value: 25, name: "Chiến thuật", itemStyle: { color: "#6ECB63" } },
            { value: 20, name: "Nhập vai", itemStyle: { color: "#FFB74D" } },
            { value: 15, name: "Thể thao", itemStyle: { color: "#FF7373" } },
            { value: 5, name: "Giải đố", itemStyle: { color: "#9C5FFF" } },
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };
    gameTypeChart.setOption(gameTypeOption);

    const playerStatsChart = echarts.init(playerStatsDom);
    const playerStatsOption = {
      animation: false,
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          label: {
            backgroundColor: "#6a7985",
          },
        },
      },
      legend: {
        data: ["Người chơi mới", "Người chơi hoạt động"],
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: [
        {
          type: "category",
          boundaryGap: false,
          data: ["26/06", "27/06", "28/06", "29/06", "30/06", "01/07", "02/07"],
        },
      ],
      yAxis: [
        {
          type: "value",
        },
      ],
      series: [
        {
          name: "Người chơi mới",
          type: "line",
          stack: "Total",
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: "rgba(79, 106, 255, 0.8)",
                },
                {
                  offset: 1,
                  color: "rgba(79, 106, 255, 0.1)",
                },
              ],
            },
          },
          emphasis: {
            focus: "series",
          },
          data: [120, 132, 101, 134, 90, 230, 210],
        },
        {
          name: "Người chơi hoạt động",
          type: "line",
          stack: "Total",
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: "rgba(110, 203, 99, 0.8)",
                },
                {
                  offset: 1,
                  color: "rgba(110, 203, 99, 0.1)",
                },
              ],
            },
          },
          emphasis: {
            focus: "series",
          },
          data: [220, 182, 191, 234, 290, 330, 310],
        },
      ],
    };
    playerStatsChart.setOption(playerStatsOption);

    const handleResize = () => {
      gameTypeChart.resize();
      playerStatsChart.resize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      gameTypeChart.dispose();
      playerStatsChart.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, [activeTab]);

  const gameTypes = [
    "Tất cả",
    "Hành động",
    "Chiến thuật",
    "Nhập vai",
    "Thể thao",
    "Giải đố",
  ];
  const statusOptions = [
    "Tất cả",
    "Đang hoạt động",
    "Bảo trì",
    "Ngừng hoạt động",
  ];

  const filteredGames = Array.isArray(games)
    ? games.filter((game) => {
        return (
          (searchQuery === "" ||
            game.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
          (selectedGameType === "Tất cả" || game.category === selectedGameType) &&
          (selectedStatus === "Tất cả" || game.status === selectedStatus)
        );
      })
    : [];

  const renderDashboard = () => (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-700">Tổng số game</h3>
            <span className="text-xs text-gray-500">7 ngày qua</span>
          </div>
          <div className="flex items-center">
            <div className="bg-indigo-100 p-3 rounded-full mr-4">
              <i className="fas fa-gamepad text-indigo-600 text-xl"></i>
            </div>
            <div>
              <p className="text-2xl font-bold">32</p>
              <p className="text-sm text-green-500">
                <i className="fas fa-arrow-up mr-1"></i>
                +3 game mới
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-700">
              Tổng số người chơi
            </h3>
            <span className="text-xs text-gray-500">7 ngày qua</span>
          </div>
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <i className="fas fa-users text-blue-600 text-xl"></i>
            </div>
            <div>
              <p className="text-2xl font-bold">12,450</p>
              <p className="text-sm text-green-500">
                <i className="fas fa-arrow-up mr-1"></i>
                +8% so với tuần trước
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-700">Doanh thu</h3>
            <span className="text-xs text-gray-500">7 ngày qua</span>
          </div>
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <i className="fas fa-money-bill-wave text-green-600 text-xl"></i>
            </div>
            <div>
              <p className="text-2xl font-bold">8.500.000đ</p>
              <p className="text-sm text-green-500">
                <i className="fas fa-arrow-up mr-1"></i>
                +12% so với tuần trước
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Thống kê người chơi
          </h3>
          <div
            id="playerStatsChart"
            style={{ width: "100%", height: "300px" }}
          ></div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Phân bố thể loại game
          </h3>
          <div
            id="gameTypeChart"
            style={{ width: "100%", height: "300px" }}
          ></div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-700">
            Game phổ biến nhất
          </h3>
          <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium cursor-pointer !rounded-button whitespace-nowrap">
            Xem tất cả <i className="fas fa-arrow-right ml-1"></i>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Game
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Thể loại
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Người chơi
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {games.slice(0, 5).map((game) => (
                <tr key={game.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={game.imageUrl}
                          alt={game.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {game.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{game.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">
                      {(game.playerCount ?? 0).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {game.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderGameList = () => (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          Quản lý danh sách game
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center cursor-pointer !rounded-button whitespace-nowrap"
        >
          <i className="fas fa-plus mr-2"></i> Thêm game mới
        </button>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="relative mb-4 md:mb-0 md:w-1/3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-gray-400"></i>
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm game..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
              <div className="relative">
                <select
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={selectedGameType}
                  onChange={(e) => setSelectedGameType(e.target.value)}
                >
                  {gameCategories.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <i className="fas fa-chevron-down"></i>
                </div>
              </div>
              <div className="relative">
                <select
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  {gameStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <i className="fas fa-chevron-down"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredGames.map((game) => (
              <div
                key={game.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-40 bg-gray-200 relative overflow-hidden">
                  <img
                    src={game.imageUrl}
                    alt={game.name}
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {game.status}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {game.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Thể loại: {game.category}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <i className="fas fa-users text-indigo-500 mr-1"></i>
                      <span className="text-sm text-gray-700">
                        {(game.playerCount ?? 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 text-blue-600 hover:text-blue-800 cursor-pointer !rounded-button whitespace-nowrap" onClick={() => handleEditClick(game)}>
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="p-2 text-red-600 hover:text-red-800 cursor-pointer !rounded-button whitespace-nowrap" onClick={() => handleDeleteGame(game)}>
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredGames.length === 0 && (
            <div className="text-center py-12">
              <i className="fas fa-search text-gray-400 text-5xl mb-4"></i>
              <p className="text-gray-500 text-lg">
                Không tìm thấy game nào phù hợp với bộ lọc
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedGameType("Tất cả");
                  setSelectedStatus("Tất cả");
                }}
                className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer !rounded-button whitespace-nowrap"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}

          {filteredGames.length > 0 && (
            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-gray-600">
                Hiển thị 1-{Math.min(8, filteredGames.length)} trong số{" "}
                {filteredGames.length} game
              </p>
              <div className="flex space-x-1">
                <button className="px-3 py-1 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 cursor-pointer !rounded-button whitespace-nowrap">
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button className="px-3 py-1 bg-indigo-600 text-white rounded-md cursor-pointer !rounded-button whitespace-nowrap">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 cursor-pointer !rounded-button whitespace-nowrap">
                  2
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 cursor-pointer !rounded-button whitespace-nowrap">
                  3
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 cursor-pointer !rounded-button whitespace-nowrap">
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAddGameForm = () => (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => setActiveTab("danhSach")}
          className="text-indigo-600 hover:text-indigo-800 mr-2 cursor-pointer !rounded-button whitespace-nowrap"
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Thêm game mới</h2>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-medium mb-2"
                htmlFor="gameName"
              >
                Tên game <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="gameName"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Nhập tên game"
              />
            </div>
          </div>

          <div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-medium mb-2"
                htmlFor="gameType"
              >
                Thể loại <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="gameType"
                  className="appearance-none w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Chọn thể loại</option>
                  {gameTypes
                    .filter((type) => type !== "Tất cả")
                    .map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <i className="fas fa-chevron-down"></i>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-medium mb-2"
                htmlFor="gameStatus"
              >
                Trạng thái <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="gameStatus"
                  className="appearance-none w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Chọn trạng thái</option>
                  {statusOptions
                    .filter((status) => status !== "Tất cả")
                    .map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <i className="fas fa-chevron-down"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-medium mb-2"
                htmlFor="gameDescription"
              >
                Mô tả
              </label>
              <textarea
                id="gameDescription"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Nhập mô tả game"
              ></textarea>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Hình ảnh game
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="mb-4">
                  <i className="fas fa-cloud-upload-alt text-gray-400 text-4xl"></i>
                </div>
                <p className="text-gray-600 mb-2">Kéo và thả file hoặc</p>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer !rounded-button whitespace-nowrap">
                  Chọn file
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  PNG, JPG hoặc GIF (tối đa 2MB)
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={() => setActiveTab("danhSach")}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer !rounded-button whitespace-nowrap"
          >
            Hủy
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer !rounded-button whitespace-nowrap">
            Lưu game
          </button>
        </div>
      </div>
    </div>
  );

  const handleEditClick = (game) => {
    setEditForm({
      id: game.id,
      name: game.name || '',
      description: game.description || '',
      category: game.category || '',
      platform: game.platform || '',
      status: game.status || '',
      imageUrl: game.imageUrl || '',
      websiteUrl: game.websiteUrl || '',
      requirements: game.requirements || '',
      hasRoles: !!game.hasRoles,
      availableRoles: Array.isArray(game.availableRoles) ? game.availableRoles.join(', ') : (game.availableRoles || ''),
      availableRanks: Array.isArray(game.availableRanks) ? game.availableRanks.join(', ') : (game.availableRanks || ''),
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleEditGame = async (e) => {
    e.preventDefault();
    setIsEditing(true);
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.put(`/games/${editForm.id}`, {
        name: editForm.name,
        description: editForm.description,
        category: editForm.category,
        platform: editForm.platform,
        status: editForm.status,
        imageUrl: editForm.imageUrl,
        websiteUrl: editForm.websiteUrl,
        requirements: editForm.requirements,
        hasRoles: editForm.hasRoles,
        availableRoles: editForm.availableRoles.split(',').map(r => r.trim()).filter(Boolean),
        availableRanks: editForm.availableRanks.split(',').map(r => r.trim()).filter(Boolean),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowEditModal(false);
      setEditForm({ id: '', name: '', description: '', category: '', platform: '', status: '', imageUrl: '', websiteUrl: '', requirements: '', hasRoles: false, availableRoles: '', availableRanks: '' });
      fetchGames();
      alert('Sửa game thành công!');
    } catch (err) {
      alert('Có lỗi khi sửa game!');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteGame = async (game) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa game này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.delete(`/games/${game.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchGames();
      alert('Đã xóa game thành công!');
    } catch (err) {
      alert('Có lỗi khi xóa game!');
    }
  };

  return (
    <AdminLayout breadcrumb="Quản lý game" >
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-100">
        {activeTab === "danhSach" && renderGameList()}
        {activeTab === "themMoi" && renderAddGameForm()}
        {activeTab === "thongKe" && renderDashboard()}
      </main>
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={() => setShowEditModal(false)}>
          <div
            className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative overflow-y-auto"
            style={{ maxHeight: '90vh' }}
            onClick={e => e.stopPropagation()}
          >
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setShowEditModal(false)}>
              <i className="fas fa-times"></i>
            </button>
            <h2 className="text-xl font-bold mb-4">Sửa game</h2>
            <form onSubmit={handleEditGame} className="space-y-4">
              <input name="name" value={editForm.name} onChange={handleEditInputChange} className="w-full border rounded px-3 py-2" placeholder="Tên game" required />
              <textarea name="description" value={editForm.description} onChange={handleEditInputChange} className="w-full border rounded px-3 py-2" placeholder="Mô tả" />
              <input name="category" value={editForm.category} onChange={handleEditInputChange} className="w-full border rounded px-3 py-2" placeholder="Thể loại" required />
              <input name="platform" value={editForm.platform} onChange={handleEditInputChange} className="w-full border rounded px-3 py-2" placeholder="Nền tảng" />
              <input name="status" value={editForm.status} onChange={handleEditInputChange} className="w-full border rounded px-3 py-2" placeholder="Trạng thái" required />
              <input name="imageUrl" value={editForm.imageUrl} onChange={handleEditInputChange} className="w-full border rounded px-3 py-2" placeholder="Link ảnh" required />
              <input name="websiteUrl" value={editForm.websiteUrl} onChange={handleEditInputChange} className="w-full border rounded px-3 py-2" placeholder="Website" />
              <input name="requirements" value={editForm.requirements} onChange={handleEditInputChange} className="w-full border rounded px-3 py-2" placeholder="Yêu cầu hệ thống" />
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="hasRoles" checked={editForm.hasRoles} onChange={handleEditInputChange} />
                <span>Có phân vai trò</span>
              </label>
              <input name="availableRoles" value={editForm.availableRoles} onChange={handleEditInputChange} className="w-full border rounded px-3 py-2" placeholder="Các vai trò (cách nhau bởi dấu phẩy)" />
              <input name="availableRanks" value={editForm.availableRanks} onChange={handleEditInputChange} className="w-full border rounded px-3 py-2" placeholder="Các hạng (cách nhau bởi dấu phẩy)" />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded w-full" disabled={isEditing}>
                {isEditing ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </form>
          </div>
        </div>
      )}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative overflow-y-auto"
            style={{ maxHeight: '90vh' }}
            onClick={e => e.stopPropagation()}
          >
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setShowAddModal(false)}>
              <i className="fas fa-times"></i>
            </button>
            <h2 className="text-xl font-bold mb-4">Thêm game mới</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsAdding(true);
              try {
                const token = localStorage.getItem('token');
                await axiosInstance.post('/games', {
                  name: addForm.name,
                  description: addForm.description,
                  category: addForm.category,
                  platform: addForm.platform,
                  status: addForm.status,
                  imageUrl: addForm.imageUrl,
                  websiteUrl: addForm.websiteUrl,
                  requirements: addForm.requirements,
                  hasRoles: addForm.hasRoles,
                  availableRoles: addForm.availableRoles.split(',').map(r => r.trim()).filter(Boolean),
                  availableRanks: addForm.availableRanks.split(',').map(r => r.trim()).filter(Boolean),
                }, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                setShowAddModal(false);
                setAddForm({ name: '', description: '', category: '', platform: '', status: '', imageUrl: '', websiteUrl: '', requirements: '', hasRoles: false, availableRoles: '', availableRanks: '' });
                fetchGames();
                alert('Thêm game thành công!');
              } catch (err) {
                alert('Có lỗi khi thêm game!');
              } finally {
                setIsAdding(false);
              }
            }} className="space-y-4">
              <input name="name" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} className="w-full border rounded px-3 py-2" placeholder="Tên game" required />
              <textarea name="description" value={addForm.description} onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))} className="w-full border rounded px-3 py-2" placeholder="Mô tả" />
              <input name="category" value={addForm.category} onChange={e => setAddForm(f => ({ ...f, category: e.target.value }))} className="w-full border rounded px-3 py-2" placeholder="Thể loại" required />
              <input name="platform" value={addForm.platform} onChange={e => setAddForm(f => ({ ...f, platform: e.target.value }))} className="w-full border rounded px-3 py-2" placeholder="Nền tảng" />
              <input name="status" value={addForm.status} onChange={e => setAddForm(f => ({ ...f, status: e.target.value }))} className="w-full border rounded px-3 py-2" placeholder="Trạng thái" required />
              <input name="imageUrl" value={addForm.imageUrl} onChange={e => setAddForm(f => ({ ...f, imageUrl: e.target.value }))} className="w-full border rounded px-3 py-2" placeholder="Link ảnh" required />
              <input name="websiteUrl" value={addForm.websiteUrl} onChange={e => setAddForm(f => ({ ...f, websiteUrl: e.target.value }))} className="w-full border rounded px-3 py-2" placeholder="Website" />
              <input name="requirements" value={addForm.requirements} onChange={e => setAddForm(f => ({ ...f, requirements: e.target.value }))} className="w-full border rounded px-3 py-2" placeholder="Yêu cầu hệ thống" />
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="hasRoles" checked={addForm.hasRoles} onChange={e => setAddForm(f => ({ ...f, hasRoles: e.target.checked }))} />
                <span>Có phân vai trò</span>
              </label>
              <input name="availableRoles" value={addForm.availableRoles} onChange={e => setAddForm(f => ({ ...f, availableRoles: e.target.value }))} className="w-full border rounded px-3 py-2" placeholder="Các vai trò (cách nhau bởi dấu phẩy)" />
              <input name="availableRanks" value={addForm.availableRanks} onChange={e => setAddForm(f => ({ ...f, availableRanks: e.target.value }))} className="w-full border rounded px-3 py-2" placeholder="Các hạng (cách nhau bởi dấu phẩy)" />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded w-full" disabled={isAdding}>
                {isAdding ? 'Đang lưu...' : 'Lưu game'}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default GameListPage;
