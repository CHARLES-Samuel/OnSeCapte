import React, { useState } from 'react';

interface UserAvatarProps {
  photoUrl?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  photoUrl, 
  name, 
  size = 'md',
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  const initial = name ? name.charAt(0).toUpperCase() : '?';

  // Fonction pour générer une couleur de fond basée sur le nom
  const getBackgroundColor = (nameStr: string) => {
    let hash = 0;
    for (let i = 0; i < nameStr.length; i++) {
      hash = nameStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 50%)`;
  };

  if (photoUrl && !imageError) {
    return (
      <div
        className={`rounded-full overflow-hidden flex items-center justify-center shrink-0 photo-gradient-bg ${sizeClasses[size]} ${className}`}
      >
        <img
          src={photoUrl}
          alt={`Avatar de ${name}`}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-medium ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: getBackgroundColor(name) }}
    >
      {initial}
    </div>
  );
};
