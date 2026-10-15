import { Calendar, LocaleConfig } from 'react-native-calendars';
LocaleConfig.locales.pt = {
  monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'], today: 'Hoje',
};
LocaleConfig.defaultLocale = 'pt';
export default function CalendarPanel({ value, onChange, dates = [] }) {
  const marked = Object.fromEntries(dates.map((date) => [date, { marked: true, dotColor: '#0e8f7e' }]));
  marked[value] = { ...marked[value], selected: true, selectedColor: '#087f72' };
  return <Calendar initialDate={value} firstDay={1} enableSwipeMonths markedDates={marked} onDayPress={(day) => onChange(day.dateString)} theme={{ arrowColor: '#087f72', todayTextColor: '#087f72' }} />;
}
