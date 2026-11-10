import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import AppButton from '../components/AppButton';
import Badge from '../components/Badge';
import { PRIORITIES, STATUSES } from '../constants/tasks';
import { colors } from '../constants/theme';
import { useTasks } from '../context/TaskContext';
import { confirmDelete, showError } from '../utils/alerts';
import { formatDate } from '../utils/format';

export default function TaskDetailsScreen({ navigation, route }) {
  const { tasks, removeTask, toggleTaskStatus } = useTasks();
  const [busy, setBusy] = useState(false);
  const task = tasks.find((item) => item.id === route.params.taskId);

  // La tâche disparaît de l'état juste avant le retour à la liste.
  if (!task) return null;

  const priority = PRIORITIES[task.priority];
  const status = STATUSES[task.status];
  const isDone = task.status === 'terminee';

  async function handleToggle() {
    setBusy(true);
    try {
      await toggleTaskStatus(task);
    } catch (e) {
      showError(e);
    } finally {
      setBusy(false);
    }
  }

  function handleDelete() {
    confirmDelete(async () => {
      setBusy(true);
      try {
        await removeTask(task.id);
        navigation.goBack();
      } catch (e) {
        showError(e);
        setBusy(false);
      }
    });
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={[styles.card, { borderLeftColor: priority.color }]}>
        <Text style={styles.title}>{task.title}</Text>

        <View style={styles.badges}>
          <Badge {...priority} />
          <Badge {...status} />
        </View>

        <Text style={styles.description}>
          {task.description || 'Aucune description.'}
        </Text>

        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
          <Text style={styles.date}>Créée le {formatDate(task.created_at)}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <AppButton
          title={isDone ? 'Marquer à faire' : 'Marquer comme terminée'}
          icon={isDone ? 'refresh' : 'checkmark'}
          color={colors.success}
          disabled={busy}
          onPress={handleToggle}
        />
        <AppButton
          title="Modifier"
          icon="create-outline"
          disabled={busy}
          onPress={() => navigation.navigate('TaskForm', { taskId: task.id })}
        />
        <AppButton
          title="Supprimer"
          icon="trash-outline"
          color={colors.danger}
          disabled={busy}
          onPress={handleDelete}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: 20,
    padding: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  badges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  description: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 23,
  },
  dateRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  date: {
    color: colors.textMuted,
    fontSize: 14,
  },
  actions: {
    gap: 10,
  },
});
