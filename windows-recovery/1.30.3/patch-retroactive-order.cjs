const fs = require('node:fs');
const [input, output] = process.argv.slice(2);
let bundle = fs.readFileSync(input, 'utf8');
function replaceOnce(before, after) {
  const index = bundle.indexOf(before);
  if (index < 0 || bundle.indexOf(before, index + before.length) >= 0) {
    throw Error('Integração ambígua: ' + before.slice(0, 100));
  }
  bundle = bundle.slice(0,index) + after + bundle.slice(index+before.length);
}

replaceOnce("if(!['approved','scheduled','done'].includes(o.status))throw Error('A finaliza\\xe7\\xe3o pertence a um pedido aprovado.');",
 `if(l==='record-only'){
   if(!['draft','approved','scheduled'].includes(o.status)||(o.replacesOrderId&&o.status==='draft')){
     throw Error('Abra o pedido original para registrar o serviço executado.');
   }
   if(o.completion?.finalizedAt)throw Error('O relatório emitido está preservado.');
   s(n,false);
   if(!(0,nativeCompletionDates.validDate)(n.completedDate)||n.completedDate>(0,nativeCompletionDates.localDate)()||!n.workDescription.trim()){
     throw Error('Informe a data real e descreva o serviço executado.');
   }
   const completion={...n,version:1};
   delete completion.finalizedAt;
   delete completion.reportHash;
   delete completion.quoteSnapshot;
   delete completion.photoHashes;
   return {...o,status:'done',completedAt:o.completedAt||new Date().toISOString(),completion,recordVersion:(o.recordVersion||0)+1};
 }
 if(!['approved','scheduled','done'].includes(o.status))throw Error('A finalização pertence a um pedido aprovado.');`);
replaceOnce('var o=r(d[0]),t=r(d[1]),n=r(d[2]);function s(o,t=!1){if(!o||',
 'var o=r(d[0]),t=r(d[1]),n=r(d[2]),nativeCompletionDates=n;function s(o,t=!1){if(!o||');

const savePrefix='onSave:async function(e,t,n,o){const a=JSON.parse(JSON.stringify(t));if(o){a.photoHashes={};';
replaceOnce(savePrefix, `onSave:async function(e,t,n,o){const a=JSON.parse(JSON.stringify(t));const issueReport=o===true;if(issueReport){
 if((!a.pairs.length||a.pairs.some(pair=>!pair.before||!pair.after))&&!a.photoReason.trim()){
   a.photoReason='Fotos de antes e depois incompletas na data da emissão.';
 }
 a.photoHashes={};`);
replaceOnce('o&&c.contract?.authorization&&await(0,h.verifyStoredAuthorization)(c);const l=(0,w.saveCompletion)(c,a,n,o);return o&&',
 'issueReport&&c.contract?.authorization&&await(0,h.verifyStoredAuthorization)(c);const l=(0,w.saveCompletion)(c,a,n,o);return issueReport&&');
replaceOnce("!q&&(0,W.jsx)(d.default,{quote:e,onNext:L}),e.archivedAt",
 `!q&&(0,W.jsx)(d.default,{quote:e,onNext:L}),!q&&!e.archivedAt&&['draft','approved','scheduled'].includes(e.status)&&!(e.status==='draft'&&e.replacesOrderId)&&(0,W.jsx)(f.default,{title:'Já executei este serviço',subtitle:'Informe a data e registre as fotos no mesmo pedido',icon:'checkmark-done-outline',tone:'green',onPress:()=>L?.('completion',e.id)}),e.archivedAt`);
replaceOnce("children:\"A emiss\\xe3o final depende da autoriza\\xe7\\xe3o registrada no contrato. Voc\\xea pode salvar as fotos e o rascunho antes.\"",
 "children:'Contrato sem autorização registrada. Você pode registrar o serviço feito e completar os documentos depois.'");
const draftAction="(0,N.jsx)(S.default,{title:V?'Salvando...':'Salvar rascunho da execu\\xe7\\xe3o',icon:\"save-outline\",tone:\"blue\",disabled:V,onPress:()=>ae(()=>ee(!1))})";
replaceOnce(draftAction,`['draft','approved','scheduled'].includes(e.status)&&(0,N.jsx)(S.default,{title:'Registrar serviço já executado',subtitle:'Vai para Finalizados. Fotos e relatório continuam no mesmo pedido.',icon:'checkmark-done-outline',tone:'green',disabled:V,onPress:()=>ae(async()=>{await ee('record-only');s.default.alert('Serviço finalizado','O relatório pode ser emitido aqui. O pagamento é registrado no Financeiro.');})}),e.status!=='draft'&&`+draftAction);
replaceOnce('title:"Concluir servi\\xe7o e emitir relat\\xf3rio final",icon:"checkmark-done-outline",tone:"green",disabled:V',
 "title:e.status==='done'?'Emitir relatório final':'Concluir serviço e emitir relatório final',icon:'checkmark-done-outline',tone:'green',disabled:V||e.status==='draft'");
fs.writeFileSync(output,bundle,{flag:'wx'});
