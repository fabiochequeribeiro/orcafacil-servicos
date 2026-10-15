import { Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { categoryName, money, statusLabels } from '../data/appData';
export default function QuoteReview({ quote, onClose, onConfirm = undefined, onContract = undefined, saving = false }) {
  async function call() {
    const digits = (quote.clientPhone || '').replace(/[^\d+]/g, '');
    if (!digits) { Alert.alert('Telefone', 'Nenhum telefone informado.'); return; }
    try { await Linking.openURL(`tel:${digits}`); } catch { Alert.alert('Telefone', 'Não foi possível abrir o discador neste aparelho.'); }
  }
  return <Modal animationType="slide" onRequestClose={onClose}><SafeAreaView style={styles.screen}>
    <View style={styles.header}><Text style={styles.title}>{onConfirm ? 'Revisar orçamento' : 'Detalhes do orçamento'}</Text><Pressable accessibilityLabel="Fechar revisão" style={{ padding: 10 }} onPress={onClose}><Ionicons name="close" size={26} /></Pressable></View>
    <ScrollView contentContainerStyle={{ padding: 18 }}>
      <Text style={styles.title}>{categoryName(quote.category)}</Text><Text style={styles.section}>{quote.clientName || 'Cliente não informado'}</Text><Text style={styles.line}>{quote.clientAddress || 'Endereço não informado'}</Text>
      <Pressable style={styles.action} onPress={call}><Ionicons name="call-outline" size={22} color="#087f72" /><Text>{quote.clientPhone || 'Sem telefone'}</Text></Pressable>
      <Text style={styles.section}>Serviço</Text><Text style={styles.line}>{quote.description || 'Descrição não informada'}</Text>
      {quote.items?.map((item, index) => <Text key={index} style={styles.line}>{item.description || item.name} · {item.quantity} {item.unit}</Text>)}
      {quote.painting && <><Text style={styles.section}>Pintura</Text><Text style={styles.line}>{quote.painting.area} m² · {quote.painting.coats} demãos</Text><Text style={styles.line}>{quote.painting.preparation}</Text><Text style={styles.line}>{quote.painting.paint}</Text></>}
      <Text style={styles.section}>Valores</Text><Text style={styles.line}>Mão de obra: {money(quote.labor)}</Text><Text style={styles.line}>Materiais: {money(quote.materials)}</Text><Text style={styles.title}>Total: {money(quote.total)}</Text>
      <Text style={styles.section}>Datas</Text><Text style={styles.line}>Visita: {quote.visitDate} às {quote.visitTime}</Text>
      {quote.contract?.snapshot && <Text style={styles.line}>Execução: {quote.contract.snapshot.terms.startDate} até {quote.contract.snapshot.terms.endDate}</Text>}
      <Text style={styles.line}>{statusLabels[quote.status] || quote.status}</Text>
      {onContract && <Pressable style={styles.action} onPress={onContract}><Ionicons name="document-text-outline" size={24} color="#087f72" /><Text>Contrato e autorização</Text></Pressable>}
    </ScrollView>
    {onConfirm && <View style={styles.footer}><Pressable style={styles.action} onPress={onClose}><Ionicons name="create-outline" size={22} /><Text>Voltar e ajustar</Text></Pressable><Pressable disabled={saving} style={styles.confirm} onPress={onConfirm}><Ionicons name="save-outline" color="#fff" size={22} /><Text style={{ color: '#fff', fontWeight: '700' }}>{saving ? 'Salvando...' : 'Confirmar e salvar'}</Text></Pressable></View>}
  </SafeAreaView></Modal>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#fff' }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: '#dde4e9' }, title: { fontSize: 20, fontWeight: '800', color: '#172d39', flexShrink: 1 }, line: { fontSize: 15, color: '#475569', marginVertical: 6 }, section: { fontSize: 16, fontWeight: '700', marginTop: 22, marginBottom: 6 }, action: { flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 14 }, footer: { padding: 16, borderTopWidth: 1, borderColor: '#dde4e9' }, confirm: { flexDirection: 'row', gap: 10, backgroundColor: '#087f72', minHeight: 48, borderRadius: 6, alignItems: 'center', justifyContent: 'center' } });
