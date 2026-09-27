# OnSeCapte 🚀

> **Note :** Ce projet a été réalisé en mode **Vibe Coding** ! Il est né d'un besoin concret au sein de notre groupe d'amis : nous ne trouvions aucun logiciel ou application adapté pour organiser facilement nos sorties et activités ensemble.

**OnSeCapte** est une application web moderne qui permet d'organiser facilement des événements, sorties et activités entre amis ou au sein de groupes privés.

## 🛠️ Stack Technique

- **Frontend :** React (Vite) + TypeScript (mode strict)
- **Style :** Tailwind CSS + Lucide Icons
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
- **Administration du Groupe :**
  - **Suppression :** Le gérant/propriétaire du groupe peut supprimer définitivement son groupe.
  - **Transfert de propriété :** Le gérant peut transférer la propriété du groupe à un autre membre, sous réserve que le destinataire n'ait pas atteint sa limite de 3 groupes créés.
- **Gestion des Événements :**
  - **Création d'événement :** Titre, description, prix (gratuit si 0 €) et choix parmi 6 catégories (*Restaurant*, *Jeux de rôle*, *Soirée*, *Repas*, *Sport*, *Gaming*).
  - **Droits de modification/suppression :** Un événement ne peut être supprimé que par son créateur ou le gérant du groupe.
- **Filtrage et Tri UX/UI :**
  - Onglets/filtres par catégorie avec icônes Lucide dédiées.
  - Tri dynamique par prix (croissant / décroissant).

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
