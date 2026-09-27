import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-slate-300">
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Retour à l'accueil
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-white mb-8">Politique de Confidentialité (RGPD)</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">1. Données collectées</h2>
        <p className="mb-4">
          Dans le cadre de l'utilisation d'OnSeCapte, nous collectons les données suivantes, principalement via Firebase Auth et Firestore :
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Nom ou pseudo</li>
          <li>Adresse e-mail</li>
          <li>Photo de profil (si connexion via Google)</li>
          <li>Données d'utilisation (appartenance aux groupes, événements, disponibilités)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">2. Finalité de la collecte</h2>
        <p className="mb-2">
          Les données collectées ont pour unique but de permettre le bon fonctionnement de l'application : l'organisation de sorties entre amis, la gestion des groupes et la coordination des disponibilités. 
        </p>
        <p className="mb-2 text-primary-400 font-medium">
          Vos données ne seront jamais revendues ou cédées à des tiers.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">3. Durée de conservation</h2>
        <p className="mb-2">
          Vos données sont conservées aussi longtemps que votre compte reste actif. Si vous décidez de supprimer votre compte, l'ensemble de vos données personnelles sera supprimé de nos bases de données de manière permanente.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">4. Exercice de vos droits (RGPD)</h2>
        <p className="mb-2">
          Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Droit d'accès et de rectification de vos données.</li>
          <li>Droit à l'effacement (suppression de compte).</li>
          <li>Droit à la limitation et à l'opposition au traitement.</li>
        </ul>
        <p className="mb-2">
          Pour exercer ces droits, vous pouvez nous contacter à slummer0902@gmail.com ou utiliser les options de suppression de compte directement dans l'application.
        </p>
      </section>
    </div>
  );
};
