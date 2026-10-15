import { useMemo, useState } from 'react';
import ServiceIcon from '../components/ServiceIcon';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Card from '../components/Card';
import DateField from '../components/DateField';
import QuoteReview from '../components/QuoteReview';
import FormField from '../components/FormField';
import ServicePhotos from '../components/ServicePhotos';
import PaintingEstimator from '../components/PaintingEstimator';
import ServiceEstimator from '../components/ServiceEstimator';
import { estimateItems } from '../data/itemEstimator';
import { calculatePainting, newSurface } from '../data/paintingCalculator';
import { localDate, validDate } from '../data/serviceContract';
import { localId } from '../data/localId';
import { categoryName, money } from '../data/appData';

const emptyPainting = () => ({ area: '', surface: 'Paredes', preparation: '', coats: '2', paint: '', surfaces: [newSurface()], yield: '', yieldMode: 'coat', waste: '10', rate: '' });

export default function QuoteScreen({ categories, onSave, initialCategory = 'eletrica' }) {
  const category = initialCategory;
  const [review, setReview] = useState(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [description, setDescription] = useState('');
  const [visitDate, setVisitDate] = useState(localDate);
  const [visitTime, setVisitTime] = useState('14:00');
  const [labor, setLabor] = useState('120');
  const [materials, setMaterials] = useState('0');
  const [painting, setPainting] = useState(emptyPainting);
  const [saving, setSaving] = useState(false);
  const [itemsByCategory, setItemsByCategory] = useState({});
  const items = itemsByCategory[category] || [];
  const [photos, setPhotos] = useState({});

  const total = useMemo(() => Number(labor.replace(',', '.') || 0) + Number(materials.replace(',', '.') || 0), [labor, materials]);

  async function save(openContract = false, confirmed = false) {
    if (saving) return;
    if (items.length && !estimateItems(items).valid) {
      Alert.alert('Itens', 'Revise os itens do orçamento.');
      return;
    }
    if (category !== 'pintura' && items.length) {
      const estimate = estimateItems(items);
      if (Math.abs(estimate.labor - Number(labor.replace(',', '.'))) > 0.01 || Math.abs(estimate.materials - Number(materials.replace(',', '.'))) > 0.01) {
        Alert.alert('Valores dos itens', 'Aplique os valores calculados dos itens antes de salvar.');
        return;
      }
    }
    if (!Number.isFinite(total) || Number(labor.replace(',', '.')) < 0 || Number(materials.replace(',', '.')) < 0) {
      Alert.alert('Valores', 'Informe valores válidos para mão de obra e materiais.');
      return;
    }
    if (category === 'pintura' && !calculatePainting(painting.surfaces, painting).valid) {
      Alert.alert('Pintura', 'Complete as medidas, demãos e rendimento da tinta.');
      return;
    }
    if (!clientName.trim()) {
      Alert.alert('Cliente obrigatório', 'Informe o nome do cliente para salvar o orçamento.');
      return;
    }

    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(visitTime)) { Alert.alert('Horário', 'Use um horário válido (HH:MM).'); return; }
    if (!validDate(visitDate)) { Alert.alert('Data', 'Selecione uma data válida para a visita.'); return; }
    const payload = {
      items,
      photos,
      painting: category === 'pintura' ? painting : undefined,
      labor: Number(labor.replace(',', '.') || 0),
      materials: Number(materials.replace(',', '.') || 0),
      id: localId(),
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientAddress: clientAddress.trim(),
      category,
      description: description.trim(),
      status: 'draft',
      createdAt: new Date().toISOString(),
      createdDate: localDate(),
      visitDate: visitDate.trim(),
      visitTime: visitTime.trim(),
      visitDuration: '2h',
      paymentMethod: 'Pix',
      total,
    };
    if (!confirmed) { setReview({ quote: payload, openContract }); return; }
    setSaving(true);
    try {
    await onSave(review.quote, openContract);
    setReview(null);

    setClientName('');
    setClientPhone('');
    setClientAddress('');
    setDescription('');
    setLabor('120');
    setMaterials('0');
    setPhotos({});
    setPainting(emptyPainting());
    setItemsByCategory({});
    } catch {
      Alert.alert('Orçamento', 'Não foi possível salvar. Seus dados permanecem no formulário.');
    } finally { setSaving(false); }
  }

  return <>
    <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
      <Card>
        <Text style={styles.sectionTitle}>Dados do cliente</Text>
        <FormField label="Cliente" value={clientName} onChangeText={setClientName} placeholder="Nome do cliente" />
        <FormField label="WhatsApp" value={clientPhone} onChangeText={setClientPhone} placeholder="(43) 99999-9999" keyboardType="phone-pad" />
        <FormField label="Endereço da visita" value={clientAddress} onChangeText={setClientAddress} placeholder="Rua, número e bairro" />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>{categoryName(category)}</Text>
        <View style={styles.categoryGrid}>
          {categories.filter((item) => item.id === category).map((item) => {
            const selected = item.id === category;
            return (
              <View key={item.id} style={[styles.category, selected && styles.categoryActive]}>
                <ServiceIcon category={item.id} size={56} />
                <Text style={styles.categoryName}>{item.name}</Text>
              </View>
            );
          })}
        </View>
      </Card>

      {category === 'pintura' && <Card>
        <Text style={styles.sectionTitle}>Pintura</Text>
        <PaintingEstimator painting={painting} onChange={setPainting} onLabor={setLabor} />
        <FormField label="Preparação da superfície" value={painting.preparation} onChangeText={(preparation) => setPainting({ ...painting, preparation })} placeholder="Lixar, corrigir trincas, massa corrida..." multiline />
        <FormField label="Tinta e materiais" value={painting.paint} onChangeText={(paint) => setPainting({ ...painting, paint })} placeholder="Tipo de tinta, cor e quantidade" multiline />
      </Card>}
      <Card><Text style={styles.sectionTitle}>Fotos do serviço</Text><ServicePhotos photos={photos} onChange={setPhotos} /></Card>
      {category !== 'pintura' && <Card><Text style={styles.sectionTitle}>Itens e quantidades</Text><ServiceEstimator category={category} items={items} onChange={(next) => setItemsByCategory({ ...itemsByCategory, [category]: next })} onApply={(result) => { setLabor(result.labor.toFixed(2)); setMaterials(result.materials.toFixed(2)); }} /></Card>}
      <Card>
        <Text style={styles.sectionTitle}>Serviço e valores</Text>
        <FormField label="Descrição" value={description} onChangeText={setDescription} placeholder="Explique o serviço solicitado" multiline />
        <FormField label="Mão de obra" value={labor} onChangeText={setLabor} placeholder="120" keyboardType="decimal-pad" />
        <FormField label="Materiais" value={materials} onChangeText={setMaterials} placeholder="0" keyboardType="decimal-pad" />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Agendamento</Text>
        <DateField label="Data da visita" value={visitDate} onChangeText={setVisitDate} />
        <FormField label="Horário" value={visitTime} onChangeText={setVisitTime} placeholder="14:00" />
      </Card>

      <Card>
        <Text style={styles.summaryTitle}>Resumo</Text>
        <Text style={styles.summaryLine}>{categoryName(category)} - {clientName || 'Cliente não informado'}</Text>
        <Text style={styles.summaryDescription}>{description || 'Descrição do serviço aparecerá aqui.'}</Text>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{money(total)}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity disabled={saving} style={styles.secondary} onPress={() => save()}>
            <Text style={styles.secondaryText}>Revisar e salvar</Text>
          </TouchableOpacity>
          <TouchableOpacity disabled={saving} style={styles.primary} onPress={() => save(true)}>
            <Text style={styles.primaryText}>{saving ? 'Salvando...' : 'Preparar contrato'}</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </ScrollView>
    {review && <QuoteReview quote={review.quote} saving={saving} onClose={() => setReview(null)} onConfirm={() => save(review.openContract, true)} />}
  </>;
}

const styles = StyleSheet.create({
  screen: {
    padding: 14,
  },
  sectionTitle: {
    color: '#152638',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 10,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  category: {
    width: '47%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d8e1ea',
    backgroundColor: '#f7fafc',
    padding: 12,
  },
  categoryActive: {
    borderColor: '#0e8f7e',
    backgroundColor: '#e0f2f1',
  },
  categoryIcon: {
    fontSize: 22,
    marginBottom: 8,
  },
  categoryName: {
    color: '#152638',
    fontWeight: '900',
  },
  summaryTitle: {
    color: '#152638',
    fontSize: 18,
    fontWeight: '900',
  },
  summaryLine: {
    color: '#26394d',
    fontWeight: '800',
    marginTop: 8,
  },
  summaryDescription: {
    color: '#64748b',
    marginTop: 6,
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#d8e1ea',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: '#152638',
    fontWeight: '900',
  },
  totalValue: {
    color: '#152638',
    fontSize: 24,
    fontWeight: '900',
  },
  actions: {
    gap: 10,
    marginTop: 14,
  },
  primary: {
    minHeight: 46,
    borderRadius: 8,
    backgroundColor: '#0e8f7e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '900',
  },
  secondary: {
    minHeight: 46,
    borderRadius: 8,
    backgroundColor: '#e6eef5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: '#12324a',
    fontWeight: '900',
  },
});
