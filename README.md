# TP-ListeTaches-V3

Application Expo (SDK 58) de gestion de tâches, **hors ligne d'abord** :
les tâches sont enregistrées sur le téléphone (SQLite) et synchronisées
avec Supabase dès qu'une connexion internet est disponible.

## Fonctionnement

- Chaque ajout, modification ou suppression est d'abord enregistré sur le
  téléphone : l'application fonctionne sans internet.
- Les modifications non envoyées sont marquées « Non synchronisée ».
- La synchronisation se lance au démarrage, après chaque modification, quand
  le réseau revient, quand on revient dans l'application, et en tirant la
  liste vers le bas (ou avec « Synchroniser maintenant » dans le profil).
- Un bandeau indique l'état : synchronisé, synchronisation en cours,
  hors ligne (avec le nombre de modifications en attente) ou erreur.
- En cas de conflit, la dernière modification envoyée l'emporte.
- Sans fichier `.env.local`, l'application fonctionne en mode local seulement.

| Fichier | Rôle |
| --- | --- |
| `src/services/localTasks.js` | Copie locale (SQLite) et file des modifications à envoyer |
| `src/services/remoteTasks.js` | Accès à la table `tasks` de Supabase |
| `src/services/sync.js` | Envoi des modifications puis réception de la liste du serveur |
| `src/context/TaskContext.js` | État partagé et déclenchement de la synchronisation |
| `src/components/SyncBanner.js` | Bandeau d'état de la synchronisation |

## Installation

1. `npm install`
2. Créez un projet Supabase et exécutez `supabase/schema.sql` dans
   **SQL Editor**.
3. Copiez `.env.example` vers `.env.local` et renseignez l'URL du projet et
   la clé *publishable* (**Project Settings → API Keys**).
4. `npm start`, puis ouvrez l'application avec Expo Go.

Pour tester le mode hors ligne : activez le mode avion, ajoutez ou modifiez
des tâches, puis désactivez-le et regardez le bandeau passer à « Synchronisé ».

> La règle de sécurité de `schema.sql` laisse toute personne possédant la clé
> publique lire et modifier les tâches : acceptable pour un TP uniquement.
# TP-ListeTaches-V3
