import * as local from './localTasks';
import * as remote from './remoteTasks';

// Synchronisation en deux temps :
// 1. envoi : les modifications faites sur le téléphone partent vers Supabase,
//    dans l'ordre, puis sont marquées comme envoyées ;
// 2. réception : la liste de Supabase remplace la copie locale (sauf les
//    tâches modifiées entre-temps sur le téléphone).
//
// En cas de conflit, la dernière modification envoyée l'emporte.
export async function syncTasks() {
  const changes = await local.getPendingChanges();

  for (const change of changes) {
    if (change.pending === 'delete') {
      await remote.deleteTask(change.id);
    } else {
      await remote.upsertTask(change);
    }
    await local.markSent(change);
  }

  const serverTasks = await remote.fetchTasks();
  await local.applyServerTasks(serverTasks);
}
