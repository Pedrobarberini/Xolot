# Métricas operacionais iniciais do Folko

Implementação inicial de IM01, publicada na web e no backend em 06/11/2026, commit `199ee64`, após autorização. Relacionada a O01/O03/I07, sem concluir custo faturado, métricas nativas de crash, proteção completa ou o programa de observabilidade. O [diário por categoria](../refatoracao/07-execucao-por-categoria.md) explica entrega, armazenamento, verificação e aceites restantes.

## O que é medido

| Operação | Início → fim | O que não significa |
| --- | --- | --- |
| `feed.first_item` | Montagem da tela → layout do primeiro item, concluído em um frame | Não inclui autenticação, bootstrap ou download anterior à montagem; não comprova primeiro vídeo reproduzindo |
| `post.like.confirm` | Invocação do comando → resposta do servidor | Não mede sozinho o frame otimista nem a atualização de todos os listeners |
| `post.view.confirm` | Invocação do comando → resposta do servidor | Não soma a permanência mínima do usuário; não cria uma nova regra de contabilização |
| `message.send.confirm` | Envio → aceitação pelo servidor | Não comprova entrega, leitura ou renderização no destinatário |
| `notification.resolve` | Seleção → resolução e emissão da navegação, ou indisponibilidade | Não mede o primeiro frame do destino nem comprova push nativo |
| `media.publish` | Comando de publicação de foto/vídeo → resultado, por R2 ou Firebase | Não guarda nome, URL, tamanho ou conteúdo do arquivo |
| `camera.preview` | Montagem/remontagem após permissão concedida → ready, erro ou cancelamento | Não inclui o tempo que o usuário levou para autorizar câmera |
| `query.posts.documents` | Quantidade de documentos do snapshot de posts | Volume de resultados observado; não é leitura faturada, métrica de latência ou contador social |

## Protocolo, limites e proteção

Contrato: [operational-metrics-v1.json](../../contracts/operational-metrics-v1.json). Cliente e backend possuem codecs pequenos independentes para manter os dois pacotes compiláveis; testes de conformidade conferem as listas e formatos.

O lote contém somente versão de schema, fonte `client`, plataforma fechada, release ID validado, taxa de amostragem, descarte e até 20 amostras. Cada amostra tem operação de uma lista fixa, resultado, código fechado e número limitado. Campos extras, IDs, textos livres, URLs, resultados incoerentes e valores não finitos são rejeitados antes do log.

Coleta de 20% no início das operações, com fila de 80 registros por instância do app. Amostras em RAM expiram em cinco minutos. Trocar de conta ou sair descarta o buffer e invalida callbacks antigos. O transporte é carregado sob demanda, tem timeout de 10 segundos e não tem retry automático de lote incerto. Só há uma chamada pendente por instância e uma tentativa a cada minuto. Não promete entrega exatamente uma vez ou cobertura de todas as falhas do app.

O callable `ingestOperationMetrics` usa identidade verificada, guard de payload e quota existente, até seis chamadas por minuto por conta, no máximo cinco instâncias e concorrência 10 por instância. App Check segue a configuração de enforcement existente e não é exigido silenciosamente dos clientes ainda incompatíveis. O número de exports passa deliberadamente de 24 a 25; os outros endpoints permanecem fora do escopo desta adição.

O evento customizado não contém UID, email, corpo de mensagem, perfil, senha, token, cookie ou URL assinada. A autenticação normal do SDK e os logs de infraestrutura do provedor continuam existindo; não declarar anonimização integral de toda a plataforma. Acesso, sinks, retenção e transparência devem ser revistos antes de ativar a coleta.

O único documento novo por conta/operação é o contador estável da quota em `callableRateLimits/{hash}`. Não é um documento por amostra. A quota deve ser retirada junto dos recursos da conta; não habilitar TTL ou apagar dados de usuário por causa desta entrega.

## Armazenamento e relatório

No cliente: somente RAM. No backend: um evento estruturado por lote com `event="folko.operation_metrics"`, usando o [SDK oficial de logs de Functions](https://firebase.google.com/docs/functions/writing-and-viewing-logs). No banco social: nenhuma coleção de métricas é criada por este ajuste.

O relatório do operador aceita logs obtidos por acesso autorizado ou um arquivo local. Projeta apenas o contrato permitido; não exporta identidades, `insertId`, `logName` ou payloads extras. Detecta duplicata de entrada quando há identidade de log, limita a leitura a 1.000 entradas e informa janela truncada, amostra pequena e lotes descartados/incertos. p50/p95 ficam separados por operação, build, plataforma e resultado, para um cancelamento rápido não parecer uma melhora de sucesso e para permitir comparação entre versões.

Com arquivo autorizado:

```powershell
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/report-operation-metrics.mjs --input output/testes/imediata-01-observabilidade/entrada.json --output output/testes/imediata-01-observabilidade/resumo
```

Leitura do projeto configurado, depois da ativação, usando a sessão Firebase do operador:

```powershell
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/report-operation-metrics.mjs --fetch --project xolot-384e9 --since-hours 24 --output output/testes/imediata-01-observabilidade/resumo-producao
```

O comando não modifica logs, infraestrutura nem dados sociais. Saídas JSON/Markdown ficam em `output/testes/`, ignorado pelo Git. Não publica um painel administrativo ou logs no app/site. Ainda é preciso um painel do provedor e alertas em IM07; quantidades de resultados não substituem faturamento, leituras de Rules/índices ou métricas oficiais de disponibilidade.

## Ativação, reversão e aceite

Por padrão `EXPO_PUBLIC_OPERATION_METRICS_ENABLED=false`. `EXPO_PUBLIC_RELEASE_ID` aceita SHA hexadecimal de 7–40 caracteres; se ausente/inválido vira `unknown`. Não usar nome, UID ou URL nesse campo.

Preparar a publicação isolada; pedir aprovação; publicar e conferir o coletor e os fluxos de limpeza da quota (`ingestOperationMetrics`, `deleteOwnAccount`, `cleanupDeletedAccount`); só então ativar o cliente em um build identificado. Validar primeiro em staging/conta de teste. Reverter a coleta por build com a flag desligada, sem apagar conteúdo social nem mudar a configuração de segurança dos demais clientes.

Aceite inicial: contrato sanitizado nos dois lados, ausência de gravação de métricas no Firestore, limites de fila/tamanho/frequência, auth/quota negativos, mudança de conta e falha de transporte, tipos, lint, formatação, suíte UI e build. Aceite de produção adicional: conferir IAM/sinks/retenção/orçamento, executar uma operação real autorizada, verificar o lote no log e gerar relatório sem dados privados. A instrumentação local não comprova esse último aceite.
