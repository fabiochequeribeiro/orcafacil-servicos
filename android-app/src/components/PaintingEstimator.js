import { Switch, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FormField from './FormField';
import ServicePhotos from './ServicePhotos';
import { calculatePainting, measureSurface, newSurface, number } from '../data/paintingCalculator';

export default function PaintingEstimator({ painting, onChange, onLabor }) {
  const surfaces = painting.surfaces || [];
  const result = calculatePainting(surfaces, painting);
  function update(values) {
    const next = { ...painting, ...values };
    const calculation = calculatePainting(next.surfaces || [], next);
    onChange({ ...next, area: calculation.area.toFixed(2), estimate: calculation });
  }
  function surfaceUpdate(id, values) {
    update({ surfaces: surfaces.map((item) => item.id === id ? { ...item, ...values } : item) });
  }
  return <View>
    {surfaces.map((surface, index) => <View key={surface.id} style={styles.surface}>
      <View style={styles.row}><Text style={styles.title}>Medida {index + 1}</Text><TouchableOpacity accessibilityLabel="Remover medida" style={styles.icon} onPress={() => update({ surfaces: surfaces.filter((item) => item.id !== surface.id) })}><Ionicons name="trash-outline" size={22} color="#b91c1c" /></TouchableOpacity></View>
      <FormField label="Ambiente / parede" value={surface.name} onChangeText={(name) => surfaceUpdate(surface.id, { name })} placeholder="Sala, quarto, parede externa..." />
      <ServicePhotos photos={{ before: surface.photo }} stages={['before']} labels={{ before: 'Foto de referência (opcional)' }} onChange={(photos) => surfaceUpdate(surface.id, { photo: photos.before })} />
      <View style={styles.row}>{[['wall', 'Parede'], ['room', 'Cômodo retangular']].map(([mode, label]) => <TouchableOpacity key={mode} style={[styles.mode, surface.mode === mode && styles.active]} onPress={() => surfaceUpdate(surface.id, { mode })}><Text>{label}</Text></TouchableOpacity>)}</View>
      <FormField label="Comprimento (m)" value={surface.length} onChangeText={(length) => surfaceUpdate(surface.id, { length })} keyboardType="decimal-pad" />
      {surface.mode === 'room' && <FormField label="Largura do cômodo (m)" value={surface.width} onChangeText={(width) => surfaceUpdate(surface.id, { width })} keyboardType="decimal-pad" />}
      <FormField label="Altura da parede (m)" value={surface.height} onChangeText={(height) => surfaceUpdate(surface.id, { height })} keyboardType="decimal-pad" />
      <FormField label="Descontar portas e janelas (m²)" value={surface.openings} onChangeText={(openings) => surfaceUpdate(surface.id, { openings })} keyboardType="decimal-pad" />
      {surface.mode === 'room' && <View style={styles.row}><Text>Incluir teto</Text><Switch value={surface.ceiling} onValueChange={(ceiling) => surfaceUpdate(surface.id, { ceiling })} /></View>}
      <Text style={styles.result}>{measureSurface(surface).valid ? `${measureSurface(surface).area.toFixed(2)} m²` : 'Medidas incompletas ou inválidas'}</Text>
    </View>)}
    <TouchableOpacity style={styles.button} onPress={() => update({ surfaces: [...surfaces, newSurface()] })}><Ionicons name="add-outline" size={22} color="#075e55" /><Text>Adicionar parede ou cômodo</Text></TouchableOpacity>
    <FormField label="Número de demãos" value={painting.coats} onChangeText={(coats) => update({ coats })} keyboardType="number-pad" />
    <View style={styles.row}>{[['coat', 'Por demão'], ['finished', 'Área acabada']].map(([yieldMode, label]) => <TouchableOpacity key={yieldMode} style={[styles.mode, painting.yieldMode === yieldMode && styles.active]} onPress={() => update({ yieldMode })}><Text>{label}</Text></TouchableOpacity>)}</View>
    <FormField label={painting.yieldMode === 'finished' ? 'Rendimento acabado da embalagem (m²/L)' : 'Rendimento por demão da embalagem (m²/L)'} value={painting.yield} onChangeText={(value) => update({ yield: value })} keyboardType="decimal-pad" />
    <FormField label="Margem para perdas (%)" value={painting.waste} onChangeText={(waste) => update({ waste })} keyboardType="decimal-pad" />
    <FormField label="Mão de obra por m² (R$)" value={painting.rate} onChangeText={(rate) => update({ rate })} keyboardType="decimal-pad" />
    <Text style={styles.result}>Área de pintura: {result.area.toFixed(2)} m²</Text>
    <Text style={styles.result}>Tinta estimada: {result.liters === null ? 'Informe medidas e rendimento' : `${result.liters.toFixed(2)} L`}</Text>
    {result.volume > 0 && <Text style={styles.note}>Volume dos cômodos: {result.volume.toFixed(2)} m³</Text>}
    <Text style={styles.note}>Estimativa sujeita à superfície, cor e aplicação. Use o rendimento da tinta escolhida; área acabada já considera as demãos do fabricante.</Text>
    <TouchableOpacity disabled={!result.valid || !(number(painting.rate) > 0)} style={styles.button} onPress={() => onLabor((result.area * number(painting.rate)).toFixed(2))}><Ionicons name="calculator-outline" size={22} color="#075e55" /><Text>Aplicar mão de obra calculada</Text></TouchableOpacity>
  </View>;
}
const styles = StyleSheet.create({
  surface: { borderBottomWidth: 1, borderColor: '#d8e1ea', paddingBottom: 12, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  title: { flex: 1, fontWeight: '700', color: '#152638' },
  icon: { padding: 10 }, mode: { padding: 10, minHeight: 44, borderRadius: 6, backgroundColor: '#eef3f7' },
  active: { backgroundColor: '#ccebe4' }, button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, minHeight: 44, backgroundColor: '#e0f2f1', borderRadius: 6, marginVertical: 10 },
  result: { fontWeight: '700', color: '#075e55', marginVertical: 4 }, note: { color: '#475569', marginVertical: 8 },
});
