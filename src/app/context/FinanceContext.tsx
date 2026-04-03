import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction, UserRole, FinanceState, TransactionType, TransactionCategory } from '../types/finance';
import { mockTransactions } from '../utils/mockData';

interface FinanceContextType extends FinanceState {
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  setRole: (role: UserRole) => void;
  toggleDarkMode: () => void;
  setFilter: (filter: Partial<FinanceState['filter']>) => void;
  setSorting: (sortBy: FinanceState['sortBy'], sortOrder: FinanceState['sortOrder']) => void;
  resetFilters: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const loadFromStorage = () => {
    try {
      const saved = localStorage.getItem('financeData');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          transactions: parsed.transactions || mockTransactions,
          role: parsed.role || 'admin',
          darkMode: parsed.darkMode || false
        };
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
    return {
      transactions: mockTransactions,
      role: 'admin' as UserRole,
      darkMode: false
    };
  };

  const savedData = loadFromStorage();

  const [transactions, setTransactions] = useState<Transaction[]>(savedData.transactions);
  const [role, setRole] = useState<UserRole>(savedData.role);
  const [darkMode, setDarkMode] = useState<boolean>(savedData.darkMode);
  const [filter, setFilterState] = useState<FinanceState['filter']>({
    type: 'all',
    category: 'all',
    searchTerm: ''
  });
  const [sortBy, setSortBy] = useState<FinanceState['sortBy']>('date');
  const [sortOrder, setSortOrder] = useState<FinanceState['sortOrder']>('desc');

  useEffect(() => {
    try {
      localStorage.setItem('financeData', JSON.stringify({
        transactions,
        role,
        darkMode
      }));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [transactions, role, darkMode]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString()
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTransaction = (id: string, updatedFields: Partial<Transaction>) => {
    setTransactions(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updatedFields } : t))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const setFilter = (newFilter: Partial<FinanceState['filter']>) => {
    setFilterState(prev => ({ ...prev, ...newFilter }));
  };

  const setSorting = (newSortBy: FinanceState['sortBy'], newSortOrder: FinanceState['sortOrder']) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const resetFilters = () => {
    setFilterState({
      type: 'all',
      category: 'all',
      searchTerm: ''
    });
  };

  const value: FinanceContextType = {
    transactions,
    role,
    darkMode,
    filter,
    sortBy,
    sortOrder,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setRole,
    toggleDarkMode,
    setFilter,
    setSorting,
    resetFilters
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
