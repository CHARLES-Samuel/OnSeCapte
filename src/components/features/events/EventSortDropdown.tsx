import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowUpDown, ChevronDown, Check, Calendar, Sparkles } from 'lucide-react';
import { EVENT_SORT_OPTIONS, type EventSortOption } from '../../../utils/eventSortUtils';

interface EventSortDropdownProps {
  sortOption: EventSortOption;
  onSelectSortOption: (option: EventSortOption) => void;
  className?: string;
}

export const EventSortDropdown: React.FC<EventSortDropdownProps> = ({
  sortOption,
  onSelectSortOption,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeOption = EVENT_SORT_OPTIONS.find((opt) => opt.value === sortOption) || EVENT_SORT_OPTIONS[0];

  const handleSelect = useCallback(
    (option: EventSortOption) => {
      onSelectSortOption(option);
      setIsOpen(false);
    },
    [onSelectSortOption]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
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

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Tri actuel : ${activeOption.label}`}
        className="inline-flex items-center justify-between gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition shadow-sm min-h-[38px] w-full sm:w-auto"
      >
        <span className="flex items-center gap-1.5 truncate">
          {sortOption.startsWith('date') ? (
            <Calendar className="w-3.5 h-3.5 text-primary-400 shrink-0" aria-hidden="true" />
          ) : sortOption === 'created-desc' ? (
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
          ) : (
            <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
          )}
          <span className="truncate">{activeOption.shortLabel}</span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Options de tri des événements"
          className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-64 bg-slate-800/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl py-1.5 z-40 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/60">
            Trier les événements
          </div>
          {EVENT_SORT_OPTIONS.map((opt) => {
            const isSelected = opt.value === sortOption;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs transition text-left ${
                  isSelected
                    ? 'bg-primary-500/15 text-primary-300 font-semibold'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-primary-400 shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
