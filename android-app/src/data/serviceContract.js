import { categoryName, money } from './appData';

export const CONTRACT_VERSION = '2026-10-02.1';
export function localDate() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export const contractClauses = [
  ['Objeto e autorização', 'O cliente autoriza exclusivamente os serviços, materiais e equipamentos descritos neste orçamento, no endereço informado. Serviços adicionais ou alterações de preço, materiais ou prazo dependem de nova aprovação expressa e documentada das partes.'],
  ['Execução e responsabilidades', 'O prestador executará o serviço com cuidado, pessoal capacitado e observância das normas aplicáveis. O cliente disponibilizará acesso ao local nos horários acordados. Condições ocultas, infiltrações, riscos ou impedimentos identificados deverão ser comunicados antes de prosseguir; eventual alteração será negociada e registrada. Quando exigida, a responsabilidade técnica e a documentação profissional deverão ser providenciadas antes da execução.'],
  ['Preço e materiais', 'O preço e a forma de pagamento são os discriminados neste documento. O fornecimento de materiais e equipamentos seguirá a responsabilidade aqui indicada. Não serão cobrados acréscimos sem autorização. O prestador fornecerá o comprovante correspondente e documento fiscal quando exigível.'],
  ['Prazos e entrega', 'As datas de início e término previstas constam abaixo. Mudanças decorrentes de condições técnicas, acesso, clima ou fornecimento serão comunicadas e acordadas. A entrega será conferida pelas partes e eventuais pendências serão registradas, sem renúncia aos direitos legais.'],
  ['Garantias e reclamações', 'Permanecem íntegros os direitos previstos no Código de Defesa do Consumidor, inclusive a garantia legal e os direitos em caso de vícios do serviço. Eventual garantia contratual é complementar à legal e será entregue por escrito com prazo, condições e canal de atendimento.'],
  ['Cancelamento e direitos do consumidor', 'O cancelamento e os valores de eventual acerto serão tratados conforme a legislação aplicável e os serviços efetivamente executados, sem multa automática ou perda integral de valores. Quando aplicável à contratação fora do estabelecimento, será respeitado o direito de arrependimento previsto no art. 49 do CDC. Nenhuma cláusula afasta direitos obrigatórios do consumidor.'],
  ['Dados e fotos', 'Os dados pessoais e as fotos serão usados para orçamento, execução, comprovação e atendimento relacionados a este serviço, com acesso limitado às pessoas necessárias. Divulgação publicitária de imagens exige autorização específica e separada. O cliente pode solicitar esclarecimentos pelo contato do prestador.'],
  ['Forma de autorização', 'As partes podem autorizar este documento em papel ou aceitar expressamente a assinatura eletrônica manuscrita capturada no aplicativo. O registro local inclui o texto aprovado, a assinatura e a data informada pelo aparelho; não é assinatura certificada ICP-Brasil nem fornece verificação independente de identidade ou de horário. Cada parte deverá receber uma cópia.'],
];

export function defaultTerms(quote, provider = {}) {
  return {
    providerName: provider.name || '', providerDocument: provider.document || '', providerPhone: provider.phone || '', providerAddress: provider.address || '',
    clientDocument: '', startDate: quote.visitDate || '', endDate: '',
    payment: '', materials: '', equipment: '', exclusions: '', guarantee: '',
    receivedDate: localDate(), validityDays: '10',
  };
}

export function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validateTerms(quote, terms) {
  const required = ['providerName', 'providerDocument', 'providerPhone', 'providerAddress', 'clientDocument', 'payment', 'materials', 'equipment'];
  if (!quote.clientName || !quote.clientAddress || !quote.description || required.some((field) => !terms[field]?.trim())) return 'Complete as partes, o endereço, a descrição do serviço, o pagamento e os materiais/equipamentos (ou informe não aplicável).';
  if (![terms.startDate, terms.endDate, terms.receivedDate].every(validDate) || terms.endDate < terms.startDate) return 'Informe datas válidas (AAAA-MM-DD), com término igual ou posterior ao início.';
  if (!/^\d+$/.test(terms.validityDays) || Number(terms.validityDays) < 1 || Number(terms.validityDays) > 3650) return 'Informe a validade entre 1 e 3650 dias.';
  const expiration = new Date(`${terms.receivedDate}T12:00:00Z`);
  expiration.setUTCDate(expiration.getUTCDate() + Number(terms.validityDays));
  if (expiration.toISOString().slice(0, 10) < localDate()) return 'Este orçamento está vencido. Revise o recebimento e a validade antes de autorizar.';
  if (!Number.isFinite(quote.total) || quote.total < 0) return 'Revise o valor do orçamento.';
  return null;
}

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

export function makeSnapshot(quote, terms) {
  // The signed content is frozen separately from later photos and agenda changes.
  return JSON.parse(JSON.stringify({ version: CONTRACT_VERSION, id: quote.id, clientName: quote.clientName, clientPhone: quote.clientPhone, clientAddress: quote.clientAddress, category: quote.category, description: quote.description, labor: quote.labor ?? quote.total, materialsCost: quote.materials ?? 0, total: quote.total, painting: quote.painting || null, items: quote.items || [], terms: { ...terms }, clauses: contractClauses }));
}

export function contractHtml(snapshot, authorization = null, draftHash = '') {
  const s = snapshot;
  const t = s.terms;
  const field = (label, value) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value || 'Não informado').replace(/\n/g, '<br>')}</p>`;
  const signature = authorization?.method === 'app' && /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(authorization.signature || '')
    ? `<img class="signature" src="${authorization.signature}" alt="Assinatura manuscrita do cliente">` : '<div class="signature-line"></div>';
  const providerSignature = authorization?.method === 'app' && /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(authorization.providerSignature || '')
    ? `<img class="signature" src="${authorization.providerSignature}" alt="Assinatura manuscrita do prestador">` : '<div class="signature-line"></div>';
  const itemList = (s.items || []).map((item) => field(item.name, `${item.quantity} ${item.unit}; mão de obra/unidade ${money(Number(item.laborPrice.replace(',', '.')))}; material/unidade ${money(Number(item.materialPrice.replace(',', '.')))}`)).join('');
  const p = s.painting;
  const painting = p ? `<h2>Memorial de pintura</h2>${field('Área líquida', `${p.area || 'Não informada'} m²`)}${field('Demãos', p.coats)}${field('Preparação', p.preparation)}${field('Tinta e materiais', p.paint)}${(p.surfaces || []).map((surface, index) => field(surface.name || `Medida ${index + 1}`, `${surface.mode === 'room' ? 'Cômodo' : 'Parede'}: ${surface.length} m × ${surface.mode === 'room' ? `${surface.width} m × ` : ''}${surface.height} m; aberturas: ${surface.openings} m²${surface.ceiling ? '; inclui teto' : ''}`)).join('')}${p.estimate?.liters != null ? field('Tinta estimada, sujeita à conferência', `${p.estimate.liters.toFixed(2)} L; rendimento ${p.yield} m²/L (${p.yieldMode === 'finished' ? 'acabado' : 'por demão'}); perdas ${p.waste}%`) : ''}` : '';
  return `<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>
    @page { size:A4; margin:18mm } body{font:12pt Arial,sans-serif;color:#182c35;line-height:1.5;margin:24px;overflow-wrap:anywhere} h1{font-size:22pt;margin:0} h2{font-size:14pt;border-bottom:1px solid #cbd5e1;padding-bottom:5px;margin-top:24px} p{white-space:normal;margin:8px 0} header{border-bottom:4px solid #0e8f7e;padding-bottom:16px} .tag{font-size:10pt;color:#475569}.total{font-size:18pt;font-weight:bold;color:#075e55}.signatures{break-inside:avoid;margin-top:30px}.signature{width:260px;max-width:100%;height:110px;object-fit:contain}.signature-line{height:80px;border-bottom:1px solid #475569}.audit{font-size:9pt;color:#475569;border-top:1px solid #cbd5e1;margin-top:24px}
    </style></head><body><header><p class="tag">ORÇAFÁCIL PRO · ORÇAMENTO ${escapeHtml(s.id)}</p><h1>Contrato de prestação de serviços</h1><p>Orçamento e autorização de execução</p></header>
    <h2>Partes e local</h2>${field('Prestador', t.providerName)}${field('CPF/CNPJ do prestador', t.providerDocument)}${field('Endereço do prestador', t.providerAddress)}${field('Contato do prestador', t.providerPhone)}${field('Cliente', s.clientName)}${field('CPF/CNPJ do cliente', t.clientDocument)}${field('Contato do cliente', s.clientPhone)}${field('Local da execução', s.clientAddress)}
    <h2>Escopo e orçamento</h2>${field('Área de serviço', categoryName(s.category))}${field('Serviços incluídos', s.description)}${itemList}${field('Materiais e responsável pelo fornecimento', t.materials)}${field('Equipamentos e custos incluídos', t.equipment)}${field('Itens não incluídos', t.exclusions || 'Nenhum adicional especificado')}${field('Mão de obra', money(s.labor))}${field('Materiais/equipamentos', money(s.materialsCost))}<p class="total">Total: ${escapeHtml(money(s.total))}</p>${field('Pagamento e vencimentos', t.payment)}
    <h2>Prazos e condições</h2>${field('Início previsto', t.startDate)}${field('Término previsto', t.endDate)}${field('Recebimento do orçamento', t.receivedDate)}${field('Validade a partir do recebimento', `${t.validityDays} dias`)}${field('Garantia contratual adicional', t.guarantee || 'Sem garantia contratual adicional estipulada; preservada a garantia legal')}${painting}
    <h2>Condições acordadas</h2>${s.clauses.map(([title, content], index) => `<p><strong>${index + 1}. ${escapeHtml(title)}.</strong> ${escapeHtml(content)}</p>`).join('')}
    <div class="signatures"><p>Declaro ter lido o escopo, os valores, os prazos e as condições e autorizo a execução nos termos deste documento.</p>${signature}${field('Cliente', s.clientName)}${providerSignature}${field('Prestador', t.providerName)}<p>Local e data: ________________________________________</p><p>Testemunha 1 (se utilizada): ____________________ CPF: ______________</p><p>Testemunha 2 (se utilizada): ____________________ CPF: ______________</p></div>
    ${authorization ? `<div class="audit">${field('Registro', authorization.method === 'app' ? 'Assinatura manuscrita no aplicativo' : 'Via assinada em papel anexada')}${field('Data do aparelho', authorization.signedAt)}${field('Identificador SHA-256 do conteúdo', authorization.contentHash)}<p>Registro local. Identidade e horário não verificados por terceiro. O identificador não substitui certificado ou validação independente.</p></div>` : `<p class="tag">Minuta para conferência. Sem autorização registrada no aplicativo.</p>${draftHash ? `<div class="audit">${field('Identificador SHA-256 do conteúdo', draftHash)}</div>` : ''}`}
    <p class="tag">Modelo ${escapeHtml(s.version)} · As partes conservam seus direitos legais e devem guardar uma cópia.</p></body></html>`;
}
