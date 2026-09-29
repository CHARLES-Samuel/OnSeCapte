import { useState, useEffect, useCallback } from 'react';

export type EventsViewMode = 'grid' | 'list';

const STORAGE_KEY = 'onsecapte_events_view_mode';

/**
 * Hook pour gérer le mode d'affichage des événements (grille vs liste)
 * avec persistance automatique dans le localStorage.
 */
export const useEventsViewMode = (defaultMode: EventsViewMode = 'grid') => {
  const [viewMode, setViewModeState] = useState<EventsViewMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'grid' || stored === 'list') {
        return stored;
      }
    } catch {
      // Ignorer les erreurs d'accès à localStorage (ex: mode navigation privée stricte)
    }
    return defaultMode;
  });

  const setViewMode = useCallback((mode: EventsViewMode) => {
    setViewModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Ignorer
    }
  }, []);

  // Synchronisation si le localStorage change dans un autre onglet
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === 'grid' || e.newValue === 'list')) {
        setViewModeState(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return { viewMode, setViewMode };
};
