export const categories = [
  {
    id: 'pintura',
    icon: '▥',
    name: 'Pintura',
    description: 'Paredes, tetos, preparação e acabamento.',
    examples: ['Pintura interna', 'Pintura de teto', 'Preparação de paredes'],
  },
  {
    id: 'eletrica',
    icon: '⚡',
    name: 'Elétrica',
    description: 'Tomadas, disjuntores, chuveiros, iluminação e manutenção.',
    examples: ['Troca de tomada', 'Instalação de chuveiro', 'Revisão de disjuntor'],
  },
  {
    id: 'hidraulica',
    icon: '◌',
    name: 'Hidráulica',
    description: 'Vazamentos, torneiras, sifões, descargas e registros.',
    examples: ['Troca de torneira', 'Reparo de vazamento', 'Sifão e descarga'],
  },
  {
    id: 'moveis',
    icon: '▤',
    name: 'Móveis',
    description: 'Montagem, desmontagem, regulagem e pequenos ajustes.',
    examples: ['Montagem de armário', 'Desmontagem', 'Ajuste de porta'],
  },
  {
    id: 'reparos',
    icon: '✚',
    name: 'Pequenos reparos',
    description: 'Fixação, acabamento, manutenção geral e visita técnica.',
    examples: ['Instalação de suporte', 'Vedação', 'Ajustes gerais'],
  },
];

export const statusLabels = {
  draft: 'Em orçamento',
  approved: 'Autorizado',
  scheduled: 'Agendado',
  done: 'Concluído',
};

export const initialQuotes = [
  {
    id: 'demo-1',
    clientName: 'Mariana Oliveira',
    clientPhone: '(43) 99999-1200',
    clientAddress: 'Rua das Flores, Centro',
    category: 'eletrica',
    description: 'Troca de chuveiro e revisão de tomada.',
    status: 'scheduled',
    visitDate: new Date().toISOString().slice(0, 10),
    visitTime: '14:00',
    visitDuration: '2h',
    total: 180,
    paymentMethod: 'Pix',
  },
];

export function money(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function categoryName(id) {
  return (categories.find((category) => category.id === id) || categories[0]).name;
}
