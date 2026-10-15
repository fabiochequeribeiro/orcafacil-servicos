import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Card from '../components/Card';
import VisitCard from '../components/VisitCard';
import { categoryName } from '../data/appData';
import { localDate } from '../data/serviceContract';
import { quoteDates } from '../data/agenda';

export default function HomeScreen({ quotes, visits, onOpenAgenda, onOpenQuote, events }) {
  const today = localDate();
  const todayVisits = quotes.filter((quote) => quoteDates(quote).includes(today) && quote.status !== 'done');
  const personal = events.filter((event) => event.date === today);
  const approvedWithoutDate = quotes.filter((quote) => quote.status === 'approved' && !quote.visitDate);
  const next = visits.find((quote) => quote.visitDate >= today);

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.stats}>
        <Card style={styles.stat}>
          <Text style={styles.statLabel}>Hoje</Text>
          <Text style={styles.statValue}>{todayVisits.length + personal.length}</Text>
        </Card>
        <Card style={styles.stat}>
          <Text style={styles.statLabel}>Autorizados</Text>
          <Text style={styles.statValue}>{quotes.filter((quote) => quote.contract?.authorization || quote.status === 'approved').length}</Text>
        </Card>
      </View>

      <Card>
        <View style={styles.row}>
          <Text style={styles.sectionTitle}>Próximo compromisso</Text>
          <TouchableOpacity onPress={onOpenAgenda}>
            <Text style={styles.link}>Ver agenda</Text>
          </TouchableOpacity>
        </View>
        {next ? <TouchableOpacity onPress={() => onOpenQuote(next.id)}><VisitCard quote={next} /></TouchableOpacity> : <Text style={styles.empty}>Sem compromisso agendado.</Text>}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Alertas</Text>
        {approvedWithoutDate.length === 0 && todayVisits.length === 0 && personal.length === 0 ? (
          <Text style={styles.empty}>Sem alertas pendentes.</Text>
        ) : (
          <>
            {approvedWithoutDate.map((quote) => (
              <Text key={quote.id} style={styles.alert}>Agendar visita: {quote.clientName} - {categoryName(quote.category)}</Text>
            ))}
            {todayVisits.map((quote) => (
              <Text key={`today-${quote.id}`} style={styles.alert}>Visita hoje: {quote.visitTime || 'sem horário'} - {quote.clientName}</Text>
            ))}
            {personal.map((event) => <TouchableOpacity key={event.id} onPress={onOpenAgenda}><Text style={styles.alert}>{event.time} - {event.title}</Text></TouchableOpacity>)}
          </>
        )}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Compromissos do dia</Text>
        {todayVisits.length ? todayVisits.map((quote) => <TouchableOpacity key={quote.id} onPress={() => onOpenQuote(quote.id)}><VisitCard quote={quote} /></TouchableOpacity>) : <Text style={styles.empty}>Nenhum serviço para hoje.</Text>}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 14,
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '800',
  },
  statValue: {
    color: '#152638',
    fontSize: 28,
    fontWeight: '900',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#152638',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 10,
  },
  link: {
    color: '#087263',
    fontWeight: '800',
  },
  empty: {
    color: '#64748b',
  },
  alert: {
    color: '#92400e',
    backgroundColor: '#fef3c7',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    fontWeight: '700',
  },
});
