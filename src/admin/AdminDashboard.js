import React, { useState, useEffect } from 'react';
import * as echarts from 'echarts';
import axios from '../api/axiosConfig';
import { Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";

const AdminDashboard = () => { 
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(5);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('7days');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); 
  const [userCount, setUserCount] = useState(null);
  const [userGrowth, setUserGrowth] = useState(null);
  const [orderCount, setOrderCount] = useState(null);
  const [orderGrowth, setOrderGrowth] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [revenueGrowth, setRevenueGrowth] = useState(null);
  const [reportSummary, setReportSummary] = useState({ total: null, unprocessed: null });
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartRange, setChartRange] = useState('7days');
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [joinedFrom, setJoinedFrom] = useState('');
  const [joinedTo, setJoinedTo] = useState('');
  const usersPerPage = 10;

 
  useEffect(() => {
    
    const revenueChart = echarts.init(document.getElementById('revenue-chart')); // Removed as HTMLDivElement
    const revenueOption = {
      animation: false,
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['Doanh thu', 'Đơn thuê'],
        textStyle: {
          color: darkMode ? '#ffffff' : '#333333' 
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['20/06', '21/06', '22/06', '23/06', '24/06', '25/06', '26/06'],
        axisLabel: {
          color: darkMode ? '#ccc' : '#555' // Adjust axis label color
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: darkMode ? '#ccc' : '#555' // Adjust axis label color
        }
      },
      series: [
        {
          name: 'Doanh thu',
          type: 'line',
          data: [5200000, 4800000, 6500000, 7200000, 6800000, 7500000, 8200000],
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#4F46E5'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: 'rgba(79, 70, 229, 0.4)'
              }, {
                offset: 1, color: 'rgba(79, 70, 229, 0.1)'
              }]
            }
          }
        },
        {
          name: 'Đơn thuê',
          type: 'line',
          data: [120, 132, 145, 160, 152, 168, 180],
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#10B981'
          }
        }
      ]
    };
    revenueChart.setOption(revenueOption);

    // Biểu đồ phân bổ người dùng
    const userChart = echarts.init(document.getElementById('user-chart')); // Removed as HTMLDivElement
    const userOption = {
      animation: false,
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: {
          color: darkMode ? '#ffffff' : '#333333' // Adjust legend text color based on dark mode
        }
      },
      series: [
        {
          name: 'Phân bổ người dùng',
          type: 'pie',
          radius: '70%',
          data: [
            { value: 1548, name: 'Người dùng thường' },
            { value: 735, name: 'Game thủ' },
            { value: 580, name: 'Người dùng mới' },
            { value: 120, name: 'Admin' }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          itemStyle: {
            borderRadius: 5,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false // Hide labels on the pie chart itself
          }
        }
      ]
    };
    userChart.setOption(userOption);

    // Resize charts on window resize
    const handleResize = () => {
      revenueChart.resize();
      userChart.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      revenueChart.dispose();
      userChart.dispose();
    };
  }, [darkMode]); // Re-render charts when dark mode changes to update text color

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/users/count', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setUserCount(res.data))
      .catch(() => setUserCount('N/A'));
    axios.get('/users/growth-percent', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setUserGrowth(res.data))
      .catch(() => setUserGrowth(null));
    axios.get('/orders/count', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setOrderCount(Number(res.data)))
      .catch(() => setOrderCount('N/A'));
    axios.get('/orders/growth-percent-yesterday', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setOrderGrowth(res.data))
      .catch(() => setOrderGrowth(null));
    axios.get('/game-players/revenue/total', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setRevenue(Number(res.data)))
      .catch(() => setRevenue('N/A'));
    axios.get('/game-players/revenue/growth-percent-yesterday', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setRevenueGrowth(res.data))
      .catch(() => setRevenueGrowth(null));
    axios.get('/reports/summary', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setReportSummary({
        total: res.data.total,
        unprocessed: res.data.unprocessed
      }))
      .catch(() => setReportSummary({ total: 'N/A', unprocessed: 'N/A' }));
    axios.get('/users/recent', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setUsers(res.data))
      .catch(() => setUsers([]));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    // Chart data fetch
    let from, to;
    const today = new Date();
    if (chartRange === '7days') {
      to = today;
      from = new Date(today);
      from.setDate(from.getDate() - 6);
    } else if (chartRange === '30days') {
      to = today;
      from = new Date(today);
      from.setDate(from.getDate() - 29);
    } else {
      to = today;
      from = new Date(today);
      from.setDate(from.getDate() - 6);
    }
    const fromStr = from.toISOString().slice(0, 10);
    const toStr = to.toISOString().slice(0, 10);
    setChartLoading(true);
    axios.get(`/statistics/revenue-orders?from=${fromStr}&to=${toStr}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setChartData(res.data);
        setChartLoading(false);
      })
      .catch(() => setChartLoading(false));
  }, [chartRange]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  const handleDeleteUser = (id) => { // Removed : number
    setSelectedUser(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    // Xử lý xóa người dùng
    console.log(`Deleting user with ID: ${selectedUser}`);
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  // Tính toán dữ liệu phân trang:
  const filteredUsers = users
    .filter(user =>
      (statusFilter === 'all' || user.status === statusFilter) &&
      (roleFilter === 'all' || user.role === roleFilter) &&
      (user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!joinedFrom || (user.joinedDate && user.joinedDate >= joinedFrom)) &&
      (!joinedTo || (user.joinedDate && user.joinedDate <= joinedTo))
    );
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, roleFilter, joinedFrom, joinedTo]);

  return (
    <AdminLayout>
          {/* Breadcrumb */}
          <nav className="mb-5 text-sm">
            <ol className="list-reset flex">
              <li><a href="#" className="text-indigo-600 hover:underline">Trang chủ</a></li>
              <li><span className="mx-2 text-gray-500">/</span></li>
              <li className="text-gray-500">Tổng quan</li>
            </ol>
          </nav>
          {/* Page Title */}
          <div className="flex justify-between items-center mb-6">
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Tổng quan hệ thống</h1>
            <div className="flex space-x-2">
              <div className="relative">
                <select 
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className={`appearance-none pl-3 pr-8 py-2 border rounded-full ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer`}
                >
                  <option value="today">Hôm nay</option>
                  <option value="yesterday">Hôm qua</option>
                  <option value="7days">7 ngày qua</option>
                  <option value="30days">30 ngày qua</option>
                  <option value="custom">Tùy chỉnh</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <i className="fas fa-chevron-down text-gray-500 dark:text-gray-400 text-xs"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className={`p-6 rounded-xl shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tổng người dùng</p>
              <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{userCount !== null ? userCount.toLocaleString() : '...'}</h3>
              <p className={`text-sm mt-2 flex items-center ${userGrowth > 0 ? 'text-green-600' : userGrowth < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                <i className={`fas ${userGrowth > 0 ? 'fa-arrow-up' : userGrowth < 0 ? 'fa-arrow-down' : ''} mr-1`}></i>
                {userGrowth !== null ? `${Math.abs(userGrowth).toFixed(2)}%` : '...'} <span className="text-gray-500 ml-1 dark:text-gray-400">so với tuần trước</span>
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-700 dark:text-blue-100">
                  <i className="fas fa-users text-xl"></i>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-xl shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex justify-between items-center">
                <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tổng đơn hàng</p>
              <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {typeof orderCount === 'number' ? orderCount.toLocaleString() : (orderCount === null ? '...' : 'N/A')}
              </h3>
              <p className={`text-sm mt-2 flex items-center ${orderGrowth > 0 ? 'text-green-600' : orderGrowth < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                <i className={`fas ${orderGrowth > 0 ? 'fa-arrow-up' : orderGrowth < 0 ? 'fa-arrow-down' : ''} mr-1`}></i>
                {orderGrowth !== null ? `${Math.abs(orderGrowth).toFixed(2)}%` : '...'} <span className="text-gray-500 ml-1 dark:text-gray-400">so với hôm qua</span>
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-700 dark:text-purple-100">
                  <i className="fas fa-shopping-cart text-xl"></i>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-xl shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex justify-between items-center">
                <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tổng doanh thu</p>
              <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {typeof revenue === 'number' ? revenue.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : (revenue === null ? '...' : 'N/A')}
              </h3>
              <p className={`text-sm mt-2 flex items-center ${revenueGrowth > 0 ? 'text-green-600' : revenueGrowth < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                <i className={`fas ${revenueGrowth > 0 ? 'fa-arrow-up' : revenueGrowth < 0 ? 'fa-arrow-down' : ''} mr-1`}></i>
                {revenueGrowth !== null ? `${Math.abs(revenueGrowth).toFixed(2)}%` : '...'} <span className="text-gray-500 ml-1 dark:text-gray-400">so với hôm qua</span>
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-100 text-green-600 dark:bg-green-700 dark:text-green-100">
                  <i className="fas fa-money-bill-wave text-xl"></i>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-xl shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Báo cáo vi phạm</p>
              <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{reportSummary.total !== null ? reportSummary.total.toLocaleString() : '...'}</h3>
                  <p className="text-sm mt-2 flex items-center text-red-600">
                <i className="fas fa-arrow-up mr-1"></i> {reportSummary.unprocessed !== null ? reportSummary.unprocessed.toLocaleString() : '...'} <span className="text-gray-500 ml-1 dark:text-gray-400">chưa xử lý</span>
                  </p>
                </div>
                <div className="p-3 rounded-full bg-red-100 text-red-600 dark:bg-red-700 dark:text-red-100">
                  <i className="fas fa-flag text-xl"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className={`lg:col-span-2 p-6 rounded-xl shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Doanh thu & Đơn thuê</h3>
                <div className="relative">
              <select value={chartRange} onChange={e => setChartRange(e.target.value)} className={`appearance-none pl-3 pr-8 py-1 text-sm border rounded-full ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer`}>
                <option value="7days">7 ngày qua</option>
                <option value="30days">30 ngày qua</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <i className="fas fa-chevron-down text-gray-500 dark:text-gray-400 text-xs"></i>
                  </div>
                </div>
              </div>
              <div id="revenue-chart" className="w-full h-80"></div>
            </div>

            <div className={`p-6 rounded-xl shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Phân bổ người dùng</h3>
                <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200">
                  <i className="fas fa-ellipsis-v"></i>
                </button>
              </div>
              <div id="user-chart" className="w-full h-80"></div>
            </div>
          </div>

          {/* Recent Users */}
          <div className={`rounded-xl shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden mb-6`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Người dùng gần đây</h3>
                <a href="#" className="text-indigo-600 hover:text-indigo-800 text-sm">Xem tất cả</a>
              </div>
            </div>
            
            <div className="p-4">
          <div className="flex flex-wrap items-center gap-3 mb-4">
                    <input
                      type="text"
                      placeholder="Tìm kiếm người dùng..."
                      value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-full border bg-gray-100 border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ maxWidth: 250 }}
                />
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="pl-3 pr-8 py-2 border rounded-full bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="ROLE_USER">USER</option>
              <option value="ROLE_PLAYER">PLAYER</option>
              <option value="ROLE_ADMIN">ADMIN</option>
            </select>
                    <select 
                      value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="pl-3 pr-8 py-2 border rounded-full bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">Tất cả trạng thái</option>
              <option value="Đang hoạt động">Đang hoạt động</option>
              <option value="Không hoạt động">Không hoạt động</option>
                    </select>
            <input
              type="date"
              value={joinedFrom}
              onChange={e => setJoinedFrom(e.target.value)}
              className="border rounded-full px-3 py-2 bg-white border-gray-300"
              placeholder="Từ ngày"
              style={{ minWidth: 140 }}
            />
            <input
              type="date"
              value={joinedTo}
              onChange={e => setJoinedTo(e.target.value)}
              className="border rounded-full px-3 py-2 bg-white border-gray-300"
              placeholder="Đến ngày"
              style={{ minWidth: 140 }}
            />
              </div>
              
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        Người dùng
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        Vai trò
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        Trạng thái
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        Ngày tham gia
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        Số dư
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
                {paginatedUsers.map((user, idx) => (
                  <tr key={idx} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img 
                            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.email)}&background=random`}
                            alt={user.fullName}
                                className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                              />
                            </div>
                            <div className="ml-4">
                          <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user.fullName}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ROLE_PLAYER' ? 'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-100' : user.role === 'ROLE_ADMIN' ? 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100' : 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100'}`}>{user.role.replace('ROLE_', '')}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'Đang hoạt động' ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' : user.status === 'Không hoạt động' ? 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100'}`}>{user.status}</span>
                        </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.joinedDate ? new Date(user.joinedDate).toLocaleDateString('vi-VN') : ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.balance != null ? user.balance.toLocaleString('vi-VN') + 'đ' : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
          {totalPages > 1 && (
            <nav className="flex justify-end mt-4">
              <ul className="inline-flex -space-x-px">
                <li>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-l-lg border border-gray-300 ${currentPage === 1 ? 'bg-gray-200 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                  >
                    &lt;
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <li key={page}>
                        <button
                          onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 border border-gray-300 ${currentPage === page ? 'bg-indigo-700 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                        >
                          {page}
                        </button>
                  </li>
                  ))}
                <li>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-r-lg border border-gray-300 ${currentPage === totalPages ? 'bg-gray-200 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                  >
                    &gt;
                      </button>
                </li>
              </ul>
                    </nav>
          )}
        </div>
    </div>
    </AdminLayout>
  );
};

export default  AdminDashboard;
