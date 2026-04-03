import { useFinance } from '../context';
import { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  DollarSign,
  Calendar,
  Target
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function Insights() {
  const { transactions, darkMode } = useFinance();

  const spendingTrends = useMemo(() => {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const last30DaysTransactions = transactions.filter(
      t => new Date(t.date) >= last30Days && t.status === 'completed'
    );

    const categoryTotals = new Map<string, number>();
    last30DaysTransactions.forEach(t => {
      if (t.type === 'expense') {
        categoryTotals.set(t.category, (categoryTotals.get(t.category) || 0) + t.amount);
      }
    });

    return Array.from(categoryTotals.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const dailyPattern = useMemo(() => {
    const last14Days = new Date();
    last14Days.setDate(last14Days.getDate() - 14);

    const dailyMap = new Map<string, { income: number; expenses: number }>();

    transactions.forEach(t => {
      const date = new Date(t.date);
      if (date >= last14Days && t.status === 'completed') {
        const dateStr = t.date;
        const existing = dailyMap.get(dateStr) || { income: 0, expenses: 0 };
        
        if (t.type === 'income') {
          existing.income += t.amount;
        } else {
          existing.expenses += t.amount;
        }
        
        dailyMap.set(dateStr, existing);
      }
    });

    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        income: data.income,
        expenses: data.expenses,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions]);

  const budgetRecommendations = useMemo(() => {
    const monthlyExpenses = transactions.filter(
      t => t.type === 'expense' && t.status === 'completed'
    );

    const categoryTotals = new Map<string, number[]>();
    
    monthlyExpenses.forEach(t => {
      const amounts = categoryTotals.get(t.category) || [];
      amounts.push(t.amount);
      categoryTotals.set(t.category, amounts);
    });

    return Array.from(categoryTotals.entries())
      .map(([category, amounts]) => {
        const total = amounts.reduce((sum, a) => sum + a, 0);
        const average = total / amounts.length;
        const suggested = Math.ceil(average * 1.1); // 10% buffer
        return { category, current: total, suggested };
      })
      .sort((a, b) => b.current - a.current)
      .slice(0, 5);
  }, [transactions]);

  const insights = useMemo(() => {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    const previous30Days = new Date(last30Days);
    previous30Days.setDate(previous30Days.getDate() - 30);

    const currentPeriod = transactions.filter(
      t => new Date(t.date) >= last30Days && t.status === 'completed'
    );

    const previousPeriod = transactions.filter(
      t => new Date(t.date) >= previous30Days && 
           new Date(t.date) < last30Days && 
           t.status === 'completed'
    );

    const currentExpenses = currentPeriod
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const previousExpenses = previousPeriod
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const currentIncome = currentPeriod
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const previousIncome = previousPeriod
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenseChange = previousExpenses > 0
      ? ((currentExpenses - previousExpenses) / previousExpenses) * 100
      : 0;

    const incomeChange = previousIncome > 0
      ? ((currentIncome - previousIncome) / previousIncome) * 100
      : 0;

    const avgDaily = currentExpenses / 30;
    const topCategory = spendingTrends[0];

    return {
      expenseChange,
      incomeChange,
      avgDaily,
      topCategory: topCategory?.category || 'N/A',
      topCategoryAmount: topCategory?.amount || 0,
      savingsRate: currentIncome > 0 ? ((currentIncome - currentExpenses) / currentIncome) * 100 : 0,
    };
  }, [transactions, spendingTrends]);

  const chartColors = {
    grid: darkMode ? '#374151' : '#e5e7eb',
    text: darkMode ? '#9ca3af' : '#6b7280',
    income: '#10b981',
    expenses: '#ef4444',
    bar: '#3b82f6',
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Insights</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Analysis of your spending patterns and financial behavior
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <span className={`text-sm font-medium ${
              insights.expenseChange > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {insights.expenseChange > 0 ? '+' : ''}{insights.expenseChange.toFixed(1)}%
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Expense Change</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            Last 30 Days
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            vs previous period
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className={`text-sm font-medium ${
              insights.incomeChange > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {insights.incomeChange > 0 ? '+' : ''}{insights.incomeChange.toFixed(1)}%
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Income Change</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            Last 30 Days
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            vs previous period
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Avg Daily Spending</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            ${insights.avgDaily.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            over last 30 days
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            Daily Activity (Last 14 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyPattern}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis 
                dataKey="date" 
                stroke={chartColors.text}
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke={chartColors.text}
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                  border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  color: darkMode ? '#f9fafb' : '#111827',
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke={chartColors.income} 
                strokeWidth={2}
                name="Income"
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke={chartColors.expenses} 
                strokeWidth={2}
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            Top Spending Categories (Last 30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={spendingTrends.slice(0, 5)} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis type="number" stroke={chartColors.text} style={{ fontSize: '12px' }} />
              <YAxis 
                type="category" 
                dataKey="category" 
                stroke={chartColors.text}
                style={{ fontSize: '12px' }}
                width={100}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                  border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  color: darkMode ? '#f9fafb' : '#111827',
                }}
              />
              <Bar dataKey="amount" fill={chartColors.bar} name="Amount ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          Category Spending Breakdown
        </h3>
        <div className="space-y-4">
          {spendingTrends.slice(0, 8).map((item, index) => {
            const total = spendingTrends.reduce((sum, i) => sum + i.amount, 0);
            const percentage = (item.amount / total) * 100;
            
            return (
              <div key={item.category}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {item.category}
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-gray-900 dark:text-white">
                      ${item.amount.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                      ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Suggested Budget Allocations
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgetRecommendations.map((budget) => (
            <div
              key={budget.category}
              className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600"
            >
              <p className="font-medium text-gray-900 dark:text-white mb-2">
                {budget.category}
              </p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Current:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${budget.current.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Suggested:</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    ${budget.suggested.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                Top Spending Category
              </h4>
              <p className="text-gray-700 dark:text-gray-300">
                Your highest spending is in <strong>{insights.topCategory}</strong> with{' '}
                <strong>${insights.topCategoryAmount.toLocaleString()}</strong> in the last 30 days.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400 mt-1" />
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                Savings Rate
              </h4>
              <p className="text-gray-700 dark:text-gray-300">
                You're saving <strong>{insights.savingsRate.toFixed(1)}%</strong> of your income.{' '}
                {insights.savingsRate >= 20 
                  ? 'Great job! Keep it up!' 
                  : 'Consider increasing your savings rate to 20% or more.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
