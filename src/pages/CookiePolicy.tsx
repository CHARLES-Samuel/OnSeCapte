import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const CookiePolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-slate-300">
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Retour à l'accueil
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-white mb-8">Politique des Cookies</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">1. Qu'est-ce qu'un cookie ?</h2>
        <p className="mb-2">
          Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur, tablette, smartphone) lors de la visite d'un site web ou de l'utilisation d'une application. Il permet au site de mémoriser vos actions et préférences (telles que la connexion, la langue, la taille de la police, etc.) pendant un temps donné.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">2. Cookies utilisés sur OnSeCapte</h2>
        <p className="mb-4">
          Nous utilisons uniquement des cookies et des technologies de stockage local (comme `localStorage` ou `IndexedDB`) strictement nécessaires au bon fonctionnement de l'application :
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Cookies d'authentification :</strong> Gérés par Firebase Auth pour maintenir votre session active de manière sécurisée.</li>
          <li><strong>Stockage de préférences :</strong> Pour sauvegarder vos choix en matière de cookies et certains paramètres d'interface.</li>
        </ul>
        <p className="mb-2 font-medium text-primary-400">
          Nous n'utilisons aucun cookie de suivi publicitaire ou de profilage.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">3. Gestion de vos préférences</h2>
        <p className="mb-2">
          Vous avez la possibilité d'accepter tous les cookies ou de refuser ceux qui ne sont pas strictement nécessaires au fonctionnement de base de l'application (bien qu'actuellement, tous nos cookies soient essentiels).
        </p>
        <div className="mt-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
          <h3 className="text-lg font-medium text-white mb-2">Modifier vos choix</h3>
          <p className="text-sm mb-4">Vous pouvez réinitialiser vos préférences de cookies à tout moment.</p>
          <button 
            onClick={() => {
              localStorage.removeItem('onsecapte-cookie-consent');
              window.location.reload();
            }}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
          >
            Réinitialiser mes préférences
          </button>
        </div>
      </section>
    </div>
  );
};
