import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Edit2, LogOut } from 'lucide-react';
import type { User } from '../../../models/User';
import { UserAvatar } from '../UserAvatar';

interface NavUserMenuProps {
  user: User;
  onEditPseudo: () => void;
  onSignOut: () => void;
}

export const NavUserMenu: React.FC<NavUserMenuProps> = ({
  user,
  onEditPseudo,
  onSignOut,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleEditPseudoClick = () => {
    setIsOpen(false);
    onEditPseudo();
  };

  const handleSignOutClick = () => {
    setIsOpen(false);
    onSignOut();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Menu du compte utilisateur"
        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl border border-slate-700/80 bg-slate-800/60 hover:bg-slate-800 hover:border-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 cursor-pointer h-10 select-none"
      >
        <UserAvatar
          photoUrl={user.photoURL}
          name={user.displayName || "User"}
          size="sm"
          className="border border-slate-700 shrink-0"
        />
        <span className="text-sm font-medium text-slate-200 max-w-[130px] truncate">
          {user.displayName || "Mon compte"}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-white' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Options du compte"
          className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-800/95 backdrop-blur-md border border-slate-700/90 shadow-2xl shadow-black/60 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* En-tête profil */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 mb-1.5">
            <UserAvatar
              photoUrl={user.photoURL}
              name={user.displayName || "User"}
              size="md"
              className="border border-slate-700 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-white truncate">
                {user.displayName || "Utilisateur"}
              </div>
              {user.email && (
                <div className="text-xs text-slate-400 truncate" title={user.email}>
                  {user.email}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleEditPseudoClick}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-200 hover:text-white hover:bg-slate-700/60 rounded-xl transition-colors text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <Edit2 className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
              <span>Modifier le pseudo</span>
            </button>

            <div className="border-t border-slate-700/60 my-1" />

            <button
              type="button"
              role="menuitem"
              onClick={handleSignOutClick}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <LogOut className="w-4 h-4 text-red-400 shrink-0" aria-hidden="true" />
              <span>Se déconnecter</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
