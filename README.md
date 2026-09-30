# OnSeCapte 🚀 (v1.3.0)

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
- **Gestion, Filtrage & Consultation des Événements (`GroupEventsTab`) :**
  - **Désengorgement de la vue "Tous" & Catégorie "Passés" dédiée :**
    - Le filtre **"Tous"** n'affiche désormais que les **événements actifs** (*En recherche* et *À venir*), évitant la surcharge visuelle avec d'anciens événements obsolètes.
    - Les événements passés sont isolés dans leur propre catégorie / onglet **"Passés"**.
    - **Compteurs dynamiques :** Chaque bouton de statut affiche un badge de comptage en temps réel (*Tous (N)*, *En recherche (N)*, *À venir (N)*, *Passés (N)*).
    - **Bannière d'accès rapide aux archives :** Lorsqu'on consulte "Tous" et que des événements passés existent, un encart discret en bas de liste permet de basculer en un clic vers la vue des événements passés.
  - **Bascule Grille vs Liste (`EventViewToggle`) :** Bouton discret permettant d'alterner entre l'affichage en **Cartes** (visuel) et le mode **Ligne / Liste compacte** (`EventListItem`), idéal pour les groupes avec de nombreux événements. La préférence est automatiquement mémorisée dans le `localStorage` via `useEventsViewMode`.
  - **Tri Intelligent des Événements (`EventSortDropdown` & `eventSortUtils`) :** Menu déroulant moderne avec tri chronologique par date (*Prochains événements d'abord*, *Plus lointains d'abord*), par date de création récente, ou par prix (croissant / décroissant). Les événements à date fixée se positionnent à leur date exacte, et ceux sans date fixée (en recherche de date) sont classés en fin de liste.
  - **Nombre de Participants & Réponses en Direct (`EventParticipationBadge`) :** Chaque carte et chaque ligne affiche un badge récapitulatif clair indiquant le nombre de participants confirmés (*ex: "4 participants"*) ainsi que les réponses en attente (*ex: "2 en attente"*), offrant une visibilité immédiate sans ouvrir l'événement.
  - **Actions rapides :** Possibilité de répondre directement (*Je participe* / *Pas dispo*) et d'accéder aux actions de modification/suppression depuis les cartes et lignes.
  - **Création & Détails complets :** Gestion avec modales, filtres par catégorie (`CategoryDropdown`) et par statut (*Tous*, *En recherche*, *À venir*, *Passés*). Lieu (avec lien Google Maps) et lien externe (réservation, menu...) intégrés.

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

### 4. Saisie des Disponibilités, Sondage & Heatmap de Dates (`EventDetails`)
- **Contrôles Stricts de Dates & Protection Anti-Erreur :**
  - **Interdiction Formelle des Dates Passées :** Impossible de fixer une date à un jour déjà passé (que ce soit via la Heatmap, la sélection rapide du podium, la saisie manuelle ou les formulaires de création et modification). Le podium (Top 3) exclut automatiquement toute date passée.
  - **Respect Strict de la Plage Définie (`dateMode: 'range'`) :** Lorsqu'un événement a une plage de dates définie, il est strictement impossible de valider une date en dehors de cette plage (contrôle à 3 niveaux : restrictions HTML `min`/`max`, validation JS en temps réel et garde-fou strict côté service `lockEventDate`).
  - **Transition Automatique vers l'État "Passé" (`state: 'passe'`) & Vue Épurée (`PastEventView`) :**
    - Dès qu'un événement confirmé voit sa date dépassée, il bascule automatiquement à l'état `passe`. Il est immédiatement sorti de la liste "Tous" pour désencombrer l'écran et reçoit le statut archivé avec persistance en base de données.
    - **Clôture Totale des Interactions de Présence :** Sur un événement passé, il est désormais **impossible d'interagir sur sa présence** (aucun bouton de vote, formulaires de disponibilité retirés, boutons rapides masqués sur les cartes et les lignes, et rejet strict côté service).
    - **Affichage Dédié en Lecture Seule :** La page de détails affiche une vue épurée et ciblée présentant uniquement :
      1. La **date exacte où l'événement s'est produit** (avec le créneau horaire).
      2. La **liste des personnes présentes** (avatars, pseudos et nombre de participants confirmés).
      3. La **description complète de l'événement** (au format Markdown).
- **Fenêtre de Recherche & Plage de Dates à la Création (`EventDateModeSelector`) :**
  - **3 choix de date à la création et modification :**
    1. **Sans restriction :** L'algorithme analyse l'ensemble des plannings partagés glissants pour identifier les meilleures dates futures.
    2. **Plage de dates (Période restreinte) :** L'organisateur définit une fenêtre précise avec sélecteurs de *Date de début* et *Date de fin* (ex: *"Entre le 10 et le 25 du mois"*). Le calcul des scores, le podium et l'affichage interactif se restreignent automatiquement à cet intervalle (les dates extérieures sont atténuées et désactivées).
    3. **Date fixe :** Événement arrêté à un jour et un créneau horaire précis (contraint aux dates futures).
  - **Indicateur visuel de plage :** Badge bleu informatif présent dans les listes d'événements et dans l'en-tête de la page de détails (*"Plage : 10 oct. - 25 oct."*).
- **Calendrier Choroplèthe (Heatmap des Disponibilités) (`AvailabilityHeatmapCalendar` & `AvailabilityHeatmapCell`) :**
  - **Remplacement de la vue classique de sondage :** Vue calendrier mensuelle sous forme de heatmap interactive avec navigation fluide de mois en mois et centrage automatique sur le début de la plage.
  - **Opacité dynamique selon le taux de présence :**
    - 0 disponible : fond neutre et discret.
    - Faible disponibilité : vert pastel très doux.
    - Disponibilité moyenne / forte : vert franc.
    - 100% du groupe disponible : vert émeraude vibrant avec ombre portée lumineuse.
    - Dates passées : atténuées avec opacité réduite et sans possibilité de verrouillage.
  - **Mise en avant du Podium (Top 3) :**
    - 🥇 **1ère place (Or) :** Bordure dorée brillante, halo ambré et badge médaille d'or.
    - 🥈 **2ème place (Argent) :** Bordure argentée élégante et badge médaille d'argent.
    - 🥉 **3ème place (Bronze) :** Bordure cuivrée bronze et badge médaille de bronze.
    - **Barre de raccourcis Podium :** Accès direct aux 3 meilleures dates d'un simple clic pour naviguer instantanément vers leur mois respectif (dates passées exclues).
- **Détails Nominatifs au Clic / Survol (`DayAvailabilityDetails`) :**
  - Clic sur n'importe quel jour actif pour afficher la ventilation exhaustive :
    - **Disponibles :** Avatars et noms des membres confirmés disponibles.
    - **À confirmer :** Avatars et noms des membres ayant répondu "Peut-être" ou n'ayant pas encore voté.
    - **Indisponibles :** Membres ayant indiqué être absents ou indisponibles pour l'événement.
  - **Verrouillage direct en 1 clic :** L'organisateur peut verrouiller directement la date définitive depuis la vue détaillée du jour sélectionné (bouton sécurisé : masqué si la date est passée ou hors plage avec message d'information explicite).
- **Architecture Ports & Adapters (`IAvailabilityService` & `AvailabilityService`) :**
  - Calcul algorithmique pur isolé dans un service TypeScript strict (zéro `any`, sans effet de bord, indépendant de React et de Firebase), garantissant une testabilité unitaire totale.
- **Gestion de l'indisponibilité globale & Imprévus après date fixée :**
  - Possibilité de déclarer son indisponibilité totale en un clic.
  - **Maintien de la modification post-verrouillage :** Même lorsqu'une date définitive a été sélectionnée et l'événement verrouillé (`planifie`), chaque membre conserve la possibilité de se déclarer indisponible ("Pas dispo") ou de reconfirmer sa présence ("Je participe") à tout moment en cas d'imprévu tant que l'événement n'est pas passé.
- **Retour Visuel Immédiat & Feedback Utilisateur :**
  - État de chargement explicite (*"Enregistrement en cours..."*) et désactivation des champs pendant la sauvegarde.
  - Notification Toast flottante auto-temporisée (3,5 secondes) confirmant la prise en compte.
  - Badge dynamique dans la bannière d'événement confirmé indiquant clairement le statut individuel du membre (*Inscrit*, *Indisponible* ou *Réponse en attente*).
- **Affichage Épuré pour les Événements à Date Fixe (`EventFixedParticipantsList`) :**
  - Pour les événements créés avec une date fixe (`dateMode: 'fixed'`), la vue calendrier de sondage est masquée au profit d'une liste claire et ciblée des participants inscrits et indisponibles.
- **Verrouillage & Annulation (`unlockEventDate`) :** Le créateur ou le gérant peut fixer puis annuler la date finale avec confirmation modale (réservé aux événements issus d'un sondage de dates non encore passés).

### 5. Ergonomie, UI/UX & Responsive Design (Mobile 320px+ & Desktop)
- **Barre de Navigation Globale Unifiée (`Navbar`, `NavUserMenu`, `NavMobileDrawer`) :**
  - **Composant Unique & Cohérent :** Une seule et même barre de navigation responsive utilisée à travers toute l'application (landing page publique et application connectée), évitant toute impression de rupture entre la vitrine et l'espace membre.
  - **Stabilité Dimensionnelle & Zéro Saut de Mise en Page :** Hauteur fixe et garantie (`h-16`, 64px), positionnement sticky (`sticky top-0`), flou d'arrière-plan (`bg-slate-900/80 backdrop-blur-md border-b border-slate-800`), typographie et placement du logo strictement identiques.
  - **Variantes de Contenu selon l'État d'Authentification :**
    - *Visiteur déconnecté :* Logo OnSeCapte (redirection accueil `/`), lien de navigation rapide « Fonctionnalités » avec défilement fluide vers la section de présentation, et bouton stylisé « Connexion avec Google ».
    - *Utilisateur connecté :* Logo OnSeCapte (redirection tableau de bord `/dashboard`), lien direct applicatif « Mes Groupes » avec état actif, et menu profil déroulant ergonomique (`NavUserMenu`) regroupant l'avatar, l'identité, la modification du pseudo et la déconnexion.
  - **Expérience Mobile Symétrique & Tactile (`NavMobileDrawer`) :** Tiroir latéral coulissant unifié (*drawer*) accessible depuis le bouton burger ou l'avatar mobile, offrant le même confort d'utilisation en mode connecté comme déconnecté avec fermeture automatique lors de la navigation.
  - **Hiérarchie Stricte des Z-Index :** Navbar fixée à `z-40`, menus flottants et drawer à `z-50`, et sélecteurs de page harmonisés à `z-30` (ex: `EventSortDropdown`), assurant que la barre de navigation reste continuellement et proprement au-dessus de tout le contenu défilant.
- **Identité Visuelle & Logo / Favicon Unifié (`Logo` & Assets Multi-supports) :**
  - **Source Unique Vectorielle :** Remplacement des anciennes icônes hétérogènes de la navbar (`Users` / `Calendar`) par le visuel officiel de la marque issu directement de la même source SVG (`/favicon.svg`), assurant une reconnaissance immédiate et une identité de marque cohérente.
  - **Composant UI Réutilisable (`Logo.tsx`) :** Conforme aux principes SOLID, modulable en plusieurs tailles (`sm`, `md`, `lg`, `xl`), avec conteneur protecteur optionnel (`withContainer`) assurant un contraste et une lisibilité parfaits sur fonds sombres comme clairs.
  - **Accessibilité & Sémantique :** Intégration d'un lien sémantique `<Link>` avec `aria-label` descriptif pour les lecteurs d'écran et navigation clavier optimale.
  - **Couverture Complète des Formats :**
    - `favicon.svg` : Favicon vectoriel haute définition pour navigateurs modernes.
    - `favicon.ico` : Icône multi-résolution (16x16, 32x32, 48x48) pour la compatibilité avec les anciens navigateurs, agrégateurs et moteurs de recherche.
    - `apple-touch-icon.png` : Format 180x180 optimisé pour l'écran d'accueil iOS avec fond plein `#0f172a` évitant le fond noir par défaut d'Apple.
    - `manifest.json` & Icônes PWA : Fichiers `pwa-192x192.png`, `pwa-512x512.png` et `pwa-maskable-512x512.png` (icône adaptative Android avec marges de sécurité).
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
  - Découpage strict des composants respectant la limite de 150-200 lignes (`GroupHeader`, `GroupEventsTab`, `EventListItem`, `EventCard`, `EventSortDropdown`, `EventViewToggle`, `EventFixedParticipantsList`, `MemberRow`, `MemberManagementPanel`, `GroupStatsPanel`).
  - **Inversion des Dépendances (DIP)** : Ni les composants React ni les Custom Hooks ne dépendent directement de Firebase Firestore. Tout transite par les interfaces de services (`IGroupService`, `IEventService`, etc.).
- **Typage Strict** : TypeScript strict, zéro `any`, gestion sécurisée des erreurs.
- **Logique métier isolée** : `eventSortUtils.ts` (tri chronologique intelligent), `eventParticipationUtils.ts` (calcul des participations) et `eventStatsUtils.ts` sont des fonctions **pures** (zéro effet de bord, zéro dépendance externe), hautement modulaires et testables.
- **Architecture de Sécurité & Règles Firestore Durcies** :
  - **Cloisonnement Strict des Groupes Privés** : Seuls les membres actifs et le propriétaire peuvent lire ou lister un groupe (`allow list` et `allow get` restreints). Aucun non-membre ne peut sonder ou inspecter les groupes privés.
  - **Registre Anti-Énumération (`inviteCodes`)** : Les codes d'invitation sont isolés dans une collection dédiée indexée par code (`O(1)`). L'énumération globale est formellement interdite (`allow list: if false`), bloquant tout moissonage ou scraping automatisé.
  - **Validation Cryptographique de l'Adhésion** : L'adhésion à un groupe exige de fournir la preuve du code d'invitation (`joinCodeAttempt == resource.data.inviteCode`). Il est impossible pour un attaquant ou un script de s'injecter dans un groupe sans posséder le code valide.
  - **Intégrité Granulaire des Événements** :
    - Seuls le créateur de l'événement ou le propriétaire du groupe peuvent modifier ses détails (titre, dates, état, verrouillage).
    - Les membres ordinaires ont uniquement le droit de modifier **leur propre participation** (`participations[request.auth.uid]`), sans pouvoir altérer les votes des autres ni le contenu de l'événement.
    - Seuls les membres du groupe peuvent lire les événements associés.
  - **Protection des Plannings & Profils** : Les disponibilités partagées sont cloisonnées aux membres du groupe, et les profils utilisateurs sont protégés en écriture avec validation stricte des champs.
  - **Règles Cloud Storage Renforcées** : Filtrage strict des types MIME (`image/jpeg`, `image/png`, `image/webp`), restriction de taille (5 Mo max) et chemins autorisés uniquement (`photo.jpg`, `banner.webp`).
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
