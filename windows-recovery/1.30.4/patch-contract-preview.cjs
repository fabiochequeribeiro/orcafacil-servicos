const fs = require('node:fs');
const [input, output] = process.argv.slice(2);
let bundle = fs.readFileSync(input, 'utf8');

function replaceOnce(before, after) {
  const start = bundle.indexOf(before);
  if (start < 0 || bundle.indexOf(before, start + before.length) >= 0) {
    throw Error('Ponto de integração ambíguo: ' + before.slice(0, 100));
  }
  bundle = bundle.slice(0, start) + after + bundle.slice(start + before.length);
}

const preview = '(0,W.jsx)(w.default,{style:{flex:1,minHeight:0},children:(0,W.jsx)(P.default,{html:xe})})';
const oldToolbar = '(0,W.jsxs)(w.default,{style:{padding:10,gap:6},children:[ge?';
replaceOnce(preview + ',' + oldToolbar, `
!te&&${preview},
!te&&(0,W.jsxs)(w.default,{style:[J.actions,{padding:8,borderTopWidth:1,borderColor:'#cbd5e1'}],children:[
 (0,W.jsxs)(b.default,{accessibilityRole:'button',disabled:ee,style:[J.command,{minHeight:38,padding:8}],onPress:Ce,children:[
  (0,W.jsx)(D.Ionicons,{name:'download-outline',size:18}),(0,W.jsx)(x.default,{children:'Baixar PDF do contrato'})
 ]}),
 (0,W.jsxs)(b.default,{accessibilityRole:'button',style:[J.command,{minHeight:38,padding:8}],onPress:()=>oe(true),children:[
  (0,W.jsx)(D.Ionicons,{name:'create-outline',size:18}),(0,W.jsx)(x.default,{children:'Assinatura e anexos'})
 ]})
]}),
te&&(0,W.jsxs)(d.default,{style:{flex:1,minHeight:0},contentContainerStyle:{padding:12,gap:12},children:[
 (0,W.jsx)(c.default,{title:'Voltar ao documento',icon:'arrow-back-outline',tone:'outline',onPress:()=>oe(false)}),
 ${oldToolbar}`);
const oldToggle = `(0,W.jsx)(c.default,{title:te?'Recolher op\\xe7\\xf5es de assinatura':'Assinatura, impress\\xe3o e outras op\\xe7\\xf5es',icon:"chevron-down-outline",tone:"outline",onPress:()=>oe(!te)})]}),te&&(0,W.jsxs)(d.default,{style:[J.footer,{maxHeight:240,flexGrow:0}],contentContainerStyle:{padding:12},children:[`;
replaceOnce(oldToggle, ']}),');
replaceOnce("onPress:()=>{'preview'===e?we():(L(e),K(!1))}", "onPress:()=>{oe(false);if('preview'===e){if(G!=='preview')we();}else{L(e);K(false);}}");
fs.writeFileSync(output, bundle, {flag:'wx'});
