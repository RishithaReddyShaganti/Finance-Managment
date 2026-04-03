import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { TransactionType, TransactionCategory } from '../types/finance';

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
}

const categories: TransactionCategory[] = [
  'Salary','Freelance','Investment','Groceries','Utilities',
  'Entertainment','Transportation','Healthcare','Shopping',
  'Dining','Education','Other'
];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ open, onClose }) => {
  const { addTransaction } = useFinance();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: 'Other' as TransactionCategory,
    type: 'expense' as TransactionType,
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    addTransaction({
      date: formData.date,
      amount: parseFloat(formData.amount),
      category: formData.category,
      type: formData.type,
      description: formData.description || `${formData.category} transaction`
    });

    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      category: 'Other',
      type: 'expense',
      description: ''
    });

    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-md w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">

        <h2 className="text-lg font-semibold mb-1">Add New Transaction</h2>
        <p className="text-sm text-gray-500 mb-4">
          Enter the details below
        </p>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as TransactionType })
              }
              className="w-full border rounded-md p-2"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full border rounded-md p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              className="w-full border rounded-md p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value as TransactionCategory })
              }
              className="w-full border rounded-md p-2"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm mb-1">Description</label>
            <input
              type="text"
              placeholder="Enter description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border rounded-md p-2"
            />
          </div>

          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Add Transaction
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};