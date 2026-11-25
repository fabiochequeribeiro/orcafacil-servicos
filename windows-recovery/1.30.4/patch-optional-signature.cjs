const fs = require('node:fs');
const [input, output] = process.argv.slice(2);
let bundle = fs.readFileSync(input, 'utf8');

function replaceOnce(before, after) {
  const start = bundle.indexOf(before);
  if (start < 0 || bundle.indexOf(before, start+before.length) >= 0) {
    throw Error('Ponto de integração ambíguo: '+before.slice(0,100));
  }
  bundle = bundle.slice(0,start)+after+bundle.slice(start+before.length);
}

replaceOnce("if(s(n,l),l&&'done'!==o.status&&!o.contract?.authorization)throw Error('Registre a autoriza\\xe7\\xe3o do contrato antes de concluir o servi\\xe7o.');", 's(n,l);');
replaceOnce("if(!o.contract?.authorization)throw Error('Registre a autoriza\\xe7\\xe3o do contrato antes de iniciar.');", '');
replaceOnce('return await(0,h.verifyStoredAuthorization)(n),await _t(n=>n.map(n=>n.id!==e?n:(o=(0,w.startExecution)(n,t),o))),o',
 'if(n.contract?.authorization)await(0,h.verifyStoredAuthorization)(n);return await _t(n=>n.map(n=>n.id!==e?n:(o=(0,w.startExecution)(n,t),o))),o');

const startBranch = bundle.indexOf("if(t.contract?.authorization)try{await on(e,t.recordVersion||0)");
const startEnd = bundle.indexOf('}}])}function wt()',startBranch);
if(startBranch<0||startEnd<0)throw Error('Ação de início não encontrada.');
replaceOnce(bundle.slice(startBranch,startEnd),
 "try{await on(e,t.recordVersion||0);Me('active')}catch(error){G.default.alert('Início do serviço',error.message)}");

const popup = bundle.indexOf('const Ft=(0,H.useRef)(new Set);(0,H.useEffect)(');
const popupEnd = bundle.indexOf('const Gt=ze.find',popup);
if(popup<0||popupEnd<0)throw Error('Lembrete automático não encontrado.');
const effect=bundle.slice(popup,popupEnd);
if(!effect.includes('Ft.current.add(t),yt(e.id)'))throw Error('O efeito encontrado não é o lembrete de início.');
replaceOnce(effect,'');
replaceOnce("subtitle:e.contract?.authorization?'Autoriza\\xe7\\xe3o registrada':'Pendente: registrar antes de concluir o servi\\xe7o'",
 "subtitle:e.contract?.authorization?'Contrato assinado registrado':e.approvalPhotos?.length?'Aceite por mensagem anexado · assinatura pendente':'Assinatura pendente'");
replaceOnce("'Pendente - registrar antes de iniciar a execu\\xe7\\xe3o'", "'Assinatura do contrato pendente'");
replaceOnce("title:'Adicionar fotos da aprovação',subtitle:'Prints de WhatsApp e outros registros do aceite'",
 "title:'Adicionar prints do WhatsApp',subtitle:'Anexe um ou mais registros do aceite por mensagem'");
fs.writeFileSync(output,bundle,{flag:'wx'});
