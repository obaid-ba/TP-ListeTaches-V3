import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>Chargement de vos tâches…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    gap: 16,
    justifyContent: 'center',
  },
  text: {
    color: colors.textMuted,
    fontSize: 16,
  },
});
