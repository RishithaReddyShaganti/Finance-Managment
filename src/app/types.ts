export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  status: 'completed' | 'pending';
}

export interface BudgetCategory {
  category: string;
  budget: number;
  spent: number;
}

export type UserRole = 'admin' | 'viewer';

export interface AppState {
  transactions: Transaction[];
  role: UserRole;
  darkMode: boolean;
}
