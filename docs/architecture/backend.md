# Composição do backend

`functions/src/index.ts` inicializa Admin por `bootstrap/admin.ts` e reexporta os
handlers. Nenhuma regra de negócio fica no entrypoint. O bootstrap verifica o
app `[DEFAULT]` e pode ser importado novamente sem erro de inicialização dupla.
Os módulos não inicializam Admin ao importar uma regra pura.

A mídia está em `modules/posts`: handlers finos compõem parsers, autorização,
serviço de aplicação e adaptadores. O serviço usa portas de repositório,
storage, relógio e IDs; não importa Firebase, AWS ou HTTP. Firestore mantém as
transações; R2 mantém assinaturas, HEAD, copy e delete. O antigo arquivo de
handlers misturados foi removido após a caracterização dos três comandos.

`config/functions-exports.json` registra os 24 contratos antes da extração:
nome, região, geração, callable/HTTP/evento, segredos declarados e opções de
execução. Contém somente nomes de segredos, nunca valores. O trigger Auth v1
continua v1; os demais continuam v2. `pnpm run test:backend` compila e compara
metadados efetivos com esse contrato em projeto demo, sem invocar handlers.

O teste do pacote isolado da CI também carrega esses exports fora do workspace.
Não importar código do cliente no backend. Novos módulos entram por portas
pequenas nas tarefas B02–B12, preservando seus adaptadores até a substituição
ser testada. Esta etapa não fez deploy nem tocou cobrança ou dados de usuários.

O primeiro caso de uso com porta é `requireRegisteredAccount`. Ele recebe
`AccountRegistrationReader`, independente de Firestore. O adaptador conserva as
duas leituras paralelas de conta/perfil e a regra de compatibilidade: conta
existente OU perfil legado concluído. Falha de infraestrutura não vira cadastro
válido. `verifyRegisteredUser` mantém a API e compõe caso de uso/adaptador.

`OperationError` expressa erro esperado sem SDK; `toCallableError` mantém código
e mensagem do contrato externo. Outros erros são preservados para o tratamento
existente. Clock, gerador de IDs e provedor só ganham portas quando houver caso
de uso consumidor nas extrações seguintes; não criar interfaces vazias para
cumprir uma lista. Não há Repository genérico nem import do cliente no backend.

RequestContext é derivado somente do contexto autenticado fornecido pelo runtime
Firebase: UID, recência e claim admin booleana. Não preserva token, email ou
payload. Os helpers de ownership e recência mapeiam erros de domínio para os
mesmos códigos externos. A exclusão própria mantém dez minutos, aceita pequena
folga de relógio e recusa token sem auth_time válido ou muito futuro. Nenhuma
claim foi concedida; o helper administrativo será usado pelos novos comandos,
sem transformar papel da interface em autorização.

Os três comandos de mídia agora declaram suas chaves aceitas em
`modules/posts/mediaCommandFields.ts`, rejeitam campos de sistema e limitam o
JSON UTF-8 a 16 KiB. Identificadores não aceitam segmentos de caminho ou trim
silencioso; o limite de uploadId continua 80. Payloads do cliente atual foram
conferidos. Essa validação exige ensaio dos clientes suportados antes de deploy;
outros comandos ganham allowlists nas extrações B05–B12.

Os testes de mídia conservam criação/quota/intenção, falha de assinatura,
finalização direta, completed, dono, expiração, arquivo ausente/incompatível e
ordem da exclusão. A finalização completed ainda confere expiração antes de
retornar, conforme v1. Há dívidas preservadas explicitamente: a cópia ocorre
antes da transação; erro de commit pode deixar objeto copiado, e exclusão de
objeto antecede a do documento. I01/I04 substituem esse protocolo por recuperação
durável; B04 não declara idempotência completa ou inspeção real do binário.
Falha de HEAD ainda segue o erro v1 de arquivo não encontrado; classificar
indisponibilidade/retry do provedor faz parte da evolução, sem sucesso fictício.

O teste integrado usa Firestore real do emulador e R2 simulado: verifica campos,
Timestamp, publicação atômica, conflito sem sobrescrita e quota transacional.
Os testes de Rules compilam o backend antes de executar. Build de Functions
limpa somente `lib` validado dentro do próprio pacote; o smoke independente
compila de fonte em diretório sem `lib`, impedindo sucesso por saída obsoleta.

## Curtidas e visualizações

`modules/engagement` separa as transições puras, o caso de uso, a transação
Firestore e os handlers. Somente o retorno da tentativa confirmada de
`runTransaction` determina `recorded`. Uma tentativa descartada não altera uma
variável externa nem a resposta final. O teste do adaptador simula a tentativa
descartada que pretendia gravar e a tentativa confirmada que encontra o marcador
já criado por outra chamada; o resultado é `recorded: false`.

O contrato v1 continua usando marcador por UID/publicação e uma visualização
por conta. Curtir o que já está curtido e remover uma curtida ausente não
incrementam nem diminuem novamente os contadores. Post ausente ou fora de
`published` permanece indisponível; shares e demais campos de métricas são
preservados. Não mudou a definição de visualização nem o limiar do player.

Os comandos aceitam somente `playerId` e, em curtidas, `liked` booleano. Campos
extras e alias vazio `approved-` são recusados antes da transação. O prefixo
compatível continua apontando para o post e as chaves de métricas v1 não são
renomeadas nesta extração. Esse alias pode ser ambíguo para um ID físico iniciado
por `approved-`; G01 deve inventariar a correspondência antes de qualquer
migração. Não foi aplicado strip genérico em IDs ou documentos implantados.

Dois tipos de prova se complementam: o teste de retry controla as tentativas do
adaptador e os testes com Admin SDK no emulador executam chamadas concorrentes,
repetição, contas diferentes e publicação indisponível. As Rules de leitura e
negação de escrita direta continuam cobertas pela suíte cliente. Metadados dos
24 endpoints devem continuar idênticos antes de promover o pacote.
