# OrcaFacil Pro — ponto de retomada

Atualizado em 15/10/2026.

## Projeto correto

O aplicativo Android instalado pelo usuário é **OrcaFacil Pro**, com fontes neste diretório `android-app`. O HTML na raiz do repositório é um protótipo web separado, sem migração automática de dados entre os dois.

## Versão entregue

- Android 1.3.0, versionCode 5, pacote `com.brs.orcafacilpro`.
- Download: https://github.com/fabiochequeribeiro/orcafacil-servicos/releases/download/android-v1.3.0/OrcaFacil-Pro-1.3.apk
- APK universal: 93.694.317 bytes; SHA-256 `F9D804976707E9EFA47560E8DD036B1CCA6DFEE69D984BFAEA6E37D0620758AE`.
- Compilado com JDK 17. Assinatura de desenvolvimento igual à versão 1.2; material de assinatura mantido apenas localmente.

## Implementado

Calendário mensal de domingo a sábado, seis semanas, títulos de compromissos destacados, navegação entre meses, dia atual e grade diária ao tocar em uma data. Criar compromisso ao tocar no horário; duração e verificação de conflitos. Contratos, fotos, serviços e orçamentos existentes permanecem no aplicativo. Chaves de armazenamento local não foram alteradas.

## Verificado

Typecheck, Expo lint e testes de cálculos/agenda passaram. Gradle assembleRelease concluiu. Assinatura do APK e metadados foram conferidos. No Pixel_7, instalação 1.2 seguida de atualização 1.3 sem desinstalar foi aceita. Calendário, abertura do dia e compromisso das 9h às 11h foram conferidos na interface. Emulador e ajustes temporários de teste foram encerrados/restaurados.

## Pendências e limites

Conferência no celular físico, migração de todos os registros reais e nova validação de contratos, fotos e PDF não foram realizadas nesta atualização. Não há sincronização com Google Agenda. Não desinstalar nem limpar dados para atualizar. Havendo conflito de assinatura, preservar a instalação existente e investigar. O próximo passo é receber o retorno do usuário sobre a instalação e a agenda em seu aparelho.

## Continuidade

Consultar este arquivo antes de editar o app. Não substituir a versão nativa pelo protótipo HTML. Código e releases estão no GitHub; a assinatura anterior deve ser preservada fora do repositório. Não publicar segredos, dados reais de clientes ou a chave de assinatura.
