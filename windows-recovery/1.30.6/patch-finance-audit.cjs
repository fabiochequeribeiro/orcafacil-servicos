const fs = require('node:fs');
const [input, output] = process.argv.slice(2);
let bundle = fs.readFileSync(input, 'utf8');

function change(before, after) {
  if (bundle.split(before).length !== 2) throw Error('Integração ambígua: ' + before);
  bundle = bundle.replace(before, after);
}

change('(x,exportPeriod)}catch', '({...x,executed},exportPeriod)}catch');
change(
  "['Contratado no período',(t.contracted/100).toFixed(2).replace('.',',')],",
  "['Contratado no período',(t.contracted/100).toFixed(2).replace('.',',')],['Saldo a receber dos pedidos deste período',((t.remaining||0)/100).toFixed(2).replace('.',',')],",
);
change(
  "...t.entries.map(e=>['Recebimento'",
  "...(t.executed||[]).map(order=>['Serviço executado',order.completion?.completedDate||order.completedAt?.slice(0,10),order.clientName,'Valor do serviço',Number(order.total).toFixed(2).replace('.',',')]),...t.entries.map(e=>['Recebimento'",
);
fs.writeFileSync(output, bundle, { flag: 'wx' });

