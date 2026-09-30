import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, Sparkles } from 'lucide-react';

interface NavDesktopLinksProps {
  isAuthenticated: boolean;
}

export const NavDesktopLinks: React.FC<NavDesktopLinksProps> = ({ isAuthenticated }) => {
  const location = useLocation();
  const navigate = useNavigate();

  if (isAuthenticated) {
    const isGroupsActive =
      location.pathname === '/dashboard' || location.pathname.startsWith('/groups');

    return (
      <nav className="flex items-center gap-2" aria-label="Navigation principale">
        <Link
          to="/dashboard"
          className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
            isGroupsActive
              ? 'text-white bg-slate-800/90 border border-slate-700/80 shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
          }`}
          aria-current={isGroupsActive ? 'page' : undefined}
        >
          <Users className={`w-4 h-4 ${isGroupsActive ? 'text-primary-400' : 'text-slate-400'}`} aria-hidden="true" />
          <span>Mes Groupes</span>
        </Link>
      </nav>
    );
  }

  const handleScrollToFeatures = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const el = document.getElementById('fonctionnalites');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', '#fonctionnalites');
      }
    } else {
      navigate('/#fonctionnalites');
    }
  };

  return (
    <nav className="flex items-center gap-2" aria-label="Navigation publique">
      <a
        href="/#fonctionnalites"
        onClick={handleScrollToFeatures}
        className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <Sparkles className="w-4 h-4 text-primary-400" aria-hidden="true" />
        <span>Fonctionnalités</span>
      </a>
    </nav>
  );
};
