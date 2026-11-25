const assert = require('node:assert/strict');
const test = require('node:test');
const { groupOrders, orderStage } = require('../src/data/orderFlow.cjs');

const appointment = { visitDate: '2026-11-24', visitTime: '06:40' };

test('classifies legacy budgets and all Windows workflow stages', () => {
  const cases = [
    [{ status: 'draft' }, 'quotes'],
    [{ status: 'rejected' }, 'quotes'],
    [{ status: 'approved' }, 'toSchedule'],
    [{ status: 'scheduled', visitDate: appointment.visitDate }, 'toSchedule'],
    [{ status: 'scheduled', ...appointment }, 'scheduled'],
    [{ status: 'approved', ...appointment }, 'scheduled'],
    [{ status: 'scheduled', ...appointment, executionStartedAt: '2026-11-24T09:40:00Z' }, 'active'],
    [{ status: 'scheduled', ...appointment, orderControl: { state: 'paused' } }, 'blocked'],
    [{ status: 'approved', orderControl: { state: 'review' } }, 'blocked'],
    [{ status: 'approved', orderControl: { state: 'superseded' } }, 'blocked'],
    [{ status: 'done' }, 'done'],
    [{ status: 'cancelled' }, 'cancelled'],
    [{ status: 'done', archivedAt: '2026-11-24' }, 'archived'],
    [{ status: 'newer-schema' }, 'unknown'],
  ];
  for (const [order, stage] of cases) assert.equal(orderStage(order), stage);
});

test('groups every order exactly once and retains empty stages for the counters', () => {
  const input = [
    Object.freeze({ id: 'a', status: 'approved' }),
    Object.freeze({ id: 'b', status: 'scheduled', ...appointment }),
    Object.freeze({ id: 'c', status: 'unknown-state' }),
  ];
  const groups = groupOrders(Object.freeze(input));
  assert.deepEqual(groups.toSchedule, [input[0]]);
  assert.deepEqual(groups.scheduled, [input[1]]);
  assert.deepEqual(groups.unknown, [input[2]]);
  assert.deepEqual(groups.done, []);
  assert.equal(Object.values(groups).flat().length, input.length);
});
