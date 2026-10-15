# OrçaFácil Serviços

Aplicativo web para orçamentos de elétrica, hidráulica, móveis e pequenos reparos, com agenda mensal e diária, fechamento com fotos, Pix e PDF.

## Abrir e instalar

https://fabiochequeribeiro.github.io/orcafacil-servicos/

No Android, abra o endereço no Chrome e use o menu **Instalar aplicativo** ou **Adicionar à tela inicial**. Reabra o app com internet para obter atualizações.

## Dados

Os dados ficam no armazenamento local do navegador. Não há banco de dados remoto ou sincronização com Google Agenda. Dados de outra origem ou de um arquivo HTML local não são transferidos automaticamente. Não desinstale a versão antiga nem limpe seus dados antes de conferir os registros.

O aplicativo pode abrir offline depois do primeiro acesso. Geração de PDF depende das bibliotecas externas da CDN; QR Code Pix e compartilhamento dependem de internet. Preços do catálogo são exemplos editáveis no código, não uma tabela de mercado validada.

## Histórico

15/10/2026: agenda mensal com compromissos destacados, grade diária, agendamento por horário e bloqueio de sobreposição. Inclusão de manifesto e service worker para instalação como aplicativo web.

## Executar localmente

`python -m http.server 8000`

Abra http://localhost:8000. Nenhuma etapa de build é necessária.
