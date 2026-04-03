import { Transaction } from './types';

const categories = [
  'Groceries',
  'Rent',
  'Utilities',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Dining',
  'Salary',
  'Freelance',
  'Investments',
  'Other',
];

const descriptions = [
  'Whole Foods Market',
  'Monthly Rent Payment',
  'Electric Bill',
  'Gas Station',
  'Netflix Subscription',
  'Doctor Visit',
  'Amazon Purchase',
  'Restaurant Dinner',
  'Monthly Salary',
  'Freelance Project',
  'Stock Dividends',
  'Coffee Shop',
  'Gym Membership',
  'Phone Bill',
  'Internet Service',
  'Uber Ride',
  'Movie Tickets',
  'Grocery Store',
  'Clothing Store',
  'Bonus Payment',
];

export function generateMockTransactions(): Transaction[] {
  const transactions: Transaction[] = [];
  const now = new Date();

  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    const isIncome = Math.random() > 0.7;
    const type = isIncome ? 'income' : 'expense';
    
    let category: string;
    if (isIncome) {
      category = ['Salary', 'Freelance', 'Investments'][Math.floor(Math.random() * 3)];
    } else {
      category = categories.filter(c => !['Salary', 'Freelance', 'Investments'].includes(c))[
        Math.floor(Math.random() * 9)
      ];
    }

    const amount = isIncome
      ? Math.floor(Math.random() * 4000) + 1000
      : Math.floor(Math.random() * 500) + 10;

    transactions.push({
      id: `txn-${i + 1}`,
      date: date.toISOString().split('T')[0],
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      category,
      amount,
      type,
      status: Math.random() > 0.1 ? 'completed' : 'pending',
    });
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
