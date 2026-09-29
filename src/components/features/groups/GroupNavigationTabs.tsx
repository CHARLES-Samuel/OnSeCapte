import React from 'react';
import { CalendarDays, Users, BarChart3 } from 'lucide-react';

export type GroupActiveTab = 'events' | 'planning' | 'members' | 'stats';

interface TabItem {
  key: GroupActiveTab;
  label: string;
  icon: React.ElementType;
}

const TABS: TabItem[] = [
  { key: 'events', label: 'Événements', icon: CalendarDays },
  { key: 'planning', label: 'Planning', icon: CalendarDays },
  { key: 'members', label: 'Membres', icon: Users },
  { key: 'stats', label: 'Statistiques', icon: BarChart3 },
];

interface GroupNavigationTabsProps {
  activeTab: GroupActiveTab;
  onSelectTab: (tab: GroupActiveTab) => void;
  className?: string;
}

export const GroupNavigationTabs: React.FC<GroupNavigationTabsProps> = ({
  activeTab,
  onSelectTab,
  className = '',
}) => {
  return (
    <nav
      aria-label="Navigation interne du groupe"
      className={`w-full overflow-hidden ${className}`}
    >
      <div
        role="tablist"
        aria-label="Sections du groupe"
        className="w-full flex items-center gap-1.5 sm:gap-2 bg-slate-800/40 border border-slate-800 p-1.5 rounded-2xl overflow-x-auto no-scrollbar"
      >
        {TABS.map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${key}`}
              id={`tab-${key}`}
              onClick={() => onSelectTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap min-h-[44px] touch-manipulation shrink-0 sm:shrink select-none ${
                isActive
                  ? 'bg-slate-700 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
