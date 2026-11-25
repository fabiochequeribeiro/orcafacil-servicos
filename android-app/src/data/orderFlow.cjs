const stages = Object.freeze([
  { id: 'quotes', label: 'Orçamentos' },
  { id: 'toSchedule', label: 'Pedidos aprovados' },
  { id: 'scheduled', label: 'Serviços agendados' },
  { id: 'active', label: 'Em andamento' },
  { id: 'blocked', label: 'Com pendências' },
  { id: 'done', label: 'Finalizados' },
  { id: 'cancelled', label: 'Cancelados' },
  { id: 'archived', label: 'Lixeira / arquivados' },
]);

function orderStage(order) {
  if (order.archivedAt) return 'archived';

  switch (order.status) {
    case 'draft':
    case 'rejected':
      return 'quotes';
    case 'done':
      return 'done';
    case 'cancelled':
      return 'cancelled';
    case 'approved':
    case 'scheduled':
      if (['paused', 'review', 'superseded'].includes(order.orderControl?.state)) {
        return 'blocked';
      }
      if (order.executionStartedAt) return 'active';
      return order.visitDate && order.visitTime ? 'scheduled' : 'toSchedule';
    default:
      return 'unknown';
  }
}

function groupOrders(orders) {
  const groups = Object.fromEntries(stages.map(({ id }) => [id, []]));
  groups.unknown = [];
  for (const order of orders) {
    groups[orderStage(order)].push(order);
  }
  return groups;
}

module.exports = { stages, orderStage, groupOrders };
