import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Menu, List, AlertCircle, X } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'الرئيسية', path: '/stats' },
    { icon: <Users size={20} />, label: 'المستخدمين', path: '/users' },
    { icon: <List size={20} />, label: 'الإعلانات', path: '/ads' },
    { icon: <AlertCircle size={20} />, label: 'البلاغات', path: '/reports' },
    { icon: <Menu size={20} />, label: 'الأقسام', path: '/categories' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 overflow-x-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-64 bg-white border-l transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-[100%]'} lg:relative lg:translate-x-0`}>
        <div className="h-16 flex items-center justify-between px-6 border-b">
          <h1 className="text-xl font-bold text-indigo-600">لوحة التحكم</h1>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 lg:hidden text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setIsSidebarOpen(false);
                }
              }}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors mt-8"
          >
            <LogOut size={20} />
            <span className="font-medium">تسجيل الخروج</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 sticky top-0 z-40 lg:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Menu size={24} />
          </button>
          <span className="font-bold text-gray-800">المدير</span>
          <div className="w-10"></div> {/* Spacer for symmetry */}
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
