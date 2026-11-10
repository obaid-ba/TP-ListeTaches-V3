import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';

function StatCard({ label, value, color, background }) {
  return (
    <View style={[styles.card, { backgroundColor: background }]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
    </View>
  );
}

export default function StatsRow({ stats }) {
  return (
    <View style={styles.row}>
      <StatCard
        label="Total"
        value={stats.total}
        color={colors.primary}
        background={colors.primaryLight}
      />
      <StatCard
        label="Terminées"
        value={stats.done}
        color={colors.success}
        background={colors.successLight}
      />
      <StatCard
        label="À faire"
        value={stats.todo}
        color={colors.warning}
        background={colors.warningLight}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    paddingVertical: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
});
