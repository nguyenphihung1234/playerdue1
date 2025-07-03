import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import axios from "../api/axiosConfig";

const UserListPage = () => {
  // Dữ liệu người dùng mẫu
  const [users, setUsers] = useState([
    // Xóa dữ liệu mẫu, sẽ lấy từ API
  ]);

  // State cho các chức năng
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sortConfig, setSortConfig] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]); // Danh sách role lấy từ BE
  const [selectedRole, setSelectedRole] = useState(""); // Role đang chọn trong modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', fullName: '', password: '' });

  // Danh sách quyền
  const permissionGroups = [
    {
      name: "Quản lý người dùng",
      permissions: [
        { id: 1, name: "Xem danh sách người dùng", checked: true },
        { id: 2, name: "Thêm người dùng", checked: false },
        { id: 3, name: "Sửa người dùng", checked: true },
        { id: 4, name: "Xóa người dùng", checked: false },
      ],
    },
    {
      name: "Quản lý sản phẩm",
      permissions: [
        { id: 5, name: "Xem danh sách sản phẩm", checked: true },
        { id: 6, name: "Thêm sản phẩm", checked: true },
        { id: 7, name: "Sửa sản phẩm", checked: false },
        { id: 8, name: "Xóa sản phẩm", checked: false },
      ],
    },
    {
      name: "Quản lý đơn hàng",
      permissions: [
        { id: 9, name: "Xem danh sách đơn hàng", checked: true },
        { id: 10, name: "Xử lý đơn hàng", checked: false },
        { id: 11, name: "Hủy đơn hàng", checked: false },
      ],
    },
  ];

  const [permissions, setPermissions] = useState(permissionGroups);

  // Fetch users từ API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Map dữ liệu về đúng định dạng bảng
        const apiUsers = res.data.map((user) => ({
          id: user.id,
          name: user.fullName || user.username || "", // fallback nếu thiếu
          email: user.email,
          role: user.roles && user.roles.length > 0 ? user.roles[0] : "User",
          status:
            user.enabled && user.accountNonLocked
              ? "Hoạt động"
              : !user.enabled && user.accountNonLocked
              ? "Chờ duyệt"
              : user.enabled && !user.accountNonLocked
              ? "Bị khóa"
              : "Không hoạt động",
          createdAt: user.createdAt
            ? new Date(user.createdAt).toLocaleDateString("vi-VN")
            : "",
          avatar: user.avatarUrl ||
            "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.fullName || user.username || "U") + "&background=random",
        }));
        setUsers(apiUsers);
      } catch (err) {
        setUsers([]);
      }
    };
    fetchUsers();
  }, []);

  // Xử lý tìm kiếm và lọc
  const filteredUsers = users.filter((user) => {
    return (
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (roleFilter === "" || user.role === roleFilter) &&
      (statusFilter === "" || user.status === statusFilter) &&
      (dateFilter === "" || user.createdAt.includes(dateFilter))
    );
  });

  // Xử lý sắp xếp
  const sortedUsers = React.useMemo(() => {
    let sortableUsers = [...filteredUsers];
    if (sortConfig !== null) {
      sortableUsers.sort((a, b) => {
        if (
          a[sortConfig.key] < b[sortConfig.key]
        ) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (
          a[sortConfig.key] > b[sortConfig.key]
        ) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [filteredUsers, sortConfig]);

  // Xử lý phân trang
  const itemsPerPage = 5;
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

  // Xử lý sắp xếp
  const requestSort = (key) => {
    let direction = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Xử lý mở modal phân quyền
  const handleOpenPermissionModal = async (userId) => {
    setSelectedUser(userId);
    setShowPermissionModal(true);
    try {
      const token = localStorage.getItem("token");
      // Lấy danh sách role hệ thống (nếu có endpoint riêng, ví dụ /api/roles)
      const res = await axios.get("/roles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailableRoles(res.data);
      // Lấy role hiện tại của user (nếu có)
      const user = users.find((u) => u.id === userId);
      setSelectedRole(user?.role || "");
    } catch (err) {
      setAvailableRoles(["Admin", "User", "Player"]); // fallback nếu lỗi
    }
  };

  // Xử lý thay đổi quyền
  const handlePermissionChange = (groupIndex, permissionId) => {
    const newPermissions = [...permissions];
    const permissionIndex = newPermissions[groupIndex].permissions.findIndex(
      (p) => p.id === permissionId,
    );
    newPermissions[groupIndex].permissions[permissionIndex].checked =
      !newPermissions[groupIndex].permissions[permissionIndex].checked;
    setPermissions(newPermissions);
  };

  // Xử lý lưu phân quyền
  const handleSavePermissions = async () => {
    if (!selectedUser) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(`/users/${selectedUser}/roles`, [selectedRole], {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Cập nhật phân quyền thành công!");
      setShowPermissionModal(false);
      setSelectedUser(null);
    } catch (err) {
      alert("Có lỗi khi cập nhật phân quyền!");
    }
  };

  // Xử lý xóa người dùng
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      alert("Xóa người dùng thành công!");
    } catch (err) {
      alert("Có lỗi khi xóa người dùng!");
    }
  };

  // Thêm hàm xử lý ban/mở ban user
  const handleToggleBanUser = async (user) => {
    const token = localStorage.getItem("token");
    try {
      if (user.status === "Hoạt động") {
        // Ban user
        await axios.patch(`/users/${user.id}/lock`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: "Bị khóa" } : u));
        alert("Đã ban user thành công!");
      } else if (user.status === "Bị khóa") {
        // Mở ban user
        await axios.patch(`/users/${user.id}/unlock`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: "Hoạt động" } : u));
        alert("Đã mở ban user thành công!");
      }
    } catch (err) {
      alert("Có lỗi khi cập nhật trạng thái user!");
    }
  };

  // Xử lý tạo user mới
  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.fullName || !newUser.password) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post('/users', newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Tạo người dùng thành công!');
      setShowCreateModal(false);
      setNewUser({ username: '', email: '', fullName: '', password: '' });
      // Reload lại danh sách user
      const res = await axios.get('/users', { headers: { Authorization: `Bearer ${token}` } });
      const apiUsers = res.data.map((user) => ({
        id: user.id,
        name: user.fullName || user.username || '',
        email: user.email,
        role: user.roles && user.roles.length > 0 ? user.roles[0] : 'User',
        status:
          user.enabled && user.accountNonLocked
            ? 'Hoạt động'
            : !user.enabled && user.accountNonLocked
            ? 'Chờ duyệt'
            : user.enabled && !user.accountNonLocked
            ? 'Bị khóa'
            : 'Không hoạt động',
        createdAt: user.createdAt
          ? new Date(user.createdAt).toLocaleDateString('vi-VN')
          : '',
        avatar:
          user.avatarUrl ||
          'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.fullName || user.username || 'U') + '&background=random',
      }));
      setUsers(apiUsers);
    } catch (err) {
      alert('Có lỗi khi tạo người dùng!');
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-800">
                Quản lý người dùng
              </h1>
              <p className="text-gray-500 mt-1">
                Quản lý và phân quyền cho người dùng trong hệ thống
              </p>
            </div>

            {/* Thanh tìm kiếm và nút thêm mới */}
            <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-search text-gray-400"></i>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Tìm kiếm người dùng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-button bg-blue-600 hover:bg-blue-700 text-white shadow-sm whitespace-nowrap cursor-pointer" onClick={() => setShowCreateModal(true)}>
                <i className="fas fa-plus mr-2"></i>
                Thêm người dùng mới
              </button>
            </div>

            {/* Bộ lọc */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="w-full md:w-auto">
                <label
                  htmlFor="role-filter"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Vai trò
                </label>
                <div className="relative">
                  <select
                    id="role-filter"
                    className="appearance-none block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md cursor-pointer"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="">Tất cả vai trò</option>
                    <option value="Admin">Admin</option>
                    <option value="Quản lý">Quản lý</option>
                    <option value="Nhân viên">Nhân viên</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <i className="fas fa-chevron-down text-gray-400"></i>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-auto">
                <label
                  htmlFor="status-filter"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Trạng thái
                </label>
                <div className="relative">
                  <select
                    id="status-filter"
                    className="appearance-none block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md cursor-pointer"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Không hoạt động">Không hoạt động</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <i className="fas fa-chevron-down text-gray-400"></i>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-auto">
                <label
                  htmlFor="date-filter"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Ngày tạo
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="date-filter"
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    placeholder="DD/MM/YYYY"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <i className="fas fa-calendar text-gray-400"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Bảng danh sách người dùng */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Người dùng
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort("email")}
                    >
                      <div className="flex items-center">
                        Email
                        {sortConfig?.key === "email" && (
                          <span className="ml-1">
                            {sortConfig.direction === "ascending" ? (
                              <i className="fas fa-sort-up"></i>
                            ) : (
                              <i className="fas fa-sort-down"></i>
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort("role")}
                    >
                      <div className="flex items-center">
                        Vai trò
                        {sortConfig?.key === "role" && (
                          <span className="ml-1">
                            {sortConfig.direction === "ascending" ? (
                              <i className="fas fa-sort-up"></i>
                            ) : (
                              <i className="fas fa-sort-down"></i>
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort("status")}
                    >
                      <div className="flex items-center">
                        Trạng thái
                        {sortConfig?.key === "status" && (
                          <span className="ml-1">
                            {sortConfig.direction === "ascending" ? (
                              <i className="fas fa-sort-up"></i>
                            ) : (
                              <i className="fas fa-sort-down"></i>
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort("createdAt")}
                    >
                      <div className="flex items-center">
                        Ngày tạo
                        {sortConfig?.key === "createdAt" && (
                          <span className="ml-1">
                            {sortConfig.direction === "ascending" ? (
                              <i className="fas fa-sort-up"></i>
                            ) : (
                              <i className="fas fa-sort-down"></i>
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={user.avatar}
                              alt={user.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === "Admin"
                              ? "bg-purple-100 text-purple-800"
                              : user.role === "Quản lý"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.status === "Hoạt động"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full mr-1 ${
                              user.status === "Hoạt động"
                                ? "bg-green-400"
                                : "bg-red-400"
                            }`}
                          ></span>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.createdAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenPermissionModal(user.id)}
                          className="text-blue-600 hover:text-blue-900 mr-3 cursor-pointer"
                        >
                          <i className="fas fa-user-shield mr-1"></i>
                          Phân quyền
                        </button>
                        <button
                          className={`${user.status === "Bị khóa" ? "text-green-600 hover:text-green-900" : "text-yellow-600 hover:text-yellow-900"} mr-3 cursor-pointer`}
                          onClick={() => handleToggleBanUser(user)}
                        >
                          <i className={`fas ${user.status === "Bị khóa" ? "fa-unlock" : "fa-user-slash"} mr-1`}></i>
                          {user.status === "Bị khóa" ? "Mở ban" : "Ban"}
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 cursor-pointer"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <i className="fas fa-trash-alt mr-1"></i>
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Phân trang */}
            {sortedUsers.length > 0 ? (
              <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    Trước
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    Sau
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Hiển thị{" "}
                      <span className="font-medium">{indexOfFirstUser + 1}</span>{" "}
                      đến{" "}
                      <span className="font-medium">
                        {Math.min(indexOfLastUser, sortedUsers.length)}
                      </span>{" "}
                      trong số{" "}
                      <span className="font-medium">{sortedUsers.length}</span>{" "}
                      người dùng
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <span className="sr-only">Trang trước</span>
                        <i className="fas fa-chevron-left"></i>
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border ${
                              currentPage === page
                                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                            } text-sm font-medium cursor-pointer`}
                          >
                            {page}
                          </button>
                        ),
                      )}
                      <button
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <span className="sr-only">Trang sau</span>
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <i className="fas fa-search text-gray-400 text-5xl mb-4"></i>
                <p className="text-gray-500 text-lg">
                  Không tìm thấy người dùng nào phù hợp với điều kiện tìm kiếm
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal phân quyền */}
        {showPermissionModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <i className="fas fa-user-shield text-blue-600"></i>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Phân quyền người dùng
                      </h3>
                      <div className="mt-4">
                        {availableRoles.length > 0 ? (
                          <div className="space-y-2">
                            {availableRoles.map((role) => (
                              <label key={role} className="flex items-center cursor-pointer">
                                <input
                                  type="radio"
                                  name="user-role"
                                  value={role}
                                  checked={selectedRole === role}
                                  onChange={() => setSelectedRole(role)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="ml-2 text-sm text-gray-900">{role}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-500">Không có quyền nào</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-button border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm whitespace-nowrap cursor-pointer"
                    onClick={handleSavePermissions}
                    disabled={!selectedRole}
                  >
                    Lưu thay đổi
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-button border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm whitespace-nowrap cursor-pointer"
                    onClick={() => setShowPermissionModal(false)}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal tạo user mới */}
        {showCreateModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Thêm người dùng mới</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tên đăng nhập"
                      value={newUser.username}
                      onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                    />
                    <input
                      type="email"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Email"
                      value={newUser.email}
                      onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                    />
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Họ và tên"
                      value={newUser.fullName}
                      onChange={e => setNewUser({ ...newUser, fullName: e.target.value })}
                    />
                    <input
                      type="password"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Mật khẩu"
                      value={newUser.password}
                      onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                    />
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-button border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm whitespace-nowrap cursor-pointer"
                    onClick={handleCreateUser}
                  >
                    Lưu
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-button border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm whitespace-nowrap cursor-pointer"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UserListPage; 