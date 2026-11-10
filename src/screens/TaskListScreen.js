import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OptionGroup from '../components/OptionGroup';
import StatsRow from '../components/StatsRow';
import SyncBanner from '../components/SyncBanner';
import TaskCard from '../components/TaskCard';
import { FILTERS } from '../constants/tasks';
import { colors } from '../constants/theme';
import { useTasks } from '../context/TaskContext';
import { showError } from '../utils/alerts';
import { normalize } from '../utils/format';

export default function TaskListScreen({ navigation }) {
  const { tasks, stats, refreshing, refresh, toggleTaskStatus } = useTasks();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const visibleTasks = useMemo(() => {
    const query = normalize(search.trim());

    return tasks.filter((task) => {
      const matchesFilter = filter === 'all' || task.status === filter;
      const matchesSearch = normalize(
        `${task.title} ${task.description}`
      ).includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [tasks, search, filter]);

  async function handleToggle(task) {
    try {
      await toggleTaskStatus(task);
    } catch (e) {
      showError(e);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes tâches</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ajouter une tâche"
          onPress={() => navigation.navigate('TaskForm')}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      <SyncBanner />

      <StatsRow stats={stats} />

      <View style={styles.search}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher une tâche..."
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />
      </View>

      <OptionGroup options={FILTERS} value={filter} onChange={setFilter} />

      <FlatList
        data={visibleTasks}
        keyExtractor={(task) => task.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() =>
              navigation.navigate('TaskDetails', { taskId: item.id })
            }
            onToggleStatus={() => handleToggle(item)}
          />
        )}
        refreshing={refreshing}
        onRefresh={refresh}
        keyboardShouldPersistTaps="handled"
        style={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {tasks.length === 0
              ? 'Aucune tâche pour le moment. Ajoutez-en une avec le bouton +.'
              : 'Aucune tâche ne correspond à votre recherche.'}
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    gap: 14,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  search: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    paddingVertical: 11,
  },
  list: {
    flex: 1,
  },
  empty: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: 32,
    textAlign: 'center',
  },
});
