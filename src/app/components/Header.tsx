import React from 'react';
import { Moon, Sun, User, Shield } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const Header: React.FC = () => {
  const { role, setRole, darkMode, toggleDarkMode } = useFinance();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Finance Dashboard
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Track your financial activity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                Role:
              </span>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'viewer' | 'admin')}
                className="border rounded-md px-2 py-1 dark:bg-gray-700 dark:text-white"
              >
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              onClick={toggleDarkMode}
              className="border rounded-md p-2 dark:bg-gray-700"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};