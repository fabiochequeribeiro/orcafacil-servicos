# OrcaFacil Pro — Android

Aplicativo React Native / Expo SDK 57. Versão 1.3.0, versionCode 5, pacote com.brs.orcafacilpro.

Esta é a continuação do aplicativo Android OrcaFacil Pro 1.2, com contratos, orçamentos, pintura, fotos, agenda e armazenamento local. O site na raiz do repositório é um protótipo web separado.

## Mudança 1.3

Agenda mensal com seis semanas, domingo a sábado, títulos dos compromissos destacados e navegação entre meses. Tocar no dia abre uma grade de horários; tocar no horário cria um compromisso. Duração de 30 minutos, 1, 2, 4 ou 8 horas. Detecção de conflitos com eventos pessoais e visitas com horário definido. Registros antigos sem duração são tratados como uma hora. Contratos e referências de fotos são preservados.

## Desenvolvimento

`npm ci`

`npm run start`

`npx tsc --noEmit`

`npm run lint`

`node tests/estimators.test.cjs`

As pastas nativas geradas não são versionadas. A distribuição de teste foi compilada localmente usando o projeto Android e a assinatura da versão 1.2 existentes. Para gerar atualizações compatíveis, é obrigatório usar o mesmo certificado anterior; ele não está publicado neste repositório. Não regenerar a assinatura e instruir desinstalação como solução para conflito de atualização, pois os dados são locais.

No Windows, a compilação nativa pode exigir um diretório curto para o CMake. Não há credenciais de API ou dados reais de clientes neste repositório.
