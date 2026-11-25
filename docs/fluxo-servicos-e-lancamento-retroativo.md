# Fluxo de serviços e lançamento retroativo

Proposta para a reconstrução do Orça Fácil Pro em Windows e Android. A versão instalada e os dados atuais não são alterados por este documento.

## Navegação

- **Início** reúne os números e oferece **Novo orçamento** e **Registrar serviço já feito**.
- **Orçamentos** separa rascunhos, enviados aguardando aceite e recusados.
- **Pedidos** reúne as etapas **A agendar**, **Agendados**, **Em execução** e **Finalizados**, com contadores. Um pedido operacional aparece em uma etapa de cada vez.
- **Agenda** é a visualização por data para visitas e serviços. Visita de vistoria pode ocorrer antes do orçamento e é opcional.
- **Financeiro** acompanha valores a definir, a receber, recebimentos parciais e quitados. O pagamento tem status e datas próprios.
- **Pendências** reúne lembretes acionáveis e aponta para cada pedido. Um lembrete não muda a etapa de execução.
- **Clientes** e **Mais** agrupam cadastro, documentos, arquivos e configurações.

## Caminhos de trabalho

Fluxo normal: orçamento → aceite → pedido → agendamento opcional → execução → finalização. Se o orçamento já for um pedido, registrar o fato no mesmo histórico, sem criar duplicata.

Fluxo retroativo: registrar um serviço feito diretamente como **Finalizado**, com cliente ou identificação, descrição e data real da execução. Pode vincular um pedido existente. Guardar a data de lançamento separadamente e permitir registrar somente a data quando a hora for desconhecida. O dia da visita, do aceite, da execução, do registro e do pagamento só são informados quando conhecidos. Um registro retroativo não cria compromissos futuros nem dispara notificações de agendamento.

Se o serviço já foi executado, o usuário pode finalizar diretamente um pedido existente. Permitir acrescentar depois valor, itens, fotos, PDF, assinatura, CNPJ e comprovante de aprovação. Aprovação por mensagem fica registrada como tal, com data e um ou mais anexos, separada do contrato assinado. Se o aceite não estiver documentado, a pendência permanece visível.

## Fotos e relatório no mesmo pedido

- **Registrar serviço já feito** oferece **Fotos do antes** e **Fotos do depois** no próprio lançamento, com seleção de várias imagens e identificação opcional por ambiente, ponto ou etapa.
- Ao finalizar um pedido existente, recuperar automaticamente as fotos de vistoria que já pertencem ao orçamento. O usuário só acrescenta ou associa as fotos do depois, sem carregar novamente as do antes.
- Aproveitar os pares de fotos e o relatório final existentes. O atalho pode salvar e seguir para **Revisar relatório**, sem abrir outro pedido ou criar outro modelo de relatório.
- **Finalizar serviço** registra que a execução aconteceu. **Emitir relatório** registra o documento no momento em que o conteúdo estiver conferido. Fotos ausentes viram pendências visíveis e podem ser completadas antes da emissão.
- Preservar relatórios já emitidos, seus anexos e verificações de integridade. Se novas fotos precisarem entrar depois de uma emissão, tratá-las como revisão documentada.
- No teste de sincronização, conferir um pedido com mais de um ambiente e múltiplas fotos em cada etapa. Abrir o relatório nos dois aparelhos e conferir o vínculo e a ordem das imagens.

## Validação e alertas

- Para salvar o lançamento, exigir identificação do cliente ou serviço, descrição e, se marcado como já executado, data de execução válida.
- Para fechar o serviço, fotos, assinatura, CNPJ, contrato, horário, agendamento e pagamento podem ficar pendentes. Manter o significado real de cada registro.
- Para uma ação específica como lançar pagamento ou gerar determinado documento, exigir apenas os dados de que aquela ação depende. Valor desconhecido fica **A definir** e não entra como zero ou como recebido.
- Mostrar a etapa operacional, o status financeiro e os lembretes no mesmo pedido. Contadores devem refletir os mesmos filtros das listas.
- Salvar quem registrou ou alterou o serviço e quando, preservando datas reais, anexos e contratos existentes. Verificar duplicidades ao salvar e repetir a sincronização.

## Verificação antes da entrega

1. Criar um orçamento, aprovar, agendar, iniciar e finalizar.
2. Registrar um serviço de ontem sem horário, contrato ou foto e conferir que aparece em Finalizados com pendências.
3. Finalizar diretamente um pedido já cadastrado e conferir que não surge outro pedido.
4. Registrar recebimento parcial ou quitado com a data real e conferir os totais.
5. Sincronizar nos dois sentidos usando dados fictícios. Conferir estado, datas, anexos e contadores depois de reabrir os aplicativos.

## Referências

- [Jobber — serviços avulsos e agendamento posterior](https://help.getjobber.com/en/articles/create-a-one-off-job/)
- [Housecall Pro — finalizar serviço que nunca foi agendado](https://help.housecallpro.com/en/articles/2832091-jobs-invoices-how-to-delete-cancel-and-restore)
