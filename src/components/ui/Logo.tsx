import React from 'react';

export interface LogoProps {
  /**
   * Taille du pictogramme
   * - 'sm' : 24px (h-6 w-6)
   * - 'md' : 32px (h-8 w-8)
   * - 'lg' : 40px (h-10 w-10)
   * - 'xl' : 48px (h-12 w-12)
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Afficher le texte « OnSeCapte » à côté du logo
   */
  showText?: boolean;
  /**
   * Ajouter un conteneur stylisé avec fond neutre pour garantir la lisibilité sur tous fonds
   */
  withContainer?: boolean;
  /**
   * Texte alternatif pour l'image (si vide, l'image est considérée décorative)
   */
  alt?: string;
  /**
   * Classes CSS personnalisées pour le conteneur global
   */
  className?: string;
  /**
   * Classes CSS personnalisées pour l'image SVG
   */
  imageClassName?: string;
  /**
   * Classes CSS personnalisées pour le libellé textuel
   */
  textClassName?: string;
}

const SIZE_MAP = {
  sm: {
    img: 'w-6 h-6',
    container: 'w-8 h-8 p-1 rounded-lg',
    text: 'text-sm sm:text-base',
  },
  md: {
    img: 'w-8 h-8',
    container: 'w-9 h-9 sm:w-10 sm:h-10 p-1.5 rounded-xl',
    text: 'text-base sm:text-lg',
  },
  lg: {
    img: 'w-10 h-10',
    container: 'w-12 h-12 p-2 rounded-xl',
    text: 'text-lg sm:text-xl',
  },
  xl: {
    img: 'w-12 h-12',
    container: 'w-14 h-14 p-2.5 rounded-2xl',
    text: 'text-xl sm:text-2xl',
  },
};

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = false,
  withContainer = false,
  alt = 'Logo OnSeCapte',
  className = '',
  imageClassName = '',
  textClassName = '',
}) => {
  const currentSize = SIZE_MAP[size];

  const imageElement = (
    <img
      src="/favicon.svg"
      alt={alt}
      width={48}
      height={46}
      className={`object-contain transition-transform duration-200 select-none ${
        withContainer ? 'w-full h-full' : currentSize.img
      } ${imageClassName}`}
      loading="eager"
      decoding="async"
    />
  );

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {withContainer ? (
        <div
          className={`${currentSize.container} bg-slate-800/90 border border-slate-700/60 shadow-md shadow-primary-500/5 flex items-center justify-center shrink-0 backdrop-blur-xs group-hover:border-primary-500/40 group-hover:shadow-primary-500/20 group-hover:scale-105 transition-all`}
        >
          {imageElement}
        </div>
      ) : (
        <div className="shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
          {imageElement}
        </div>
      )}

      {showText && (
        <span
          className={`font-bold tracking-tight text-white ${currentSize.text} ${textClassName}`}
        >
          On<span className="text-primary-500">SeCapte</span>
        </span>
      )}
    </div>
  );
};
