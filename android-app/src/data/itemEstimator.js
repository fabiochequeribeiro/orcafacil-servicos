import { number } from './paintingCalculator';

export const serviceSuggestions = {
  eletrica: ['Troca de tomada', 'Instalação de luminária', 'Troca de interruptor', 'Visita e diagnóstico'],
  hidraulica: ['Troca de torneira', 'Troca de sifão', 'Reparo de descarga', 'Reparo de vazamento'],
  moveis: ['Montagem de móvel', 'Ajuste de porta'], reparos: ['Fixação de suporte', 'Vedação e acabamento'],
};
export function estimateItems(items) {
  let labor = 0;
  let materials = 0;
  const valid = items.length > 0 && items.every((item) => {
    const quantity = number(item.quantity);
    const laborPrice = number(item.laborPrice);
    const materialPrice = number(item.materialPrice);
    if (!item.name.trim() || !(quantity > 0) || laborPrice < 0 || materialPrice < 0 || ![quantity, laborPrice, materialPrice].every(Number.isFinite)) return false;
    labor += quantity * laborPrice;
    materials += quantity * materialPrice;
    return true;
  });
  return { valid, labor: valid ? labor : 0, materials: valid ? materials : 0, total: valid ? labor + materials : 0 };
}
