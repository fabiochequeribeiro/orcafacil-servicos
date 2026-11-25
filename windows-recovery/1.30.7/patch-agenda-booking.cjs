const fs = require('node:fs');
const [source, destination] = process.argv.slice(2);
const bundle = fs.readFileSync(source, 'utf8');
const marker = bundle.indexOf('accessibilityLabel:"Novo compromisso"');
const start = bundle.lastIndexOf('__d(function', marker);
const end = bundle.indexOf('__d(function', marker);
if (marker < 0 || start < 0 || end < 0) throw Error('Tela da agenda não localizada.');
let screen = bundle.slice(start, end);

function change(before, after) {
  if (screen.split(before).length !== 2) throw Error('Integração ambígua: ' + before);
  screen = screen.replace(before, after);
}

change('function te(e="09:00"){_({id:(0,T.localId)(),title:\'\',type:\'pessoal\',date:W,',
  'function te(e="09:00",type="pessoal"){_({id:(0,T.localId)(),title:\'\',type,date:W,');

change(']}),!!N.length&&',
  `]}),
  (0,P.jsx)(l.default,{title:'Agendar orçamento',subtitle:'Marque uma visita para preparar o orçamento',icon:'clipboard-outline',tone:'outline',onPress:()=>te(undefined,'visita')}),
  (0,P.jsx)(l.default,{title:'Agendar serviço',subtitle:'Reserve um horário para executar o serviço',icon:'construct-outline',tone:'outline',onPress:()=>te(undefined,'servico')}),
  !!N.length&&`);

change('accessibilityLabel:"Novo compromisso"', 'accessibilityLabel:"Agendar compromisso pessoal"');
change('children:"Agendar"', 'children:"Pessoal"');
change('children:"Compromisso"', "children:B.type==='visita'?'Agendamento de orçamento':B.type==='servico'?'Agendamento de serviço':'Compromisso pessoal'");
change("'pessoal'===e?'Pessoal':'visita'===e?'Visita':'Servi\\xe7o'",
  "'pessoal'===e?'Pessoal':'visita'===e?'Orçamento':'Serviço'");
change("style:I.heading,children:['pessoal','visita','servico'].map",
  "style:[I.heading,{flexWrap:'wrap'}],children:['pessoal','visita','servico'].map");
change("'visita'===u.find(t=>t.id===e.id)?.type?'Visita para or\\xe7amento':`${e.duration} h`",
  "({visita:'Orçamento',servico:'Serviço',pessoal:'Pessoal'}[u.find(t=>t.id===e.id)?.type]||'Compromisso')+` · ${e.duration} h`");

fs.writeFileSync(destination, bundle.slice(0, start) + screen + bundle.slice(end), { flag: 'wx' });

