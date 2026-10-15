import { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as ImagePicker from 'expo-image-picker';
import { Directory, File, Paths } from 'expo-file-system';
import FormField from './FormField';
import DateField from './DateField';
import SignatureDialog from './SignatureDialog';
import { contractHtml, defaultTerms, makeSnapshot, validateTerms } from '../data/serviceContract';

const providerKey = 'orcafacil.provider.v1';
const fields = [
  ['providerName', 'Nome / razão social do prestador'], ['providerDocument', 'CPF/CNPJ do prestador'], ['providerPhone', 'Telefone do prestador'], ['providerAddress', 'Endereço do prestador'],
  ['clientDocument', 'CPF/CNPJ do cliente'], ['startDate', 'Início previsto (AAAA-MM-DD)'], ['endDate', 'Término previsto (AAAA-MM-DD)'],
  ['receivedDate', 'Recebimento do orçamento (AAAA-MM-DD)'], ['validityDays', 'Validade (dias)'], ['payment', 'Pagamento: entrada, parcelas e vencimentos'],
  ['materials', 'Materiais: lista, quantidades e quem fornece'], ['equipment', 'Equipamentos: lista e custos incluídos'], ['exclusions', 'Itens fora do escopo'], ['guarantee', 'Garantia contratual adicional (opcional)'],
];

export default function ContractDialog({ quote, onClose, onSave }) {
  const [terms, setTerms] = useState(() => quote.contract?.snapshot?.terms || defaultTerms(quote));
  const [mode, setMode] = useState(quote.contract?.authorization ? 'preview' : 'details');
  const [consent, setConsent] = useState(false);
  const [signing, setSigning] = useState('');
  const [providerSignature, setProviderSignature] = useState(null);
  const [busy, setBusy] = useState(false);
  const signed = !!quote.contract?.authorization;
  const snapshot = signed ? quote.contract.snapshot : makeSnapshot(quote, terms);
  const html = contractHtml(snapshot, quote.contract?.authorization, quote.contract?.draftHash);

  useEffect(() => {
    let active = true;
    if (!quote.contract) AsyncStorage.getItem(providerKey).then((value) => {
      if (active && value) setTerms(defaultTerms(quote, JSON.parse(value)));
    }).catch(() => {});
    return () => { active = false; };
  }, [quote]);

  async function run(task) {
    if (busy) return;
    setBusy(true);
    try { await task(); } catch { Alert.alert('Contrato', 'Não foi possível concluir. Tente novamente.'); }
    finally { setBusy(false); }
  }

  async function prepare() {
    await run(async () => {
      const frozen = makeSnapshot(quote, terms);
      const draftHash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, JSON.stringify(frozen));
      await onSave(quote.id, { snapshot: frozen, authorization: null, draftHash });
      await AsyncStorage.setItem(providerKey, JSON.stringify({ name: terms.providerName, document: terms.providerDocument, phone: terms.providerPhone, address: terms.providerAddress }));
      setMode('preview');
      setConsent(false);
    });
  }

  function canAuthorize() {
    if (JSON.stringify(makeSnapshot(quote, terms)) !== JSON.stringify(quote.contract?.snapshot)) {
      Alert.alert('Revisão', 'Salve os dados e revise o documento antes de autorizar.');
      return false;
    }
    const error = validateTerms(quote, terms);
    if (error) { Alert.alert('Contrato incompleto', error); return false; }
    if (!consent) { Alert.alert('Autorização', 'O cliente deve ler e aceitar o documento e a forma de assinatura.'); return false; }
    return true;
  }

  async function authorize(method, signature, paperFiles = []) {
    if (!canAuthorize()) return;
    await run(async () => {
      const frozen = makeSnapshot(quote, terms);
      const contentHash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, JSON.stringify(frozen));
      const evidenceHashes = [];
      if (method === 'app') {
        evidenceHashes.push(await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${providerSignature}\n${signature}`));
      } else {
        for (const uri of paperFiles) evidenceHashes.push(await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, await new File(uri).base64()));
      }
      const authorization = { method, signature: signature || null, providerSignature: method === 'app' ? providerSignature : null, paperFiles, evidenceHashes, signedAt: new Date().toISOString(), contentHash, consent: true };
      await onSave(quote.id, { snapshot: frozen, authorization });
      setSigning('');
      Alert.alert('Autorização registrada', 'Guarde e entregue uma cópia do contrato ao cliente.');
    });
  }

  async function paper() {
    if (!canAuthorize()) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, quality: 0.85 });
      if (result.canceled || !result.assets.length) return;
      const directory = new Directory(Paths.document, 'contracts');
      directory.create({ intermediates: true, idempotent: true });
      const files = [];
      for (const [index, asset] of result.assets.entries()) {
        const destination = new File(directory, `${Date.now()}-${quote.id}-${index}.jpg`);
        await new File(asset.uri).copy(destination);
        files.push(destination.uri);
      }
      await authorize('paper', null, files);
    } catch { Alert.alert('Contrato', 'Não foi possível anexar as páginas assinadas.'); }
  }

  async function share() {
    await run(async () => {
      if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing unavailable');
      const result = await Print.printToFileAsync({ html: await exportHtml(), width: 595, height: 842 });
      const directory = new Directory(Paths.document, 'contracts');
      directory.create({ intermediates: true, idempotent: true });
      const destination = new File(directory, `contrato-${quote.id}-${Date.now()}.pdf`);
      await new File(result.uri).copy(destination);
      await Sharing.shareAsync(destination.uri, { mimeType: 'application/pdf', dialogTitle: 'Contrato de serviço' });
    });
  }

  async function exportHtml() {
    const authorization = quote.contract?.authorization;
    if (authorization) {
      const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, JSON.stringify(quote.contract.snapshot));
      if (hash !== authorization.contentHash) throw new Error('Content integrity mismatch');
      if (authorization.method === 'app') {
        const evidence = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${authorization.providerSignature}\n${authorization.signature}`);
        if (evidence !== authorization.evidenceHashes[0]) throw new Error('Signature integrity mismatch');
      }
    }
    const pages = quote.contract?.authorization?.paperFiles || [];
    let annex = '';
    for (const [index, uri] of pages.entries()) {
      const base64 = await new File(uri).base64();
      const evidence = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, base64);
      if (evidence !== authorization.evidenceHashes[index]) throw new Error('Paper integrity mismatch');
      annex += `<section style="break-before:page;break-inside:avoid"><h2>Via assinada - página ${index + 1}</h2><img src="data:image/jpeg;base64,${base64}" style="width:100%;height:850px;object-fit:contain"></section>`;
    }
    return html.replace('</body>', `${annex}</body>`);
  }

  return <Modal visible animationType="slide" onRequestClose={onClose}>
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}><Text style={styles.title}>Contrato e autorização</Text><TouchableOpacity accessibilityLabel="Fechar contrato" onPress={onClose} style={styles.icon}><Ionicons name="close-outline" size={28} /></TouchableOpacity></View>
      {!signed && <View style={styles.tabs}>{[['details', 'Dados'], ['preview', 'Documento']].map(([id, label]) => <TouchableOpacity disabled={busy} key={id} style={[styles.tab, mode === id && styles.selected]} onPress={() => { if (id === 'preview') prepare(); else { setMode(id); setConsent(false); } }}><Text>{label}</Text></TouchableOpacity>)}</View>}
      {mode === 'details' && !signed ? <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        {fields.map(([key, label]) => ['startDate', 'endDate', 'receivedDate'].includes(key)
          ? <DateField key={key} label={label.replace(' (AAAA-MM-DD)', '')} value={terms[key]} onChangeText={(value) => { setTerms({ ...terms, [key]: value }); setConsent(false); }} />
          : <FormField key={key} label={label} value={terms[key]} onChangeText={(value) => { setTerms({ ...terms, [key]: value }); setConsent(false); }} multiline={['payment', 'materials', 'equipment', 'exclusions', 'guarantee'].includes(key)} />)}
        <TouchableOpacity disabled={busy} style={styles.primary} onPress={prepare}><Text style={styles.white}>Salvar e revisar documento</Text></TouchableOpacity>
      </ScrollView> : <>
        <WebView style={{ flex: 1 }} source={{ html }} originWhitelist={['about:*']} javaScriptEnabled={false} onShouldStartLoadWithRequest={(request) => request.url === 'about:blank' || request.url.startsWith('data:')} />
        <ScrollView style={styles.footer} contentContainerStyle={{ padding: 12 }}>
          <View style={styles.actions}>
            <TouchableOpacity disabled={busy} style={styles.command} onPress={() => run(async () => Print.printAsync({ html: await exportHtml() }))}><Ionicons name="print-outline" size={22} /><Text>Imprimir</Text></TouchableOpacity>
            <TouchableOpacity disabled={busy} style={styles.command} onPress={share}><Ionicons name="share-outline" size={22} /><Text>PDF / enviar</Text></TouchableOpacity>
          </View>
          {signed ? <>
            <Text style={styles.success}>Autorização registrada · {quote.contract.authorization.method === 'app' ? 'Aplicativo' : 'Papel'}</Text>
            {quote.contract.authorization.paperFiles?.map((uri, index) => <TouchableOpacity key={uri} style={styles.command} onPress={() => run(() => Sharing.shareAsync(uri, { mimeType: 'image/jpeg' }))}><Ionicons name="document-outline" size={22} /><Text>Página assinada {index + 1}</Text></TouchableOpacity>)}
          </> : <>
            <View style={styles.consent}><Switch value={consent} onValueChange={setConsent} /><Text style={{ flex: 1 }}>Li e aceito este contrato e autorizo a execução. Aceito a assinatura manuscrita no aplicativo e receberei uma cópia. Para papel, confirmo que todas as páginas anexadas correspondem a este documento e foram conferidas e assinadas pelas partes.</Text></View>
            <View style={styles.actions}>
              <TouchableOpacity disabled={busy} style={styles.command} onPress={() => { if (canAuthorize()) { setProviderSignature(null); setSigning('provider'); } }}><Ionicons name="create-outline" size={22} /><Text>Assinar no app</Text></TouchableOpacity>
              <TouchableOpacity disabled={busy} style={styles.command} onPress={paper}><Ionicons name="attach-outline" size={22} /><Text>Anexar via assinada</Text></TouchableOpacity>
            </View>
          </>}
          {busy && <Text>Processando...</Text>}
        </ScrollView>
      </>}
      {!!signing && <SignatureDialog key={signing} visible title={signing === 'provider' ? 'Assinatura do prestador' : 'Assinatura do cliente'} onCancel={() => setSigning('')} onConfirm={(signature) => { if (signing === 'provider') { setProviderSignature(signature); setSigning('client'); } else { authorize('app', signature); } }} />}
    </SafeAreaView>
  </Modal>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f7fafc' }, header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }, title: { flex: 1, fontSize: 20, fontWeight: '700', color: '#152638' }, icon: { padding: 12 },
  tabs: { flexDirection: 'row', padding: 12, gap: 8 }, tab: { flex: 1, padding: 12, alignItems: 'center', backgroundColor: '#eef3f7', borderRadius: 6 }, selected: { backgroundColor: '#ccebe4' },
  form: { padding: 16 }, primary: { padding: 14, backgroundColor: '#0e8f7e', borderRadius: 6, alignItems: 'center' }, white: { color: 'white', fontWeight: '700' },
  footer: { maxHeight: '42%', flexGrow: 0, borderTopWidth: 1, borderColor: '#cbd5e1' }, actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, command: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 48, padding: 8 },
  consent: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 12 }, success: { color: '#075e55', fontWeight: '700', paddingVertical: 8 },
});
