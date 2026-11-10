import { supabase } from '../lib/supabase';

// Accès à la table « tasks » de Supabase. Utilisé uniquement par la
// synchronisation : les écrans lisent et écrivent la copie locale.

const REQUEST_TIMEOUT_MS = 15000;

export const isRemoteConfigured = supabase !== null;

export class NetworkError extends Error {}

function toUserError(error) {
  const message = error.message ?? '';

  if (/network|fetch|abort|timeout/i.test(message)) {
    return new NetworkError(
      'Impossible de joindre Supabase. Vérifiez votre connexion internet.'
    );
  }
  if (error.code === 'PGRST205' || error.code === '42P01') {
    return new Error(
      'La table « tasks » est introuvable. Exécutez supabase/schema.sql dans votre projet Supabase.'
    );
  }
  if (error.code === '42501') {
    return new Error('Accès refusé par les règles de sécurité de Supabase.');
  }
  if (/api key/i.test(message)) {
    return new Error('La clé Supabase est invalide. Vérifiez le fichier .env.local.');
  }
  return new Error(message || 'Une erreur est survenue.');
}

// Une requête sans réponse (Wi-Fi sans internet, par exemple) ne doit pas
// bloquer la synchronisation indéfiniment.
async function run(buildQuery) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let result;
  try {
    result = await buildQuery(supabase.from('tasks')).abortSignal(
      controller.signal
    );
  } catch (error) {
    throw toUserError(error);
  } finally {
    clearTimeout(timer);
  }
  if (result.error) throw toUserError(result.error);
  return result.data;
}

export function fetchTasks() {
  return run((table) =>
    table
      .select('id, title, description, priority, status, created_at')
      .order('created_at', { ascending: false })
  );
}

export function upsertTask(task) {
  return run((table) =>
    table.upsert({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      created_at: task.created_at,
    })
  );
}

export function deleteTask(id) {
  return run((table) => table.delete().eq('id', id));
}
