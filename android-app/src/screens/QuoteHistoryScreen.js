import { ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import ServicePhotos from '../components/ServicePhotos';
import { categoryName, money, statusLabels } from '../data/appData';

export default function QuoteHistoryScreen({ quotes, onUpdatePhotos, onContract, onOpenQuote }) {
  return <ScrollView contentContainerStyle={styles.screen}>
    {!quotes.length && <Text>Nenhum orçamento salvo.</Text>}
    {quotes.map((quote) => <Card key={quote.id}>
      <Text style={styles.title}>{quote.clientName}</Text>
      <TouchableOpacity style={{ flexDirection: 'row', gap: 8, paddingVertical: 12 }} onPress={() => onOpenQuote(quote.id)}><Ionicons name="eye-outline" size={24} color="#087f72" /><Text>Ver orçamento completo</Text></TouchableOpacity>
      <Text style={styles.line}>{categoryName(quote.category)} · {statusLabels[quote.status]} · {money(quote.total)}</Text>
      <Text style={styles.line}>{quote.description}</Text>
      {quote.painting && <Text style={styles.line}>{quote.painting.surface} · {quote.painting.area || '—'} m² · {quote.painting.coats} demãos{'\n'}{quote.painting.preparation}{'\n'}{quote.painting.paint}</Text>}
      <ServicePhotos photos={quote.photos} onChange={(photos) => onUpdatePhotos(quote.id, photos)} />
      <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14 }} onPress={() => onContract(quote.id)}><Ionicons name="document-text-outline" size={24} color="#075e55" /><Text>{quote.contract?.authorization ? 'Contrato autorizado' : 'Contrato e autorização'}</Text></TouchableOpacity>
    </Card>)}
  </ScrollView>;
}
const styles = StyleSheet.create({ screen: { padding: 14 }, title: { fontSize: 18, fontWeight: '700', color: '#152638' }, line: { color: '#475569', marginVertical: 8 } });
