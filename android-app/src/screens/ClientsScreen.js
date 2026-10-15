import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '../components/Card';
import { categoryName, statusLabels } from '../data/appData';

export default function ClientsScreen({ quotes }) {
  const clients = [...new Map(quotes.filter((quote) => quote.clientName).map((quote) => [quote.clientName.toLowerCase(), quote])).values()];

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Card>
        <Text style={styles.sectionTitle}>Clientes cadastrados</Text>
        {clients.length ? clients.map((quote) => (
          <View key={quote.id} style={styles.client}>
            <Text style={styles.name}>{quote.clientName}</Text>
            <Text style={styles.meta}>{quote.clientPhone || 'Telefone não informado'}</Text>
            <Text style={styles.meta}>{quote.clientAddress || 'Endereço não informado'}</Text>
            <Text style={styles.tag}>{categoryName(quote.category)} - {statusLabels[quote.status]}</Text>
          </View>
        )) : <Text style={styles.empty}>Nenhum cliente salvo ainda.</Text>}
      </Card>
    </ScrollView>
  );
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
  client: {
    borderWidth: 1,
    borderColor: '#d8e1ea',
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  name: {
    color: '#152638',
    fontWeight: '900',
    marginBottom: 4,
  },
  meta: {
    color: '#64748b',
    fontSize: 12,
  },
  tag: {
    color: '#075e55',
    backgroundColor: '#e0f2f1',
    alignSelf: 'flex-start',
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginTop: 8,
    fontSize: 11,
    fontWeight: '800',
  },
  empty: {
    color: '#64748b',
  },
});
