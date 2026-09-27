# OnSeCapte 🚀

> **Note :** Ce projet a été réalisé en mode **Vibe Coding** ! Il est né d'un besoin concret au sein de notre groupe d'amis : nous ne trouvions aucun logiciel ou application adapté pour organiser facilement nos sorties et activités ensemble.

**OnSeCapte** est une application web moderne qui permet d'organiser facilement des événements, sorties et activités entre amis ou au sein de groupes privés.

## 🛠️ Stack Technique

- **Frontend :** React (Vite) + TypeScript (mode strict)
- **Style :** Tailwind CSS + Lucide Icons + React-Markdown
- **Backend / BaaS :** Firebase (Authentication & Cloud Firestore)

---

## ✨ Fonctionnalités Principales

### 1. Authentification & Profil (`Auth`)
- Connexion / Inscription sécurisée avec Firebase Auth (Google & Email/Mot de passe).
- Protection des routes privées.

### 2. Gestion des Groupes (`Dashboard`)
- **Création de Groupe :** Limite stricte de 3 groupes créés par utilisateur.
- **Rejoindre un groupe :** Système de code d'invitation unique (ex: `A8X9K2`) avec protection rate-limiting contre les tentatives abusives.
- **Vue Dashboard :** Visualisation élégante de tous les groupes dont l'utilisateur est membre.

### 3. Vue Détaillée d'un Groupe & Administration (`GroupDetails`)
- **Administration du Groupe & Transfert :**
  - **Suppression :** Le gérant/propriétaire du groupe peut supprimer définitivement son groupe avec confirmation visuelle.
  - **Transfert de propriété (`TransferOwnershipModal`) :** Le gérant peut transférer la propriété avec affichage explicite des **noms réels des membres** au lieu des identifiants bruts.
- **Gestion des Événements :**
  - **Création d'événement :** Titre, description riche en Markdown (avec limite de 1500 caractères), prix (gratuit si 0 €) et choix parmi 6 catégories.
  - **Créateur visible :** Affichage clair du nom du membre ayant créé l'événement sur les cartes.
  - **Édition d'événement (`EditEventModal`) :** Modification à tout moment du titre, de la description, de la catégorie et du prix par le gérant ou le créateur.
  - **Support du Markdown (`MarkdownView`) :** Rendu riche des descriptions.
  - **Popups de confirmation modernes (`ConfirmModal`) :** Remplacement des alertes navigateur natives par de magnifiques fenêtres modales personnalisées pour les suppressions et annulations.
- **Filtrage, Tri & Listes Déroulantes UX/UI :**
  - Design moderne et sur-mesure pour toutes les listes déroulantes (flèche SVG custom, fond sombre adapté, transitions douces).
  - Onglets/filtres par catégorie et état avec icônes Lucide dédiées.
  - Tri dynamique par prix (croissant / décroissant).

### 4. Saisie des Disponibilités & Sondage (`EventDetails`)
- **Sélection des jours (Format Calendrier Grille Airbnb) :**
  - Grille mensuelle sur 7 colonnes (Lundi à Dimanche) avec navigation entre les mois.
  - Visualisation claire des jours passés (désactivés), du jour actuel et des jours sélectionnés.
- **Personnalisation des Créneaux Horaires via Liste Déroulante :**
  - Liste déroulante ergonomique pour basculer facilement d'un jour sélectionné à l'autre.
  - Choix fin par jour (*Toute la journée*, *Matin*, *Après-midi*, *Soirée*).
- **Synthèse & Réponses des Membres :**
  - Progression en temps réel du nombre de membres ayant répondu.
  - Classement dynamique des meilleures dates (Top 3 des créneaux les plus plébiscités).
  - Affichage détaillé des réponses et disponibilités individuelles des autres membres du groupe.
- **Verrouillage & Annulation en cas d'imprévu (`unlockEventDate`) :**
  - Le créateur de l'événement ou le gérant du groupe peut fixer la date finale **exclusivement parmi les 3 meilleures options du sondage**.
  - **Annulation et réouverture du sondage :** En cas d'imprévu, le gérant ou le créateur peut annuler la date fixée avec confirmation modale moderne et rouvrir le sondage pour permettre aux membres de revoter.
  - **Visualisation persistante :** Même lorsque l'événement est verrouillé, le contenu complet reste accessible à tous les membres.

### 5. Conformité Légale & Accessibilité (RGPD / WCAG)
- **Pages Légales dédiées :** Mentions Légales, Politique de Confidentialité, Politique des Cookies, accessibles via un Footer persistant.
- **Bannière de Consentement (Cookies) :** Gestion des cookies via le `localStorage`, ne bloquant pas l'UX tout en garantissant le droit d'information et de refus de l'utilisateur.
- **Accessibilité Universelle (A11y) :** 
  - Structure HTML5 sémantique (`<main>`, `<header>`, `<footer>`).
  - Accessibilité clavier 100% avec des styles de focus globaux explicites.
  - Textes alternatifs (`alt`, `aria-label`) et balisage pour les lecteurs d'écran (`aria-hidden` sur les icônes).
  - Contraste de couleurs respectant la norme WCAG AA.

---

## 🛡️ Qualité & Sécurité (Clean Code & SOLID)
- **Sécurité et variables d'environnement** : Toutes les clés API et configurations sensibles (Firebase) sont sécurisées via variables d'environnement (`.env`) exclues de Git.
- **Principes SOLID & DRY** : Code fortement factorisé (Hooks réutilisables, Utilitaires globaux de formatage, Composants modulaires).
- **Typage Strict** : Utilisation rigoureuse de TypeScript, gestion sécurisée des erreurs avec `err instanceof Error`, et typage Firebase officiel (`DocumentData`) pour bannir l'usage du type `any`.
- **Inversion des Dépendances (DIP)** : L'interface utilisateur ne communique jamais directement avec Firestore, tout transite via des interfaces `Service`.
- **Gestion de la Mémoire** : Nettoyage systématique des écouteurs temps réel Firestore (`onSnapshot`) au démontage des composants React.

---

## 🚀 Lancement en local

```bash
# Installation des dépendances
npm install

# Lancement du serveur de développement Vite
npm run dev

# Vérification du typage TypeScript
npx tsc --noEmit

# Build de production
npm run build
```
