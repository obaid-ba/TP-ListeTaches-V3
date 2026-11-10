# MyTasks V3 — Offline-First Task Manager

> A mobile task manager built with **React Native** and **Expo** that works **without internet**. Tasks are saved on the phone with **SQLite** and synced automatically with **Supabase** whenever a connection is available.

![Expo](https://img.shields.io/badge/Expo-SDK%2058-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.88-61DAFB?logo=react&logoColor=black)
![SQLite](https://img.shields.io/badge/Local-SQLite-003B57?logo=sqlite&logoColor=white)
![Supabase](https://img.shields.io/badge/Cloud-Supabase-3FCF8E?logo=supabase&logoColor=white)
![Offline first](https://img.shields.io/badge/Offline--first-yes-success)

This is the **third and final version** of the project:

| Version | Repository | Storage |
| --- | --- | --- |
| V1 | [ToDoList-obaidAllahBenAli](https://github.com/obaid-ba/ToDoList-obaidAllahBenAli) | On the device (AsyncStorage) |
| V2 | [TP-ListeTaches-V2](https://github.com/obaid-ba/TP-ListeTaches-V2) | In the cloud (Supabase) |
| **V3 (this repo)** | [TP-ListeTaches-V3](https://github.com/obaid-ba/TP-ListeTaches-V3) | Offline-first: SQLite on the device, synced with Supabase |

---

## What's new compared to V2

- **Works offline:** every change is saved on the phone first, so the app never waits for the network.
- **Change queue:** changes that haven't been sent yet are kept on the phone and sent when the connection returns.
- **Automatic sync** with Supabase, plus a **status banner**.
- **IDs created on the phone:** task UUIDs are generated with `expo-crypto`, so tasks created offline never clash with server tasks.
- **Local-only mode:** with no Supabase configuration, the app still works fully on the phone.

## Features

- **Full task management:** create, edit, delete, view and complete tasks.
- **Rich tasks:** title, description, priority (Low / Medium / High) and status (To do / Done).
- **Search, filters and statistics** like in the earlier versions.
- **"Not synced" badge** on tasks with changes that haven't been sent yet.
- **Sync status banner** with four states:
  - **Synced**
  - **Syncing…**
  - **Offline**, with the number of pending changes
  - **Error**
- **Sync runs automatically:**
  - when the app starts
  - after each change
  - when the network comes back (`expo-network`)
  - when you return to the app
  - when you pull the list down
  - when you tap **"Sync now"** in the Profile screen
- **Conflict handling:** when the same task was changed in two places, the last change sent wins.

## How sync works

```
            ┌──────────────── Phone ────────────────┐                 ┌──── Cloud ────┐
 UI  ──►  TaskContext  ──►  localTasks.js (SQLite)
                                   │  pending = 'upsert' | 'delete'
                                   ▼
                              sync.js  ── 1. push pending changes ──►   Supabase
                                   ◄──── 2. pull the latest list ────   (PostgreSQL)
```

1. **Write locally.** Each create or update marks the row `pending = 'upsert'`. Each delete marks it `pending = 'delete'`. A `version` counter goes up with every change.
2. **Push.** `sync.js` sends the pending changes to Supabase. A row is marked as synced only if its `version` hasn't changed in the meantime, so an edit made during sync is never lost.
3. **Pull.** The server list is downloaded and merged into SQLite. Rows that still have pending local changes are never overwritten.
4. **Clean up.** Synced rows that no longer exist on the server are removed from the phone.

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | [Expo](https://expo.dev) SDK 58, React Native 0.88, React 19 |
| Local database | `expo-sqlite` |
| Cloud backend | [Supabase](https://supabase.com) via `@supabase/supabase-js` |
| Network detection | `expo-network` |
| UUID generation | `expo-crypto` |
| Navigation | React Navigation 7 (bottom tabs + native stack) |
| State | React Context (`TaskContext`) |

## Project structure

```
.
├── App.js
├── scripts/start.js               # Starts Expo on the Wi-Fi network address
├── supabase/schema.sql            # Supabase table + security policy
├── .env.example
└── src/
    ├── components/
    │   ├── SyncBanner.js          # Sync status banner
    │   └── ...                    # AppButton, Badge, OptionGroup, StatsRow, TaskCard
    ├── constants/                 # theme, priorities, statuses, filters
    ├── context/TaskContext.js     # Shared state + starts the sync
    ├── lib/supabase.js            # Supabase client (null if not configured)
    ├── navigation/AppNavigator.js
    ├── screens/                   # Home, TaskList, TaskDetails, TaskForm, Profile, Loading, Error
    ├── services/
    │   ├── localTasks.js          # SQLite copy + queue of pending changes
    │   ├── remoteTasks.js         # Supabase `tasks` table access
    │   └── sync.js                # Push pending changes, then pull from the server
    └── utils/                     # alerts, formatting
```

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) (LTS)
- A free [Supabase](https://supabase.com) project. This is optional: without it the app runs in local-only mode.
- The **Expo Go** app on your phone, or an emulator

### 1. Install

```bash
git clone https://github.com/obaid-ba/TP-ListeTaches-V3.git
cd TP-ListeTaches-V3
npm install
```

### 2. Set up the database

In Supabase, open **SQL Editor → New query**, paste [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.

### 3. Configure the environment

```bash
cp .env.example .env.local
```

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

The values are in **Project Settings → API Keys**. If you skip this step, the app runs in **local-only mode**.

### 4. Run

```bash
npm start
```

Scan the QR code with Expo Go.

### Available scripts

| Command | Description |
| --- | --- |
| `npm start` | Start Expo on the Wi-Fi network address |
| `npm run tunnel` | Start Expo with a tunnel |
| `npm run android` / `ios` / `web` | Open on a specific platform |

## Testing offline mode

1. Open the app and wait for the banner to show **Synced**.
2. Turn on **airplane mode**.
3. Add, edit or delete a few tasks. The banner switches to **Offline** and shows the number of pending changes, and the changed tasks show **Not synced**.
4. Turn off airplane mode. The banner goes through **Syncing…** and then **Synced**, and the changes appear in the Supabase table.

## Security note

The policy in `schema.sql` allows anyone who has the public key to read and change tasks. The app has no login, so this is fine for a demo or school project. Add Supabase Auth and per-user policies before using it in production.

## Author

**Obaid Allah Ben Ali** — [@obaid-ba](https://github.com/obaid-ba)

## License

Released under the MIT License. See [LICENSE](LICENSE).
