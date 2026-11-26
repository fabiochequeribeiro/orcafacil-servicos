const fs = require('node:fs');
const [source, destination] = process.argv.slice(2);
let bundle = fs.readFileSync(source, 'utf8');

function change(before, after) {
  if (bundle.split(before).length !== 2) throw Error('Integração ambígua: ' + before);
  bundle = bundle.replace(before, after);
}

change("phone:'(43) 98459-4216',address:", "phone:'(43) 98459-4216',secondaryPhone:'(43) 99160-1149',address:");
change("phone:'(43) 98459-4216',secondaryName:'Val\\xe9ria',secondaryPhone:'(43) 99160-1149',",
  "phone:n.providerDefaults.phone,secondaryName:'Val\\xe9ria',secondaryPhone:n.providerDefaults.secondaryPhone,");
change('e.businessContactsHtml=function(n,t=o,l=!1)', 'e.businessContactsHtml=function(n,t=o,l=!0)');
change('function s(n=o,s=!1)', 'function s(n=o,s=!0)');
change('providerPhone:o.phone,providerAddress:o.address',
  "providerPhone:[o.phone,o.secondaryPhone].join(' / '),providerAddress:o.address");
change('providerPhone:s.phone||o.providerDefaults.phone,providerAddress:',
  'providerPhone:s.phone||(0,o.providerTerms)().providerPhone,providerAddress:');
change("\\n${i.businessBrand.phone}`},_e.quoteHtml=",
  "\\n${(0,i.businessContactRows)()[0].label}`},_e.quoteHtml=");
fs.writeFileSync(destination, bundle, {flag:'wx'});

