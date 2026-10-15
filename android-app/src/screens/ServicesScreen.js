import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Card from '../components/Card';
import ServiceIcon from '../components/ServiceIcon';

export default function ServicesScreen({ categories, onClearData, onOpenCategory }) {
  return (
    <ScrollView contentContainerStyle={styles.screen}>
      {categories.map((category) => (
        <Card key={category.id}>
          <TouchableOpacity style={styles.header} onPress={() => onOpenCategory(category.id)}>
            <ServiceIcon category={category.id} />
            <View style={styles.textWrap}>
              <Text style={styles.title}>{category.name}</Text>
              <Text style={styles.description}>{category.description}</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.examples}>
            {category.examples.map((item) => (
              <Text key={item} style={styles.example}>{item}</Text>
            ))}
          </View>
        </Card>
      ))}
      <Card>
        <Text style={styles.title}>Dados do aparelho</Text>
        <Text style={styles.description}>Os orçamentos, clientes e compromissos ficam salvos localmente neste celular ou tablet.</Text>
        <TouchableOpacity style={styles.dangerButton} onPress={onClearData}>
          <Text style={styles.dangerText}>Limpar dados de teste</Text>
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#dcebf7',
    color: '#0f3a5a',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 22,
    fontWeight: '900',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: '#152638',
    fontSize: 18,
    fontWeight: '900',
  },
  description: {
    color: '#64748b',
    marginTop: 3,
  },
  examples: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  example: {
    color: '#075e55',
    backgroundColor: '#e0f2f1',
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: '800',
  },
  dangerButton: {
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  dangerText: {
    color: '#991b1b',
    fontWeight: '900',
  },
});
