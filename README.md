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

L'interface est organisée en trois **onglets** : **Événements**, **Membres** et **Statistiques**.

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
- **Gestion des Événements :** Création, édition, suppression avec modales de confirmation, filtres par catégorie et état, tri par prix.

#### Onglet Membres (`MemberManagementPanel` & `MemberRow`)
- **Exclusion systématique et temps réel (Kick) :** Le gérant peut exclure un membre du groupe avec confirmation. Grâce à la synchronisation temps réel `onSnapshot` du groupe, **l'accès du membre est immédiatement révoqué sur son écran sans qu'il ait besoin de rafraîchir la page**. Toute modale ouverte est fermée, et la création ou modification d'événements est bloquée instantanément à 3 niveaux (UI, Service et Règles Firestore). Le membre exclu peut rejoindre à nouveau via le code ou le lien d'invitation.
- **Bannissement définitif (Ban) :** Le gérant peut bannir un membre. Son UID est ajouté à la liste `bannedMemberIds` et retiré de `members`. Toute tentative de réadhésion est bloquée côté service **et** dans les règles Firestore avec un message explicite : *"Vous ne pouvez pas rejoindre ce groupe car vous en avez été banni"*.
- **Levée de bannissement (Unban) :** Le gérant peut consulter la liste des membres bannis (avec récupération complète de leurs pseudos) et lever leur bannissement.
- **Quitter le groupe :** Chaque membre peut quitter volontairement le groupe avec confirmation modale. Le gérant est informé qu'il doit d'abord transférer la propriété avant de pouvoir quitter.

#### Onglet Statistiques (`GroupStatsPanel`)
- **Résumé global :** Nombre total d'événements avec répartition par statut (*En recherche*, *À venir*, *Passés*).
- **Activités favorites :** Répartition par catégorie avec barres de progression visuelles.
- **Membres les plus actifs :** Classement (Top 5) avec compteurs d'événements créés et de réponses de disponibilité.

### 4. Saisie des Disponibilités & Sondage (`EventDetails`)
- **Sélection des jours (Format Calendrier Grille Airbnb) :** Grille mensuelle 7 colonnes avec navigation entre les mois.
- **Personnalisation des Créneaux Horaires :** Liste déroulante ergonomique (*Toute la journée*, *Matin*, *Après-midi*, *Soirée*).
- **Synthèse & Réponses des Membres :** Progression en temps réel, classement dynamique des meilleures dates (Top 3).
- **Verrouillage & Annulation (`unlockEventDate`) :** Le créateur ou le gérant peut fixer puis annuler la date finale avec confirmation modale.

### 5. Conformité Légale & Accessibilité (RGPD / WCAG)
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
