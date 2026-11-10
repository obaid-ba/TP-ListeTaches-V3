import * as Crypto from 'expo-crypto';
import * as SQLite from 'expo-sqlite';

// Copie locale des tâches, stockée sur le téléphone avec SQLite.
//
// Colonnes ajoutées pour la synchronisation :
// - pending : null (à jour), 'upsert' (à envoyer) ou 'delete' (à supprimer
//   sur Supabase). Une tâche supprimée hors ligne reste en base, masquée,
//   jusqu'à ce que la suppression soit envoyée.
// - version : augmente à chaque modification locale. La synchronisation ne
//   marque une tâche « à jour » que si elle n'a pas changé pendant l'envoi.

const TASK_COLUMNS = 'id, title, description, priority, status, created_at';
const EDITABLE_FIELDS = ['title', 'description', 'priority', 'status'];

let dbPromise = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('tasks.db');
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          priority TEXT NOT NULL DEFAULT 'moyenne',
          status TEXT NOT NULL DEFAULT 'a_faire',
          created_at TEXT NOT NULL,
          pending TEXT,
          version INTEGER NOT NULL DEFAULT 0
        );
      `);
      return db;
    })().catch((error) => {
      dbPromise = null; // permet de réessayer
      throw error;
    });
  }
  return dbPromise;
}

export async function listTasks() {
  const db = await getDb();
  return db.getAllAsync(
    `SELECT ${TASK_COLUMNS}, pending FROM tasks
     WHERE pending IS NULL OR pending <> 'delete'
     ORDER BY created_at DESC`
  );
}

export async function countPending() {
  const db = await getDb();
  const row = await db.getFirstAsync(
    'SELECT COUNT(*) AS count FROM tasks WHERE pending IS NOT NULL'
  );
  return row?.count ?? 0;
}

export async function createTask(values) {
  const db = await getDb();
  const task = {
    id: Crypto.randomUUID(),
    title: values.title,
    description: values.description ?? '',
    priority: values.priority ?? 'moyenne',
    status: values.status ?? 'a_faire',
    created_at: new Date().toISOString(),
  };

  await db.runAsync(
    `INSERT INTO tasks (${TASK_COLUMNS}, pending, version)
     VALUES (?, ?, ?, ?, ?, ?, 'upsert', 1)`,
    [
      task.id,
      task.title,
      task.description,
      task.priority,
      task.status,
      task.created_at,
    ]
  );
  return task;
}

export async function updateTask(id, values) {
  const db = await getDb();
  const fields = EDITABLE_FIELDS.filter((field) => values[field] !== undefined);
  if (fields.length === 0) return;

  const assignments = fields.map((field) => `${field} = ?`).join(', ');
  const result = await db.runAsync(
    `UPDATE tasks
     SET ${assignments}, pending = 'upsert', version = version + 1
     WHERE id = ? AND (pending IS NULL OR pending <> 'delete')`,
    [...fields.map((field) => values[field]), id]
  );
  if (result.changes === 0) throw new Error('Cette tâche n’existe plus.');
}

export async function deleteTask(id) {
  const db = await getDb();
  await db.runAsync(
    `UPDATE tasks SET pending = 'delete', version = version + 1 WHERE id = ?`,
    [id]
  );
}

// ---- Fonctions utilisées par la synchronisation ----

export async function getPendingChanges() {
  const db = await getDb();
  return db.getAllAsync(
    `SELECT ${TASK_COLUMNS}, pending, version FROM tasks
     WHERE pending IS NOT NULL
     ORDER BY created_at`
  );
}

// Appelé après l'envoi réussi d'une modification.
export async function markSent(change) {
  const db = await getDb();
  if (change.pending === 'delete') {
    await db.runAsync('DELETE FROM tasks WHERE id = ? AND version = ?', [
      change.id,
      change.version,
    ]);
  } else {
    await db.runAsync(
      'UPDATE tasks SET pending = NULL WHERE id = ? AND version = ?',
      [change.id, change.version]
    );
  }
}

// Remplace la copie locale par les tâches de Supabase, sans jamais écraser
// une modification locale qui n'a pas encore été envoyée.
export async function applyServerTasks(serverTasks) {
  const db = await getDb();

  await db.withTransactionAsync(async () => {
    for (const task of serverTasks) {
      await db.runAsync(
        `INSERT INTO tasks (${TASK_COLUMNS}, pending, version)
         VALUES (?, ?, ?, ?, ?, ?, NULL, 0)
         ON CONFLICT(id) DO UPDATE SET
           title = excluded.title,
           description = excluded.description,
           priority = excluded.priority,
           status = excluded.status,
           created_at = excluded.created_at
         WHERE tasks.pending IS NULL`,
        [
          task.id,
          task.title,
          task.description ?? '',
          task.priority,
          task.status,
          task.created_at,
        ]
      );
    }

    // Tâches supprimées depuis un autre appareil.
    const serverIds = new Set(serverTasks.map((task) => task.id));
    const synced = await db.getAllAsync(
      'SELECT id FROM tasks WHERE pending IS NULL'
    );
    for (const { id } of synced) {
      if (!serverIds.has(id)) {
        await db.runAsync(
          'DELETE FROM tasks WHERE id = ? AND pending IS NULL',
          [id]
        );
      }
    }
  });
}
