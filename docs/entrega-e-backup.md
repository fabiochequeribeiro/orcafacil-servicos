# Entrega e recuperação do Orça Fácil Pro

## Antes de fechar uma versão

1. Registre a versão, os problemas corrigidos e o commit do código usado no build.
2. Guarde o código e os scripts de compilação. Preserve a chave de assinatura Android separadamente em armazenamento privado, com recuperação testada.
3. Gere o executável ou atualizador Windows e o APK Android da mesma versão. No Android, confira o pacote, a assinatura e o aumento do código de versão para permitir atualização sobre a instalação anterior.
4. Teste a instalação sobre a versão anterior com dados de teste. Confira a abertura, os pedidos existentes, as fotos, o PDF em uma folha e os contadores da barra lateral.
5. Teste a sincronização nos dois sentidos com a mesma conta de teste. Crie ou altere um orçamento no PC, confira no Android e repita no sentido contrário com múltiplos anexos. Reabra os dois apps e confira que as fotos e os pedidos permanecem disponíveis.
6. Anexe os dois instaladores, os hashes SHA-256 e as notas de versão a um release do GitHub. Reabra o release e confira os arquivos. Guarde uma cópia local dos mesmos arquivos.
7. Mantenha uma cópia privada do banco e dos arquivos vinculados, inclusive os objetos usados na sincronização. Registre a data da última cópia e teste uma restauração separada. O repositório público e os instaladores não substituem o backup dos dados.

## Estado em 24/11/2026

- Windows 1.30.2 de teste: atualizador e ZIP de reconstrução disponíveis no rascunho **Orça Fácil Pro — backup dos instaladores**, na [página de releases](https://github.com/fabiochequeribeiro/orcafacil-servicos/releases).
- Android: APK 1.30.1 recuperado. O projeto original e a assinatura compatível para produzir o APK 1.30.2 ainda precisam ser recuperados ou confirmados.
- O teste de sincronização de 1.30.2 com o celular e o backup restaurável dos dados ainda estão pendentes.

## Assinatura Android recuperada

Os APKs 1.30.0 e 1.30.1 têm o mesmo certificado público SHA-256, `FAC61745DC0903786FB9EDE62A962B399F7348F0BB6F899B8332667591033B9C`. Esse valor também consta na documentação do Android 1.3. Ele serve para conferir uma chave recuperada, sem substituir a chave privada usada para assinar.
