import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';

// options : { cle: { label, color?, background? } }
export default function OptionGroup({ options, value, onChange }) {
  return (
    <View style={styles.group}>
      {Object.entries(options).map(([key, option]) => {
        const selected = key === value;
        const selectedBox = {
          backgroundColor: option.background ?? colors.primary,
          borderColor: option.color ?? colors.primary,
        };

        return (
          <Pressable
            key={key}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(key)}
            style={[styles.option, selected && selectedBox]}
          >
            <Text
              style={[
                styles.label,
                selected && { color: option.color ?? '#FFFFFF' },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 9,
  },
  label: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
});
