import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

type CookieConsent = 'all' | 'essential' | 'custom' | null;

export const CookieBanner = () => {
  const [, setConsent] = useState<CookieConsent>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const savedConsent = localStorage.getItem('onsecapte-cookie-consent') as CookieConsent;
    if (!savedConsent) {
      setIsVisible(true);
    } else {
      setConsent(savedConsent);
    }
  }, []);

  const handleConsent = (choice: CookieConsent) => {
    localStorage.setItem('onsecapte-cookie-consent', choice || 'essential');
    setConsent(choice);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-slate-900 border-t border-slate-800 shadow-2xl animate-in slide-in-from-bottom">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4 md:gap-8">
        <div className="flex-grow text-sm text-slate-300">
          <h2 className="text-lg font-semibold text-white mb-2">Respect de votre vie privée</h2>
          <p className="mb-2">
            Nous utilisons des cookies essentiels pour assurer le bon fonctionnement et la sécurité de l'application (authentification, préférences). 
            Aucun cookie de suivi publicitaire n'est utilisé.
          </p>
          <Link to="/cookies" className="text-primary-400 hover:text-primary-300 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-1 py-0.5">
            En savoir plus sur notre politique des cookies
          </Link>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={() => handleConsent('essential')}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            Continuer sans accepter
          </button>
          <button
            onClick={() => handleConsent('all')}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-500 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            Tout accepter
          </button>
          <button 
            onClick={() => setIsVisible(false)} 
            className="absolute top-2 right-2 md:hidden p-2 text-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg"
            aria-label="Fermer la bannière des cookies"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
