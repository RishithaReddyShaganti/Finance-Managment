import React, { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Award } from 'lucide-react';

export const Insights: React.FC = () => {
  const { transactions } = useFinance();

  const insights = useMemo(() => {
    if (transactions.length === 0) {
      return null;
    }

    const categoryTotals: { [key: string]: number } = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    const highestCategory = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])[0];

    const monthlyData: { [key: string]: { income: number; expense: number } } = {};
    transactions.forEach(t => {
      const month = t.date.substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        monthlyData[month].income += t.amount;
      } else {
        monthlyData[month].expense += t.amount;
      }
    });

    const sortedMonths = Object.keys(monthlyData).sort();
    const currentMonth = sortedMonths[sortedMonths.length - 1];
    const previousMonth = sortedMonths[sortedMonths.length - 2];

    let monthlyComparison = null;
    if (currentMonth && previousMonth) {
      const currentExpense = monthlyData[currentMonth].expense;
      const previousExpense = monthlyData[previousMonth].expense;
      const difference = currentExpense - previousExpense;
      const percentageChange = previousExpense > 0 
        ? ((difference / previousExpense) * 100).toFixed(1)
        : '0';

      monthlyComparison = {
        current: currentExpense,
        previous: previousExpense,
        difference,
        percentageChange,
        currentMonthName: new Date(currentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        previousMonthName: new Date(previousMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      };
    }

    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const avgTransaction = totalAmount / transactions.length;

    const largestTransaction = transactions.reduce((max, t) => 
      t.amount > max.amount ? t : max
    );

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const savingsRate = totalIncome > 0 
      ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1)
      : '0';

    const incomeCount = transactions.filter(t => t.type === 'income').length;
    const expenseCount = transactions.filter(t => t.type === 'expense').length;

    return {
      highestCategory,
      monthlyComparison,
      avgTransaction,
      largestTransaction,
      savingsRate,
      incomeCount,
      expenseCount
    };
  }, [transactions]);

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (!insights) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border">
        <h2 className="text-2xl font-semibold mb-4">Insights</h2>
        <div className="text-center py-12">
          <p className="text-gray-500">
            No data available yet. Add some transactions to see insights.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border">

        <h2 className="text-2xl font-semibold mb-6">
          Financial Insights
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {insights.highestCategory && (
            <div className="p-4 rounded-lg border">
              <div className="flex items-start gap-3">
                <TrendingDown className="w-5 h-5" />
                <div>
                  <h3 className="font-semibold">Highest Spending Category</h3>
                  <p className="text-xl font-bold">
                    {insights.highestCategory[0]}
                  </p>
                  <p className="text-sm">
                    Total: {formatCurrency(insights.highestCategory[1])}
                  </p>
                </div>
              </div>
            </div>
          )}

          {insights.monthlyComparison && (
            <div className="p-4 rounded-lg border">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5" />
                <div>
                  <h3 className="font-semibold">Monthly Trend</h3>
                  <p className="text-xl font-bold">
                    {insights.monthlyComparison.percentageChange}%
                  </p>
                  <p className="text-sm">
                    {insights.monthlyComparison.currentMonthName} vs {insights.monthlyComparison.previousMonthName}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 rounded-lg border">
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5" />
              <div>
                <h3 className="font-semibold">Savings Rate</h3>
                <p className="text-xl font-bold">
                  {insights.savingsRate}%
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5" />
              <div>
                <h3 className="font-semibold">Average Transaction</h3>
                <p className="text-xl font-bold">
                  {formatCurrency(insights.avgTransaction)}
                </p>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-6 p-4 border rounded-lg">
          <h3 className="font-semibold mb-3">Quick Stats</h3>
          <p>Total: {insights.incomeCount + insights.expenseCount}</p>
          <p>Income: {insights.incomeCount}</p>
          <p>Expense: {insights.expenseCount}</p>
        </div>

        <div className="mt-6 p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Largest Transaction</h3>
          <p>{insights.largestTransaction.description}</p>
          <p>{formatCurrency(insights.largestTransaction.amount)}</p>
        </div>

      </div>
    </div>
  );
};