import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { categories } from './src/data/appData';
import AgendaScreen from './src/screens/AgendaScreen';
import ClientsScreen from './src/screens/ClientsScreen';
import HomeScreen from './src/screens/HomeScreen';
import QuoteScreen from './src/screens/QuoteScreen';
import QuoteHistoryScreen from './src/screens/QuoteHistoryScreen';
import ServicesScreen from './src/screens/ServicesScreen';
import { loadQuotes, saveQuotes } from './src/storage/quoteStorage';
import ContractDialog from './src/components/ContractDialog';
import QuoteReview from './src/components/QuoteReview';
import ServiceIcon from './src/components/ServiceIcon';
import { router, useLocalSearchParams } from 'expo-router';


/** @type {{id: string, label: string, icon: import('react').ComponentProps<typeof Ionicons>['name'], title: string}[]} */
const tabs = [
  { id: 'home', label: 'Inicio', icon: 'home-outline', title: 'Painel do dia' },
  { id: 'quote', label: 'Orcamento', icon: 'document-text-outline', title: 'Novo orçamento' },
  { id: 'agenda', label: 'Agenda', icon: 'calendar-outline', title: 'Agenda integrada' },
  { id: 'clients', label: 'Clientes', icon: 'people-outline', title: 'Clientes' },
  { id: 'services', label: 'Servicos', icon: 'construct-outline', title: 'Areas de serviço' },
  { id: 'assistant', label: 'Assistente', icon: 'chatbubbles-outline', title: 'Assistente' },
];

export default function App() {
  return <SafeAreaProvider><OrcaFacilApp /></SafeAreaProvider>;
}

function OrcaFacilApp() {
  const params = useLocalSearchParams();
  const sections = Array.isArray(params.section) ? params.section : [params.section || 'home'];
  const activeTab = String(sections[0]);
  const selectedCategory = categories.some((c) => c.id === sections[1]) ? String(sections[1]) : null;
  function setActiveTab(id) { router.replace({ pathname: '/[...section]', params: { section: [id] } }); }
  function setSelectedCategory(id) { router.replace({ pathname: '/[...section]', params: { section: id ? ['quote', id] : ['quote'] } }); }
  const [quotes, setQuotes] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [quoteView, setQuoteView] = useState('new');
  const [contractId, setContractId] = useState(null);
  const [reviewId, setReviewId] = useState(null);
  const [events, setEvents] = useState([]);
  const eventRecords = useRef([]);
  const eventWrites = useRef(Promise.resolve());
  const records = useRef([]);
  const writes = useRef(Promise.resolve());
  const contractQuote = quotes.find((quote) => quote.id === contractId);
  const active = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  useEffect(() => {
    let mounted = true;
    Promise.all([loadQuotes(), AsyncStorage.getItem('orcafacil.events.v1')])
      .then(([loadedQuotes, savedEvents]) => {
        if (mounted) {
          records.current = loadedQuotes; setQuotes(loadedQuotes);
          const loadedEvents = savedEvents ? JSON.parse(savedEvents) : [];
          if (!Array.isArray(loadedEvents)) throw new Error('Invalid agenda');
          eventRecords.current = loadedEvents; setEvents(loadedEvents);
        }
      })
      .catch(() => {
        Alert.alert('Armazenamento', 'Não foi possível carregar os dados salvos.');
      })
      .finally(() => {
        if (mounted) setIsReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const visits = useMemo(
    () => quotes
      .filter((quote) => ['approved', 'scheduled', 'done'].includes(quote.status) && quote.visitDate)
      .sort((a, b) => `${a.visitDate} ${a.visitTime}`.localeCompare(`${b.visitDate} ${b.visitTime}`)),
    [quotes],
  );

  function mutateQuotes(transform) {
    const operation = writes.current.then(async () => {
      const next = transform(records.current);
      await saveQuotes(next);
      records.current = next;
      setQuotes(next);
    });
    writes.current = operation.catch(() => {});
    return operation;
  }

  function mutateEvents(transform) {
    const operation = eventWrites.current.then(async () => {
      const next = transform(eventRecords.current);
      await AsyncStorage.setItem('orcafacil.events.v1', JSON.stringify(next));
      eventRecords.current = next; setEvents(next);
    });
    eventWrites.current = operation.catch(() => {});
    return operation;
  }

  async function openAssistant() {
    try { await Linking.openURL('https://chatgpt.com/'); }
    catch { Alert.alert('ChatGPT', 'Não foi possível abrir o ChatGPT. Confira sua conexão e o navegador.'); }
  }

  async function addQuote(quote, openContract) {
    await mutateQuotes((current) => [quote, ...current]);
    setQuoteView('saved');
    if (openContract) setContractId(quote.id);
  }

  function updateQuoteStatus(id, status) {
    mutateQuotes((current) => current.map((quote) => quote.id === id ? { ...quote, status } : quote)).catch(() => {
        Alert.alert('Armazenamento', 'Não foi possível salvar a alteração de status.');
    });
  }

  async function updatePhotos(id, photos) {
    try {
      await mutateQuotes((current) => current.map((quote) => quote.id === id ? { ...quote, photos } : quote));
    } catch {
      Alert.alert('Fotos', 'Não foi possível salvar as fotos do orçamento.');
    }
  }

  async function saveContract(id, contract) {
    await mutateQuotes((current) => current.map((quote) => {
      if (quote.id !== id) return quote;
      if (quote.contract?.authorization) throw new Error('Already authorized');
      return { ...quote, contract, ...(contract.authorization ? { status: 'scheduled', visitDate: contract.snapshot.terms.startDate } : {}) };
    }));
  }

  function confirmClearData() {
    Alert.alert(
      'Limpar dados',
      'Isso apaga orçamentos, clientes e agenda salvos neste aparelho.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            try {
              await mutateQuotes(() => []);
              await mutateEvents(() => []);
              setActiveTab('home');
            } catch { Alert.alert('Armazenamento', 'Não foi possível limpar os dados.'); }
          },
        },
      ],
    );
  }

  if (!isReady) {
    return (
      <SafeAreaView style={styles.loading}>
        <StatusBar style="light" />
        <Text style={styles.loadingTitle}>OrcaFacil Pro</Text>
        <Text style={styles.loadingText}>Carregando dados do aparelho...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.app}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View style={styles.brandMark}>
          <Text style={styles.brandMarkText}>OF</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>OrcaFacil Pro</Text>
          <Text style={styles.title}>{active.title}</Text>
        </View>
        <TouchableOpacity style={styles.newButton} onPress={() => { setSelectedCategory(null); setQuoteView('new'); setActiveTab('quote'); }}>
          <Text style={styles.newButtonText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'home' && <HomeScreen quotes={quotes} visits={visits} events={events} onOpenQuote={setReviewId} onOpenAgenda={() => setActiveTab('agenda')} />}
        {activeTab === 'quote' && <>
          <View style={{ flexDirection: 'row', padding: 10, gap: 10 }}>
            {['new', 'saved'].map((mode) => <TouchableOpacity key={mode} style={[styles.tab, quoteView === mode && styles.tabActive]} onPress={() => setQuoteView(mode)}><Text>{mode === 'new' ? 'Novo orçamento' : 'Orçamentos salvos'}</Text></TouchableOpacity>)}
          </View>
          {quoteView === 'new' ? selectedCategory ? <>
            <TouchableOpacity accessibilityLabel="Trocar tipo de orçamento" style={{ padding: 12, flexDirection: 'row', gap: 8 }} onPress={() => Alert.alert('Trocar serviço?', 'O formulário ainda não salvo será descartado.', [{ text: 'Continuar aqui' }, { text: 'Trocar', onPress: () => setSelectedCategory(null) }])}><Ionicons name="arrow-back" size={22} /><Text>Tipos de orçamento</Text></TouchableOpacity>
            <QuoteScreen key={selectedCategory} initialCategory={selectedCategory} categories={categories} onSave={addQuote} />
          </> : <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
            {categories.map((category) => <TouchableOpacity key={category.id} onPress={() => setSelectedCategory(category.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 18, backgroundColor: '#fff', borderRadius: 8, padding: 16 }}><ServiceIcon category={category.id} /><View style={{ flex: 1 }}><Text style={{ fontSize: 19, fontWeight: '700' }}>{category.name}</Text><Text style={{ color: '#64748b', marginTop: 6 }}>{category.description}</Text></View><Ionicons name="chevron-forward" size={22} /></TouchableOpacity>)}
          </ScrollView> : <QuoteHistoryScreen quotes={quotes} onOpenQuote={setReviewId} onUpdatePhotos={updatePhotos} onContract={setContractId} />}
        </>}
        {activeTab === 'agenda' && <AgendaScreen quotes={quotes} events={events} onSaveEvent={(event) => mutateEvents((current) => [event, ...current.filter((e) => e.id !== event.id)])} onDeleteEvent={(id) => mutateEvents((current) => current.filter((e) => e.id !== id))} onOpenQuote={setReviewId} onMarkDone={(id) => updateQuoteStatus(id, 'done')} />}
        {activeTab === 'assistant' && <View style={{ flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 20 }}><ServiceIcon category="assistant" size={144} /><Text style={{ fontSize: 22, fontWeight: '700' }}>ChatGPT</Text><TouchableOpacity accessibilityLabel="Abrir ChatGPT" style={[styles.newButton, { flexDirection: 'row', gap: 10, padding: 16 }]} onPress={openAssistant}><Ionicons name="open-outline" size={24} color="#fff" /><Text style={styles.newButtonText}>Abrir ChatGPT</Text></TouchableOpacity></View>}
        {activeTab === 'clients' && <ClientsScreen quotes={quotes} />}
        {activeTab === 'services' && <ServicesScreen categories={categories} onClearData={confirmClearData} onOpenCategory={(id) => { setQuoteView('new'); setSelectedCategory(id); }} />}
      </View>

      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const selected = tab.id === activeTab;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, selected && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons name={tab.icon} size={22} color={selected ? '#075e55' : '#64748b'} />
              <Text style={[styles.tabLabel, selected && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {contractQuote && <ContractDialog key={contractQuote.id} quote={contractQuote} onClose={() => setContractId(null)} onSave={saveContract} />}
      {quotes.find((q) => q.id === reviewId) && <QuoteReview quote={quotes.find((q) => q.id === reviewId)} onClose={() => setReviewId(null)} onContract={() => { setContractId(reviewId); setReviewId(null); }} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#eef3f7',
  },
  loading: {
    flex: 1,
    backgroundColor: '#12324a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
  },
  loadingText: {
    color: '#c7d2df',
    marginTop: 8,
  },
  header: {
    backgroundColor: '#12324a',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#f6c344',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: {
    color: '#102235',
    fontWeight: '900',
    fontSize: 17,
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    color: '#c7d2df',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
  },
  newButton: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#0e8f7e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newButtonText: {
    color: '#fff',
    fontWeight: '800',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopColor: '#d8e1ea',
    borderTopWidth: 1,
    paddingHorizontal: 4,
    paddingTop: 6,
    paddingBottom: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#e0f2f1',
  },
  tabIcon: {
    color: '#64748b',
    fontSize: 18,
    fontWeight: '800',
  },
  tabLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  tabTextActive: {
    color: '#075e55',
  },
});
