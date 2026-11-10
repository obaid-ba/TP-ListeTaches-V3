import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../constants/theme';
import { useTasks } from '../context/TaskContext';

function pendingText(count) {
  return count === 1
    ? '1 modification en attente'
    : `${count} modifications en attente`;
}

function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function describe({ syncState, syncError, pendingCount, lastSyncedAt }) {
  switch (syncState) {
    case 'disabled':
      return {
        icon: 'phone-portrait-outline',
        color: colors.textMuted,
        background: colors.surface,
        text: 'Mode local : Supabase n’est pas configuré (.env.local).',
      };
    case 'syncing':
      return {
        spinner: true,
        color: colors.primary,
        background: colors.primaryLight,
        text: 'Synchronisation…',
      };
    case 'offline':
      return {
        icon: 'cloud-offline-outline',
        color: colors.warning,
        background: colors.warningLight,
        text:
          pendingCount > 0
            ? `Hors ligne · ${pendingText(pendingCount)}`
            : 'Hors ligne · vos tâches restent disponibles',
      };
    case 'error':
      return {
        icon: 'alert-circle-outline',
        color: colors.danger,
        background: colors.dangerLight,
        text: `Synchronisation impossible : ${syncError} Touchez pour réessayer.`,
      };
    default:
      if (pendingCount > 0) {
        return {
          icon: 'cloud-upload-outline',
          color: colors.warning,
          background: colors.warningLight,
          text: pendingText(pendingCount),
        };
      }
      return {
        icon: 'cloud-done-outline',
        color: colors.success,
        background: colors.successLight,
        text: lastSyncedAt
          ? `Synchronisé à ${formatTime(lastSyncedAt)}`
          : 'Synchronisé',
      };
  }
}

export default function SyncBanner() {
  const tasks = useTasks();
  const { icon, spinner, color, background, text } = describe(tasks);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${text} Synchroniser maintenant`}
      disabled={tasks.syncState === 'syncing' || tasks.syncState === 'disabled'}
      onPress={tasks.refresh}
      style={[styles.banner, { backgroundColor: background }]}
    >
      {spinner ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <Ionicons name={icon} size={18} color={color} />
      )}
      <Text style={[styles.text, { color }]}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
});
