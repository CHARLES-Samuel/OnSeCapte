export const formatPrice = (price: number): string => {
  return price === 0 ? 'Gratuit' : `${price} €`;
};

export const formatDateShort = (timestamp: number | string): string => {
  return new Date(timestamp).toLocaleDateString('fr-FR');
};

export const formatDateLong = (timestamp: number | string): string => {
  return new Date(timestamp).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};
