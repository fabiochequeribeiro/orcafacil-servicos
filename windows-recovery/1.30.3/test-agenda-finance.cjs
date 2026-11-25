const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('work/orca-retroactive-complete-v3.js','utf8');
const modules = {};
const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
modules[871] = { validDate: date, localDate: () => '2026-11-24' };
modules[269] = { money: value => 'R$ '+value.toFixed(2) };
modules[870] = {};
modules[882] = { receivableForecast: () => [] };

function load(marker) {
  const index = source.indexOf(marker);
  assert(index >= 0);
  const start = source.lastIndexOf('__d(function',index);
  const end = source.indexOf('\n__d(function',index);
  const register = (factory,id,dependencies) => {
    const exports = {};
    factory({}, id => modules[id] || {}, null, null, {}, exports, dependencies);
    modules[id] = exports;
    return exports;
  };
  let result;
  vm.runInNewContext(source.slice(start,end), {__d: (...args) => {result=register(...args);}});
  return result;
}
const ledger = load('monthSummary=function(t,r)');
const finance = load('cashReport=function(e,t,o)');
const agenda = load('e.agendaHistoryEntries=function(orders)');
const historical = {
  id:'retro-1',status:'done',clientName:'Cliente teste',total:350,
  createdDate:'2026-11-24',completedAt:'2026-11-24T12:00:00Z',
  completion:{completedDate:'2026-11-19'},visitDate:'2026-11-21',visitTime:'09:00',
  payments:[
    {id:'p1',date:'2026-11-19',amountCents:15000,feeCents:500},
    {id:'p2',date:'2026-11-24',amountCents:10000},
  ],
};
const draft={id:'draft-1',status:'draft',clientName:'Proposta',total:99,createdDate:'2026-11-22'};
const scheduled={id:'next-1',status:'scheduled',clientName:'Agendado',total:120,visitDate:'2026-11-25',visitTime:'10:00'};
const history=agenda.agendaHistoryEntries([historical,draft,scheduled]);
assert.equal(history.length,2);
assert.equal(history.find(e=>e.id===historical.id).date,'2026-11-19');
assert.match(history.find(e=>e.id===historical.id).title,/Serviço executado.*Cliente teste.*350/);
assert.match(history.find(e=>e.id===draft.id).title,/Orçamento.*Proposta.*99/);
assert.deepEqual(Array.from(agenda.agendaEntries([historical,draft,scheduled],[]),e=>e.id),['next-1']);
const expenses=[{date:'2026-11-20',amountCents:3000,category:'Materiais'},{date:'2026-11-24',amountCents:2000,category:'Materiais'}];
const week={start:'2026-11-16',end:'2026-11-22'};
const weekly=finance.cashReport([historical,draft],expenses,week);
assert.equal(weekly.contracted,35000);
assert.equal(weekly.received,14500);
assert.equal(weekly.spent,3000);
assert.equal(weekly.net,11500);
assert.equal(weekly.remaining,10000);
const monthly=finance.cashReport([historical,draft],expenses,'2026-11');
assert.equal(monthly.received,24500);
assert.equal(monthly.spent,5000);
assert.equal(monthly.net,19500);
assert.equal(ledger.insidePeriod('2026-11-22',week),true);
assert.equal(ledger.insidePeriod('2026-11-23',week),false);
console.log('Agenda por data real e caixa semanal/mensal com recebimentos, taxas, despesas e saldo: testes aprovados.');
