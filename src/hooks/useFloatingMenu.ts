import { useState, useEffect, useCallback, useLayoutEffect, type RefObject } from 'react';

interface UseFloatingMenuOptions {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLElement | null>;
  menuRef: RefObject<HTMLElement | null>;
  menuWidth?: number;
  estimatedHeight?: number;
  offset?: number;
}

export interface FloatingPosition {
  top: number;
  left?: number;
  right?: number;
  openUpwards: boolean;
}

/**
 * Hook gérant le positionnement dynamique et le cycle de vie d'un menu flottant rendu dans un Portal.
 * Résout définitivement les problèmes d'overflow: hidden et de contextes d'empilement (stacking context).
 */
export function useFloatingMenu({
  isOpen,
  onClose,
  triggerRef,
  menuRef,
  menuWidth = 224,
  estimatedHeight = 175,
  offset = 8,
}: UseFloatingMenuOptions) {
  const [position, setPosition] = useState<FloatingPosition | null>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();

    const actualHeight = menuRef.current?.offsetHeight || estimatedHeight;
    const actualWidth = menuRef.current?.offsetWidth || menuWidth;

    const spaceBelow = window.innerHeight - rect.bottom;
    const shouldOpenUpwards = spaceBelow < actualHeight + offset && rect.top > actualHeight + offset;

    const top = shouldOpenUpwards
      ? Math.max(offset, rect.top - actualHeight - offset)
      : Math.min(window.innerHeight - actualHeight - offset, rect.bottom + offset);

    // Alignement à droite par rapport au déclencheur
    const right = Math.max(offset, window.innerWidth - rect.right);

    // Protection contre le débordement sur les écrans très étroits
    if (window.innerWidth - right < actualWidth) {
      setPosition({
        top,
        left: offset,
        right: undefined,
        openUpwards: shouldOpenUpwards,
      });
    } else {
      setPosition({
        top,
        right,
        left: undefined,
        openUpwards: shouldOpenUpwards,
      });
    }
  }, [triggerRef, menuRef, menuWidth, estimatedHeight, offset]);

  // Calcul du positionnement dès l'ouverture
  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen, updatePosition]);

  // Synchronisation lors du redimensionnement et du défilement
  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      // Ferme automatiquement le menu si le bouton déclencheur sort complètement de l'écran
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
          onClose();
          return;
        }
      }
      updatePosition();
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen, onClose, triggerRef, updatePosition]);

  // Fermeture au clic extérieur et touche Échap
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) {
        return;
      }
      if (menuRef.current?.contains(target)) {
        return;
      }
      onClose();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, triggerRef, menuRef]);

  return { position, updatePosition };
}
