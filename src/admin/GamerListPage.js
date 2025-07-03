// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.

import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import axiosInstance from '../api/axiosConfig';

const GamerListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showRatingDropdown, setShowRatingDropdown] = useState(false);
  const [showGameTypeDropdown, setShowGameTypeDropdown] = useState(false);
  const [showItemsPerPageDropdown, setShowItemsPerPageDropdown] = useState(false);
  const [selectedGamerId, setSelectedGamerId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [selectedGameType, setSelectedGameType] = useState('all');
  const [selectedRank, setSelectedRank] = useState('all');
  const [players, setPlayers] = useState([]);
  const [gameOptions, setGameOptions] = useState([]);
  const [rankOptions, setRankOptions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    userId: '',
    gameId: '',
    username: '',
    rank: '',
    role: '',
    server: '',
    pricePerHour: '',
    description: '',
  });
  const [isAdding, setIsAdding] = useState(false);
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);

  const fetchPlayers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axiosInstance.get('/game-players/summary', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlayers((res.data.data || []).map(gp => ({
        ...gp,
        fullName: gp.name,
        orderCount: gp.totalOrders,
        reviewCount: gp.totalReviews,
        income: gp.totalRevenue,
        rank: gp.rankLabel,
      })));
    } catch (err) {
      alert('Có lỗi khi tải danh sách game thủ!');
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const games = Array.from(new Set(players.map(p => p.gameName).filter(Boolean)));
    const ranks = Array.from(new Set(players.map(p => p.rank).filter(Boolean)));
    setGameOptions(games);
    setRankOptions(ranks);
  }, [players]);

  // Fetch games khi mount
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axiosInstance.get('/games', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGames(res.data);
      } catch (err) {}
    };
    fetchGames();
  }, []);

  // Khi chọn gameId, set selectedGame
  useEffect(() => {
    const found = games.find(g => String(g.id) === String(addForm.gameId));
    setSelectedGame(found || null);
    // Nếu gameId đổi thì reset rank, role
    setAddForm(f => ({ ...f, rank: '', role: '' }));
  }, [addForm.gameId, games]);

  // Filter gamers based on search term, status, rating and game type
  const filteredGamers = players.filter(gamer => {
    const matchesSearch = (gamer.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (gamer.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || gamer.status === selectedStatus;
    const matchesRating = selectedRating === 'all' || gamer.rating === selectedRating;
    const matchesGame = selectedGameType === 'all' || gamer.gameName === selectedGameType;
    const matchesRank = selectedRank === 'all' || gamer.rank === selectedRank;
    return matchesSearch && matchesStatus && matchesRating && matchesGame && matchesRank;
  });

  // Pagination
  const totalPages = Math.ceil(filteredGamers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGamers = filteredGamers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleResetFilters = () => {
    setSelectedStatus('all');
    setSelectedRating('all');
    setSelectedGameType('all');
    setSelectedRank('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleToggleGamerStatus = async (gamer) => {
    if (!gamer || !gamer.id) {
      alert('Không tìm thấy ID game thủ!');
      return;
    }
    const isBanned = gamer.status === 'BANNED';
    const confirmMsg = isBanned ? 'Bạn có muốn mở khóa game thủ này không?' : 'Bạn có muốn khóa (ban) game thủ này không?';
    if (!window.confirm(confirmMsg)) return;
    try {
      const token = localStorage.getItem('token');
      const url = isBanned
        ? `/game-players/unban/${gamer.id}`
        : `/game-players/ban/${gamer.id}`;
      await axiosInstance.post(url, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlayers((prev) => prev.map((p) =>
        p.id === gamer.id ? { ...p, status: isBanned ? 'AVAILABLE' : 'BANNED' } : p
      ));
      alert(isBanned ? 'Đã mở khóa game thủ!' : 'Đã khóa game thủ!');
    } catch (err) {
      alert('Có lỗi khi thay đổi trạng thái game thủ!');
    }
  };

  const handleDeleteGamer = async (gamer) => {
    console.log('Gamer to delete:', gamer);
    if (!gamer || !gamer.id) {
      alert('Không tìm thấy ID game thủ!');
      return;
    }
    if (!window.confirm('Bạn có chắc chắn muốn xóa game thủ này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.delete(`game-players/${gamer.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlayers((prev) => prev.filter((p) => p.id !== gamer.id));
      alert('Đã xóa game thủ thành công!');
    } catch (err) {
      alert('Có lỗi khi xóa game thủ!');
    }
  };

  const getStatusLabel = (status) => {
    const normalized = (status || '').toUpperCase();
    switch (normalized) {
      case 'AVAILABLE':
        return { text: 'Hoạt động', bgColor: 'bg-green-100', textColor: 'text-green-800' };
      case 'LOCKED':
        return { text: 'Khóa', bgColor: 'bg-red-100', textColor: 'text-red-800' };
      case 'PENDING':
        return { text: 'Chờ duyệt', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' };
      case 'BANNED':
        return { text: 'Bị khóa', bgColor: 'bg-red-100', textColor: 'text-red-800' };
      default:
        return { text: `Không xác định (${status})`, bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
    }
  };

  const getRatingLabel = (rating) => {
    switch (rating) {
      case 'high':
        return { text: 'Cao', bgColor: 'bg-indigo-100', textColor: 'text-indigo-800', icon: 'fa-star' };
      case 'medium':
        return { text: 'Trung bình', bgColor: 'bg-blue-100', textColor: 'text-blue-800', icon: 'fa-star-half-alt' };
      case 'low':
        return { text: 'Thấp', bgColor: 'bg-gray-100', textColor: 'text-gray-800', icon: 'fa-star' };
      default:
        return { text: 'Không xác định', bgColor: 'bg-gray-100', textColor: 'text-gray-800', icon: 'fa-star' };
    }
  };

  // Thay đổi hàm getGameTypeLabel để trả về tên game cụ thể thay vì thể loại
  const getGameTypeLabel = (gameType) => {
    switch (gameType) {
      case 'moba':
        return { text: 'Liên Minh Huyền Thoại', bgColor: 'bg-purple-100', textColor: 'text-purple-800', icon: 'fa-gamepad' };
      case 'strategy':
        return { text: 'Đấu Trường Chân Lý', bgColor: 'bg-blue-100', textColor: 'text-blue-800', icon: 'fa-chess' };
      case 'fps':
        return { text: 'Free Fire', bgColor: 'bg-red-100', textColor: 'text-red-800', icon: 'fa-crosshairs' };
      case 'rpg':
        return { text: 'PUBG', bgColor: 'bg-green-100', textColor: 'text-green-800', icon: 'fa-dragon' };
      default:
        return { text: 'Khác', bgColor: 'bg-gray-100', textColor: 'text-gray-800', icon: 'fa-gamepad' };
    }
  };

  const getToggleStatusText = (status) => {
    return status === 'locked' ? 'Mở khóa' : 'Khóa';
  };

  const getToggleStatusIcon = (status) => {
    return status === 'locked' ? 'fa-unlock' : 'fa-user-slash';
  };

  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddGamer = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.post('game-players', {
        ...addForm,
        pricePerHour: Number(addForm.pricePerHour),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowAddModal(false);
      setAddForm({ userId: '', gameId: '', username: '', rank: '', role: '', server: '', pricePerHour: '', description: '' });
      // Reload danh sách
      fetchPlayers();
      alert('Thêm game thủ thành công!');
    } catch (err) {
      alert('Có lỗi khi thêm game thủ!');
    } finally {
      setIsAdding(false);
    }
  };

  return (
        <AdminLayout breadcrumb="Quản lý game thủ">

    
      
        {/* Gamer List Content */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">Danh sách game thủ</h1>
              <p className="text-sm text-gray-500 mb-2">Quản lý thông tin và hoạt động của tất cả game thủ trong hệ thống</p>
            </div>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center !rounded-button whitespace-nowrap cursor-pointer mt-2 md:mt-0" onClick={() => setShowAddModal(true)}>
              <i className="fas fa-plus mr-2"></i>
              <span>Thêm game thủ</span>
            </button>
          </div>
          

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="col-span-1 md:col-span-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, email..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                </div>
              </div>
              <div className="relative">
                <div
                  className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 cursor-pointer"
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                >
                  <span>
                    {selectedStatus === 'all' ? 'Tất cả trạng thái' :
                      selectedStatus === 'active' ? 'Hoạt động' :
                        selectedStatus === 'locked' ? 'Khóa' : 'Chờ duyệt'}
                  </span>
                  <i className="fas fa-chevron-down ml-2 text-gray-500"></i>
                </div>
                {showStatusDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                    <div
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedStatus('all');
                        setShowStatusDropdown(false);
                      }}
                    >
                      Tất cả trạng thái
                    </div>
                    <div
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedStatus('active');
                        setShowStatusDropdown(false);
                      }}
                    >
                      Hoạt động
                    </div>
                    <div
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedStatus('locked');
                        setShowStatusDropdown(false);
                      }}
                    >
                      Khóa
                    </div>
                    <div
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedStatus('pending');
                        setShowStatusDropdown(false);
                      }}
                    >
                      Chờ duyệt
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <div
                  className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 cursor-pointer"
                  onClick={() => setShowRatingDropdown(!showRatingDropdown)}
                >
                  <span>
                    {selectedRank === 'all' ? 'Tất cả xếp hạng' : selectedRank}
                  </span>
                  <i className="fas fa-chevron-down ml-2 text-gray-500"></i>
                </div>
                {showRatingDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedRank('all');
                        setShowRatingDropdown(false);
                      }}
                    >
                      Tất cả xếp hạng
                    </div>
                    {rankOptions.map(rank => (
                      <div
                        key={rank}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSelectedRank(rank);
                          setShowRatingDropdown(false);
                        }}
                      >
                        {rank}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <div
                  className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 cursor-pointer"
                  onClick={() => setShowGameTypeDropdown(!showGameTypeDropdown)}
                >
                  <span>
                    {selectedGameType === 'all' ? 'Tất cả game' : selectedGameType}
                  </span>
                  <i className="fas fa-chevron-down ml-2 text-gray-500"></i>
                </div>
                {showGameTypeDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedGameType('all');
                        setShowGameTypeDropdown(false);
                      }}
                    >
                      Tất cả game
                    </div>
                    {gameOptions.map(game => (
                      <div
                        key={game}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSelectedGameType(game);
                          setShowGameTypeDropdown(false);
                        }}
                      >
                        {game}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg flex items-center !rounded-button whitespace-nowrap cursor-pointer"
                onClick={handleResetFilters}
              >
                <i className="fas fa-sync-alt mr-2"></i>
                <span>Đặt lại bộ lọc</span>
              </button>
            </div>
          </div>

          {/* Gamer Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thông tin game thủ
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thống kê
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Xếp hạng
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thể loại game
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentGamers.map((gamer, idx) => {
                        const { text: statusText, bgColor: statusBg, textColor: statusColor } = getStatusLabel(gamer.status);
                        console.log('Gamer status:', gamer.status);
                        // Map rank
                        const rankText = gamer.rank || "Không xác định";
                        const rankColor = "bg-blue-100 text-blue-800";

                        // Map gameName
                        const gameName = gamer.gameName || "Khác";
                        const gameColor = "bg-purple-100 text-purple-800";

                        // Số sao
                        const rating = Math.round(gamer.rating || 0);

                        return (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <img className="h-10 w-10 rounded-full object-cover" src={gamer.avatarUrl || '/default-avatar.png'} alt="avatar" />
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{gamer.fullName || "Không rõ"}</div>
                                  <div className="text-sm text-gray-500">{gamer.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col space-y-1">
                                <div className="text-xs text-gray-500 flex items-center">
                                  <i className="fas fa-shopping-cart text-indigo-500 mr-2"></i>
                                  <span>Đơn thuê: <span className="font-semibold text-gray-700">{gamer.orderCount}</span></span>
                                </div>
                                <div className="text-xs text-gray-500 flex items-center">
                                  <i className="fas fa-star text-yellow-500 mr-2"></i>
                                  <span>Đánh giá: <span className="font-semibold text-gray-700">{gamer.reviewCount}</span></span>
                                </div>
                                <div className="text-xs text-gray-500 flex items-center">
                                  <i className="fas fa-coins text-yellow-600 mr-2"></i>
                                  <span>Thu nhập: <span className="font-semibold text-gray-700">{gamer.income.toLocaleString('vi-VN')} đ</span></span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBg} ${statusColor}`}>{statusText}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${rankColor} mr-2`}>{rankText}</span>
                                <div className="flex text-yellow-500">
                                  {[...Array(5)].map((_, i) => (
                                    <i key={i} className={`fas fa-star${i < rating ? '' : '-o'}`}></i>
                                  ))}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${gameColor} flex items-center`}>
                                <i className="fas fa-gamepad mr-1"></i> {gameName}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-indigo-600 hover:text-indigo-900 mr-3 cursor-pointer">
                                <i className="fas fa-eye"></i>
                              </button>
                              <button
                                className={`${gamer.status === 'BANNED' ? 'text-green-600 hover:text-green-900' : 'text-yellow-600 hover:text-yellow-900'} mr-3 cursor-pointer`}
                                onClick={() => handleToggleGamerStatus(gamer)}
                              >
                                <i className={`fas ${gamer.status === 'BANNED' ? 'fa-unlock' : 'fa-user-slash'}`}></i>
                              </button>
                              <button
                                className="text-red-600 hover:text-red-900 cursor-pointer"
                                onClick={() => handleDeleteGamer(gamer)}
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                      } !rounded-button whitespace-nowrap cursor-pointer`}
                    >
                      Trước
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                      } !rounded-button whitespace-nowrap cursor-pointer`}
                    >
                      Sau
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Hiển thị <span className="font-medium">{indexOfFirstItem + 1}</span> đến <span className="font-medium">{Math.min(indexOfLastItem, filteredGamers.length)}</span> trong số <span className="font-medium">{filteredGamers.length}</span> kết quả
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-4 relative">
                        <div
                          className="flex items-center justify-between bg-white border border-gray-300 rounded-lg px-3 py-1 text-sm text-gray-700 cursor-pointer"
                          onClick={() => setShowItemsPerPageDropdown(!showItemsPerPageDropdown)}
                        >
                          <span>{itemsPerPage} / trang</span>
                          <i className="fas fa-chevron-down ml-2 text-gray-500"></i>
                        </div>
                        {showItemsPerPageDropdown && (
                          <div className="absolute right-0 z-10 mt-1 w-32 bg-white border border-gray-300 rounded-lg shadow-lg">
                            {[5, 10, 20, 50].map((number) => (
                              <div
                                key={number}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setItemsPerPage(number);
                                  setCurrentPage(1);
                                  setShowItemsPerPageDropdown(false);
                                }}
                              >
                                {number} / trang
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                            currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50 cursor-pointer'
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <i className="fas fa-chevron-left"></i>
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                          let pageNumber;
                          if (totalPages <= 5) {
                            pageNumber = index + 1;
                          } else if (currentPage <= 3) {
                            pageNumber = index + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + index;
                          } else {
                            pageNumber = currentPage - 2 + index;
                          }
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => handlePageChange(pageNumber)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === pageNumber
                                  ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              } cursor-pointer`}
                            >
                              {pageNumber}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                            currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50 cursor-pointer'
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <i className="fas fa-chevron-right"></i>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
     

      {/* Notification */}
      {showNotification && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg ${notificationType === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white flex items-center z-50`}>
          <i className={`fas ${notificationType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
          <span>{notificationMessage}</span>
        </div>
      )}
     
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative overflow-y-auto" style={{ maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setShowAddModal(false)}>
              <i className="fas fa-times"></i>
            </button>
            <h2 className="text-xl font-bold mb-4">Thêm game thủ</h2>
            <form onSubmit={handleAddGamer} className="space-y-4">
              <input name="userId" value={addForm.userId} onChange={handleAddInputChange} className="w-full border rounded px-3 py-2" placeholder="User ID" required />
              <select name="gameId" value={addForm.gameId} onChange={handleAddInputChange} className="w-full border rounded px-3 py-2" required>
                <option value="">Chọn game</option>
                {games.map(game => (
                  <option key={game.id} value={game.id}>{game.name}</option>
                ))}
              </select>
              <input name="username" value={addForm.username} onChange={handleAddInputChange} className="w-full border rounded px-3 py-2" placeholder="Username" required />
              <select name="rank" value={addForm.rank} onChange={handleAddInputChange} className="w-full border rounded px-3 py-2" required disabled={!selectedGame || !selectedGame.availableRanks || selectedGame.availableRanks.length === 0}>
                <option value="">Chọn rank</option>
                {selectedGame && Array.isArray(selectedGame.availableRanks) && selectedGame.availableRanks.map(rank => (
                  <option key={rank} value={rank}>{rank}</option>
                ))}
              </select>
              <select name="role" value={addForm.role} onChange={handleAddInputChange} className="w-full border rounded px-3 py-2" disabled={!selectedGame || !selectedGame.availableRoles || selectedGame.availableRoles.length === 0}>
                <option value="">Chọn role</option>
                {selectedGame && Array.isArray(selectedGame.availableRoles) && selectedGame.availableRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <input name="server" value={addForm.server} onChange={handleAddInputChange} className="w-full border rounded px-3 py-2" placeholder="Server" required />
              <input name="pricePerHour" type="number" value={addForm.pricePerHour} onChange={handleAddInputChange} className="w-full border rounded px-3 py-2" placeholder="Giá mỗi giờ" required min="0" />
              <textarea name="description" value={addForm.description} onChange={handleAddInputChange} className="w-full border rounded px-3 py-2" placeholder="Mô tả" maxLength={500} />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded w-full" disabled={isAdding}>
                {isAdding ? 'Đang thêm...' : 'Thêm game thủ'}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default GamerListPage;
