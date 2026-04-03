import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { AddTransactionModal } from './AddTransactionModal';
import {
  Plus,
  Search,
  Download,
  ArrowUpDown,
  Trash2,
  X
} from 'lucide-react';
import { TransactionType, TransactionCategory } from '../types/finance';

export const Transactions: React.FC = () => {
  const {
    transactions,
    role,
    filter,
    setFilter,
    sortBy,
    sortOrder,
    setSorting,
    deleteTransaction,
    resetFilters
  } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = [...transactions];

    if (filter.type !== 'all') {
      filtered = filtered.filter(t => t.type === filter.type);
    }

    if (filter.category !== 'all') {
      filtered = filtered.filter(t => t.category === filter.category);
    }

    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.description.toLowerCase().includes(searchLower) ||
          t.category.toLowerCase().includes(searchLower)
      );
    }

    filtered.sort((a, b) => {
      let compareValue = 0;
      if (sortBy === 'date') compareValue = a.date.localeCompare(b.date);
      else if (sortBy === 'amount') compareValue = a.amount - b.amount;
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [transactions, filter, sortBy, sortOrder]);

  const handleSort = (field: 'date' | 'amount') => {
    if (sortBy === field) {
      setSorting(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSorting(field, 'desc');
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Description'];
    const rows = filteredAndSortedTransactions.map(t => [
      t.date,
      t.type,
      t.category,
      t.amount.toFixed(2),
      t.description
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) =>
    `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const hasActiveFilters =
    filter.type !== 'all' ||
    filter.category !== 'all' ||
    filter.searchTerm !== '';

  const categories: TransactionCategory[] = [
    'Salary','Freelance','Investment','Groceries','Utilities','Entertainment',
    'Transportation','Healthcare','Shopping','Dining','Education','Other'
  ];

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border">

        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Transactions</h2>
            <p className="text-sm text-gray-500">
              {filteredAndSortedTransactions.length} items {hasActiveFilters && '(filtered)'}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              disabled={filteredAndSortedTransactions.length === 0}
              className="border px-3 py-1 rounded flex items-center gap-1"
            >
              <Download className="w-4 h-4" /> Export
            </button>

            {role === 'admin' && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-500 text-white px-3 py-1 rounded flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">

          <div className="relative">
            <Search className="absolute left-2 top-2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={filter.searchTerm}
              onChange={(e) => setFilter({ searchTerm: e.target.value })}
              className="border pl-8 pr-2 py-1 w-full rounded"
            />
          </div>

          <select
            value={filter.type}
            onChange={(e) => setFilter({ type: e.target.value as TransactionType | 'all' })}
            className="border px-2 py-1 rounded"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            value={filter.category}
            onChange={(e) => setFilter({ category: e.target.value as TransactionCategory | 'all' })}
            className="border px-2 py-1 rounded"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="border px-2 py-1 rounded flex items-center gap-1"
            >
              <X className="w-4 h-4" /> Clear
            </button>
          )}
        </div>

        {filteredAndSortedTransactions.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No transactions found
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th onClick={() => handleSort('date')} className="cursor-pointer py-2">
                  Date <ArrowUpDown className="inline w-4 h-4" />
                </th>
                <th>Type</th>
                <th>Category</th>
                <th onClick={() => handleSort('amount')} className="cursor-pointer">
                  Amount <ArrowUpDown className="inline w-4 h-4" />
                </th>
                <th>Description</th>
                {role === 'admin' && <th />}
              </tr>
            </thead>

            <tbody>
              {filteredAndSortedTransactions.map(t => (
                <tr key={t.id} className="border-b">
                  <td>{t.date}</td>
                  <td>{t.type}</td>
                  <td>{t.category}</td>
                  <td>{formatCurrency(t.amount)}</td>
                  <td>{t.description}</td>

                  {role === 'admin' && (
                    <td>
                      <button
                        onClick={() => {
                          if (confirm('Delete?')) deleteTransaction(t.id);
                        }}
                        className="text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {role === 'viewer' && (
          <p className="mt-4 text-sm text-blue-600">
            Viewer mode: no edit access
          </p>
        )}

      </div>

      <AddTransactionModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};