import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FormField from './FormField';
import { estimateItems, serviceSuggestions } from '../data/itemEstimator';
import { money } from '../data/appData';
import { localId } from '../data/localId';

export default function ServiceEstimator({ category, items, onChange, onApply }) {
  const result = estimateItems(items);
  function handleAdd(name = '') { onChange([...items, { id: localId(), name, quantity: '1', unit: 'un', laborPrice: '0', materialPrice: '0' }]); }
  function update(id, values) { onChange(items.map((item) => item.id === id ? { ...item, ...values } : item)); }
  return <View>
    <View style={styles.row}>{(serviceSuggestions[category] || []).map((name) => <TouchableOpacity key={name} style={styles.button} onPress={() => handleAdd(name)}><Ionicons name="add-outline" size={20} color="#075e55" /><Text style={{ flexShrink: 1 }}>{name}</Text></TouchableOpacity>)}</View>
    {items.map((item) => <View key={item.id} style={styles.item}>
      <FormField label="Serviço / material" value={item.name} onChangeText={(name) => update(item.id, { name })} />
      <View style={styles.row}>{['un', 'm', 'm²', 'h'].map((unit) => <TouchableOpacity key={unit} style={[styles.button, item.unit === unit && styles.active]} onPress={() => update(item.id, { unit })}><Text>{unit}</Text></TouchableOpacity>)}</View>
      <FormField label={`Quantidade (${item.unit})`} value={item.quantity} onChangeText={(quantity) => update(item.id, { quantity })} keyboardType="decimal-pad" />
      <FormField label="Mão de obra por unidade (R$)" value={item.laborPrice} onChangeText={(laborPrice) => update(item.id, { laborPrice })} keyboardType="decimal-pad" />
      <FormField label="Material por unidade (R$)" value={item.materialPrice} onChangeText={(materialPrice) => update(item.id, { materialPrice })} keyboardType="decimal-pad" />
      <TouchableOpacity accessibilityLabel="Remover item" style={styles.button} onPress={() => onChange(items.filter((entry) => entry.id !== item.id))}><Ionicons name="trash-outline" size={22} color="#b91c1c" /></TouchableOpacity>
    </View>)}
    <TouchableOpacity style={styles.button} onPress={() => handleAdd()}><Ionicons name="add-outline" size={22} color="#075e55" /><Text>Adicionar item</Text></TouchableOpacity>
    {items.length > 0 && <><Text style={styles.result}>{result.valid ? `Mão de obra ${money(result.labor)} · Materiais ${money(result.materials)}` : 'Revise os nomes, quantidades e valores.'}</Text><TouchableOpacity disabled={!result.valid} style={[styles.button, styles.active]} onPress={() => onApply(result)}><Ionicons name="calculator-outline" size={22} color="#075e55" /><Text>Aplicar valores dos itens</Text></TouchableOpacity></>}
  </View>;
}
const styles = StyleSheet.create({ row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, button: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, padding: 10, backgroundColor: '#eef3f7', borderRadius: 6, marginVertical: 4, maxWidth: '100%' }, active: { backgroundColor: '#ccebe4' }, item: { marginTop: 12, borderBottomWidth: 1, borderColor: '#d8e1ea', paddingBottom: 12 }, result: { color: '#075e55', paddingVertical: 12 } });
