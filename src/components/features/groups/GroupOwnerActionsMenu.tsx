import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Edit2, UserCheck, Trash2 } from 'lucide-react';
import { useFloatingMenu } from '../../../hooks/useFloatingMenu';

interface GroupOwnerActionsMenuProps {
  onEditGroup: () => void;
  onTransferOwnership: () => void;
  onDeleteGroup: () => void;
}

export const GroupOwnerActionsMenu: React.FC<GroupOwnerActionsMenuProps> = ({
  onEditGroup,
  onTransferOwnership,
  onDeleteGroup,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { position } = useFloatingMenu({
    isOpen,
    onClose: () => setIsOpen(false),
    triggerRef: buttonRef,
    menuRef,
    menuWidth: 224,
    estimatedHeight: 165,
    offset: 8,
  });

  const handleAction = (callback: () => void) => {
    setIsOpen(false);
    callback();
  };

  const menuDropdown = isOpen && position && (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Actions du propriétaire"
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        ...(position.right !== undefined ? { right: `${position.right}px` } : {}),
        ...(position.left !== undefined ? { left: `${position.left}px` } : {}),
      }}
      className="w-56 max-w-[calc(100vw-16px)] rounded-xl bg-slate-800/95 backdrop-blur-md border border-slate-700 shadow-2xl shadow-black/60 z-50 p-1.5 focus:outline-none divide-y divide-slate-700/60 animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Option Modifier visible dans le menu déroulant uniquement sur mobile (< sm) */}
      <div className="py-1 sm:hidden">
        <button
          type="button"
          role="menuitem"
          onClick={() => handleAction(onEditGroup)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-700/60 hover:text-white transition text-left min-h-[44px]"
        >
          <Edit2 className="w-4 h-4 text-primary-400 shrink-0" aria-hidden="true" />
          <span>Modifier le groupe</span>
        </button>
      </div>

      {/* Actions d'administration avancées */}
      <div className="py-1">
        <button
          type="button"
          role="menuitem"
          onClick={() => handleAction(onTransferOwnership)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-amber-300 hover:bg-amber-500/10 hover:text-amber-200 transition text-left min-h-[44px]"
        >
          <UserCheck className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
          <span>Transférer la propriété</span>
        </button>
      </div>

      <div className="py-1">
        <button
          type="button"
          role="menuitem"
          onClick={() => handleAction(onDeleteGroup)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition text-left min-h-[44px]"
        >
          <Trash2 className="w-4 h-4 text-red-400 shrink-0" aria-hidden="true" />
          <span>Supprimer le groupe</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex items-center gap-2">
      {/* Bouton Modifier direct sur tablette / desktop (sm et plus) */}
      <button
        type="button"
        onClick={onEditGroup}
        aria-label="Modifier les informations du groupe"
        className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl transition text-xs sm:text-sm font-medium min-h-[40px] shadow-sm"
      >
        <Edit2 className="w-4 h-4 shrink-0 text-primary-400" aria-hidden="true" />
        <span>Modifier</span>
      </button>

      {/* Menu contextuel Kebab ("...") pour actions propriétaire */}
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Options d'administration du groupe"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center justify-center p-2.5 rounded-xl border transition min-h-[40px] min-w-[40px] ${
          isOpen
            ? 'bg-slate-700 border-slate-600 text-white shadow-md'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
        }`}
      >
        <MoreVertical className="w-4 h-4" aria-hidden="true" />
      </button>

      {/* Rendu dans un Portal à la racine du document body */}
      {typeof document !== 'undefined' && menuDropdown && createPortal(menuDropdown, document.body)}
    </div>
  );
};
