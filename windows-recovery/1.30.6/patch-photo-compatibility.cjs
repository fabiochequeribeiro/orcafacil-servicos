const fs = require('node:fs');
const [input, output] = process.argv.slice(2);
let bundle = fs.readFileSync(input, 'utf8');
const extras = `photos => Object.keys(photos||{})
  .filter(key=>/^beforeExtra[1-9]\\d*$/.test(key))
  .sort((a,b)=>Number(a.slice(11))-Number(b.slice(11)))
  .map(key=>photos[key]).filter(Boolean)`;

function change(before, after, count=1) {
  if (bundle.split(before).length!==count+1) throw Error('Integração ambígua: '+before);
  bundle=bundle.split(before).join(after);
}

change("const collect=photos=>[photos.before,...(Array.isArray(photos.beforeExtras)?photos.beforeExtras:[])].filter(Boolean);",
 `const collect=photos=>[photos.before,...(${extras})(photos)].filter(Boolean);`);
change("const update=(photos,items)=>({...photos,before:items[0]||null,beforeExtras:items.slice(1)});",
 `const update=(photos,items)=>{
  const kept=Object.fromEntries(Object.entries(photos).filter(([key])=>!/^beforeExtra[1-9]\\d*$/.test(key)));
  return {...kept,before:items[0]||null,...Object.fromEntries(items.slice(1).map((item,index)=>['beforeExtra'+(index+1),item]))};
 };`);
for (const name of ['t','f','e']) {
 change(`(${name}.photos?.beforeExtras||[]).entries()`,`(${extras})(${name}.photos).entries()`);
}
fs.writeFileSync(output,bundle,{flag:'wx'});

