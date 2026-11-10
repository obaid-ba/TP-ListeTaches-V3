import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PRIORITIES, STATUSES } from '../constants/tasks';
import { colors } from '../constants/theme';
import { formatDate } from '../utils/format';
import Badge from './Badge';

export default function TaskCard({ task, onPress, onToggleStatus }) {
  const priority = PRIORITIES[task.priority];
  const status = STATUSES[task.status];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { borderLeftColor: priority.color },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {task.title}
        </Text>

        <View style={styles.badges}>
          <Badge {...priority} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Changer le statut : ${status.label}`}
            hitSlop={8}
            onPress={onToggleStatus}
          >
            <Badge {...status} />
          </Pressable>
        </View>

        {task.description !== '' && (
          <Text style={styles.description} numberOfLines={1}>
            {task.description}
          </Text>
        )}

        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
          <Text style={styles.date}>Créée le {formatDate(task.created_at)}</Text>
          {task.pending && (
            <>
              <Ionicons
                name="cloud-upload-outline"
                size={14}
                color={colors.warning}
                style={styles.pendingIcon}
              />
              <Text style={styles.pendingText}>Non synchronisée</Text>
            </>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    padding: 14,
  },
  pressed: {
    opacity: 0.7,
  },
  content: {
    flex: 1,
    gap: 8,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  badges: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  description: {
    color: colors.textMuted,
    fontSize: 14,
  },
  dateRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  date: {
    color: colors.textMuted,
    fontSize: 12,
  },
  pendingIcon: {
    marginLeft: 8,
  },
  pendingText: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '600',
  },
});
