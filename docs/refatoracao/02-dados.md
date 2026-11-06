# Organização dos dados e migrações — Folko

Revisão de produto: 2026-11-05. A [direção Folko](05-direcao-folko.md) preserva os dados e recursos atuais, generaliza o cadastro e acrescenta texto ao destino do feed. O banco não é renomeado por causa da marca.

## 1. Status da proposta

Este documento define um modelo lógico candidato. Não é um schema implantado, inventário dos documentos reais ou prova das permissões em produção.

D00 já tem inventário em estado.json e docs/architecture/ambientes.md: Standard/Native, banco padrão, southamerica-east1. Antes de qualquer nova escrita/migração, conferir o alvo e atualizar o inventário necessário de versões, índices, TTL, backups e identidades de serviço; não apresentar lacuna não consultada como inexistência. O código usa a API Firebase/Firestore e o banco padrão; preservar esse contrato até uma decisão explícita em contrário. Uma API específica de outra edição não pode ser introduzida por suposição.

Não criar um banco novo, mudar a região ou presumir Enterprise porque a CLI não conseguiu consultar metadados. Também não presumir Standard apenas porque o SDK atual funciona.

## 2. Princípios do modelo

- Uma autoridade por informação. Perfil é autoridade de identidade social; publicação é autoridade do conteúdo; provedor é autoridade do estado de assinatura; cache local é apenas cache/rascunho.
- Relações que crescem viram documentos consultáveis. Arrays pequenos de tamanho fixo ou limitado continuam aceitáveis: duas pessoas em uma conversa, tags limitadas, tipos de permissão.
- Separar dados de conta, perfil social, preferências privadas, cobrança e verificação de identidade.
- Desnormalizar somente projeções úteis para consultas. Toda cópia tem um dono, versão de origem e rotina de reconstrução.
- Usar IDs estáveis, datas do servidor e `schemaVersion` quando houver mudança de contrato. O campo de versão deve primeiro ser aceito pelas regras e pelos leitores.
- Objetos de mídia ficam no armazenamento; Firestore guarda metadados e referências, não o arquivo nem URLs assinadas duráveis.
- Uma consulta nasce junto com sua permissão, ordenação, limite, cursor, índice e caso de teste.

Listas crescentes em documentos exigem cuidado de tamanho e de leitura; subcoleções permitem consultar os itens individualmente. [Estrutura de dados](https://firebase.google.com/docs/firestore/manage-data/structure-data).

## 3. Dicionário das coleções

`Manter` significa preservar o caminho inicialmente, não dispensar validação. Todas as mudanças são aditivas até o corte de compatibilidade.

| Caminho | Situação/destino | Autoridade de escrita e leitura |
|---|---|---|
| `accounts/{uid}` | Manter; metadados privados de cadastro e ciclo de vida | Servidor; leitura individual pelo dono. Conservar temporariamente o protocolo atual de criação por cliente validado |
| `pendingAccounts/{uid}` | Manter durante confirmação de email; política de expiração explícita | Operações de cadastro estritamente validadas; leitura individual do dono |
| `profiles/{uid}` | Manter como projeção social limitada | Dono altera campos sociais permitidos; servidor controla selo, plano e moderação. Leitura social permanece restrita conforme o produto atual |
| `usernames/{normalizedUsername}` | Manter reserva única e transacional | Operação de perfil validada; não abrir listagem completa |
| `profileMedia/{uid}` | Manter referência e enquadramento de avatar | Servidor; dados sociais mínimos de imagem |
| `professionalProfiles/{uid}` | Criar se a configuração profissional continuar funcional no produto | Dono edita categoria/link/enabled; nenhum campo permite conceder plano pago |
| `posts/{postId}` | Manter, evoluir com adaptadores | Autoridade do conteúdo; comandos de publicação/moderação/exclusão no servidor |
| `postEngagement/{postId}` | Normalizar ID legado; projeção de métricas | Somente servidor; leitura dos itens autorizados/visíveis |
| `userPostLikes/{uid}/posts/{postId}` | Manter, normalizar ID legado | Comando idempotente do servidor; leitura pelo dono, limitada aos itens necessários |
| `userPostViews/{uid}/posts/{postId}` | Manter inicialmente a semântica atual de visualização única por usuário/post | Servidor; não carregar histórico inteiro no boot nem introduzir TTL que altere essa semântica |
| `follows/{edgeId}` | Manter coleção raiz; consultar por `followerUid` ou `targetUid` | Identidade do seguidor validada; mover escrita para comando protegido com fase de compatibilidade |
| `postComments/{commentId}` | Manter; adicionar consultas por `postId` | Autor autenticado; servidor/regras validam referência, resposta e campos de autor |
| `notifications/{notificationId}` | Manter; consulta por destinatário e tempo | Servidor cria; destinatário confirma leitura por operação validada |
| `directMessages/{messageId}` | Legado temporário, não apagar no início | Preservar protocolo atual enquanto a migração de conversas não for concluída |
| `conversations/{conversationId}` | Novo agregado de conversa individual | Servidor mantém duas identidades participantes imutáveis; leitura somente por participante |
| `conversations/{conversationId}/messages/{messageId}` | Novo histórico paginado | Servidor cria; recibos monotônicos validados por destinatário |
| `userInboxes/{uid}/conversations/{conversationId}` | Nova projeção privada para listar conversas | Servidor mantém resumo e não lidos; leitura exclusiva do dono |
| `socialPreferences/{uid}` | Legado temporário de arrays/mapas | Ler durante transição, sem crescer indefinidamente |
| `userData/{uid}/preferences/app` | Novo documento pequeno de preferências | Dono altera somente campos de preferência, com limites |
| `userData/{uid}/blockedProfiles/{targetUid}` | Nova relação privada de bloqueio | Dono/serviço de preferências; comandos sociais consultam política no servidor |
| `userData/{uid}/hiddenPosts/{postId}` | Nova preferência privada por item | Dono; não equivale a excluir a publicação |
| `userData/{uid}/mutedTopics/{topicId}` | Nova preferência privada por assunto | Dono; identificador normalizado e limite operacional |
| `userData/{uid}/conversationStates/{conversationId}` | Pin, mute e corte de histórico por usuário | Dono altera somente preferências; não muda membros, mensagens ou métricas do servidor |
| `tagCatalog/{tagKey}` e subcoleções `posts`, `users` | Manter como catálogo e marcadores derivados | Backend; reprocessamento precisa produzir o mesmo resultado |
| `subscriptions/{uid}` | Manter contrato; autoridade operacional de assinatura | Somente backend a partir do Mercado Pago; leitura individual do dono |
| `identityVerifications/{uid}` | Manter resultado mínimo de verificação | Somente backend autorizado; leitura individual, sem documentos KYC no perfil público |
| `entitlements/{uid}` | Criar projeção reconstruível de permissões efetivas se necessária | Servidor; acesso individual. Não substituir validação de assinatura pela confiança em uma flag enviada pelo app |
| `billingEvents/{eventKey}` | Nova caixa de entrada técnica de eventos | Servidor; acesso operacional restrito, conteúdo sanitizado |
| `mediaUploadIntents/{uploadId}`, `avatarUploadIntents/{uploadId}` | Manter, evoluir para máquina de estados | Servidor; expiração e retomada sem conceder acesso a outros usuários |
| `operationJobs/{jobId}` | Novos registros duráveis de processamento e limpeza | Servidor/workers; acesso administrativo restrito |
| `mediaRateLimits`, `socialRateLimits`, `tagRateLimits` | Manter inicialmente, com retenção e política de contenção | Somente servidor; não expor a clientes |
| `reports/{reportId}` | Nova denúncia operacional se a funcionalidade for mantida | Denunciante cria via comando; revisão administrativa, sem listagem pública |
| `moderationDecisions/{decisionId}` | Nova decisão auditável de moderação | Servidor autorizado; visibilidade mínima para autor/admin |
| `auditEvents/{eventId}` | Nova trilha sanitizada de ações críticas | Somente servidor; acesso e retenção controlados |
| `migrationRuns/{runId}` e checkpoints | Novo controle operacional de migrações | Ferramenta administrativa; nenhum acesso pelo cliente |

Campanhas simuladas não viram cobrança real durante esta refatoração. Decidir em `D02` se continuam como demonstração isolada no dispositivo ou como domínio persistido. Em ambos os casos, marcar `simulation` e impedir mistura com assinatura real.

## 4. Campos e invariantes por agregado

### Conta e perfil

- `accounts`: `uid`, estado da conta, versão do cadastro, provedor, datas do servidor e referências/versionamento do aceite quando definidos pelo produto.
- Email e credenciais continuam no Firebase Auth; não duplicar senhas ou tokens no Firestore.
- `profiles`: `uid`, `username`, nome, bio, apresentação, cidade/organização, interesses por hashtags limitados, área legada preservada (vazia em novos perfis), referência de avatar, datas e campos sociais permitidos.
- `identityVerified` e `plusActive` são projeções exclusivas do servidor. Preservar a regra atual: o selo pago depende de identidade aprovada e assinatura autorizada.
- P01 mantém as chaves legadas sport/position/club para área/apresentação/organização no formulário geral. Não converter registros nem impor um enum esportivo; renomeação física e mudança de obrigatoriedade seriam outra migração.
- A idade exata hoje faz parte do perfil. Classificar esse dado antes da evolução: não inventar data de nascimento nem ampliar exposição. Qualquer substituição por faixa etária depende de decisão de produto/privacidade e de plano para os dados legados.
- “Perfil público” neste documento significa perfil social dentro das permissões atuais; não autoriza liberar acesso anônimo.
- `username` normalizado e reserva são atualizados atomicamente. Não usar nome de usuário como chave primária de relações.

### Publicação e mídia

Separar estes estados, mesmo se os metadados continuarem no mesmo documento inicialmente:

```text
upload: created -> uploaded -> verifying -> processing -> ready | failed | expired
post:   draft -> processing -> published -> hidden | rejected | deleting -> deleted
job:    pending -> running -> succeeded | retryable_failed | permanently_failed
```

São estados propostos. A ficha correspondente deve especificar transições legais, responsáveis, precondições e política de repetição antes de implementá-los.

O contrato existente de `posts` mantém `postId`, `authorId`, título/descrição, tags/menções limitadas, `mediaType`, status, datas e referência de mídia. P04 propõe o contrato adicional de texto: corpo válido, tipo/versão explícitos, autoria/estado/datas e ausência de arquivo. Os leitores, as Rules e a ativação por capacidade/coorte devem preceder a escrita nova, sem invalidar v1, esconder suas fotos/vídeos em páginas parciais ou expor drafts. Não basta tornar mediaType opcional no código e publicar. Metadados de arquivo incluem provedor, bucket lógico, chave imutável, tamanho, MIME verificado, dimensões, duração verificada e variantes/thumbnail quando existirem.

O schema atual do cliente reconhece apenas `published`. Primeiro adicionar leitores tolerantes aos novos estados; depois publicar esses estados no servidor. Feed e Rules devem permitir apenas conteúdo publicável para a audiência correta. Posts em processamento não entram no feed por um fallback do normalizador.

O backend atual confere `ContentLength`/`ContentType` no R2 e recebe duração/dimensões do cliente. A evolução deve verificar o conteúdo real em ambiente apropriado, com limites de CPU, memória, tempo e tamanho. MIME e duração informados pelo app não são prova suficiente de validade do arquivo.

### Relações e métricas

- `follows`: `followerUid`, `targetUid`, `createdAt`. `targetProfileId` legado é traduzido no adaptador.
- O identificador de relação nova deve ser determinístico e sem ambiguidades, por exemplo hash de uma tupla JSON versionada de UIDs. Isso evita duplicação, não substitui autorização.
- Curtidas: uma existência por `(uid, postId)`. O comando define o estado desejado, não “incrementa a cada clique recebido”.
- Visualização: conservar primeiro a definição atual de unicidade. Definir por escrito se o produto quiser passar a contar sessão/dia/repetição; isso é outra mudança de comportamento.
- Métricas são projeções reconciliáveis. Contadores fragmentados entram somente se a carga mostrar contenção; introduzem custo de leitura e reconciliação. [Contadores distribuídos](https://firebase.google.com/docs/firestore/solutions/counters).

### Comentários e notificações

- Comentário tem `postId`, autor UID, corpo limitado, data do servidor e referência opcional à resposta. Validar que o pai pertence ao mesmo post.
- Nomes/avatares copiados são snapshots para apresentação, nunca autoridade de identidade. Decidir e documentar quando são atualizados.
- Notificação tem destinatário, ator, tipo, referência, data, leitura e chave de origem para deduplicação.
- Entrega de evento pode repetir e chegar fora de ordem. Projeções leem o estado autoritativo atual e usam marcadores/versões, em vez de presumir execução única. [Eventos de Firestore](https://firebase.google.com/docs/functions/firestore-events).

### Conversas e mensagens

`conversationId` de conversa individual é derivado de dois UIDs ordenados e serializados sem ambiguidade. Não usar username nem o texto de exibição do perfil.

| Documento | Campos mínimos propostos |
|---|---|
| Conversa | `participantIds` com exatamente dois UIDs, `createdAt`, `updatedAt`, última mensagem/revisão |
| Mensagem | `senderUid`, `recipientUid`, corpo e/ou referência compartilhada, data do servidor, `clientOperationId`, versão e recibos |
| Inbox por participante | referência da conversa, resumo mínimo, `lastMessageAt`, ordenação, não lidos e versão da projeção |
| Estado por participante | fixação, silenciamento e cursor/data de ocultação do histórico |

Mensagens são append-only para o cliente. O mesmo `clientOperationId` reenviado após timeout não cria outra mensagem nem outro compartilhamento. Uma nova operação legítima recebe outro ID.

Recibos não regridem de lido para entregue. Remetente não pode declarar leitura pelo destinatário. Começar preservando `deliveredAt`/`readAt` por mensagem; qualquer otimização para cursor de leitura por conversa precisa de prova de equivalência.

Para apresentação temporal, `createdAt` define ordem; relógio local não é autoridade. `deliveredAt >= createdAt` e `readAt >= deliveredAt` precisam de uma política explícita para timestamps legados e confirmação recebida no mesmo commit. Não corrigir registros inválidos inventando datas; isolar inconsistências e registrá-las para reconciliação.

Ocultar conversa para uma pessoa não apaga o histórico da outra. Reconstrução de inbox não pode ressuscitar uma conversa anterior ao corte de histórico do usuário.

### Assinatura, verificação e cobrança

- Preservar IDs do provedor, estados reconhecidos e vínculo proprietário já existente.
- Domínio financeiro usa centavos e moeda explícita; adaptador documenta conversão de `amount` legado. Não multiplicar valores existentes sem conhecer a unidade.
- Webhook continua validando assinatura e consulta o provedor antes de conceder benefício. [Documentação Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs/subscriptions/additional-content/your-integrations/notifications/webhooks).
- Deduplicar entrega não é descartar todos os eventos do mesmo `data.id`: o mesmo recurso pode mudar legitimamente de estado. Guardar ID/versão de evento quando disponíveis e reconciliar o estado atual por recurso.
- Validar vínculo da assinatura à conta, produto, ambiente, moeda e valor esperado. Um payload autenticado ainda precisa dessas verificações de negócio.
- Projetar os benefícios a partir da assinatura e identidade atuais, com uma única política. Eventos antigos não podem reativar benefício cancelado ou identidade rejeitada.
- Não armazenar número de cartão, segredo de webhook, token do provedor ou documentos de identidade no perfil social, logs ou cache do app.

## 5. Catálogo mínimo de consultas

Valores abaixo são limites iniciais propostos, a validar com UX/custo. Todo repositório retorna `items`, `nextCursor` e `hasMore`; fim de lista não é inferido de um limite global.

| Uso | Filtro/ordem lógica | Página | Tempo real |
|---|---|---:|---|
| Feed | `posts`, `status=published`, `createdAt desc`, desempate pelo ID | 20 | Somente janela recente/visível |
| Galeria de autor | `authorId=uid`, status permitido, data e ID | 20 | Janela recente do autor |
| Perfis | UID/username exatos ou prefixo normalizado com critérios documentados | 20 | Não assinar todos os perfis |
| Seguindo | `follows`, `followerUid=uid`, data e ID | 30 | Somente relações da conta/contexto necessário |
| Seguidores | `follows`, `targetUid=uid`, data e ID | 30 | Tela/modal aberto |
| Comentários | `postComments`, `postId=postId`, `createdAt`, ID | 30 | Post selecionado e modal aberto |
| Métricas | IDs dos posts montados/visíveis | conjunto limitado | Cancelar fora da janela |
| Inbox | subcoleção do próprio usuário, `lastMessageAt desc`, ID | 30 | Janela recente |
| Histórico | subcoleção da conversa autorizada, `createdAt desc`, ID | 50 | Última janela da conversa ativa |
| Notificações | destinatário UID, `createdAt desc`, ID | 30 | Janela recente do destinatário |
| Tags | ranking/catálogo limitado e cursor | 30 | Sem catálogo ilimitado no boot |

Não paginar por offset. Cursor deve incluir todos os campos de ordenação e um desempate estável; datas iguais não podem perder/duplicar itens. Inserções ao vivo não devem reordenar silenciosamente todas as páginas históricas. [Cursores](https://firebase.google.com/docs/firestore/query-data/query-cursors).

Se `hasMore` representar continuação observada, usar lookahead de um documento e devolver apenas os N itens da página. O catálogo, as Rules e o orçamento de leitura devem considerar esse N+1 físico. Mudanças concorrentes podem esvaziar a próxima página mesmo após o lookahead; isso deve encerrar a paginação normalmente, sem tratar a situação como corrupção.

Firestore não deve ser apresentado como um motor arbitrário de busca textual. Começar com identificador exato, prefixos suportados e filtros estruturados. Se busca por vários termos e relevância global for requisito, criar uma decisão de serviço de busca, custo e privacidade; não simular busca completa baixando 200 perfis.

Sugestões usam candidatos limitados por critérios explícitos, hidratação em lote e ranking sobre essa janela. Não prometer que um ranking local de uma página representa a relevância de toda a base.

## 6. Índices e acesso

`D03` deve transformar cada linha de consulta em um registro com coleção, escopo, filtros, direções, campos de cursor, Rules e teste. Exemplos de índices candidatos:

- Posts por status/data e por autor/status/data.
- Follows por seguidor/data e por alvo/data.
- Comentários por post/data.
- Notificações por destinatário/data.
- Inbox por campo de ordenação da conversa, quando exigido pela consulta real.
- Jobs por status/próxima execução e migrações por estado/checkpoint, se esses filtros forem utilizados.

Esses exemplos não são JSON pronto para deploy. Confirmar índices implícitos, direção do desempate, escopo de coleção e edição real antes de gerar `firestore.indexes.json`. Não criar índices para todas as combinações imagináveis. Campos grandes que nunca são pesquisados podem receber isenções após verificar usos e retenção. [Índices](https://firebase.google.com/docs/firestore/query-data/indexing).

Rules não filtram documentos depois da consulta. Query e permissão precisam ser compatíveis desde o início; testar tanto acesso individual quanto listagem. [Consultas seguras](https://firebase.google.com/docs/firestore/security/rules-query).

Matriz de acesso obrigatória em testes: anônimo, email não verificado, conta incompleta, dono, outro usuário, participante de conversa, não participante e administrador com claim validada. Campos de sistema não são editáveis pelo dono do perfil. Restrição por `hasOnly` deve considerar criação e atualização, imutabilidade e documentos legados.

Não prometer sigilo de mídia já servida por URL pública do R2 apenas porque o Firestore negou o documento. Bloqueio social, autorização do metadado e acesso ao arquivo são políticas diferentes.

## 7. Cache e armazenamento local

- Separar cache remoto, rascunho e simulação. Não misturar os três no mesmo snapshot de estado.
- Toda chave de dado de conta contém UID e versão de schema. Preferências do dispositivo, como tema, têm escopo explícito e não carregam conteúdo de outras contas.
- Logout/troca de conta limpa memória, assinaturas, URLs temporárias e o cache privado conforme a política; não apaga rascunho sem um fluxo explícito.
- Escrever migrações para `@nextstar/...`, `@xolot/...` e versão 6. Idempotência local: rodar duas vezes produz o mesmo estado.
- Ler primeiro o novo formato; fallback legado apenas durante a transição, sem reimportar conteúdo ocultado/deletado.
- Não remover cache legado até que a conversão e a sincronização tenham confirmação e teste.
- `AppUser` deve separar identidade autenticada de perfil social. Um perfil de terceiro não contém email ou consentimento inventado para satisfazer um tipo.

## 8. Protocolo de migração

1. **Inventariar:** identificar campos ausentes, IDs legados, referências órfãs, duplicatas, tipos de datas e contagens por domínio. Não inferir dados pessoais inexistentes.
2. **Provar recuperação:** exportação/backup autorizado, restauração em destino isolado e tempo de recuperação medido.
3. **Expandir:** publicar schema e Rules aditivos, índices e leitores compatíveis; aguardar índices prontos.
4. **Proteger novas escritas:** comandos preservam formatos necessários ou registram uma operação durável para projetar as duas versões. Não depender de dois `setDoc` disparados pelo cliente como se fossem atômicos entre sistemas.
5. **Executar dry-run:** zero escrita; produzir contagens e amostras sanitizadas de inconsistências.
6. **Copiar em lotes:** cursor/checkpoint, limite de operações, timeout, retry e ID da execução. Reexecução não duplica nem sobrescreve uma versão mais recente.
7. **Conciliar:** comparar identidades e campos críticos, relações, contadores e amostras de conteúdo. Contagem igual sozinha não prova equivalência.
8. **Mudar leitura por coorte:** usar seleção determinística e uma forma validada de interromper a promoção. Preservar clientes antigos e respeitar a preparação de capacidade da coleção.
9. **Observar:** erros, latência, custo, lag de projeção, negativos de autorização e divergência.
10. **Contrair:** só depois da janela aprovada de compatibilidade e de rollback. Remover escritores, leitores e dados legados em tarefas diferentes.

Os percentuais de rollout são um mecanismo de controle, não autorização para operar produção. Migrações por coleção exigem crescimento gradual de tráfego e planejamento de custo; a documentação do Firestore também alerta para as limitações de rollback sem escrita compatível. [Boas práticas](https://firebase.google.com/docs/firestore/best-practices).

Uma flag no cliente controla apresentação/compatibilidade, não acesso ao dado. A autoridade de um comando e a política da coorte permanecem verificadas no servidor. Usuário que altera uma variável no app não pode forçar uma permissão ou versão de escrita não autorizada.

Tratamento de concorrência: mudanças durante o backfill têm versão/`updatedAt` e comparação antes de gravar. Exclusão gera tombstone/corte de versão para impedir que um job antigo ressuscite o registro. Não usar somente “campo novo está ausente” como prova de que o registro ainda está na versão inicial.

`schemaVersion` no documento não substitui um checkpoint de migração nem a versão de contrato da API.

### Ordem das mudanças de maior risco

1. Resolver identidades canônicas e produzir mapa de correspondências.
2. Limitar queries mantendo caminhos existentes.
3. Migrar conversas e inbox com adaptadores v1/v2 e verificação de equivalência.
4. Separar preferências crescentes e cache local por UID.
5. Introduzir jobs recuperáveis para mídia, cobrança e exclusão, sem mudar benefícios/preços.
6. Normalizar projeções/IDs e reconciliar métricas.
7. Retirar formatos antigos somente após a janela de clientes suportados.

## 9. Trabalhos assíncronos e exclusão

Um documento de job não executa trabalho sozinho. A implementação deve escolher e testar o mecanismo de despacho, por exemplo uma fila de tarefas autenticada e um worker. Persistir operação, tipo, alvo, versão, tentativas, lease, próxima tentativa e erro sanitizado; limites e fila de falhas precisam de runbook.

O padrão é: ocultar/marcar intenção, persistir trabalho durável, executar efeitos idempotentes, reconciliar e concluir. Se o processo morrer depois de excluir o objeto mas antes de atualizar o documento, a próxima execução termina a operação sem recriar o conteúdo.

Excluir um documento Firestore não remove automaticamente suas subcoleções. A ferramenta de exclusão de conta deve percorrer relações e subcoleções, com checkpoints e tratamento explícito dos sistemas externos. [Modelo de dados](https://firebase.google.com/docs/firestore/data-model).

Expiração de documento e expiração de objeto R2 são mecanismos distintos. Limpar intenções expiradas, uploads abandonados e mídias órfãs com verificação de referência. URL assinada controla acesso temporário à operação autorizada; não substitui validação posterior do arquivo. [R2: URLs assinadas](https://developers.cloudflare.com/r2/api/s3/presigned-urls/).

Rollback de código não desfaz exclusão, cobrança ou transformação de dados. A recuperação é específica: reativar leitura compatível, reprocessar projeções, restaurar backup verificado ou reconciliar com o provedor. Nunca declarar um rollback destrutivo “seguro” só porque há um commit anterior.
