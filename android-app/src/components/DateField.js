import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CalendarPanel from './CalendarPanel';
import { localDate } from '../data/serviceContract';
export default function DateField({ label, value, onChangeText }) {
  const [open, setOpen] = useState(false);
  return <View style={{ marginBottom: 14 }}>
    <Text style={styles.label}>{label}</Text>
    <Pressable accessibilityLabel={label} accessibilityRole="button" style={styles.field} onPress={() => setOpen(true)}><Ionicons name="calendar-outline" size={22} color="#087f72" /><Text>{value ? value.split('-').reverse().join('/') : 'Selecionar data'}</Text></Pressable>
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}><View style={styles.backdrop}><View style={styles.dialog}>
      <View style={styles.heading}><Text style={styles.label}>{label}</Text><Pressable accessibilityLabel="Fechar calendário" onPress={() => setOpen(false)} style={{ padding: 10 }}><Ionicons name="close" size={24} /></Pressable></View>
      <CalendarPanel key={value} value={value || localDate()} onChange={(date) => { onChangeText(date); setOpen(false); }} />
    </View></View></Modal>
  </View>;
}
const styles = StyleSheet.create({ label: { fontWeight: '700', color: '#26394d', marginBottom: 6 }, field: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderWidth: 1, borderColor: '#d8e1ea', borderRadius: 6, backgroundColor: '#fff' }, backdrop: { flex: 1, backgroundColor: '#0008', alignItems: 'center', justifyContent: 'center', padding: 18 }, dialog: { width: '100%', maxWidth: 480, backgroundColor: '#fff', borderRadius: 8, padding: 12 }, heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } });
