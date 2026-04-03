import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction, UserRole, AppState } from './types';
import { generateMockTransactions } from './data';

interface FinanceContextType {
  transactions: Transaction[];
  role: UserRole;
  darkMode: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  setRole: (role: UserRole) => void;
  toggleDarkMode: () => void;
  exportToCSV: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEY = 'finance-dashboard-state';

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [role, setRole] = useState<UserRole>('admin');
  const [darkMode, setDarkMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data: AppState = JSON.parse(stored);
        setTransactions(data.transactions);
        setRole(data.role);
        setDarkMode(data.darkMode);
      } catch (e) {
        console.error('Failed to parse stored data', e);
        setTransactions(generateMockTransactions());
      }
    } else {
      setTransactions(generateMockTransactions());
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      const state: AppState = { transactions, role, darkMode };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [transactions, role, darkMode, isInitialized]);

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
      id: Date.now().toString(),
    };
    setTransactions([newTransaction, ...transactions]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(transactions.map(t => 
      t.id === id ? { ...t, ...updates } : t
    ));
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Status'];
    const rows = transactions.map(t => [
      t.date,
      t.description,
      t.category,
      t.type,
      t.amount.toString(),
      t.status,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        role,
        darkMode,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        setRole,
        toggleDarkMode,
        exportToCSV,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within FinanceProvider');
  }
  return context;
}