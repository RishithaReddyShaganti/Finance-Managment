// Type definitions for the finance dashboard

export type TransactionType = 'income' | 'expense';

export type TransactionCategory = 
  | 'Salary'
  | 'Freelance'
  | 'Investment'
  | 'Groceries'
  | 'Utilities'
  | 'Entertainment'
  | 'Transportation'
  | 'Healthcare'
  | 'Shopping'
  | 'Dining'
  | 'Education'
  | 'Other';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: TransactionCategory;
  type: TransactionType;
  description: string;
}

export type UserRole = 'viewer' | 'admin';

export interface FinanceState {
  transactions: Transaction[];
  role: UserRole;
  darkMode: boolean;
  filter: {
    type: TransactionType | 'all';
    category: TransactionCategory | 'all';
    searchTerm: string;
  };
  sortBy: 'date' | 'amount';
  sortOrder: 'asc' | 'desc';
}
