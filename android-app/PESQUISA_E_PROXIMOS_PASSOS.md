# Contratos e assistentes de orçamento

Pesquisa realizada em 02/10/2026. O aplicativo está em preparação; o usuário pretende formalizar a empresa posteriormente. Os dados do prestador permanecem configuráveis, sem razão social ou CNPJ inventados.

## Base do contrato

- CDC, arts. 39 VI e 40: orçamento prévio, autorização expressa, discriminação de mão de obra, materiais/equipamentos, pagamento, início e término. Validade padrão de dez dias desde o recebimento, salvo acordo diferente. Mudanças dependem de negociação.
- CDC, arts. 46, 49, 50 e 51: leitura prévia, arrependimento quando aplicável à contratação fora do estabelecimento, garantia contratual complementar e proteção contra cláusulas abusivas.
- Código Civil, arts. 593 a 609: prestação de serviços; a classificação jurídica de trabalhos específicos também pode envolver empreitada. A revisão profissional deve adaptar o instrumento ao negócio e aos serviços efetivamente oferecidos.
- MP 2.200-2/2001, art. 10 §2: admite outros meios de comprovar autoria e integridade quando aceitos pelas partes. A assinatura desenhada localmente não equivale automaticamente a certificação ICP-Brasil ou prova independente da identidade.

Fontes oficiais:
- https://planalto.gov.br/ccivil_03/leis/l8078compilado.htm
- https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm
- https://www.planalto.gov.br/ccivil_03/mpv/antigas_2001/2200-2.htm

O modelo é uma base para revisão jurídica antes do uso comercial, não certificação de conformidade integral. Não foram criadas multas, foro exclusivo, renúncias de direitos ou cobrança automática por serviço adicional. Situações como assinatura a rogo exigem fluxo próprio e orientação profissional.

## Implementado nesta versão

- Contrato para todas as categorias, com escopo, partes, custos, materiais, equipamentos, exclusões, pagamento, prazos e garantia adicional opcional.
- Leitura do documento antes da aceitação. Captura manuscrita separada do prestador e cliente; alternativa de importar todas as páginas assinadas em papel.
- Fotografia de assinatura não identifica sozinha o signatário: o operador deve conferir as partes e as páginas.
- Texto congelado, versão, data do aparelho e hashes SHA-256 do conteúdo e evidências. Exportação confere os hashes. Não há timestamp externo, verificação de identidade ou armazenamento remoto imutável.
- PDF A4 e impressão via Android. Via assinada em papel entra como anexo do PDF. Compartilhamento pode ser usado para entregar a cópia ao cliente.
- Após autorização, o orçamento entra na agenda pela data de início. O contrato aprovado não pode ser editado pelo formulário; alterações exigem novo documento.
- Cálculo de várias paredes ou cômodos retangulares, teto opcional, desconto de aberturas e fotos de referência para as medidas informadas manualmente.
- Área em m²; volume do cômodo em m³ exibido separadamente. Rendimento por demão e rendimento acabado têm fórmulas diferentes, evitando contar demãos duas vezes.
- Preço por m² definido pelo usuário. Itens por unidade, metro, m² ou hora para elétrica, hidráulica, móveis e reparos. Preços não são tabelas de mercado, e os itens não dimensionam instalações técnicas.

## Mercado e limites da medição

Suvinil disponibiliza calculadora de tinta e explica o rendimento acabado. O consumo depende do produto, acabamento, superfície, cor e aplicação. A margem para perdas é ajustável e não uma garantia de consumo.
- https://www.suvinil.com.br/calculadora-de-tinta
- https://www.youtube.com/watch?v=6__CLrF1y7M

magicplan oferece desenho/manual e importação com escala conhecida no Android; sua documentação consultada descreve escaneamento manual/automático como exclusivo de iOS. Photoshop documenta escala de medição e planos de perspectiva. Uma foto isolada não determina a escala real: precisa de referência conhecida, plano/perspectiva e confirmação local.
- https://help.magicplan.app/creating-floor-plans-in-magicplan-on-your-android-device
- https://help.magicplan.app/import-and-digitalize-an-existing-floor-plan
- https://helpx.adobe.com/br/photoshop/using/vanishing-point.html

Nesta versão, a foto é referência vinculada às dimensões digitadas. Não há medição automática por foto, AR ou detecção de parede. Etapa futura: seleção dos cantos, referência de escala e correção de perspectiva usando biblioteca estabelecida, com incerteza explícita e conferência manual. Compatibilidade de AR/LiDAR depende do aparelho. O usuário confirmou que seu Sony Vaio usa Android; o modelo e a versão do sistema ainda não foram informados. O APK requer Android 7.0/API 24 ou superior e ainda precisa de teste nesse aparelho.

## IA e evolução

IA ainda não conectada. Planejar servidor autenticado para proteger a chave do provedor, controlar custo, obter consentimento para enviar fotos/dados e validar a resposta estruturada. Primeiro uso: sugerir escopo, perguntas de vistoria e lista de materiais com aprovação humana. Dimensões e cálculos permanecem determinísticos. Não delegar à IA diagnóstico de risco ou dimensionamento de cabos/disjuntores/tubulação sem dados e verificação profissional.

Antes do uso comercial: revisão jurídica do modelo, política de privacidade e retenção, backup/exportação de registros, assinatura eletrônica com verificação/auditoria se necessária, assinatura de produção para distribuição e testes reais de câmera, PDF, impressão, assinatura e recuperação após fechar o app.

## Verificação

Executar node tests/estimators.test.cjs, npx expo lint, npx tsc --noEmit, npx expo-doctor e compilação Android. Os testes cobrem cálculo com vírgula decimal, teto, aberturas, rendimento acabado/por demão, entradas inválidas, custos por quantidade, datas e isolamento/escape do conteúdo contratual. Registrar separadamente o que foi observado no emulador e o que ainda necessita teste físico.
