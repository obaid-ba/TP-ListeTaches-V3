import { StyleSheet, Text, View } from 'react-native';

export default function Badge({ label, color, background }) {
  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
