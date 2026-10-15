import { validDate } from './serviceContract';

export function quoteDates(quote) {
  const dates = [quote.visitDate, quote.createdDate || quote.createdAt?.slice(0, 10)].filter(validDate);
  const terms = quote.contract?.authorization && quote.contract.snapshot?.terms;
  if (terms && validDate(terms.startDate) && validDate(terms.endDate)) {
    const current = new Date(`${terms.startDate}T12:00:00Z`);
    // Bound malformed legacy ranges without affecting ordinary multi-day services.
    for (let i = 0; i < 3660; i++) {
      const date = current.toISOString().slice(0, 10);
      if (date > terms.endDate) break;
      dates.push(date);
      current.setUTCDate(current.getUTCDate() + 1);
    }
  }
  return [...new Set(dates)];
}

export function quoteDayLabel(quote, day) {
  const terms = quote.contract?.authorization && quote.contract.snapshot?.terms;
  if (terms && day >= terms.startDate && day <= terms.endDate) return quote.status === 'done' ? 'Serviço concluído' : 'Execução autorizada';
  if (quote.visitDate === day) return quote.status === 'draft' ? 'Visita / orçamento' : 'Serviço agendado';
  return 'Orçamento registrado';
}

export function monthDays(month) {
  const date = new Date(`${month}-01T12:00:00Z`);
  date.setUTCDate(1 - date.getUTCDay());
  return Array.from({ length: 42 }, () => {
    const key = date.toISOString().slice(0, 10);
    date.setUTCDate(date.getUTCDate() + 1);
    return key;
  });
}

export function agendaEntries(quotes, events) {
  return [
    ...quotes.flatMap(quote => quoteDates(quote).map(date => ({
      key: `quote-${quote.id}-${date}`, id: quote.id, kind: 'quote', date,
      time: date === quote.visitDate ? (quote.visitTime || '') : '',
      title: quote.clientName || 'Orçamento', duration: 1,
    }))),
    ...events.map(event => ({ key: `event-${event.id}`, id: event.id, kind: 'event', date: event.date, time: event.time, title: event.title, duration: Number(event.duration) || 1 })),
  ];
}

export function eventOverlaps(candidate, events) {
  const minutes = time => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
  const start = minutes(candidate.time), end = start + (Number(candidate.duration) || 1) * 60;
  return events.some(event => event.id !== candidate.id && event.date === candidate.date && start < minutes(event.time) + (Number(event.duration) || 1) * 60 && end > minutes(event.time));
}
