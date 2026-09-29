import React from 'react';
import { getCategoryTheme, type CategoryFilterValue } from '../../utils/categoryTheme';

interface CategoryBadgeProps {
  category: CategoryFilterValue;
  showIcon?: boolean;
  showDot?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  showIcon = true,
  showDot = false,
  size = 'sm',
  className = '',
}) => {
  const theme = getCategoryTheme(category);
  const Icon = theme.icon;

  const sizeClasses =
    size === 'sm'
      ? 'px-2.5 py-1 text-xs gap-1.5 rounded-lg'
      : 'px-3 py-1.5 text-sm gap-2 rounded-xl';

  return (
    <span
      className={`inline-flex items-center font-medium border transition-colors ${theme.badgeClasses} ${sizeClasses} ${className}`}
    >
      {showDot && (
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${theme.dotColor}`}
          aria-hidden="true"
        />
      )}
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
      <span className="truncate">{category === 'Toutes' ? 'Toutes' : theme.label}</span>
    </span>
  );
};
