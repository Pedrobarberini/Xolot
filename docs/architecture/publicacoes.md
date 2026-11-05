# Publicação, mídia e apresentação

`features/posts/domain` contém Post, PublishedPost, MediaAsset e Draft. Uma
publicação não contém idade, cidade, nome ou credenciais da pessoa. A mídia tem
provedor, chave e medidas; sua URL resolvida fica na apresentação. PublishedPost
exige mídia; os outros estados não são convertidos em publicados por fallback.
Draft mantém somente dados locais de edição e referência da mídia escolhida.

`features/feed/domain/FeedItem` combina a publicação com resumo social, URI e
métricas para exibir. Esse resumo não é uma conta autenticada. IDs canônicos
passam pelas primitives já definidas; não há remoção heurística de prefixos.

Player e VideoSubmission permanecem formatos mistos de compatibilidade em
`posts/application/legacyTypes.ts`, reexportados por `src/types.ts`. A normalização
remota está em `posts/data/postDocument.ts`, com fachada no caminho anterior.
Os adaptadores de documento/Post/submission são explícitos; fixtures de foto e
vídeo nos dois provedores conservam o resultado legado e os seletores do feed.

O normalizador v1 continua aceitando ausência de schemaVersion e valor 1.
Versão desconhecida e estado não publicado são recusados. Isso não ativa v2,
altera documento, preço ou política de publicação. Q01 passa o novo contrato ao
repositório paginado; U01/U02/U06 retiram as fachadas dos respectivos consumidores.
