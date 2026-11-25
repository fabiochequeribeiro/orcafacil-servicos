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

const historyStart=bundle.indexOf('e.agendaHistoryEntries=function(t){');
const historyEnd=bundle.indexOf(',e.eventOverlaps=r',historyStart);
if(historyStart<0||historyEnd<0)throw Error('Histórico da agenda ausente.');
replaceOnce(bundle.slice(historyStart,historyEnd),`e.agendaHistoryEntries=function(orders){
 return orders.filter(order=>!order.archivedAt&&order.status!=='revised'&&!String(order.id).startsWith('demo-')).flatMap(order=>{
  const client=order.clientName||'Cliente';
  const value=Number.isFinite(order.total)?(0,i.money)(order.total):'Valor a definir';
  const created=[order.createdDate,order.createdAt?.slice(0,10)].find(a.validDate);
  const completed=[order.completion?.completedDate,order.completedAt?.slice(0,10)].find(a.validDate);
  const list=[];
  if(created&&(['draft','rejected'].includes(order.status)||order.approvedAt)&&!(order.status==='done'&&created===completed)){
    list.push({key:'saved-'+order.id,id:order.id,kind:'quote-saved',date:created,time:'',duration:0,title:'Orçamento · '+client+' · '+value});
  }
  if(order.status==='done'&&completed){
    list.push({key:'completed-'+order.id,id:order.id,kind:order.completion?.finalizedAt?'report':'quote-saved',date:completed,time:'',duration:0,title:'Serviço executado · '+client+' · '+value});
  }
  return list;
 });
}`);
replaceOnce("title:t.clientName||'Or\\xe7amento',duration:Number(t.executionDuration)",
 "title:'Serviço agendado · '+(t.clientName||'Cliente')+' · '+(Number.isFinite(t.total)?(0,i.money)(t.total):'Valor a definir'),duration:Number(t.executionDuration)");
// Keep historic entries out of availability calculations.
replaceOnce("...a.flatMap(t=>n(t).map(i=>({key:`quote-${t.id}-${i}`,id:t.id,kind:'quote',date:i,",
 "...a.filter(t=>t.status!=='done').flatMap(t=>n(t).map(day=>({key:`quote-${t.id}-${day}`,id:t.id,kind:'quote',date:day,");

replaceOnce('monthSummary=function(t,r){const d=t.filter(n)',
 `insidePeriod=function(date,period){return typeof date==='string'&&date!==''&&(typeof period==='string'?date.startsWith(period):date>=period.start&&date<=period.end)},e.monthSummary=function(t,r){const inside=date=>e.insidePeriod(date,r);const d=t.filter(n)`);
replaceOnce("u(t).startsWith(r)),f=d.flatMap(t=>l(t).filter(t=>t.date.startsWith(r)).map(r=>({...r,quoteId:t.id,clientName:t.clientName}))),v=d.flatMap(t=>p(t).filter(t=>t.date.startsWith(r)).map(r=>({...r,quoteId:t.id,clientName:t.clientName}))),h=d.filter(t=>'cancelled'===t.status&&t.cancellation.date.startsWith(r))",
 "inside(u(t))),f=d.flatMap(t=>l(t).filter(t=>inside(t.date)).map(r=>({...r,quoteId:t.id,clientName:t.clientName}))),v=d.flatMap(t=>p(t).filter(t=>inside(t.date)).map(r=>({...r,quoteId:t.id,clientName:t.clientName}))),h=d.filter(t=>'cancelled'===t.status&&inside(t.cancellation.date))");
replaceOnce("return(0,r.validDate)(t.financialDate)?t.financialDate:s(t.approvedAt||t.contract?.authorization?.signedAt)",
 "return(0,r.validDate)(t.financialDate)?t.financialDate:s(t.approvedAt||t.contract?.authorization?.signedAt)||('done'===t.status&&r.validDate(t.completion?.completedDate)?t.completion.completedDate:'')");
replaceOnce("const s=(0,n.monthSummary)(e,o),l=t.filter(e=>!e.voidedAt&&e.date.startsWith(o))",
 "const s=(0,n.monthSummary)(e,o),l=t.filter(e=>!e.voidedAt&&n.insidePeriod(e.date,o))");
replaceOnce('function p({quotes:e,expenses:p,month:h}){const x=(0,c.cashReport)(e,p,h);return',
 `function p({quotes:e,expenses:p,month:h}){
 const [weekly,setWeekly]=reportReact.useState(false),[offset,setOffset]=reportReact.useState(0);
 const today=reportDates.localDate();
 const anchor=new Date((today.startsWith(h)?today:h+'-01')+'T12:00:00Z');
 anchor.setUTCDate(anchor.getUTCDate()-((anchor.getUTCDay()+6)%7)+7*offset);
 const start=anchor.toISOString().slice(0,10);
 anchor.setUTCDate(anchor.getUTCDate()+6);
 const end=anchor.toISOString().slice(0,10);
 const period=weekly?{start,end}:h;
 const label=weekly?start.split('-').reverse().join('/')+' a '+end.split('-').reverse().join('/'):h.split('-').reverse().join('/');
 const exportPeriod=weekly?start+'-a-'+end:h;
 const x=(0,c.cashReport)(e,p,period);
 const executed=e.filter(order=>{
  const date=order.completion?.completedDate||order.completedAt?.slice(0,10)||'';
  return order.status==='done'&&!String(order.id).startsWith('demo-')&&date&&(weekly?date>=start&&date<=end:date.startsWith(h));
 });
 return`);
replaceOnce('l=r(d[4]),c=r(d[5]),u=r(d[6]),f=r(d[7]);function p({quotes:e,expenses:p,month:h})',
 'l=r(d[4]),c=r(d[5]),u=r(d[6]),f=r(d[7]),reportReact=r(d[8]),reportDates=r(d[9]);function p({quotes:e,expenses:p,month:h})');
replaceOnce('1308,[14,18,123,126,269,883,1309,6]', '1308,[14,18,123,126,269,883,1309,6,16,871]');
replaceOnce('children:["Relat\\xf3rio mensal \\xb7 ",h.split(\'-\').reverse().join(\'/\')]}),',
 `children:[weekly?'Relatório semanal · ':'Relatório mensal · ',label]}),(0,f.jsx)(n.default,{title:weekly?'Ver mês':'Ver semana',icon:'calendar-outline',tone:'outline',onPress:()=>{setOffset(0);setWeekly(!weekly)}}),weekly&&(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(n.default,{title:'Semana anterior',icon:'chevron-back-outline',tone:'outline',onPress:()=>setOffset(offset-1)}),(0,f.jsx)(n.default,{title:'Próxima semana',icon:'chevron-forward-outline',tone:'outline',onPress:()=>setOffset(offset+1)})]}),(0,f.jsx)(t.default,{style:{marginTop:10,fontWeight:'800'},children:executed.length+' serviço(s) executado(s) no período'}),executed.map(order=>(0,f.jsx)(t.default,{style:{marginTop:4},children:(order.completion?.completedDate||order.completedAt?.slice(0,10)).split('-').reverse().join('/')+' · '+order.clientName+' · '+(0,l.money)(order.total)},order.id)),`);
replaceOnce("['Pedidos fechados (contratado)',x.contracted,'#1766b6'],",
 "['Pedidos fechados (contratado)',x.contracted,'#1766b6'],['Saldo a receber dos pedidos deste período',x.remaining,'#966016'],");
for(const phrase of ['Dinheiro l\\xedquido recebido no m\\xeas','Devolu\\xe7\\xf5es realizadas no m\\xeas','Acertos de cancelados no m\\xeas (separados)','Despesas pagas no m\\xeas']){
 replaceOnce("'"+phrase+"',x.", "'"+phrase.replace('no m\\xeas','no período')+"',x.");
}
replaceOnce('title:"Exportar relat\\xf3rio mensal",subtitle:"Planilha CSV com resumo e lan\\xe7amentos",icon:"download-outline",onPress:async()=>{try{await(0,u.exportCashReport)(x,h)}',
 "title:'Exportar relatório',subtitle:'Planilha CSV com resumo e lançamentos',icon:'download-outline',onPress:async()=>{try{await(0,u.exportCashReport)(x,exportPeriod)}");
replaceOnce("['Or\\xe7aFacil Pro','Relat\\xf3rio mensal',o]", "['OrçaFacil Pro',o.includes('-a-')?'Relatório semanal':'Relatório mensal',o]");
replaceOnce("['Contratado no m\\xeas',(t.contracted/100)", "['Contratado no período',(t.contracted/100)");
replaceOnce("['Recebido l\\xedquido no m\\xeas',(t.received/100)", "['Recebido líquido no período',(t.received/100)");
fs.writeFileSync(output,bundle,{flag:'wx'});
