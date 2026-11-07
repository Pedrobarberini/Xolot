# Folko — execução por categoria

Início: 06/11/2026. O [levantamento consolidado](06-status-metricas-e-evolucao.md) continua sendo a referência do escopo. Esta página registra entregas concretas, armazenamento, método, motivo e aceite restante. Não reabre as 27 tarefas concluídas nem encerra fichas maiores por uma implementação parcial.

## Categoria 1 — imediata

| Etapa | Resultado esperado | Estado desta execução |
| --- | --- | --- |
| IM01 — Medição operacional inicial | Tempos, falhas e volume de resultados com coleta limitada, validação e relatório | Publicada em `199ee64`; primeiro lote autenticado confirmado. Correção de mount em `6914c1e`, em rollout web; baseline ainda em formação |
| IM02 — Proteções e otimizações já preparadas | Rollout coordenado de cliente, backend, Rules e CAPTCHA | Main/CI aprovadas em `6914c1e`; 28 Functions ativas, Rules publicadas e preview web disponível. Promoção/validação final em andamento |
| IM03 — Bloqueio, denúncia e privacidade | Autoridade do servidor e fila de moderação | Servidor e Rules publicados; 45 testes emulados aprovados. Invocação HTTP dos três serviços novos autorizada/aplicada; 14 testes negativos reais aprovados. Teste com moderador autorizado pendente |
| IM04 — Acesso à infraestrutura | Menor privilégio por responsabilidade | Editor removido dos dois runtimes; agente Google preservado. Acessos mínimos de build autorizados separadamente e aplicados; build após redução aprovado; smoke de produto em andamento |
| IM05 — Abuso e proteção de origem | Limites, sinais de rejeição e proteção dos endpoints reais | Burst emulando duas instâncias aprovado; DDoS gerenciado Cloudflare ativo; encontradas correções de www/TLS a preparar; ensaio em staging pendente |
| IM06 — Backup e recuperação | Backup com restauração provada e objetivos de recuperação definidos | PITR ativo; primeiro backup diário READY confirmado em 07/11, retenção 14 dias; clone privado validado em 10 coleções e removido. Recuperação de Auth/R2 ainda pendente |
| IM07 — Custo e painel operacional | Leituras/gravações/bytes, disponibilidade, alertas e custos oficiais por período | Painel de 13 gráficos, três alertas operacionais e orçamento BRL 50 criados; dois canais de e-mail habilitados. Entrega de alertas e relatório de custos reais ainda pendentes |

### Atualização do lote aprovado: feed, contadores e infraestrutura

As suítes atuais passaram: **250 testes de domínio/contratos, 53 de interface e 35 de backend**; tipos do app/backend e lint sem regressões. As contagens se sobrepõem a verificações anteriores e não são cobertura percentual ou teste em aparelho. A [CI de `6914c1e`](https://github.com/Pedrobarberini/Xolot/actions/runs/42321618433) passou nos três jobs, inclusive autorização em emuladores Linux. Pacote de produção isolado compilou/carregou 28 exports com a política de scripts bloqueados, sem executar handlers. Build web: **4.142.591 bytes**, quatro chunks no precache, release ID completo `6914c1e01f7804f6618cf44ded33740ea2cd47d6`. Preview `d755862aeb5b057b`, com promoção/validação de UI em andamento.

O proprietário autorizou a publicação e o bloco completo de infraestrutura em 06/11/2026 (America/Sao_Paulo). A preservação específica de acesso aos três buckets de build, repositório `gcf-artifacts` e Logging foi autorizada depois de identificada a identidade compartilhada de build/runtime. O acesso HTTP público padrão dos três novos callables foi autorizado separadamente e aplicado somente em `setpostreport`, `listmoderationreports` e `resolvemoderationreport`, preservando os demais bindings. Os 14 testes negativos reais confirmaram HTTP 401/UNAUTHENTICATED para chamadas anônimas e com token inválido nos sete endpoints verificados. Nenhum papel administrativo foi concedido a usuários do produto.

#### Correção prioritária: feed vazio após recarga — 07/11/2026

**Diagnóstico:** a publicação ficou incompleta: as Rules novas exigem consulta de posts com `status == published`, enquanto o Hosting de produção e a revisão local antiga ainda executavam uma consulta sem esse filtro. A consulta era recusada, `useFirebasePosts` esvaziava a lista e `App.tsx` descartava `postsError`, mostrando ausência de publicações como se fosse um resultado válido. A leitura operacional confirmou publicações no banco e índice READY; nenhum post foi excluído nesta investigação. A consulta compatível já está no candidato de `6914c1e`, ainda não promovido ao Hosting de produção.

**Ajuste adicional local:** `useFeedSession.ts` agora recupera uma sessão vazia quando os posts chegam, inclusive cache vazio de uma execução anterior. Também recupera um histórico sem nenhum ID disponível na janela atual, mantendo ocorrências anteriores dentro do limite de 200. Se ainda existe conteúdo visível no histórico, ordem e âncora permanecem intactas; novo lote continua dependendo do mascote. Isso evita trocar a ordem a cada atualização de preferências/contadores.

**Sincronização e interface:** `useFirebasePosts.ts` preserva a última resposta bem-sucedida em falhas transitórias da mesma conta; acesso negado ou sessão não autenticada limpa a lista e oferece nova assinatura por `retryPosts`, cancelando callbacks antigos. A troca de conta continua limpando os posts, pois o cache legado de conteúdo não é separado por UID. `App.tsx`/`AppRoutes.tsx` encaminham o erro ao `FeedScreen.tsx`: falha mostra mensagem e botão “Tentar novamente”, inclusive quando há posts anteriores na tela. Erro de conexão não se passa por feed vazio.

**Posição ao sair:** o navegador não executa o unmount React ao recarregar. `FeedScreen.tsx` agora envia a última âncora também em `pagehide`, ocultação da página e mudança do AppState para segundo plano. `useFeedSession.ts` inicia a escrita dessa âncora imediatamente, sem aguardar render/debounce; o scroll contínuo continua agrupado ao terminar a navegação. Isso cobre saídas rápidas e mantém a escrita fora de cada quadro de scroll. A persistência local continua sujeita às limitações do armazenamento do navegador/sistema.

**Armazenamento/método:** documentos continuam no Firestore e mídia no R2. A ordem/posição fica apenas em AsyncStorage, na chave existente por UID; nenhum token, mídia ou cópia do banco foi adicionado ao cache de sessão. Corrigiu-se a recuperação do estado em vez de apagar os dados locais da conta ou afrouxar as Rules.

**Verificação desta correção:** 61 testes de interface aprovados em 18 suítes; os oito casos novos cobrem cache vazio/recarga, chegada tardia, histórico fora da janela, preservação em falha/retry, erro visível, escrita imediata da âncora saída para segundo plano antes de terminar o scroll e limpeza em revogação de acesso. As 23 verificações locais de consultas/permissões passaram nos emuladores `demo-xolot-rules`, incluindo recusa da consulta ampla e aceitação de publicados. Build web local aprovado; tipos e lint sem regressões. O navegador autenticado confirmou retorno dos posts e das publicações do perfil, mesma ordem após reload e posição preservada após recarga rápida. O teste intermediário que perdeu a posição foi registrado e motivou a proteção de saída descrita acima. Nenhuma publicação social sintética foi enviada ao banco real; a publicação existente mais recente foi lida normalmente após recarga. Evidências ignoradas em `output/testes/imediatas-20261106/feed-fix-ui.log`, `feed-fix-rules.log`, `feed-review-build.log`, `feed-diagnosis-private.json`, `feed-browser-verification.json` e capturas de navegador. O novo ajuste aguarda autorização de publicação conforme `AGENTS.md`; isso não declara o Hosting público corrigido antes da promoção e do teste publicado. A verificação foi web, sem afirmar testes físicos de Android/iOS.

#### Infraestrutura aplicada: método e comprovação

- **Orçamento:** R$ 50/mês, escopo apenas do projeto, alertas por gasto real em 50/80/100%, dois canais de e-mail aprovados e destinatários padrão de IAM desabilitados. O readback confirmou valor, moeda, projeto e canais. `scripts/ops/googleClient.mjs` identifica o projeto de quota; `plans.mjs` usa `notificationsRule` da API v1. Os primeiros erros foram de transporte/schema e foram corrigidos sem alterar destinatários ou limite. Não é corte automático de serviços, não inclui a fatura Cloudflare e não constitui medição do gasto atual.
- **Painel/alertas:** um dashboard com 13 gráficos e três políticas habilitadas/válidas para 5xx, 401 e 429, cada uma vinculada aos dois canais. Sem ataques/carga para provocar incidentes ou envio manual de e-mail. A configuração foi conferida; entrega efetiva ao destinatário continua um aceite distinto.
- **IAM:** os dois runtimes receberam `datastore.user`/`firebaseauth.admin` e perderam Editor. O agente interno Google e demais bindings foram preservados. Como Compute também faz builds, manteve-se `logging.logWriter` no projeto, `artifactregistry.writer` somente em `gcf-artifacts` e `storage.objectViewer` somente nos três buckets de fontes/uploads existentes. O script `scripts/ops/preserveBuildAccess.mjs` confere que as permissões são subconjuntos do acesso efetivo anterior, preserva políticas/etags e registra rollback privado. O build real subsequente passou sem Editor. Não foi criada identidade nova ou binding público de projeto. A separação futura de identidades por responsabilidade permanece evolução de arquitetura.
- **Recuperação:** PITR habilitado com janela máxima de sete dias e backup diário retido por 14 dias. O histórico disponível é o `earliestVersionTime` retornado pelo provedor, não sete dias retroativos garantidos no instante da ativação. Criou-se um clone em banco nomeado com Rules deny-all publicadas antes da cópia, snapshot fixo e criptografia da origem. As dez contagens de coleção no clone coincidiram com as da origem no mesmo snapshot; nenhum corpo foi exportado. A operação do provedor levou aproximadamente 11min23s nesta amostra. O clone foi excluído e a ausência foi conferida; a proteção contra exclusão da origem permaneceu ativa. Não é RTO/SLA garantido nem auditoria byte a byte. O primeiro backup agendado foi confirmado READY em 07/11/2026, snapshot às 08:45:13 UTC. Isso comprova a criação do backup, sem substituir um teste de restauração desse backup; Auth e R2 não são recuperados por esse ensaio.
- **Empacotamento:** Cloud Build exigiu política explícita para os scripts já bloqueados e a dependência direta `@google-cloud/functions-framework` 5.0.5. O pacote portátil agora carrega `allowBuilds`, `strictDepBuilds` e idade mínima, usa lockfile congelado e testa a instalação de produção sem ocultar essa verificação com `--ignore-scripts`. Nenhum script de dependência foi liberado. Pnpm foi fixado em 11.25.0. A limpeza Firebase Storage legada agora exige `LEGACY_FIREBASE_STORAGE_BUCKET` explícito; no projeto R2-only, não solicita permissão a um bucket inexistente. Para bucket configurado/injetado, falhas 403/rede continuam visíveis e 404 continua tolerado.

Evidências privadas/ignoradas: `monitoring-application.json`, `infrastructure-after.json`, `iam-application.json`, `iam-rollback-private.json`, `build-access-application-private.json`, `restore-drill-application.json`, `functions-package-framework.log`, `backend-publication-fixes.log`, `ui-publication-fixes.log`, `unit-publication-fixes.log`, `dependency-audit-framework.json`, `functions-deploy-framework.log` e `rules-deploy-approved.log`, em `output/testes/imediatas-20261106/`. Os planos e hashes documentam as tentativas; falhas anteriores não foram tratadas como entrega concluída.

- **Feed:** `src/utils/feedSession.ts`, `src/actions/useFeedSession.ts`, `FeedScreen.tsx` e integração no `App.tsx`/`AppRoutes.tsx`. A ordem deixa de reagir a curtidas, seguidores e interesses durante a navegação. O mascote cria um lote de até 20 itens usando o ranking atual, prioriza IDs novos e mantém os lotes anteriores abaixo, na ordem original. Uma publicação pode reaparecer em outro lote; a identidade de cada ocorrência é distinta, sem recontar visualização da mesma conta. Histórico limitado aos 200 itens mais recentes. Ocultação, bloqueio e remoção continuam filtrando o conteúdo em todos os lotes.
- **Posição:** cache local `@folko/feed-session-v1/<UID>` em AsyncStorage, com versão, IDs/ocorrências e âncora relativa à altura do item. Preserva ordem/posição ao trocar telas ou reabrir; payload atualizado continua vindo do serviço. Não armazena mídia, URLs privadas ou mensagens nesse cache, não sincroniza entre aparelhos. UID novo não recebe a sequência da conta anterior. Usar âncora relativa permite restaurar após mudanças na altura da tela.
- **Contadores:** `src/utils/optimisticEngagement.ts`, `usePostEngagement.ts` e `useSocialActions.ts`. Curtida/view já tinham intenção otimista; compartilhamento agora incrementa no envio confirmado pelo usuário, antes de aguardar HTTPS. Confirmações/listeners reconciliam a intenção, falhas revertem apenas o incremento pendente. Abrir o menu não conta. A contagem oficial continua no servidor e o ID da mensagem mantém a idempotência. View permanece elegível após 800 ms no item; resposta de view já existente remove o incremento provisório. Não há promessa de renderização em zero milissegundos ou redução de cobranças por essa escolha.
- **Dependências:** `pnpm-workspace.yaml`, lockfile e patches mínimos de Metro 0.83.3/0.83.7 adaptam a leitura de imagens para buffer, necessária após a atualização de segurança de `image-size`. Auditoria atual: zero alto/crítico, quatro moderados (`uuid`, `@opentelemetry/core`, `glob`, `minimatch`) e um baixo (`deepmerge`). Os cinco restantes exigem migrações maiores do ferramental ou não têm correção; não foram ocultados nem forçados sem compatibilidade.
- **Bloqueio/denúncia:** `functions/src/modules/safety/`, `contracts/safety-v1.json`, `ModerationQueue.tsx`, serviços cliente e Rules. Bloqueio bilateral em novas interações; denúncia privada em `moderationReports/{hash}`, leitura direta negada, fila/revisão apenas por callable com claim administrativa. Não foi concedida claim nem apagado conteúdo automaticamente. Contrato: 28 exports e 21 orçamentos de chamadas; callables protegidos máximo de 5 instâncias/concorrência 40, com limites próprios do coletor, e limpeza legada máximo 1. Backend e invocação dos três serviços novos publicados conforme autorização específica; autenticação recusou as 14 chamadas negativas verificadas.
- **Operação:** `scripts/ops/`, `config/operations/` e `tests/operationalPlans.test.mts`. Modo padrão gera plano sem aplicar; mudança exige hash correspondente e autorização do proprietário. A redução de Editor e a preservação de build foram aplicadas conforme a comprovação acima. Smoke do produto e snapshots privados de rollback acompanham a publicação.
- **Recuperação:** PITR, agenda diária/14 dias e ensaio de clone com Rules deny-all, contagens no mesmo snapshot e limpeza restrita ao nome temporário foram aplicados e conferidos. Não houve sobrescrita do banco principal. O primeiro backup diário está READY; ainda falta cobrir recuperação de Auth/R2 e restaurar um backup agendado em ensaio distinto do clone PITR.
- **Custo:** [estimativa e premissas](../architecture/custos-piloto-2026-11.md). R$ 20–30/mês é reserva de planejamento para dez usuários leves, não fatura garantida. Banco medido em 718.178 bytes; principal bucket de mídia 31,99 MB. Dez conexões 24h/dia podem superar R$ 50, particularmente pelo CAPTCHA. Responder à dúvida de custos não foi tratado como autorização de infraestrutura.
- **Borda:** inspeção somente leitura da conta Cloudflare: domínio e mídia proxied; DDoS gerenciado ativo; zero regras personalizadas/limite de requisições. `www` ainda aponta ao GitHub Pages e mídia aceita TLS mínimo 1.0. URL pública de desenvolvimento do R2 desativada; uploads multipart incompletos expiram em 7 dias. Nenhuma regra/DNS/TLS foi alterada, nenhum plano pago foi contratado. As APIs diretas Google não passam automaticamente por essa borda.
- **Limite de segurança ainda aberto em IM05:** follows/comentários admitem escrita direta validada no Firestore, sem a quota central dos callables. Essas chamadas e consultas autorizadas exigem evolução própria de limites e rollout compatível; o teste emulado de burst dos callables não as cobre. Preferências também precisam evolução para validar cada elemento das listas/mapa. Relatório no formato da skill de auditoria em `rules-assessment.json`, nota 3/5 no escopo estático local; sem alegação de segurança integral.

As Rules geradas são um protótipo revisável, com ownership, identidade verificada, privacidade de denúncias e campos de autoridade negados ao cliente. Conforme a orientação da skill de autoria: “I've set up prototype Security Rules to keep the data in Firestore safe. They are designed to be secure for ownership checks, verified identity, private moderation reports and server-owned counters. However, you should review and verify them before broadly sharing your app. If you'd like, I can help you harden these rules.” Os testes emulados ajudam nessa revisão e não substituem o restante do aceite de IM05.

Evidências iniciais ignoradas pelo Git em `output/testes/imediatas-20261106/`: `ui-current-final.log`, `unit-current-final.log`, `dependency-audit-final.json`, `rules-safety.log`, `cost-baseline.json`, `infrastructure.json`, `prerequisites.json` e planos operacionais. Destinatários de alertas ficam só em `operator-settings.json` privado; credenciais continuam no mecanismo do operador/Secret Manager. Atualizações de autorização/publicação estão registradas acima; este histórico não substitui o aceite ainda pendente das etapas maiores.

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

1. Saúde do caminho autenticado confirmada em 06/11: o proprietário entrou na conta de testes; uma curtida foi removida e restaurada, com contador 4 → 3 → 4 e nenhum erro de console observado. O relatório sanitizado registrou um lote e uma série. Não foram extraídas credenciais nem criadas identidades. Evidências em `output/testes/imediatas-20261106/metricas-sessao-autenticada.json` e `curtida-restaurada.jpg`.
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
