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

/**
 * Nettoie et formate une description (contenant potentiellement du Markdown)
 * pour produire un extrait textuel fluide sans syntaxe brute, adapté aux aperçus tronqués.
 */
export const formatDescriptionPreview = (markdown?: string | null): string => {
  if (!markdown) return '';

  return markdown
    // Supprimer les images markdown ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // Remplacer les liens markdown [texte](url) par le texte seul
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Supprimer les titres markdown (# Titre -> Titre)
    .replace(/^#{1,6}\s+/gm, '')
    // Supprimer le formatage gras et italique
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Supprimer le texte barré
    .replace(/~~(.*?)~~/g, '$1')
    // Supprimer le code en ligne
    .replace(/`([^`]+)`/g, '$1')
    // Supprimer les puces de listes et numérotations
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    // Supprimer les citations blockquotes
    .replace(/^\s*>\s*/gm, '')
    // Supprimer les balises HTML éventuelles en conservant la séparation des mots
    .replace(/<[^>]*>/g, ' ')
    // Normaliser les retours à la ligne et espaces consécutifs en un espace unique
    .replace(/\s+/g, ' ')
    .trim();
};

