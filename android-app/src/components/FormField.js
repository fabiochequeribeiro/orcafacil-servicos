import { StyleSheet, Text, TextInput, View } from 'react-native';

/** @param {{label: string, value: string, onChangeText: (value: string) => void, placeholder?: string, keyboardType?: import('react-native').KeyboardTypeOptions, multiline?: boolean}} props */
export default function FormField({ label, value, onChangeText, placeholder = '', keyboardType = 'default', multiline = false }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        style={[styles.input, multiline && styles.multiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8a98a8"
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
    marginBottom: 10,
  },
  label: {
    color: '#26394d',
    fontSize: 13,
    fontWeight: '800',
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#d8e1ea',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    color: '#152638',
  },
  multiline: {
    minHeight: 88,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
});
