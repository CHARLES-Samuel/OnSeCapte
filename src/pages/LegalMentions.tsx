import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const LegalMentions = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-slate-300">
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Retour à l'accueil
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-white mb-8">Mentions Légales</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">1. Éditeur de l'application</h2>
        <p className="mb-2">L'application OnSeCapte est éditée à titre personnel (projet non professionnel).</p>
        <p className="mb-2">Conformément à l'article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique (LCEN), l'éditeur a fait le choix de préserver son anonymat. Ses coordonnées exactes ont été transmises à l'hébergeur.</p>
        <p className="mb-2"><strong>Contact :</strong> slummer0902@gmail.com</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">2. Hébergeur</h2>
        <p className="mb-2">L'application OnSeCapte est hébergée par <strong>Google Firebase / Google Cloud Platform</strong>.</p>
        <p className="mb-2"><strong>Siège social de l'hébergeur :</strong> Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irlande.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">3. Propriété intellectuelle</h2>
        <p className="mb-2">
          Le contenu de l'application OnSeCapte (textes, images, code, design) est la propriété exclusive de son éditeur. 
          Toute reproduction, distribution, modification ou utilisation sans autorisation préalable est strictement interdite.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">4. Contact</h2>
        <p className="mb-2">
          Pour toute question concernant l'utilisation de l'application, vous pouvez nous contacter à l'adresse suivante : slummer0902@gmail.com.
        </p>
      </section>
    </div>
  );
};
