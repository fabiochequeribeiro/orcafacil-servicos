const fs = require('node:fs');
const [source, destination] = process.argv.slice(2);
let bundle = fs.readFileSync(source, 'utf8');

function change(before, after) {
  if (bundle.split(before).length !== 2) throw Error('Integração ambígua: ' + before);
  bundle = bundle.replace(before, after);
}

change('e.downloadQuotePdf=async function(o,u,{singlePage=false}={})',
  'e.downloadQuotePdf=async function(o,u,{singlePage=true}={})');
change("...[false,true].map(singlePage=>(0,W.jsx)(f.default,{title:Q?'Preparando PDF...':singlePage?'Salvar PDF em uma folha A4':'Baixar PDF para enviar no WhatsApp',subtitle:singlePage?'Ajusta o orçamento inteiro, incluindo as fotos, para caber em uma folha':'Baixa o or\\xe7amento com todas as fotos. Depois anexe o PDF no WhatsApp.',icon:singlePage?\"contract-outline\":\"logo-whatsapp\",trailingIcon:\"document-text-outline\",tone:singlePage?\"outline\":\"green\",",
  "(0,W.jsx)(f.default,{title:Q?'Preparando PDF...':'Baixar orçamento em uma folha A4',subtitle:'Inclui as fotos e o total em uma página, pronta para enviar pelo WhatsApp.',icon:'logo-whatsapp',trailingIcon:'document-text-outline',tone:'green',");
change('return void await(0,n.downloadQuotePdf)(e,o,{singlePage})',
  'return void await(0,n.downloadQuotePdf)(e,o)');
change('}},String(singlePage))),(0,W.jsx)(f.default,{title:"Compartilhar resumo"',
  '}}),(0,W.jsx)(f.default,{title:"Compartilhar resumo"');
fs.writeFileSync(destination, bundle, { flag: 'wx' });

