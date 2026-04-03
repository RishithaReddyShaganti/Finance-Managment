import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor
}) => {
  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-green-600 dark:text-green-400';
    if (changeType === 'negative') return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>

          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            {value}
          </h3>

          {change && (
            <p className={`text-sm ${getChangeColor()}`}>
              {change}
            </p>
          )}
        </div>

        <div className={`p-3 rounded-full ${iconColor}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>

      </div>
    </div>
  );
};