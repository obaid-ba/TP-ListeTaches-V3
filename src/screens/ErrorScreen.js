import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import AppButton from '../components/AppButton';
import { colors } from '../constants/theme';

export default function ErrorScreen({ message, onRetry }) {
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={56} color={colors.danger} />
      <Text style={styles.title}>Chargement impossible</Text>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.action}>
        <AppButton title="Réessayer" icon="refresh" onPress={onRetry} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  message: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  action: {
    alignSelf: 'stretch',
    marginTop: 12,
  },
});
