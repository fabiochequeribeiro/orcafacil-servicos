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

replaceOnce("[X,Y]=(0,l.useState)('');function Z(t=T){if(V)return;",
 "[X,Y]=(0,l.useState)(''),[draftSavedAt,setDraftSavedAt]=(0,l.useState)(''),busyAction=(0,l.useRef)(false);function Z(t=T){if(busyAction.current)return;");
replaceOnce('async function ee(t=!1){const n=await R(e.id,I,B,t);J(n.recordVersion),O(n.completion)}',
 "async function ee(t=false){const n=await R(e.id,I,B,t);J(n.recordVersion);O(n.completion);if(t===false)setDraftSavedAt(new Date().toLocaleTimeString('pt-BR'));}");
replaceOnce("async function ae(e){if(!V){H(!0);try{await e()}catch(e){s.default.alert('Finaliza\\xe7\\xe3o',e.message||'N\\xe3o foi poss\\xedvel salvar.')}finally{H(!1)}}}",
 "async function ae(e,action='other'){if(busyAction.current)return;busyAction.current=true;H(action);try{await e()}catch(error){s.default.alert('Finalização',error.message||'Não foi possível salvar.')}finally{busyAction.current=false;H(false);}}");
const button = `e.status!=='draft'&&(0,N.jsx)(S.default,{title:V?'Salvando...':'Salvar rascunho da execu\\xe7\\xe3o',icon:"save-outline",tone:"blue",disabled:V,onPress:()=>ae(()=>ee(!1))})`;
replaceOnce(button,`e.status!=='draft'&&(0,N.jsx)(S.default,{title:V==='draft'?'Salvando rascunho...':'Salvar rascunho da execução',icon:'save-outline',tone:'blue',disabled:!!V,onPress:()=>ae(()=>ee(false),'draft')}),draftSavedAt&&(0,N.jsx)(u.default,{accessibilityLiveRegion:'polite',style:{color:'#126439',fontWeight:'700',padding:6},children:'Rascunho salvo às '+draftSavedAt+'. O relatório ainda não foi emitido.'})`);
replaceOnce("disabled:V||e.status==='draft',onPress:function(){s.default.alert('Emitir relat",
 "disabled:!!V||e.status==='draft',onPress:function(){if(busyAction.current)return;s.default.alert('Emitir relat");
fs.writeFileSync(output,bundle,{flag:'wx'});
