# Folko — execução por categoria

Início: 06/11/2026. O [levantamento consolidado](06-status-metricas-e-evolucao.md) continua sendo a referência do escopo. Esta página registra entregas concretas, armazenamento, método, motivo e aceite restante. Não reabre as 27 tarefas concluídas nem encerra fichas maiores por uma implementação parcial.

## Categoria 1 — imediata

| Etapa | Resultado esperado | Estado desta execução |
| --- | --- | --- |
| IM01 — Medição operacional inicial | Tempos, falhas e volume de resultados com coleta limitada, validação e relatório | Publicada na web e no backend em `199ee64`; amostras autenticadas e baseline real ainda pendentes |
| IM02 — Proteções e otimizações já preparadas | Rollout coordenado de cliente, backend, Rules e CAPTCHA | Preparadas parcialmente na auditoria anterior; publicação própria ainda necessária |
| IM03 — Bloqueio, denúncia e privacidade | Autoridade do servidor e fila de moderação | Pendente; respeitar política de acesso e retenção |
| IM04 — Acesso à infraestrutura | Menor privilégio por responsabilidade | Diagnóstico atualizado; nenhuma permissão alterada |
| IM05 — Abuso e proteção de origem | Limites, sinais de rejeição e proteção dos endpoints reais | Limites locais preparados; WAF/origem e ensaio próprio pendentes |
| IM06 — Backup e recuperação | Backup com restauração provada e objetivos de recuperação definidos | Pendente; nenhuma política de descarte ativada |
| IM07 — Custo e painel operacional | Leituras/gravações/bytes, disponibilidade, alertas e custos oficiais por período | IM01 prepara durações e volume de resultados; custo faturado e alertas do provedor continuam pendentes |

### IM01: o que foi implementado

- Instrumentação do layout do primeiro item do feed, confirmação de curtida/view, aceitação da mensagem pelo servidor, resolução de notificação, publicação de mídia, abertura do preview da câmera e quantidade de documentos retornados na consulta de posts.
- Amostragem de 20%, fila em RAM de até 80 amostras, expiração local em cinco minutos, lotes de até 20 e intervalo mínimo de um minuto por instância do app.
- Limpeza da fila ao sair ou mudar de conta; callbacks antigos não acrescentam dados na sessão nova. Falhas de diagnóstico não impedem a operação principal.
- Coletor autenticado `ingestOperationMetrics`: identidade verificada, quota de seis chamadas por minuto por conta, esquema fechado e nenhum segredo de mídia/pagamento vinculado às opções da função.
- Um evento estruturado por lote em Cloud Logging. Não há uma coleção de métricas no Firestore nem uma gravação por clique.
- Relatório JSON/Markdown com amostras, p50/p95, resultado, códigos, descarte e aviso de amostra pequena. Falha e cancelamento ficam separados dos sucessos.
- Transporte carregado sob demanda e coleta desativada por padrão; o backend deve existir antes de ativar a flag no cliente.

### Onde fica cada parte

| Parte | Local | Motivo |
| --- | --- | --- |
| Contrato fechado | `contracts/operational-metrics-v1.json` | Documentar limites, operações, autoridade e aumento deliberado de 24 para 25 exports |
| Fila/amostragem/tempos | `src/shared/observability/operationMetrics.ts` | Código puro, testável, sem banco, identidade pública ou dependência de SDK |
| Configuração e ciclo de sessão | `src/config/operationMetrics.ts`, `src/actions/useOperationMetrics.ts` | Ativar só por flag e identidade verificada; liberar recursos na saída |
| Transporte | `src/services/firebaseOperationMetricsService.ts` | Usar o callable autenticado existente como padrão de comunicação, com timeout |
| Validação e recepção | `functions/src/observability/metricProtocol.ts`, `handlers.ts` | Validar também no servidor, sem confiar no que o cliente declara |
| Quota | `callableRateLimits/{hash}` no Firestore, pelo guard existente | Uma chave estável por conta/operação evita criar um documento para cada clique; a chave não é UID em claro |
| Eventos após ativação | Cloud Logging do projeto `xolot-384e9` | Reutilizar a infraestrutura de logs e separar diagnóstico de conteúdo social |
| Relatório do operador | `scripts/report-operation-metrics.mjs` | Leitura autorizada ou arquivo local; somente projeção sanitizada é exportada |
| Evidências locais | `output/testes/imediata-01-observabilidade/` e logs em `tmp/operational-metrics-*` | Não publicar relatórios operacionais ou dados de teste no Git; as pastas são ignoradas |
| Explicação técnica | [Métricas operacionais](../architecture/metricas-operacionais.md) | Descrever método, limites, verificações e sequência de rollout |

Os dados do produto continuam onde já pertencem: contas/identidade no Firebase Auth, documentos sociais no Firestore, mídia no R2/armazenamento de objetos e credenciais de fornecedores no Secret Manager. Métricas não substituem esses dados nem os copiam para logs.

### Método e por que foi escolhido

Tempos são calculados no mesmo cliente com relógio monotônico quando disponível. A fila guarda apenas operação, resultado, código fechado e valor numérico. O UID usado para conferir a sessão fica somente no processo e não entra no lote customizado; a autenticação padrão do Firebase continua sendo enviada pelo SDK.

Usar lotes reduz chamadas e volume de logs; manter o buffer em RAM evita guardar um histórico operacional no dispositivo. Cloud Logging já existe no backend, enquanto criar documentos para cada evento social aumentaria custo e concorrência no banco. A quota tem custo de leitura/gravação próprio, que deve ser observado; a solução não é custo zero nem proteção contra toda forma de DDoS.

Os tempos são diagnóstico declarado pelo cliente e podem ser falsificados por um cliente modificado. Nunca usar esses números para contagem social, selo, ranking, cobrança ou autorização. Uma perda de resposta pode deixar um envio incerto: não há retry automático desse lote para evitar duplicação; o relatório mostra descarte/incerteza.

### O que foi conferido na infraestrutura

Consulta somente de leitura em 06/11/2026: bucket `_Default` ativo, retenção de 30 dias; bucket `_Required` ativo, retenção de 400 dias. Não foi alterada retenção, política de acesso ou sink. O diagnóstico identifica os buckets existentes, sem garantir qual destino todos os sinks futuros usarão.

A política do projeto não retornou binding público e mostrou três contas de serviço com papel Editor. Isso não substitui revisão de IAM herdado, views, sinks e políticas por recurso. A redução de privilégios pertence a IM04; nenhuma conta ou papel foi criado/removido nesta entrega. Resumo sem identidades pessoais: `output/testes/imediata-01-observabilidade/logging-settings.json`.

### Publicação autorizada e verificada

O proprietário autorizou a publicação em 06/11/2026. Código na `main`: `199ee642ec6cf162f2e13db0d59eddbaebf3c005`. Os três jobs da [CI](https://github.com/Pedrobarberini/Xolot/actions/runs/42282639027) passaram. A versão de Hosting `d426151d19342116` foi conferida no preview e promovida sem rebuild para `xolot.com.br` e `xolot.web.app`.

Foram publicadas somente `ingestOperationMetrics`, `deleteOwnAccount` e `cleanupDeletedAccount`. As duas últimas receberam a limpeza da nova quota. As outras 22 funções e o ruleset Firestore permaneceram sem alteração. O coletor está ativo com cinco instâncias máximas, concorrência dez, timeout de 15 segundos e nenhum segredo vinculado. Dois testes negativos reais devolveram HTTP 401/`UNAUTHENTICATED`: sem autenticação e com token inválido. Nenhuma conta foi criada ou excluída para esses testes.

A flag de coleta está habilitada apenas neste build web, identificado pelo SHA completo acima. Arquivo principal: 4.124.887 bytes; transporte sob demanda: 375 bytes. Hashes, cache, service worker e respostas HTTP 200 foram conferidos nos dois domínios. A tela de login renderizou sem erros de console observados; uma aba com service worker antigo precisou de duas recargas. Evidências: `output/testes/imediata-01-observabilidade/verificacao.json` e `site-publicado.jpg`.

As consultas básicas confirmaram os sinks padrão ativos, sem exclusões, e o bucket `_Default` com retenção de 30 dias. Nenhum papel IAM, retenção ou configuração de CAPTCHA/App Check foi alterado. A inspeção não substitui a revisão de IAM herdado, views, orçamento, transparência e clientes nativos, que continuam no programa de segurança/operação.

### O que ainda falta para concluir a medição operacional

1. Observar uma sessão autenticada com operações reais e conferir seu lote sanitizado no log. A aba disponível estava no login; não foram extraídas credenciais nem criadas identidades para fabricar amostras.
2. Formar uma amostra suficiente por operação, versão e plataforma; então estabelecer baseline e comparar o rollout IM02. Ainda não há afirmação de SLA ou redução de latência decorrente desta instrumentação.
3. Completar medições de renderização no destinatário, custos oficiais, alertas, concorrência e estabilidade nativa nos aceites de O03/IM07. Oito sinais iniciais não encerram essas tarefas amplas.

### Validação executada nesta etapa

| Verificação | Resultado e escopo |
| --- | --- |
| Domínio/utilitários | 239 testes na suíte geral; 13 testes específicos reexecutados após os ajustes finais de validação |
| Backend | 31 testes na suíte geral; ingestão autenticada, payload e falha de log rechecados na suíte específica |
| Interface | 46 testes na suíte geral; 20 no recorte isolado, incluindo os quatro testes novos de ciclo de sessão/transporte |
| Tipos | App e Functions aprovados no workspace e no recorte isolado |
| Qualidade | Lint sem regressões; formatação do workspace aprovada; recorte conferido em LF canônico, pois o Git archive no Windows exportou arquivos legados com CRLF |
| Contrato e pacote | Oito checks de backend no recorte; pacote independente compilou e carregou 25 exports, sem executar handlers e sem dependências do app |
| Web | Build isolado aprovado; JS principal de 4.124.858 bytes e transporte sob demanda de 375 bytes, com precache do segundo arquivo verificado |
| Relatório autorizado | Consulta de leitura no projeto funcionou; zero lotes antes da ativação, não uma medição de latência igual a zero |

As contagens das suítes se sobrepõem e não representam percentual de cobertura ou teste em aparelho. O candidato local original usava a marca `development`; o build publicado usa o SHA completo do commit. O candidato com coleta habilitada não foi executado no navegador nem publicado antes da aprovação. Evidências e limitações ficam em `output/testes/imediata-01-observabilidade/`.

## Categoria 2 — alta: desempenho e organização

Paginação por contexto, inbox/histórico de conversa, virtualização, extração dos módulos grandes, upload recuperável, acessibilidade e atualização do PWA. Referências: Q01–Q08, M01–M05, U01–U08, I01–I04 e O02/O07. Começar por gargalos e fluxos com falha observável, mantendo contratos atuais.

## Categoria 3 — alta: mobile

Builds/identificadores/assinatura Android e iOS; navegação e voltar; teclado/safe areas; permissões e ciclo de vida de câmera; push; rede instável; qualidade e distribuição. As sete frentes estão descritas no levantamento. Não confundir inspeção web com teste de release nativo.

## Categoria 4 — evolução do produto

Texto no feed (P04–P07), descoberta geral (P08), validação integrada (P09) e evolução dos recursos profissionais preservados. As oito inovações do levantamento continuam propostas, sem ativação automática.

## Regra para cada próxima entrega

Registrar: categoria e objetivo; arquivos alterados; armazenamento; método e justificativa; testes realmente executados; limitações; aceite restante; autorização de publicação; commit/ambiente verificado após publicar. A ficha original só sai da fila quando todos os seus aceites forem atendidos.
