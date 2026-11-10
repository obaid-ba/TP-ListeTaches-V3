import * as Network from 'expo-network';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';
import * as local from '../services/localTasks';
import { isRemoteConfigured, NetworkError } from '../services/remoteTasks';
import { syncTasks } from '../services/sync';

const TaskContext = createContext(null);

// Fonctionnement « hors ligne d'abord » :
// - les écrans lisent et écrivent uniquement la copie locale (SQLite), donc
//   l'application fonctionne sans internet ;
// - la synchronisation avec Supabase se lance au démarrage, après chaque
//   modification, au retour du réseau, au retour dans l'application et en
//   tirant la liste vers le bas.
export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sync, setSync] = useState({
    state: isRemoteConfigured ? 'idle' : 'disabled',
    error: null,
    lastSyncedAt: null,
  });

  const runningSync = useRef(null);
  const syncRequestedAgain = useRef(false);

  const reloadLocal = useCallback(async () => {
    const [list, count] = await Promise.all([
      local.listTasks(),
      local.countPending(),
    ]);
    setTasks(list);
    setPendingCount(count);
  }, []);

  const syncOnce = useCallback(async () => {
    const network = await Network.getNetworkStateAsync().catch(() => null);
    if (
      network &&
      (network.isConnected === false || network.isInternetReachable === false)
    ) {
      setSync((current) => ({ ...current, state: 'offline', error: null }));
      return;
    }

    setSync((current) => ({ ...current, state: 'syncing' }));
    try {
      await syncTasks();
      setSync({ state: 'idle', error: null, lastSyncedAt: new Date() });
    } catch (e) {
      setSync((current) =>
        e instanceof NetworkError
          ? { ...current, state: 'offline', error: null }
          : { ...current, state: 'error', error: e.message }
      );
    } finally {
      await reloadLocal().catch(() => {});
    }
  }, [reloadLocal]);

  // Une seule synchronisation à la fois. Si une autre est demandée pendant
  // qu'elle tourne, elle est relancée une fois à la fin.
  const synchronize = useCallback(() => {
    if (!isRemoteConfigured) return Promise.resolve();
    if (runningSync.current) {
      syncRequestedAgain.current = true;
      return runningSync.current;
    }

    runningSync.current = (async () => {
      try {
        do {
          syncRequestedAgain.current = false;
          await syncOnce();
        } while (syncRequestedAgain.current);
      } finally {
        runningSync.current = null;
      }
    })();
    return runningSync.current;
  }, [syncOnce]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await reloadLocal();
      setLoaded(true);
      synchronize();
    } catch (e) {
      setError(e.message || 'Impossible d’ouvrir les données du téléphone.');
    } finally {
      setLoading(false);
    }
  }, [reloadLocal, synchronize]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const networkSubscription = Network.addNetworkStateListener((state) => {
      if (state.isConnected && state.isInternetReachable !== false) {
        synchronize();
      } else if (isRemoteConfigured) {
        setSync((current) => ({ ...current, state: 'offline', error: null }));
      }
    });
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') synchronize();
    });

    return () => {
      networkSubscription.remove();
      appStateSubscription.remove();
    };
  }, [synchronize]);

  const stats = useMemo(() => {
    const done = tasks.filter((task) => task.status === 'terminee').length;
    return { total: tasks.length, done, todo: tasks.length - done };
  }, [tasks]);

  async function afterLocalChange() {
    await reloadLocal();
    synchronize();
  }

  async function addTask(values) {
    await local.createTask(values);
    await afterLocalChange();
  }

  async function editTask(id, values) {
    await local.updateTask(id, values);
    await afterLocalChange();
  }

  async function removeTask(id) {
    await local.deleteTask(id);
    await afterLocalChange();
  }

  function toggleTaskStatus(task) {
    return editTask(task.id, {
      status: task.status === 'terminee' ? 'a_faire' : 'terminee',
    });
  }

  async function refresh() {
    setRefreshing(true);
    try {
      await synchronize();
      await reloadLocal();
    } finally {
      setRefreshing(false);
    }
  }

  const value = {
    tasks,
    stats,
    loading,
    loaded,
    error,
    refreshing,
    retry: load,
    refresh,
    addTask,
    editTask,
    removeTask,
    toggleTaskStatus,
    pendingCount,
    syncState: sync.state,
    syncError: sync.error,
    lastSyncedAt: sync.lastSyncedAt,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  return useContext(TaskContext);
}
