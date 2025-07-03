// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.
import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout'; // Adjust the import path as necessary
// Define order status types as a comment for reference
// OrderStatus: 'Đã xác nhận' | 'Đang diễn ra' | 'Đã hoàn thành' | 'Bị hủy' | 'Chờ xác nhận'
// Order object structure is described in the sampleOrders array below

import axiosInstance from '../api/axiosConfig';

function Order() {
  // State variables
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [orderId, setOrderId] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [orderDetail, setOrderDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axiosInstance.get('/orders/summary', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data || []);
      } catch (err) {
        setOrders([]);
      }
    };
    fetchOrders();
  }, []);

  // Filter orders based on active tab, search term, order ID and price range
  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === 'Tất cả' || order.statusLabel === activeTab;
    const matchesSearch =
      (order.renterName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.playerName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrderId = !orderId || String(order.id).toLowerCase().includes(orderId.toLowerCase());
    const matchesPrice = (!priceRange.min || order.price >= parseInt(priceRange.min)) &&
      (!priceRange.max || order.price <= parseInt(priceRange.max));
    return matchesTab && matchesSearch && matchesOrderId && matchesPrice;
  });

  // Sắp xếp đơn mới nhất lên đầu
  const sortedOrders = [...filteredOrders].sort((a, b) => b.id - a.id);

  // Pagination logic
  const totalPages = Math.ceil(sortedOrders.length / rowsPerPage);
  const indexOfLastOrder = currentPage * rowsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - rowsPerPage;
  const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  // Get status color
  const getStatusColor = (statusLabel) => {
    switch (statusLabel) {
      case 'Đã xác nhận':
        return 'bg-green-100 text-green-800';
      case 'Đang diễn ra':
        return 'bg-blue-100 text-blue-800';
      case 'Đã hoàn thành':
        return 'bg-gray-100 text-gray-800';
      case 'Bị hủy':
        return 'bg-red-100 text-red-800';
      case 'Chờ xác nhận':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Dummy handlers for actions
  const handleViewOrderDetails = async (id) => {
    setShowDetailModal(true);
    setLoadingDetail(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axiosInstance.get(`/orders/detail/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrderDetail(res.data);
    } catch (err) {
      setOrderDetail(null);
    }
    setLoadingDetail(false);
  };
  const handleConfirmOrder = (id) => {
    alert('Xác nhận đơn: ' + id);
  };
  const handleDeleteOrder = async (order) => {
    if (order.status !== 'COMPLETED') {
      alert('Chỉ có thể xóa đơn đã hoàn thành (COMPLETED)');
      return;
    }
    if (!window.confirm('Bạn có chắc chắn muốn xóa đơn này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.delete(`/orders/${order.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(prev => prev.filter(o => o.id !== order.id));
      alert('Xóa đơn thành công!');
    } catch (err) {
      alert(err.response?.data || 'Không thể xóa đơn!');
    }
  };

  // Count orders by status
  const countOrdersByStatus = (statusLabel) => {
    if (statusLabel === 'Tất cả') return orders.length;
    return orders.filter(order => order.statusLabel === statusLabel).length;
  };

  return (
    <AdminLayout breadcrumb="Quản lý đơn thuê">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200">
              <h1 className="text-2xl font-semibold text-gray-900">Quản lý đơn thuê</h1>
            </div>
            {/* Search and Filters */}
            <div className="p-6 border-b border-gray-200 space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-search text-gray-400"></i>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="Tìm kiếm theo tên người thuê / người chơi"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Mã đơn</label>
                  <input
                    type="text"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="Nhập mã đơn"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Khoảng giá (VND)</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      placeholder="Giá từ"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    />
                    <input
                      type="number"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      placeholder="Đến giá"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px px-6">
                {['Tất cả', 'Đã xác nhận', 'Đang diễn ra', 'Đã hoàn thành', 'Bị hủy', 'Chờ xác nhận'].map((tab) => (
                  <button
                    key={tab}
                    className={`whitespace-nowrap cursor-pointer py-4 px-4 border-b-2 font-medium text-sm ${
                      activeTab === tab
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setActiveTab(tab);
                      setCurrentPage(1);
                    }}
                  >
                    {tab} ({countOrdersByStatus(tab)})
                  </button>
                ))}
              </nav>
            </div>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã đơn
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người thuê
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Game thủ
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian thuê
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giá
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full object-cover" src={order.renterAvatarUrl || '/default-avatar.png'} alt={order.renterName} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{order.renterName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full object-cover" src={order.playerAvatarUrl || '/default-avatar.png'} alt={order.playerName} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{order.playerName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.timeRange}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.statusLabel)}`}>
                          {order.statusLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatPrice(order.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewOrderDetails(order.id)}
                            className="text-indigo-600 hover:text-indigo-900 cursor-pointer !rounded-button whitespace-nowrap"
                            title="Xem chi tiết"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order)}
                            className="text-red-600 hover:text-red-900 cursor-pointer !rounded-button whitespace-nowrap"
                            title="Xóa đơn"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } !rounded-button whitespace-nowrap`}
                >
                  Trước
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } !rounded-button whitespace-nowrap`}
                >
                  Sau
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Hiển thị <span className="font-medium">{indexOfFirstOrder + 1}</span> đến <span className="font-medium">{Math.min(indexOfLastOrder, sortedOrders.length)}</span> của <span className="font-medium">{sortedOrders.length}</span> kết quả
                  </p>
                </div>
                <div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-700">Hiển thị</span>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {[5, 10, 20].map(pageSize => (
                        <option key={pageSize} value={pageSize}>
                          {pageSize}
                        </option>
                      ))}
                    </select>
                    <span className="text-sm text-gray-700">dòng mỗi trang</span>
                  </div>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50 cursor-pointer'
                      } !rounded-button whitespace-nowrap`}
                    >
                      <span className="sr-only">Trước</span>
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        } !rounded-button whitespace-nowrap`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50 cursor-pointer'
                      } !rounded-button whitespace-nowrap`}
                    >
                      <span className="sr-only">Sau</span>
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal chi tiết đơn thuê */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg relative animate-fadeIn" onClick={e => e.stopPropagation()}>
            <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl" onClick={() => setShowDetailModal(false)}>
              <i className="fas fa-times"></i>
            </button>
            <h2 className="text-2xl font-bold mb-4 text-indigo-700 flex items-center gap-2">
              <i className="fas fa-file-invoice-dollar text-indigo-500"></i> Chi tiết đơn thuê
            </h2>
            {loadingDetail ? (
              <div className="text-center py-8">Đang tải...</div>
            ) : orderDetail ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-2">
                  <img src={orderDetail.playerAvatarUrl || '/default-avatar.png'} alt="avatar" className="w-16 h-16 rounded-full border-2 border-indigo-400 object-cover" />
                  <div>
                    <div className="text-lg font-semibold text-gray-800">{orderDetail.playerName}</div>
                    <div className="text-sm text-gray-500">Game thủ</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="font-medium text-gray-600">Mã đơn:</div>
                  <div className="font-semibold text-gray-900">#{orderDetail.id}</div>
                  <div className="font-medium text-gray-600">Người thuê:</div>
                  <div className="text-gray-900">{orderDetail.hirerName}</div>
                  <div className="font-medium text-gray-600">Game:</div>
                  <div className="text-gray-900 flex items-center gap-1"><i className="fas fa-gamepad text-indigo-400"></i> {orderDetail.game}</div>
                  <div className="font-medium text-gray-600">Rank:</div>
                  <div className="text-gray-900">{orderDetail.playerRank}</div>
                  <div className="font-medium text-gray-600">Thời gian bắt đầu:</div>
                  <div className="text-gray-900">{orderDetail.startTime ? new Date(orderDetail.startTime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}</div>
                  <div className="font-medium text-gray-600">Số giờ thuê:</div>
                  <div className="text-gray-900">{orderDetail.hours}</div>
                  <div className="font-medium text-gray-600">Tổng tiền:</div>
                  <div className="text-indigo-600 font-bold">{orderDetail.totalCoin?.toLocaleString('vi-VN')} đ</div>
                  <div className="font-medium text-gray-600">Trạng thái:</div>
                  <div>
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${orderDetail.status === 'REJECTED' || orderDetail.status === 'CANCELED' ? 'bg-red-100 text-red-800' : orderDetail.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' : orderDetail.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : orderDetail.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>{orderDetail.status}</span>
                  </div>
                  {orderDetail.specialRequest && <><div className="font-medium text-gray-600">Yêu cầu đặc biệt:</div><div className="text-gray-900">{orderDetail.specialRequest}</div></>}
                </div>
              </div>
            ) : (
              <div className="text-center text-red-500">Không lấy được chi tiết đơn!</div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default Order;