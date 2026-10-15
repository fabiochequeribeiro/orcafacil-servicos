import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { categoryName, money, statusLabels } from '../data/appData';

export default function VisitCard({ quote, actionLabel = undefined, onAction = undefined }) {
  return (
    <View style={styles.card}>
      <View style={styles.time}>
        <Text style={styles.timeText}>{quote.visitTime || '--:--'}</Text>
        <Text style={styles.duration}>{quote.visitDuration || ''}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{quote.clientName}</Text>
        <Text style={styles.meta}>{categoryName(quote.category)} - {quote.clientAddress || 'Endereço não informado'}</Text>
        <Text style={styles.meta}>{quote.clientPhone || 'Telefone não informado'} - {money(quote.total)}</Text>
      </View>
      <View style={styles.side}>
        <Text style={[styles.status, quote.status === 'done' && styles.done]}>{statusLabels[quote.status]}</Text>
        {actionLabel && (
          <TouchableOpacity style={styles.action} onPress={onAction}>
            <Text style={styles.actionText}>{actionLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d8e1ea',
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  time: {
    width: 72,
    minHeight: 58,
    borderRadius: 8,
    backgroundColor: '#dcebf7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    color: '#0f3a5a',
    fontWeight: '900',
  },
  duration: {
    color: '#64748b',
    fontSize: 11,
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#152638',
    fontWeight: '900',
    marginBottom: 3,
  },
  meta: {
    color: '#64748b',
    fontSize: 12,
  },
  status: {
    color: '#166534',
    backgroundColor: '#dcfce7',
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 11,
    fontWeight: '800',
  },
  side: {
    alignItems: 'flex-end',
    gap: 7,
  },
  done: {
    color: '#3730a3',
    backgroundColor: '#e0e7ff',
  },
  action: {
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#0e8f7e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 12,
  },
});
