import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { localDate } from '../data/serviceContract';
import { monthDays } from '../data/agenda';

export default function AgendaMonth({ selected, entries, onSelect }) {
  const [month, setMonth] = useState(selected.slice(0, 7));
  const title = new Date(`${month}-01T12:00:00`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  function move(offset) {
    const date = new Date(`${month}-01T12:00:00`);
    date.setMonth(date.getMonth() + offset);
    setMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  }
  return <View style={styles.container}>
    <View style={styles.toolbar}>
      <Text style={styles.title}>{title}</Text>
      <Pressable style={styles.nav} accessibilityRole="button" accessibilityLabel="Mês anterior" onPress={() => move(-1)}><Text style={styles.navText}>‹</Text></Pressable>
      <Pressable style={styles.nav} accessibilityRole="button" accessibilityLabel="Ir para o mês atual" onPress={() => setMonth(localDate().slice(0, 7))}><Text style={styles.today}>Hoje</Text></Pressable>
      <Pressable style={styles.nav} accessibilityRole="button" accessibilityLabel="Próximo mês" onPress={() => move(1)}><Text style={styles.navText}>›</Text></Pressable>
    </View>
    <Text style={styles.hint}>Toque em um dia para ver os horários e agendar.</Text>
    <View style={styles.week}>{['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.'].map(label => <Text key={label} style={styles.weekday}>{label}</Text>)}</View>
    {Array.from({ length: 6 }, (_, week) => <View key={week} style={styles.week}>
      {monthDays(month).slice(week * 7, week * 7 + 7).map(date => {
        const items = entries.filter(item => item.date === date).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
        const today = date === localDate();
        return <Pressable key={date} accessibilityRole="button" accessibilityLabel={`${date.split('-').reverse().join('/')}, ${items.length} compromissos`} onPress={() => onSelect(date)} style={[styles.cell, !date.startsWith(month) && styles.outside, date === selected && styles.selected]}>
          <Text style={[styles.number, today && styles.current]}>{Number(date.slice(-2))}</Text>
          {items.slice(0, 2).map(item => <Text numberOfLines={1} key={item.key} style={[styles.event, item.kind === 'quote' ? styles.quote : styles.personal]}>{item.time ? `${item.time} ` : ''}{item.title}</Text>)}
          {items.length > 2 && <Text style={styles.more}>+{items.length - 2} mais</Text>}
        </Pressable>;
      })}
    </View>)}
    <Text style={styles.hint}>Verde: compromissos pessoais · Azul: orçamentos e serviços</Text>
  </View>;
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  title: { flexGrow: 1, fontWeight: '800', fontSize: 19, color: '#152638', textTransform: 'capitalize' },
  nav: { minHeight: 44, minWidth: 38, padding: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 8 },
  navText: { color: '#087f72', fontSize: 26 }, today: { color: '#087f72', fontWeight: '700' },
  hint: { color: '#64748b', fontSize: 12, marginVertical: 8 },
  week: { flexDirection: 'row', gap: 3 }, weekday: { flex: 1, textAlign: 'center', color: '#64748b', fontSize: 11, paddingVertical: 6 },
  cell: { flex: 1, minWidth: 0, minHeight: 92, backgroundColor: '#fff', padding: 3, borderRadius: 6, borderWidth: 1, borderColor: '#dce5e9', overflow: 'hidden' },
  selected: { borderColor: '#087f72', borderWidth: 2 }, outside: { opacity: 0.45 },
  number: { color: '#152638', fontSize: 12, textAlign: 'center', alignSelf: 'center', padding: 4, minWidth: 25, borderRadius: 14, overflow: 'hidden' },
  current: { backgroundColor: '#087f72', color: '#fff', fontWeight: '800' },
  event: { fontSize: 9, padding: 2, marginTop: 3, borderRadius: 3 },
  quote: { backgroundColor: '#e1ecff', color: '#244c83' }, personal: { backgroundColor: '#d8f1e6', color: '#155840' }, more: { color: '#64748b', fontSize: 9, marginTop: 3 },
});
