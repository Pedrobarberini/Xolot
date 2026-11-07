# Consultas, índices e páginas

O catálogo técnico está em `src/config/queryCatalog.ts`. Seus construtores
ficam em `shared/data/firestorePage.ts`; retornam `Page<documento,cursor>` para
adaptação nos repositórios de funcionalidade. Ainda não substituem os listeners
globais do aplicativo: essa troca é feita nas tarefas Q01–Q08/M03–M04.

| Consulta | Coleção / filtro | Ordem e desempate | Página padrão | Permissão atual |
|---|---|---|---:|---|
| feed | posts, status=published | createdAt desc, ID desc | 20 | registrado/verificado |
| authorPosts | posts, authorId, status=published | createdAt desc, ID desc | 20 | registrado/verificado |
| following | follows, followerUid | createdAt desc, ID desc | 30 | registrado/verificado |
| followers | follows, targetUid | createdAt desc, ID desc | 30 | registrado/verificado |
| comments | postComments, postId | createdAt asc, ID asc | 30 | registrado/verificado |
| notifications | notifications, recipientUserId | createdAt desc, ID desc | 30 | dono destinatário |
| messagesSent | directMessages, senderUserId | createdAt desc, ID desc | 30 | próprio remetente |
| messagesReceived | directMessages, recipientUserId | createdAt desc, ID desc | 30 | próprio destinatário |
| profilesPrefix | profiles, faixa de username normalizado | username asc, ID asc | 20 | registrado/verificado |
| tags | tagCatalog | key asc, ID asc | 30 | registrado/verificado |

Limite de exibição máximo: 50. A leitura física usa N+1 para decidir `hasMore`;
o elemento adicional não é exibido. Não há offset. Cursor tem versão, nome da
consulta versionado, escopo/filtros, valor ordenado e ID. Não pode ser usado em
outro UID, consulta ou versão. Mudança de semântica do catálogo exige nova
versão de queryId e invalidação explícita do cursor antigo.

Para datas, preservar `seconds` e `nanoseconds` efetivos do snapshot. Firestore
armazena precisão de microssegundos; converter a Date/ISO para gerar cursor
perderia parte dessa precisão. A suíte cobre dois valores no mesmo milissegundo,
datas iguais com desempate por ID, serialização do cursor, exclusão do documento
do cursor e inserção mais recente entre páginas.
[Tipos de dados oficiais](https://firebase.google.com/docs/firestore/manage-data/data-types).

As leituras paginadas exigem servidor (`getDocsFromServer`). Falha/offline é erro
explícito; uma resposta parcial do cache não prova fim da lista. O cache de UI
é outro contrato e não deve falsificar `hasMore: false`.
[Referência do SDK](https://firebase.google.com/docs/reference/js/firestore#getdocsfromserver).

Atualização de 2026-11-05: foram adicionados os quatro índices de `feed`,
`messagesSent`, `messagesReceived` e `notifications`. A confirmação de READY e os
novos listeners de métricas/marcadores por IDs estão na
[auditoria de otimização](otimizacao-seguranca-2026-11.md). Os outros quatro índices
permanecem candidatos para os consumidores futuros.

Oito índices compostos candidatos estão em `firestore.indexes.json` e são
conferidos por `pnpm run test:queries:config`. Todos têm escopo COLLECTION.
O desempate por ID usa a direção implícita do último campo ordenado do índice.
Username/key precisam somente dos índices automáticos de campo único. Não há
isenção de campos/TTL adicionada nesta etapa.

Emuladores comprovam resultado e autorização, mas não obrigam criar os mesmos
índices compostos que o serviço real. Antes de ativar um consumidor, conferir
o índice em staging e aguardar READY. A etapa original D03 não implantou índices;
as quatro adições posteriores estão registradas acima.

`orderBy` exclui documentos sem o campo ordenado. Datas legadas ausentes ou de
outro tipo precisam de inventário e backfill/diagnóstico explícitos; não inventar
datas nem apresentar exclusão silenciosa como migração bem-sucedida. O teste
inclui esse legado para expor a limitação. Mensagens v2/inbox só entram depois
dos seus schemas e Rules. Métricas por ID e gets privados permanecem contratos
pontuais e serão limitados por contexto nos respectivos repositórios.

`visibility` no catálogo documenta a regra; a autorização é exercida pelo
servidor/Rules, não por esse campo. As queries privadas com UID alheio e o feed
anônimo são negados em testes reais. Os clientes modulares dos testes são
explicitamente conectados ao emulador antes de qualquer leitura. Os arquivos
da suíte executam em série porque recriam fixtures no mesmo projeto demo.
