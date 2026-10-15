import { StyleSheet, View } from 'react-native';

export default function Card({ children, style = {} }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d8e1ea',
    padding: 14,
    marginBottom: 12,
    shadowColor: '#0f2030',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
});
