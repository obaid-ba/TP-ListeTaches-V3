import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import StatsRow from '../components/StatsRow';
import SyncBanner from '../components/SyncBanner';
import { colors } from '../constants/theme';
import { useTasks } from '../context/TaskContext';

export default function HomeScreen({ navigation }) {
  const { stats } = useTasks();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>MyTasks</Text>
        <Text style={styles.subtitle}>
          Organisez vos tâches, atteignez vos objectifs !
        </Text>
      </View>

      <StatsRow stats={stats} />

      <SyncBanner />

      <View style={styles.actions}>
        <AppButton
          title="Mes tâches"
          icon="list"
          onPress={() => navigation.navigate('Tasks')}
        />
        <AppButton
          title="Ajouter une tâche"
          icon="add"
          color={colors.success}
          onPress={() => navigation.navigate('TaskForm')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    gap: 28,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
  },
  actions: {
    gap: 12,
  },
});
