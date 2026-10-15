import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AgendaMonth from '../components/AgendaMonth';
import DateField from '../components/DateField';
import FormField from '../components/FormField';
import { localDate, validDate } from '../data/serviceContract';
import { categoryName } from '../data/appData';
import { localId } from '../data/localId';
import { agendaEntries, eventOverlaps, quoteDates, quoteDayLabel } from '../data/agenda';

export default function AgendaScreen({ quotes, events, onSaveEvent, onDeleteEvent, onOpenQuote, onMarkDone }) {
  const [day, setDay] = useState(localDate);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState('month');
  const matching = quotes.filter((q) => quoteDates(q).includes(day)).sort((a, b) => (a.visitTime || '').localeCompare(b.visitTime || ''));
  const personal = events.filter((event) => event.date === day).sort((a, b) => a.time.localeCompare(b.time));
  const entries = agendaEntries(quotes, events);
  const timed = entries.filter(entry => entry.date === day && /^([01]\d|2[0-3]):[0-5]\d$/.test(entry.time));
  const startHour = Math.min(7, ...timed.map(entry => Number(entry.time.slice(0, 2))));
  const endHour = Math.min(24, Math.max(21, ...timed.map(entry => Number(entry.time.slice(0, 2)) + Math.ceil(entry.duration) + 1)));
  function openDay(date) { setDay(date); setView('day'); }
  function createEvent(time = '09:00') { setEditing({ id: localId(), title: '', type: 'pessoal', date: day, time, duration: 1, notes: '', phone: '', address: '' }); }
  function openEntry(entry) {
    if (entry.kind === 'quote') onOpenQuote(entry.id);
    else setEditing({ ...events.find(event => event.id === entry.id) });
  }
  async function save() {
    if (!editing.title.trim() || !/^([01]\d|2[0-3]):[0-5]\d$/.test(editing.time)) { Alert.alert('Compromisso', 'Informe o título e um horário válido (HH:MM).'); return; }
    if (!validDate(editing.date)) { Alert.alert('Compromisso', 'Escolha uma data válida.'); return; }
    if (Number(editing.time.slice(0, 2)) * 60 + Number(editing.time.slice(3)) + (Number(editing.duration) || 1) * 60 > 1440) { Alert.alert('Compromisso', 'O compromisso deve terminar no mesmo dia.'); return; }
    const conflicts = entries.filter(entry => entry.kind === 'quote' && entry.time).map(entry => ({ ...entry, id: entry.key }));
    if (eventOverlaps(editing, [...events, ...conflicts])) { Alert.alert('Horário ocupado', 'Este período coincide com outro compromisso. Escolha outro horário.'); return; }
    setBusy(true);
    try { await onSaveEvent(editing); setDay(editing.date); setView('day'); setEditing(null); } catch { Alert.alert('Agenda', 'Não foi possível salvar.'); } finally { setBusy(false); }
  }
  return <>
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.heading}><Text style={styles.sectionTitle}>Minha agenda</Text><Pressable accessibilityLabel="Novo compromisso" style={styles.add} onPress={() => createEvent()}><Ionicons name="add" size={24} color="#fff" /><Text style={{ color: '#fff' }}>Agendar</Text></Pressable></View>
      {view === 'month' ? <AgendaMonth key={day.slice(0, 7)} selected={day} entries={entries} onSelect={openDay} /> : <>
      <View style={styles.heading}><Pressable accessibilityLabel="Voltar ao calendário mensal" style={styles.choice} onPress={() => setView('month')}><Text>← Calendário</Text></Pressable><Text style={styles.sectionTitle}>{day.split('-').reverse().join('/')}</Text></View>
      <View style={styles.heading}>{[-1, 0, 1].map(offset => <Pressable key={offset} style={styles.choice} onPress={() => { const date = new Date(`${day}T12:00:00`); date.setDate(date.getDate() + offset); openDay(offset === 0 ? localDate() : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`); }}><Text>{offset === -1 ? '‹ Anterior' : offset === 0 ? 'Hoje' : 'Próximo ›'}</Text></Pressable>)}</View>
      <Text style={styles.empty}>Toque em um horário para agendar ou em um compromisso para abrir.</Text>
      {entries.filter(entry => entry.date === day && !entry.time).map(entry => <Pressable key={entry.key} style={styles.row} onPress={() => openEntry(entry)}><Text style={styles.empty}>Sem horário · {entry.title}</Text></Pressable>)}
      <View style={{ height: (endHour - startHour) * 88, position: 'relative', marginTop: 8 }}>
        {Array.from({ length: (endHour - startHour) * 2 }, (_, index) => {
          const time = `${String(startHour + Math.floor(index / 2)).padStart(2, '0')}:${index % 2 ? '30' : '00'}`;
          return <Pressable key={time} accessibilityLabel={`Agendar às ${time}`} style={styles.hourRow} onPress={() => createEvent(time)}><Text style={styles.hourLabel}>{time}</Text><View style={styles.hourLine} /></Pressable>;
        })}
        {timed.map(entry => {
          const top = (Number(entry.time.slice(0, 2)) - startHour + Number(entry.time.slice(3)) / 60) * 88;
          return <Pressable key={entry.key} onPress={() => openEntry(entry)} style={[styles.timeBlock, entry.kind === 'quote' && styles.quoteBlock, { top, height: Math.max(40, Math.min(entry.duration * 88 - 3, (endHour - startHour) * 88 - top)) }]}><Text numberOfLines={2} style={styles.blockTitle}>{entry.time} · {entry.title}</Text><Text style={styles.blockInfo}>{entry.kind === 'quote' ? 'Visita / serviço' : `${entry.duration} h`}</Text></Pressable>;
        })}
      </View>
      <Text style={styles.sectionTitle}>Compromissos do dia</Text>
      {!matching.length && !personal.length && <Text style={styles.empty}>Nenhum compromisso nesta data.</Text>}
      {matching.map((quote) => <View key={quote.id} style={styles.row}><Pressable onPress={() => onOpenQuote(quote.id)}><Text style={styles.sectionTitle}>{quote.clientName}</Text><Text style={styles.empty}>{categoryName(quote.category)} · {quote.visitTime}</Text><Text style={styles.empty}>{quoteDayLabel(quote, day)}</Text><Text style={styles.empty}>{quote.clientAddress}</Text><Ionicons name="chevron-forward" size={22} color="#087f72" /></Pressable>{['scheduled', 'approved'].includes(quote.status) && <Pressable style={styles.link} onPress={() => onMarkDone(quote.id)}><Ionicons name="checkmark-circle-outline" size={22} color="#087f72" /><Text>Concluir serviço</Text></Pressable>}</View>)}
      {personal.map((event) => <Pressable key={event.id} style={styles.row} onPress={() => setEditing({ ...event })}><Text style={styles.sectionTitle}>{event.time} · {event.title}</Text><Text style={styles.empty}>{event.type === 'pessoal' ? 'Pessoal' : event.type === 'visita' ? 'Visita para orçamento' : 'Serviço'}</Text><Text style={styles.empty}>{event.address}</Text></Pressable>)}
      </>}
    </ScrollView>
    {editing && <Modal animationType="slide" onRequestClose={() => setEditing(null)}><SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}><ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
      <View style={styles.heading}><Text style={styles.sectionTitle}>Compromisso</Text><Pressable accessibilityLabel="Fechar compromisso" onPress={() => setEditing(null)} style={{ padding: 10 }}><Ionicons name="close" size={26} /></Pressable></View>
      <View style={styles.heading}>{['pessoal', 'visita', 'servico'].map((type) => <Pressable key={type} style={[styles.choice, editing.type === type && { backgroundColor: '#dcf3ee' }]} onPress={() => setEditing({ ...editing, type })}><Text>{type === 'pessoal' ? 'Pessoal' : type === 'visita' ? 'Visita' : 'Serviço'}</Text></Pressable>)}</View>
      <FormField label="Título / cliente" value={editing.title} onChangeText={(title) => setEditing({ ...editing, title })} />
      <DateField label="Data do compromisso" value={editing.date} onChangeText={(date) => setEditing({ ...editing, date })} />
      <Text style={styles.empty}>Duração do compromisso</Text>
      <View style={[styles.heading, { flexWrap: 'wrap' }]}>{[0.5, 1, 2, 4, 8].map(duration => <Pressable key={duration} style={[styles.choice, (Number(editing.duration) || 1) === duration && { backgroundColor: '#dcf3ee' }]} onPress={() => setEditing({ ...editing, duration })}><Text>{duration === 0.5 ? '30 min' : `${duration} h`}</Text></Pressable>)}</View>
      {['time', 'phone', 'address', 'notes'].map((key) => <FormField key={key} label={{ time: 'Horário', phone: 'Telefone', address: 'Endereço', notes: 'Observações' }[key]} value={editing[key]} onChangeText={(value) => setEditing({ ...editing, [key]: value })} multiline={key === 'notes'} />)}
      <Pressable disabled={busy} style={styles.add} onPress={save}><Ionicons name="save-outline" size={22} color="#fff" /><Text style={{ color: '#fff' }}>{busy ? 'Salvando...' : 'Salvar compromisso'}</Text></Pressable>
      {events.some((event) => event.id === editing.id) && <Pressable disabled={busy} style={styles.link} onPress={() => Alert.alert('Excluir compromisso?', editing.title, [{ text: 'Cancelar' }, { text: 'Excluir', style: 'destructive', onPress: async () => { try { await onDeleteEvent(editing.id); setEditing(null); } catch { Alert.alert('Agenda', 'Não foi possível excluir.'); } } }])}><Ionicons name="trash-outline" size={22} color="#aa253a" /><Text>Excluir compromisso</Text></Pressable>}
    </ScrollView></SafeAreaView></Modal>}
  </>;
}

const styles = StyleSheet.create({
  hourRow: { height: 44, flexDirection: 'row', alignItems: 'flex-start' },
  hourLabel: { width: 52, color: '#64748b', fontSize: 11 },
  hourLine: { flex: 1, height: 44, borderTopWidth: 1, borderColor: '#dae5e6', backgroundColor: '#ffffff' },
  timeBlock: { position: 'absolute', left: 58, right: 6, backgroundColor: '#d8f1e6', borderLeftWidth: 4, borderColor: '#087f72', padding: 8, borderRadius: 6, overflow: 'hidden' },
  quoteBlock: { backgroundColor: '#e1ecff', borderColor: '#4776ba' },
  blockTitle: { fontSize: 13, fontWeight: '700', color: '#152638' },
  blockInfo: { fontSize: 11, color: '#48645b', marginTop: 3 },
  screen: {
    padding: 14,
    gap: 12,
  },
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  row: { backgroundColor: '#fff', borderRadius: 8, padding: 16, borderWidth: 1, borderColor: '#dde4e9' },
  add: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#087f72', borderRadius: 6, padding: 12, minHeight: 48 },
  link: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingVertical: 16 },
  choice: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 6, backgroundColor: '#edf1f4' },
  sectionTitle: {
    color: '#152638',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 10,
  },
  empty: {
    color: '#64748b',
  },
});
