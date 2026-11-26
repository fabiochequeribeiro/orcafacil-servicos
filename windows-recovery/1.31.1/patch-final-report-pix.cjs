const fs = require('node:fs');
const [source,destination] = process.argv.slice(2);
let bundle = fs.readFileSync(source,'utf8');

function change(before,after){
  if(bundle.split(before).length!==2)throw Error('Integração ambígua: '+before);
  bundle=bundle.replace(before,after);
}

change('function R({quote:e,onSave:R,onClose:T,onStart:k,onContract:F})',
  'function R({quote:e,billing:reportBilling,onSave:R,onClose:T,onStart:k,onContract:F})');
change("(0,D.stageDocumentHtml)('completion',e).then", "(0,D.stageDocumentHtml)('completion',e,reportBilling).then");
change("()=>{t=!1}},[$,e]),(0,N.jsx)(c.default", "()=>{t=!1}},[$,e,reportBilling]),(0,N.jsx)(c.default");
change('x.default,{quote:ze.find(e=>e.id===ot),onClose:wt,onSave:',
  'x.default,{quote:ze.find(e=>e.id===ot),billing:Dt.billing,onClose:wt,onSave:');
change('const o=e.quoteSnapshot;return $(\'Relat\\xf3rio final de execu\\xe7\\xe3o\',o,',
  `const o=e.quoteSnapshot;
  let reportPix='';
  if(r?.pixKey?.trim()){
    try{reportPix=(0,p.pixKey)(r)}catch{}
  }
  return $('Relat\\xf3rio final de execu\\xe7\\xe3o',o,`);
change('`<p>Valor contratado: ${h((0,s.money)(o.total))}. Pagamentos constam no demonstrativo financeiro separado.</p>`',
  "v('Valor contratado',(0,s.money)(o.total))+(reportPix?v(r.pixType==='cnpj'?'Chave Pix (CNPJ)':'Chave Pix',reportPix):'')");
fs.writeFileSync(destination,bundle,{flag:'wx'});

