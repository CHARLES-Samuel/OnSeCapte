# OnSeCapte 🚀 (v1.0.0)

> **Note :** Ce projet a été réalisé en mode **Vibe Coding** ! Il est né d'un besoin concret au sein de notre groupe d'amis : nous ne trouvions aucun logiciel ou application adapté pour organiser facilement nos sorties et activités ensemble.

**OnSeCapte** est une application web moderne qui permet d'organiser facilement des événements, sorties et activités entre amis ou au sein de groupes privés.

🌐 **Application déployée :** [https://onsecapte-25bae.web.app](https://onsecapte-25bae.web.app)

## 🛠️ Stack Technique

- **Frontend :** React (Vite) + TypeScript (mode strict)
- **Style :** Tailwind CSS + Lucide Icons + React-Markdown
- **Backend / BaaS :** Firebase (Authentication & Cloud Firestore)

---

## ✨ Fonctionnalités Principales

### 1. Authentification & Profil (`Auth`)
- Connexion / Inscription sécurisée avec Firebase Auth (Google & Email/Mot de passe).
- Protection des routes privées.
- **Gestion du Pseudo :** Les utilisateurs peuvent modifier leur pseudo (nom d'affichage) à tout moment via une modale dédiée.
- **Synchronisation Globale :** Les pseudos sont synchronisés en temps réel dans une collection globale `users` sur Firestore, garantissant que tout l'historique d'événements et de votes reflète toujours le nom actuel de l'utilisateur.

### 2. Gestion des Groupes (`Dashboard`)
- **Création de Groupe :** Limite stricte de 3 groupes créés par utilisateur.
- **Rejoindre un groupe :** Système de code d'invitation unique (ex: `A8X9K2`) avec protection rate-limiting contre les tentatives abusives.
- **Vue Dashboard :** Visualisation élégante de tous les groupes dont l'utilisateur est membre.

### 3. Vue Détaillée d'un Groupe & Administration (`GroupDetails`)

L'interface est organisée en quatre **onglets** : **Événements**, **Planning**, **Membres** et **Statistiques**.

#### Onglet Événements
- **Administration du Groupe & Transfert :**
  - **Édition des informations (`EditGroupModal`) :** Le gérant peut modifier le nom, la description (avec support du Markdown) et importer une **photo de groupe ainsi qu'une bannière personnalisée** avec un **système de recadrage intégré**.
  - **Interface Profil de Groupe :** Affichage riche type "Twitter/X" avec une bannière pleine largeur, la photo de profil, et la description Markdown.
  - **Suppression :** Le gérant peut supprimer définitivement son groupe avec confirmation visuelle.
  - **Transfert de propriété (`TransferOwnershipModal`) :** Le gérant peut transférer la propriété avec affichage explicite des **noms réels des membres**.
- **Lien d'invitation partageable (`InviteLinkButton`) :**
  - En plus du code court, le gérant peut copier un **lien d'invitation direct** (ex: `https://app.example.com/join/ABCD1234`) d'un simple clic avec retour visuel immédiat ("Lien copié !").
  - La route `/join/:inviteCode` gère l'adhésion directe et idempotente pour les utilisateurs connectés (redirection automatique ou bouton d'accès direct).
  - Pour les visiteurs non connectés, l'invitation est conservée en `sessionStorage` et l'utilisateur est automatiquement redirigé vers l'invitation dès sa connexion via Google.
- **Gestion des Événements :** Création, édition, suppression avec modales de confirmation, filtres par catégorie et état, tri par prix. Ajout d'un **Lieu** (avec lien direct Google Maps) et d'un **Lien externe** (réservation, menu...) facultatifs pour enrichir les événements.

#### Onglet Planning (`GroupPlanningTab`)
- **Calendrier Partagé du Groupe :** Vue consolidée des dates et disponibilités de tous les membres pour l'ensemble des événements du groupe.
- **Synchronisation en Temps Réel :** Suivi instantané des plannings et des créneaux sélectionnés via `useGroupPlannings`.

#### Onglet Membres (`MemberManagementPanel` & `MemberRow`)
- **Exclusion systématique et temps réel (Kick) :** Le gérant peut exclure un membre du groupe avec confirmation. Grâce à la synchronisation temps réel `onSnapshot` du groupe, **l'accès du membre est immédiatement révoqué sur son écran sans qu'il ait besoin de rafraîchir la page**. Toute modale ouverte est fermée, et la création ou modification d'événements est bloquée instantanément à 3 niveaux (UI, Service et Règles Firestore). Le membre exclu peut rejoindre à nouveau via le code ou le lien d'invitation.
- **Bannissement définitif (Ban) :** Le gérant peut bannir un membre. Son UID est ajouté à la liste `bannedMemberIds` et retiré de `members`. Toute tentative de réadhésion est bloquée côté service **et** dans les règles Firestore avec un message explicite : *"Vous ne pouvez pas rejoindre ce groupe car vous en avez été banni"*.
- **Levée de bannissement (Unban) :** Le gérant peut consulter la liste des membres bannis (avec récupération complète de leurs pseudos) et lever leur bannissement.
- **Quitter le groupe :** Chaque membre peut quitter volontairement le groupe avec confirmation modale. Le gérant est informé qu'il doit d'abord transférer la propriété avant de pouvoir quitter.

#### Onglet Statistiques (`GroupStatsPanel`)
- **Résumé global :** Nombre total d'événements avec répartition par statut (*En recherche*, *À venir*, *Passés*).
- **Activités favorites :** Répartition par catégorie avec barres de progression visuelles.
- **Membres les plus actifs :** Classement (Top 5) avec compteurs d'événements créés et de réponses de disponibilité.

### 4. Saisie des Disponibilités, Sondage & Retours Visuels (`EventDetails` & `UserAvailabilityForm`)
- **Sélection des jours et créneaux horaires :** Interface intuitive permettant de choisir des dates et des créneaux horaires précis (*Matin*, *Après-midi*, *Soirée*, *Nuit*).
- **Gestion de l'indisponibilité globale & Imprévus après date fixée :**
  - Possibilité de déclarer son indisponibilité totale en un clic.
  - **Maintien de la modification post-verrouillage :** Même lorsqu'une date définitive a été sélectionnée et l'événement verrouillé (`planifie`), chaque membre conserve la possibilité de se déclarer indisponible ("Pas dispo") ou de reconfirmer sa présence ("Je participe") à tout moment en cas d'imprévu.
- **Retour Visuel Immédiat & Zéro Décalage (Feedback Utilisateur) :**
  - État de chargement explicite (*"Enregistrement en cours..."* avec spinner animé) et désactivation des champs pendant la sauvegarde.
  - Notification Pop-up Toast flottante élégante (*"Votre indisponibilité a été prise en compte"* ou *"Votre participation a bien été enregistrée ✓"*) auto-temporisée (3,5 secondes) et dismissible manuellement.
  - Badge dynamique dans la bannière d'événement confirmé indiquant clairement le statut individuel du membre (*Inscrit*, *Indisponible* ou *Réponse en attente*).
- **Synthèse & Réponses des Membres en Temps Réel :**
  - Récapitulatif temps réel des présences confirmées et des indisponibilités (`X présent(s) • Y indispo.`).
  - Classement dynamique des meilleures dates (Top 3) et détails nominatifs par participant.
- **Verrouillage & Annulation (`unlockEventDate`) :** Le créateur ou le gérant peut fixer puis annuler la date finale avec confirmation modale.

### 5. Ergonomie, UI/UX & Responsive Design (Mobile 320px+ & Desktop)
- **Gestion des Images avec Transparence (PNG & WebP) :**
  - Préservation intégrale et sans perte du format PNG (`image/png` lossless) et du canal alpha lors du téléversement, du recadrage client (`ImageCropperModal`) et de la compression client (`compressImage`).
  - Détection automatique des pixels transparents et intégration d'un dégradé linéaire vibrant (`#6366f1` Indigo ➔ `#a855f7` Violet ➔ `#ec4899` Rose) combiné à la classe dédiée `.photo-gradient-bg`, garantissant un rendu moderne et éclatant sur tous les conteneurs (profil de groupe, dashboard, modale d'édition et avatars).
- **Barre de Navigation Interne Parfaitement Alignée (`GroupNavigationTabs`) :**
  - Navigation par onglets fluide, accessible et sans marge négative parasite.
  - Alignement au pixel près avec le header du groupe (`GroupHeader`) et les panneaux de contenu (`max-w-6xl`).
  - Aucun retour à la ligne chaotique ni écrasement du texte (`whitespace-nowrap`), cibles tactiles confortables (`min-h-[44px]`).
  - Balisage WAI-ARIA complet (`role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`).
- **Couleurs Distinctes par Catégorie d'Événement (`CategoryBadge` & `categoryTheme`) :**
  - Palette colorimétrique dédiée pour chaque catégorie (Restaurant: orange chaud, Jeux de rôle: violet, Soirée: rose vif, Repas: jaune ambré, Sport: vert émeraude, Gaming: cyan, Autres: ardoise neutre).
  - Fond translucide doux, bordure vive et texte contrasté adapté aux thèmes sombres et clairs pour une scannabilité visuelle instantanée des listes d'événements.
- **Filtre de Catégories Déroulant Stylisé (`CategoryDropdown`) :**
  - Remplacement de l'ancienne barre horizontale de catégories surchargée par un sélecteur déroulant compact et accessible.
  - Option par défaut *"Toutes les catégories"*, pastilles de couleurs vives (*color dots*), icônes Lucide et indicateurs de sélection actifs.
  - Gestion accessible complète (fermeture au clic extérieur, touche Échap, WAI-ARIA `role="listbox"`).
- **Partage du Groupe Ouvert à Tous les Membres (`InviteLinkButton`) :**
  - Le bouton d'invitation / copie de lien n'est plus restreint au seul créateur mais désormais accessible et visible par **tous les membres du groupe**.
  - Libellé mobile clarifié (*"Inviter"*) avec retour visuel immédiat (*"Lien copié !"*).
- **Menu d'Administration Propriétaire Tactile sur Mobile (`GroupOwnerActionsMenu`) :**
  - Sur mobile, remplacement des multiples boutons d'administration compressés par un menu contextuel discret et tactile (*kebab menu* "...").
  - Regroupe l'édition des infos, le transfert de propriété et la suppression définitive avec des zones tactiles généreuses (`min-h-[44px]`) éliminant tout débordement ou mauvaise manipulation.
- **Interface Produit Finie :** Suppression des indicateurs techniques de test (Firebase) sur la page d'accueil.
- **Stabilisation du Bouton de Tri :** Largeur minimale calibrée (`min-w-[145px]`) et contenu centré (`whitespace-nowrap`) garantissant une stabilité dimensionnelle parfaite lors de l'alternance *Croissant* / *Décroissant*.
- **Navigation Optimisée au Pouce :**
  - Zones tactiles conformes aux recommandations d'accessibilité mobile (minimum 36px à 44px).
  - Défilement horizontal fluide des barres de filtres (statuts et catégories) avec `overflow-x-auto touch-pan-x` et protection `min-w-0` contre tout débordement d'écran.
  - Toutes les modales sont adaptatives avec défilement interne sécurisé (`max-h-[92vh] overflow-y-auto`) pour s'adapter aux claviers virtuels et à l'orientation paysage.
- **Zéro Débordement Horizontal :** Intégration de `overflow-x-hidden` et de règles de retour à la ligne propres sur tous les conteneurs principaux.

### 6. Conformité Légale & Accessibilité (RGPD / WCAG)
- **Pages Légales dédiées :** Mentions Légales, Politique de Confidentialité, Politique des Cookies.
- **Bannière de Consentement (Cookies) :** Gestion via le `localStorage`.
- **Accessibilité Universelle (A11y) :**
  - Structure HTML5 sémantique (`<main>`, `<header>`, `<footer>`).
  - Accessibilité clavier 100% avec styles de focus globaux explicites.
  - `aria-label` explicites sur tous les boutons d'action (exclure, bannir, débannir, quitter, copier le lien).
  - Balisage `role="tablist"`, `role="tab"`, `role="tabpanel"` pour le système d'onglets.
  - `role="progressbar"` pour les barres de statistiques.
  - `role="alert"` pour les messages d'erreur inline.
  - Contraste de couleurs respectant la norme WCAG AA.

---

## 🛡️ Qualité & Sécurité (Clean Code & SOLID)
- **Sécurité et variables d'environnement** : Toutes les clés API sont sécurisées via `.env` exclues de Git.
- **Principes SOLID & DRY** :
  - Découpage strict des composants respectant la limite de 150-200 lignes (`GroupHeader`, `GroupEventsTab`, `MemberRow`, `MemberManagementPanel`, `GroupStatsPanel`).
  - **Inversion des Dépendances (DIP)** : Ni les composants React ni les Custom Hooks ne dépendent directement de Firebase Firestore. Tout transite par `IGroupService` (notamment `getMemberProfiles` pour la récupération des profils).
- **Typage Strict** : TypeScript strict, zéro `any`, gestion sécurisée des erreurs.
- **Logique métier isolée** : `eventStatsUtils.ts` est une fonction **pure** (zéro effet de bord, zéro dépendance Firebase) pour le calcul des statistiques, facilement testable.
- **Firestore Security Rules** :
  - `allow read: if request.auth != null;` autorise les requêtes de recherche par code d'invitation sans bloquer les nouveaux membres ni la vérification d'unicité lors de la création d'un groupe.
  - Règles d'écriture strictes avec helpers sécurisés (`isOwner`, `isMember`, `isBanned` avec vérification de présence du champ `bannedMemberIds`) — les membres bannis sont bloqués à l'écriture côté base de données indépendamment de l'UI.
  - Révocation systématique sur les événements : `create`, `update` et votes d'événements exigent formellement que l'utilisateur soit membre actif dans le document du groupe parent (`isMemberOfGroup(groupId)`). Tout utilisateur exclu est instantanément rejeté par la base de données.
- **Gestion de la Mémoire** : Nettoyage systématique des écouteurs temps réel Firestore (`onSnapshot`) et des timers de redirection (`useRef` / `clearTimeout`).

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

---

## 🌐 Déploiement en Production

### Option A — Firebase Hosting
```bash
# 1. Connexion au CLI Firebase (si pas déjà fait)
npx firebase login

# 2. Build de production
npm run build

# 3. Déploiement du site et des règles de sécurité
npx firebase deploy --only hosting,firestore:rules,storage
```

### Option B — Vercel
```bash
# 1. Déploiement direct (avec le fichier vercel.json inclus)
npx vercel --prod
```
