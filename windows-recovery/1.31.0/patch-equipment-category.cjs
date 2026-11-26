const fs = require('node:fs');
const [source, destination] = process.argv.slice(2);
let bundle = fs.readFileSync(source, 'utf8');

function change(before, after) {
  if (bundle.split(before).length !== 2) throw Error('Integração ambígua: '+before);
  bundle = bundle.replace(before, after);
}

const examples = ['Lava-louças', 'Depurador de ar', 'Filtro ou purificador de água', 'Bebedouro', 'Portão eletrônico'];
const category = {
  id: 'equipamentos',
  icon: '⚙',
  name: 'Instalação de equipamentos',
  description: 'Instalação de eletrodomésticos, filtros, bebedouros, portões eletrônicos e outros equipamentos.',
  examples,
};
const templates = examples.map(example => 'Instalação de '+example.toLocaleLowerCase('pt-BR'));
templates.push('Instalação de outro equipamento');
change(",'Ajustes gerais']}],o={draft:", ",'Ajustes gerais']},"+JSON.stringify(category)+"],o={draft:");
change("reparos:'#19958e'},T=", "reparos:'#19958e',equipamentos:'#32726f'},T=");
change("reparos:'construct-outline'};function z", "reparos:'construct-outline',equipamentos:'hardware-chip-outline'};function z");
change("reparos:['Fixa\\xe7\\xe3o de suporte','Veda\\xe7\\xe3o e acabamento']}},1343",
  "reparos:['Fixa\\xe7\\xe3o de suporte','Veda\\xe7\\xe3o e acabamento'],equipamentos:"+JSON.stringify(templates)+"}},1343");
change('o.description&&F(`Servi\\xe7o geral: ${o.description}`);',
  "o.category==='equipamentos'&&F('Categoria: '+(0,s.categoryName)(o.category),!0);o.description&&F(`Servi\\xe7o geral: ${o.description}`);");
fs.writeFileSync(destination, bundle, {flag:'wx'});

