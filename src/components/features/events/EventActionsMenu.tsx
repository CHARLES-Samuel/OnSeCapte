import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';

interface EventActionsMenuProps {
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

export const EventActionsMenu: React.FC<EventActionsMenuProps> = ({
  canEdit,
  onEdit,
  onDelete,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
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

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    setIsOpen(false);
    action();
  };

  return (
    <div ref={menuRef} className={`relative shrink-0 ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Options de l'événement"
        title="Options de l'événement"
        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/60 transition min-w-[28px] min-h-[28px] flex items-center justify-center"
      >
        <MoreVertical className="w-4 h-4" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Actions de l'événement"
          className="absolute right-0 top-full mt-1 w-36 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100"
        >
          {canEdit && (
            <button
              type="button"
              role="menuitem"
              onClick={(e) => handleAction(e, onEdit)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-700/70 hover:text-white transition text-left"
            >
              <Edit className="w-3.5 h-3.5 text-primary-400 shrink-0" aria-hidden="true" />
              <span>Modifier</span>
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={(e) => handleAction(e, onDelete)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/15 hover:text-red-300 transition text-left"
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Supprimer</span>
          </button>
        </div>
      )}
    </div>
  );
};
