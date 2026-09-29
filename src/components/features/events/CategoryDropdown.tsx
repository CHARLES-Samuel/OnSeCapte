import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { getCategoryTheme, type CategoryFilterValue } from '../../../utils/categoryTheme';

interface CategoryDropdownProps {
  categories: CategoryFilterValue[];
  activeCategory: CategoryFilterValue;
  onSelectCategory: (category: CategoryFilterValue) => void;
  className?: string;
}

export const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const activeTheme = getCategoryTheme(activeCategory);
  const ActiveIcon = activeTheme.icon;

  const handleSelect = useCallback(
    (category: CategoryFilterValue) => {
      onSelectCategory(category);
      setIsOpen(false);
    },
    [onSelectCategory]
  );

  // Fermeture au clic en dehors et à la touche Échap
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const activeLabel =
    activeCategory === 'Toutes' ? 'Toutes les catégories' : activeCategory;

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Bouton déclencheur */}
      <button
        type="button"
        id="category-filter-dropdown"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all duration-150 min-h-[38px] select-none ${
          activeCategory !== 'Toutes'
            ? 'bg-slate-800 border-primary-500/40 text-white shadow-sm'
            : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700/80 text-slate-300 hover:text-white'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${activeTheme.dotColor} ring-2 ring-white/10`}
            aria-hidden="true"
          />
          <ActiveIcon className="w-4 h-4 shrink-0 text-slate-300" aria-hidden="true" />
          <span className="truncate">{activeLabel}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-white' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <div
          role="listbox"
          aria-labelledby="category-filter-dropdown"
          className="absolute left-0 mt-1.5 w-60 sm:w-64 max-h-72 overflow-y-auto rounded-xl bg-slate-800 border border-slate-700 shadow-2xl shadow-black/50 z-30 p-1.5 focus:outline-none scrollbar-thin"
        >
          {categories.map((cat) => {
            const theme = getCategoryTheme(cat);
            const Icon = theme.icon;
            const isSelected = activeCategory === cat;
            const label = cat === 'Toutes' ? 'Toutes les catégories' : cat;

            return (
              <button
                key={cat}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(cat)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition text-left group ${
                  isSelected
                    ? 'bg-slate-700/80 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${theme.dotColor} ring-1 ring-white/20`}
                    aria-hidden="true"
                  />
                  <Icon
                    className={`w-4 h-4 shrink-0 transition ${
                      isSelected ? 'text-primary-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="truncate">{label}</span>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-primary-400 shrink-0 ml-2" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
