import { Image, View } from 'react-native';
import atlas from '../../assets/service-atlas.png';
const positions = { pintura: 0, eletrica: 1, hidraulica: 2, moveis: 3, reparos: 4, assistant: 5 };
export default function ServiceIcon({ category, size = 72 }) {
  const position = positions[category] ?? 4;
  return <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: size, height: size, overflow: 'hidden', borderRadius: 8 }}><Image source={atlas} style={{ position: 'absolute', width: size * 3, height: size * 2, left: -(position % 3) * size, top: -Math.floor(position / 3) * size }} /></View>;
}
