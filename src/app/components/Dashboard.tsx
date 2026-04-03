import React, { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { SummaryCard } from './SummaryCard';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { transactions } = useFinance();

  const summary = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    const monthlyData: any = {};

    transactions.forEach(t => {
      const month = t.date.substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expense: 0 };
      }

      if (t.type === 'income') monthlyData[month].income += t.amount;
      else monthlyData[month].expense += t.amount;
    });

    return { totalIncome, totalExpenses, balance, monthlyData };
  }, [transactions]);

  const balanceTrendData = useMemo(() => {
    const sorted = Object.keys(summary.monthlyData).sort().slice(-6);

    let runningBalance = 0;

    return sorted.map(month => {
      const data = summary.monthlyData[month];
      runningBalance += data.income - data.expense;

      return {
        month,
        balance: runningBalance,
        income: data.income,
        expense: data.expense
      };
    });
  }, [summary.monthlyData]);

  const categoryData = useMemo(() => {
    const totals: any = {};

    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        totals[t.category] = (totals[t.category] || 0) + t.amount;
      });

    return Object.entries(totals).map(([category, amount]) => ({
      category,
      amount
    }));
  }, [transactions]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const formatCurrency = (v: number) => `$${v.toFixed(2)}`;

  return (
    <div className="p-4 space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Balance"
          value={formatCurrency(summary.balance)}
          change={summary.balance >= 0 ? 'Positive' : 'Negative'}
          changeType={summary.balance >= 0 ? 'positive' : 'negative'}
          icon={Wallet}
          iconColor="bg-blue-500"
        />
        <SummaryCard
          title="Income"
          value={formatCurrency(summary.totalIncome)}
          change="Total income"
          changeType="positive"
          icon={TrendingUp}
          iconColor="bg-green-500"
        />
        <SummaryCard
          title="Expenses"
          value={formatCurrency(summary.totalExpenses)}
          change="Total expenses"
          changeType="negative"
          icon={TrendingDown}
          iconColor="bg-red-500"
        />
      </div>

      <div className="border rounded p-4">
        <h3 className="font-semibold mb-3">Balance Trend</h3>

        {balanceTrendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={balanceTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend />

              <Line type="monotone" dataKey="balance" stroke="#3b82f6" />
              <Line type="monotone" dataKey="income" stroke="#10b981" />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500">No data</p>
        )}
      </div>

      <div className="border rounded p-4">
        <h3 className="font-semibold mb-3">Category Breakdown</h3>

        {categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="amount"
                nameKey="category"
                outerRadius={80}
                label
              >
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500">No data</p>
        )}
      </div>

      <div className="border rounded p-4">
        <h3 className="font-semibold mb-3">Income vs Expense</h3>

        {balanceTrendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={balanceTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend />

              <Bar dataKey="income" fill="#10b981" />
              <Bar dataKey="expense" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500">No data</p>
        )}
      </div>

    </div>
  );
};