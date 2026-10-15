import { useRef } from 'react';
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SignatureCanvas from 'react-native-signature-canvas';
import { Ionicons } from '@expo/vector-icons';

export default function SignatureDialog({ visible, onCancel, onConfirm, title = 'Assinatura do cliente' }) {
  const pad = useRef(null);
  return <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.pad}><SignatureCanvas ref={pad} onOK={onConfirm} onEmpty={() => Alert.alert('Assinatura', 'A assinatura está vazia.')} onError={() => Alert.alert('Assinatura', 'Não foi possível abrir a assinatura.')} descriptionText="" webStyle=".m-signature-pad--footer{display:none} .m-signature-pad{box-shadow:none;border:0} body,html{width:100%;height:100%}" penColor="#152638" backgroundColor="white" /></View>
      <View style={styles.row}>
        <TouchableOpacity accessibilityLabel="Cancelar assinatura" style={styles.button} onPress={onCancel}><Ionicons name="close-outline" size={26} /><Text>Cancelar</Text></TouchableOpacity>
        <TouchableOpacity accessibilityLabel="Limpar assinatura" style={styles.button} onPress={() => pad.current?.clearSignature()}><Ionicons name="trash-outline" size={26} /><Text>Limpar</Text></TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => pad.current?.readSignature()}><Ionicons name="checkmark-outline" size={26} color="#075e55" /><Text>Confirmar</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  </Modal>;
}
const styles = StyleSheet.create({ screen: { flex: 1, padding: 16, backgroundColor: '#eef3f7' }, title: { fontSize: 20, fontWeight: '700', padding: 16 }, pad: { flex: 1, minHeight: 180, borderWidth: 1, borderColor: '#94a3b8', backgroundColor: 'white' }, row: { flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap', padding: 12 }, button: { alignItems: 'center', padding: 12, minHeight: 48 } });
