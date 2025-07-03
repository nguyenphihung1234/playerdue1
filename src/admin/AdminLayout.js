import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(5);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleUserDropdown = () => setUserDropdownOpen(!userDropdownOpen);

  // Xác định route đang active để highlight sidebar
  const isActive = (path) => location.pathname === path;

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    localStorage.clear();
    // Nếu có context logout thì gọi thêm ở đây
    navigate('/login');
  };

  return (
    <div className={`min-h-screen font-sans ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      {/* Header */}
      <header className={`fixed w-full z-30 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm rounded-b-lg`}>
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <button onClick={toggleSidebar} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none cursor-pointer">
              <i className="fas fa-bars text-xl"></i>
            </button>
            <div className="ml-4 flex items-center">
              <span className="text-xl font-bold text-indigo-600">PlayerDuo</span>
              <span className="ml-2 text-sm bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md dark:bg-indigo-700 dark:text-indigo-100">Admin</span>
            </div>
          </div>

          <div className="w-1/3">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className={`w-full pl-10 pr-4 py-2 rounded-full border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <i className="fas fa-search"></i>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 mr-2 cursor-pointer">
              <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'} text-lg text-gray-600 dark:text-gray-300`}></i>
            </button>
            <div className="relative mr-2">
              <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer">
                <i className="fas fa-bell text-lg text-gray-600 dark:text-gray-300"></i>
                {notifications > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center -translate-y-1 translate-x-1">
                    {notifications}
                  </span>
                )}
              </button>
            </div>
            <div className="relative">
              <div onClick={toggleUserDropdown} className="flex items-center cursor-pointer p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200">
                <img 
                  src="https://readdy.ai/api/search-image?query=professional%20portrait%20of%20a%20Vietnamese%20male%20administrator%20with%20short%20black%20hair%20wearing%20a%20business%20casual%20outfit%2C%20neutral%20expression%2C%20clean%20background%2C%20high%20quality%20professional%20headshot&width=40&height=40&seq=1&orientation=squarish" 
                  alt="Admin" 
                  className="w-9 h-9 rounded-full object-cover border-2 border-indigo-500"
                />
                <span className={`ml-2 font-medium hidden md:block ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {localStorage.getItem('name') || localStorage.getItem('username') || 'Admin'}
                </span>
                <i className={`fas fa-chevron-down ml-1 text-xs transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''} ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}></i>
              </div>
              {userDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} ring-1 ring-black ring-opacity-5 z-40`}>
                  <a href="#" className={`block px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-md mx-1`}>
                    <i className="fas fa-user mr-2"></i> Hồ sơ cá nhân
                  </a>
                  <a href="#" className={`block px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-md mx-1`}>
                    <i className="fas fa-cog mr-2"></i> Cài đặt
                  </a>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  <a href="#" className={`block px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900 dark:text-red-400 rounded-md mx-1`} onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt mr-2"></i> Đăng xuất
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-20 w-64 transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg pt-16 rounded-r-lg`}>
        <div className="h-full overflow-y-auto">
          <nav className="px-4 py-4">
            <div className="space-y-1">
              <Link to="/admin" className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg ${isActive('/admin') ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-white' : darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>
                <i className="fas fa-tachometer-alt w-6 text-center"></i>
                <span className="ml-3">Tổng quan</span>
              </Link>
              <div className="pt-2">
                <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Quản lý người dùng</p>
                <Link to="/admin/users" className={`mt-1 flex items-center px-3 py-3 text-sm font-medium rounded-lg ${isActive('/admin/users') ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-white' : darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>
                  <i className="fas fa-users w-6 text-center"></i>
                  <span className="ml-3">Quản lý người dùng</span>
                </Link>
                <Link to="/admin/manage-gamers" className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg ${isActive('/admin/manage-gamers') ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-white' : darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>
                  <i className="fas fa-gamepad w-6 text-center"></i>
                  <span className="ml-3">Quản lý Game thủ</span>
                </Link>
                <Link to="/admin/games" className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg ${isActive('/admin/games') ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-white' : darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>
                  <i className="fas fa-dice w-6 text-center"></i>
                  <span className="ml-3">Quản lý game</span>
                </Link>
                <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Quản lý doanh thu</p>
                <Link to="/admin/orders" className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg ${isActive('/admin/orders') ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-white' : darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>
                  <i className="fas fa-receipt w-6 text-center"></i>
                  <span className="ml-3">Quản lý đơn hàng</span>
                </Link>
                <Link to="/admin/revenue" className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg ${isActive('/admin/revenue') ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-white' : darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-700'}`}> 
                  <i className="fas fa-credit-card w-6 text-center"></i>
                  <span className="ml-3">Quản lý doanh thu</span>
                </Link>
                <Link to="/admin/deposit" className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg ${isActive('/admin/deposit') ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-white' : darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-700'}`}> 
                  <i className="fas fa-wallet w-6 text-center"></i>
                  <span className="ml-3">Quản lý nạp tiền,rút tiền</span>
                </Link>
                
              </div>
              {/* Thêm các mục sidebar khác tương tự ở đây */}
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`pt-20 ${sidebarOpen ? 'md:ml-64' : ''} transition-all duration-300 min-h-screen bg-gray-50`}>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;