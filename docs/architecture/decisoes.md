# Decisões de arquitetura

Atualizado em 2026-11-01. Estado: adotadas para a refatoração local. Rollout de dados e produção segue gates separados.

## ADR-001 — Duas unidades de implantação

Manter cliente Expo e backend Functions com compilação e dependências independentes. Backend não importa `src` do cliente. Contratos e fixtures documentam a fronteira; código compartilhado de runtime só entra após provar empacotamento isolado.

## ADR-002 — Organização por funcionalidade

Código novo e código extraído vivem em `src/features/<dominio>`, com `domain`, `application`, `data` e `ui` criados somente quando necessários. Componentes específicos ficam junto da tela; componentes reutilizados por domínios distintos podem ir para `src/shared/ui`.

`src/screens`, `src/actions`, `src/services` e estilos globais são origens legadas, não novos destinos. Não criar uma terceira organização em `src/pages`. Exemplos históricos de páginas nos comandos/documentos antigos não substituem esta decisão.

`src/app` será reservado aos arquivos de rota quando o Router for adotado. Até lá, manter os arquivos existentes e mover a composição de forma incremental para `bootstrap`/`navigation` nas tarefas correspondentes.

## ADR-003 — Fronteiras

Domínio não depende de React, SDKs ou ambiente. Casos de uso recebem dependências pequenas. Adaptadores concentram SDKs e transformação de documentos. Hooks e telas coordenam apresentação. Evitar classes, camadas vazias e repositórios genéricos sem uso real.

## ADR-004 — Compatibilidade

Movimentar código preserva exports, payloads, região, permissões e comportamento. Fachadas temporárias são registradas no mapa de arquivos e removidas depois da migração dos consumidores. Prefixos e dados legados exigem adaptadores explícitos.

## ADR-005 — Dados e autorização

Firestore e provedores continuam como autoridades dos respectivos domínios. Identidade do token e autorização são verificadas no backend; UI e campos sociais não concedem privilégios. Schema físico depende de inventário de edição/API/região. Alterações de dados usam dry-run e migração retomável.

## ADR-006 — Execução e documentação

Executar tarefas sequencialmente conforme pré-requisitos e autorização atual. `estado.json` registra provas. Remover fichas `.md` concluídas após reparar referências, sem apagar os documentos permanentes úteis de contratos, arquitetura e operação. Nenhum commit, push ou deploy é consequência automática da conclusão local.

## ADR-007 — Folko e preservação dos recursos

Em 2026-11-05 o proprietário decidiu manter as funcionalidades existentes e mudar o foco para uma rede social geral de divulgação no Brasil. O cadastro usa áreas/apresentações gerais com chaves legadas preservadas, sem exigir modalidade esportiva. Texto/fotos/vídeos são o destino do feed; a introdução de texto é versionada e testada em P04–P07. O ícone F/tucano e as duas assinaturas finais substituem as primeiras duas artes descartadas; fontes e paleta ficam no [inventário de marca](../../assets/brand/README.md). Alterações de marca não renomeiam automaticamente IDs, OAuth, buckets, domínio, dados ou contratos financeiros. A direção executável está em [05-direcao-folko.md](../refatoracao/05-direcao-folko.md). As provas técnicas já concluídas permanecem históricas e não são redefinidas como comprovação dos novos formatos.
