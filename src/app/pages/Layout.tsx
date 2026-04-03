import { Outlet, Link, useLocation } from 'react-router';
import { useFinance } from '../context';
import {
  LayoutDashboard,
  CreditCard,
  TrendingUp,
  Moon,
  Sun,
  User,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const { role, setRole, darkMode, toggleDarkMode } = useFinance();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: CreditCard },
    { name: 'Insights', path: '/insights', icon: TrendingUp },
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">

      <header className="bg-white dark:bg-gray-800 border-b sticky top-0 z-50">
        <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">

          <div className="flex flex-wrap items-center justify-between gap-3 py-3">

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-base">F</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold">
                Finance Dashboard
              </h1>
            </div>
            <nav className="hidden lg:flex items-center gap-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${
                      isActive(item.path)
                        ? 'bg-blue-100 text-blue-600'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="flex items-center gap-2 sm:gap-3">

              <button
                onClick={() => setRole(role === 'admin' ? 'viewer' : 'admin')}
                className="px-2 sm:px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-sm flex items-center gap-1"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline capitalize">{role}</span>
              </button>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md bg-gray-100 dark:bg-gray-700"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 bg-gray-100 dark:bg-gray-700 rounded-md"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>

            </div>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden pb-4">
              <div className="flex flex-col gap-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                        isActive(item.path)
                          ? 'bg-blue-100 text-blue-600'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </header>

      <main className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}