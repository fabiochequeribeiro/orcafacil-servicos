import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Directory, File, Paths } from 'expo-file-system';
import { localId } from '../data/localId';

export default function ServicePhotos({ photos = {}, onChange, stages = ['before', 'after'], labels = {} }) {
  async function handlePick(stage, camera) {
    try {
      if (camera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Câmera', 'Permita o acesso à câmera nas configurações do aparelho.');
          return;
        }
      }
      const result = await (camera ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync)({ mediaTypes: ['images'], quality: 0.75 });
      if (result.canceled) return;
      const directory = new Directory(Paths.document, 'service-photos');
      directory.create({ intermediates: true, idempotent: true });
      const destination = new File(directory, `${localId()}-${stage}.jpg`);
      await new File(result.assets[0].uri).copy(destination);
      onChange({ ...photos, [stage]: destination.uri });
    } catch {
      Alert.alert('Foto', 'Não foi possível guardar a foto. Tente novamente.');
    }
  }

  return <View style={styles.grid}>{stages.map((stage) => (
    <View key={stage} style={styles.column}>
      <Text style={styles.label}>{labels[stage] || (stage === 'before' ? 'Antes' : 'Depois')}</Text>
      {photos[stage] ? <Image source={{ uri: photos[stage] }} style={styles.preview} resizeMode="contain" /> : <View style={[styles.preview, styles.empty]}><Ionicons name="image-outline" size={32} color="#64748b" /></View>}
      <View style={styles.tools}>
        <TouchableOpacity accessibilityLabel={`Fotografar ${stage === 'before' ? 'antes' : 'depois'}`} style={styles.button} onPress={() => handlePick(stage, true)}><Ionicons name="camera-outline" size={24} color="#075e55" /></TouchableOpacity>
        <TouchableOpacity accessibilityLabel="Escolher foto da galeria" style={styles.button} onPress={() => handlePick(stage, false)}><Ionicons name="images-outline" size={24} color="#075e55" /></TouchableOpacity>
        {photos[stage] && <TouchableOpacity accessibilityLabel="Remover foto" style={styles.button} onPress={() => onChange({ ...photos, [stage]: null })}><Ionicons name="trash-outline" size={22} color="#b91c1c" /></TouchableOpacity>}
      </View>
    </View>
  ))}</View>;
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: 12 },
  column: { flex: 1, minWidth: 0 },
  label: { fontWeight: '700', color: '#152638', marginBottom: 8 },
  preview: { width: '100%', aspectRatio: 1, backgroundColor: '#eef3f7', borderRadius: 8 },
  empty: { alignItems: 'center', justifyContent: 'center' },
  tools: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 },
  button: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
