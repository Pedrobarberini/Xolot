# Validação, escalabilidade e operação — Folko

A [direção Folko](05-direcao-folko.md) atualiza a matriz de produto sem dispensar as provas técnicas anteriores.

## 1. O que já foi verificado e o que falta

Antes deste plano, a base local passou em 164 testes Node, TypeScript do app/backend e build web. A navegação web foi observada no feed, player, busca, mensagens, perfil, seguidores, abertura de envio e restauração de sessão. As evidências estão em `output/testes/`.

As novas provas de emuladores, UI e backend estão em estado.json; o número 164 acima é histórico. Cada reexecução informa sua revisão e escopo. Essa base inicial não prova autorização real das Rules, concorrência, desempenho em escala, captura nativa, upload completo, cobrança, restauração de backup ou equivalência de uma migração. A tarefa `F00` deve reproduzir o baseline na revisão que realmente será refatorada.

## 2. Matriz de testes

| Camada | Prova exigida | Exemplos |
|---|---|---|
| Domínio | Funções puras e casos de uso com portas falsas controladas | IDs, datas, ranking, permissões de negócio, transições, centavos e estados |
| Adaptadores | Fixtures reais de formato e entradas inválidas | Documento legado, campo ausente, tipo errado, evento duplicado e erro do SDK |
| Firestore Rules | Emulator Suite com SDK cliente autenticado e `assertSucceeds`/`assertFails` | Leitura individual, listagem, owner/outro, campos imutáveis, participante/não participante |
| Queries | Emulator com documentos acima de uma página | Datas iguais, inserção entre páginas, exclusão durante paginação, cursor inválido e fim da lista |
| Backend privilegiado | Casos de uso e integração com Admin SDK em emulador | Admin não depende das Rules para impedir ação de outro usuário |
| Concorrência | Operação repetida e falhas entre etapas | Mesma curtida/mensagem/upload/evento duas vezes, corrida de atualização de selo e reinício do worker |
| UI | Renderização e interação com componentes/hook apropriados ao Expo/React | Loading/vazio/erro, retry, voltar, modal, foco, desmontagem e cancelamento |
| E2E web | Navegador com dados sintéticos e serviços de staging/emuladores | Login, onboarding, feed, publicação autorizada, perfil, conversa e restauração |
| Mobile | Dispositivo/emulador e development build compatível | Android back, câmera, galeria, permissões, memória e rede intermitente |
| Migração | Dry-run e execução duas vezes em cópia isolada | Contagens, relações, hashes sanitizados de campos críticos, concorrência, tombstones e checkpoint |
| Recuperação | Restauração efetiva e reconciliação | Banco, arquivos de mídia, jobs e estado atual do provedor |

Não apagar a suíte existente por ser imperfeita. Substituir cada teste baseado em texto por uma prova de comportamento equivalente antes de retirar a asserção antiga. Mudar regex para fazer a suíte ficar verde não comprova uma refatoração.

Testes novos devem proteger um risco real. Não criar testes que apenas conferem o nome de um arquivo, copiam a implementação ou simulam sucesso sem executar a regra relevante.

### Casos obrigatórios de segurança

- Usuário A não escreve perfil, preferências, recibos, dados financeiros ou mídia do usuário B.
- Participante não pode adicionar outra pessoa a uma conversa existente nem forjar remetente.
- Cliente não pode conceder `identityVerified`, `plusActive`, papel administrativo ou aprovação de conteúdo.
- Claims são verificadas no servidor; um texto `role: Admin` no perfil não concede acesso.
- Validações de campos e limites são aplicadas tanto em criação quanto em atualização.
- Queries não autorizadas falham, mesmo quando os documentos atualmente existentes parecem inofensivos.
- Endpoint de mídia verifica UID, intenção, expiração, chave, propriedade, estado e repetição.
- Comentário de resposta pertence ao mesmo post; referências compartilhadas não concedem acesso a conteúdo proibido.
- Bloqueio é aplicado aos comandos sociais relevantes no servidor, respeitando a política de privacidade decidida.
- Chave administrativa, token de pagamento, segredo R2, documento de identidade e URL assinada não aparecem no bundle, log ou fixture versionada.

## 3. Comandos e CI

Comandos já existentes:

```powershell
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm test
pnpm --dir functions exec tsc --noEmit
pnpm run build:web
pnpm --dir functions run build
```

Usar uma versão Node compatível com Functions Node 22 e uma versão pnpm 11 testada. Registrar patches exatos na matriz de ferramentas; não instalar a versão principal mais nova durante uma extração de código. Os comandos `pnpm dlx ...@latest` existentes devem ser substituídos por ferramentas fixadas e executáveis comprovados em uma tarefa própria.

F03–F06 já introduziram lint, format:check, test:ui, test:rules, verificação de queries e pacote de Functions isolado, com provas no estado. test:integration e test:e2e só podem ser exigidos quando tiverem implementação real e fixtures; não citar scripts aspiracionais como existentes.

Pipelines propostos:

1. **PR/local:** instalação congelada, lint incremental, tipos separados de cliente/backend, testes de domínio e contratos.
2. **PR que toca dados/segurança:** emuladores e matriz de Rules/queries, sem credenciais de produção.
3. **Integração:** build web, build de Functions e teste do pacote de deploy em diretório limpo, fora dos imports do frontend.
4. **Staging:** implantação explícita em alvo identificado, seeds sintéticas limitadas e E2E. Logs e vídeos sem segredos.
5. **Produção:** artefatos já aprovados, plano de promoção, comparação de dados, rollback específico e revisão dos responsáveis.

Uma alteração só de documentação usa revisão de links e consistência. Uma alteração de comportamento usa testes focados e a checagem de tipos correspondente. Movimentações de imports/rotas exigem também a prova de resolução no build. Não repetir toda a matriz a cada parágrafo alterado.

Testes de integração devem recusar execução quando o projeto/host não forem os alvos de teste registrados. O padrão é projeto `demo-...` e emuladores. Não “usar produção porque as credenciais já estão logadas”.

## 4. Metas propostas, não medições atuais

Os números abaixo são metas iniciais para validação, sujeitas a custo, região e dispositivos reais. Não são garantia de capacidade ou SLA contratado.

| Área | Meta inicial/medição |
|---|---|
| Consultas | Nenhum listener global no boot; consultas por contexto, página e cancelamento |
| Feed | Página inicial de 20; no máximo um vídeo reproduzindo e uma janela pequena de players preparados |
| Interface | Sem crescimento contínuo de players/listeners/memória após navegar por 100 itens |
| Scroll mobile | Medir aparelho de entrada; investigar p95 de frame acima de 33 ms e travamentos perceptíveis |
| API comum | Registrar p50/p95/p99 e taxa de erro; meta piloto sugerida de p95 abaixo de 1 s em cenário aquecido e região definida |
| Inicialização | Meta sugerida de primeiro feed útil abaixo de 3 s no perfil de rede/dispositivo publicado no benchmark |
| Mensagens | Sem duplicação em retry, ordem determinística e histórico paginado; medir tempo de entrega separadamente de leitura |
| Projeções | Lag e divergência medidos; concessão indevida de benefício pago deve permanecer zero nos testes de concorrência |
| Recuperação | Proposta de RPO de 24 h e RTO de 4 h, só adotada após ensaio de restauração e aceite do responsável |

Medir separadamente cache quente/frio, reconnect, cold start e provedor externo. Não excluir casos lentos do relatório para declarar a meta atingida.

Usar os recursos de virtualização do React Native com tamanho de janela e layout medidos, não com parâmetros copiados de outro app. [Configuração de FlatList](https://reactnative.dev/docs/optimizing-flatlist-configuration).

### Cenários de carga

Começar com fixtures locais de centenas de usuários e milhares de posts/mensagens, suficientes para exceder cada página. Depois definir ensaios graduais com sessões concorrentes, autores populares, um post concentrando interações e conversas longas.

Staging pago usa volumes e teto de gasto autorizados. Bases de 10 mil/100 mil usuários ou milhões de documentos são cenários de planejamento; não devem ser semeadas automaticamente. Resultado de throughput do emulador não estima a capacidade de produção.

## 5. Custos e limites operacionais

Planilha/relatório de custo por sessão deve registrar:

```text
leituras = páginas iniciais + hidratação de autores/métricas
         + atualizações de listeners + reconexões + leituras de autorização aplicáveis
escritas = comandos + projeções + recibos + notificações + jobs + auditoria
armazenamento = documentos + índices + mídia original + variantes + backups
```

Preços e cotas devem ser consultados na data do ensaio, na edição/região reais. Definir alertas de orçamento; alertas não são um limite rígido de gasto. Limitar tentativas, batch, concorrência, instâncias, payload, tempo de processamento e tamanho de arquivo, conforme os requisitos e as opções verificadas da plataforma.

Antes de fragmentar contadores ou materializar um feed por usuário, medir a contenção e o custo de fan-out. Um autor com muitos seguidores pode tornar a escrita por seguidor mais cara que a consulta paginada. Documentar a escolha e manter uma forma de reconstruir projeções.

## 6. Observabilidade e proteção operacional

- Contexto de requisição/operação e códigos de erro estáveis, sem payloads sensíveis.
- Métricas de listeners ativos, leituras por tela, latência, falha de upload, intenção expirada, job em retry, fila de falhas e atraso de projeção.
- Alertas de cobrança divergente, benefício inconsistente, exclusão incompleta e crescimento de órfãos.
- Logs estruturados com política de acesso, amostragem e retenção; nunca gravar tokens/URLs assinadas por conveniência.
- Error boundary na aplicação, estados de erro recuperáveis e botão de tentar novamente onde fizer sentido.
- Limites de taxa no servidor por identidade e operação; proteção por App Check após preparar e observar clientes legítimos.
- App Check não substitui autenticação/autorização. Enforcement não pode bloquear uma plataforma suportada que ainda não possui configuração válida.
- Retry com backoff e limite; não repetir automaticamente uma operação financeira cujo efeito externo seja desconhecido sem consultar/reconciliar com o provedor.

## 7. Entrega e recuperação por domínio

O PWA precisa de política própria de atualização e cache. `workbox-config.js` usa ativação imediata do service worker; testar a convivência de código/schema antigos e novos antes de manter esse comportamento. Separar assets públicos imutáveis de dados privados, respostas autenticadas e URLs temporárias. Validar atualização com rascunho aberto, rede offline, logout e troca de conta. Cache não deve se tornar um atalho de leitura privada entre usuários.

| Mudança | Condição para liberar | Recuperação |
|---|---|---|
| Extração de componente | Comportamento, tipos e navegação equivalentes | Reverter somente a tarefa, preservando alterações alheias |
| Nova query | Índice pronto, Rules e paginação testadas | Reativar leitor compatível sem exigir dados que já foram removidos |
| Conversas v2 | Backfill reconciliado e escritores/recibos compatíveis | Voltar leitura mantendo novas escritas representadas no legado ou no adaptador |
| Preferências v2 | Arrays convertidos e estado por UID verificado | Leitor compatível sem reimportar item ocultado/deletado |
| Mídia/limpeza | Jobs idempotentes, fila operacional e acesso protegido | Reprocessar estado intermediário e conciliar objetos/documentos |
| Billing/benefícios | Eventos repetidos/fora de ordem testados e sandbox aprovado | Consultar estado atual do provedor e recalcular benefícios |
| Exclusão de conta | Autorização/reautenticação, etapas e retenção definidas | Retomar job; restauração apenas quando permitida e realmente disponível |

Não chamar `git reset --hard`, apagar fixtures de referência ou desabilitar Rules para “facilitar” testes. Backup precisa ser restaurado em ensaio; existência de um arquivo exportado não prova recuperação.

## 8. Definition of Done final

- Tipos de autenticação, perfil, publicação e apresentação separados e sem casts de conveniência.
- Frontend sem imports diretos de SDK nas telas; backend sem implementação de negócio no ponto de entrada.
- Nenhuma coleção global carregada apenas para produzir um contador ou filtrar uma tela.
- Queries possuem filtros, índices versionados, paginação, autorização e teste de documentos legados.
- Funcionalidades sociais e financeiras preservam semântica e autorização; comandos críticos repetidos não duplicam efeitos.
- Nenhuma projeção é tratada como origem exclusiva de uma permissão financeira.
- Feed virtualizado e players/listeners liberados fora de uso.
- Histórico e links funcionam na web; navegação/voltar e recursos de dispositivo validados nas plataformas suportadas.
- Jobs, migrações e exclusões têm checkpoint, limites, observação e procedimento de reprocessamento.
- Perfis/dados privados, segredos e artefatos de identidade continuam protegidos.
- Pipeline reproduz artefatos, testes e configurações; produção tem alvo explícito e procedimento de recuperação.
- Compatibilidade legada só foi removida com evidência de que clientes e dados restantes foram tratados.
- README, decisões, catálogo de dados e runbooks correspondem ao código final.

Se uma dessas provas faltar, registrar exatamente o que falta. O termo “escalável” não substitui um resultado de teste nem um orçamento operacional.

## Aceite específico do Folko

- Cadastro e edição de pessoa comum com área/apresentação livres, organização opcional e dados sem esporte obrigatório. Preservar valores de quem já utiliza esporte.
- Texto de entrada e sugestões gerais; não usar exemplos exclusivamente de atleta/jogador, nem atribuir categoria profissional ou benefício pela sugestão escolhida.
- Fotos, vídeos, feed, galeria, relações, mensagens, profissional, assinatura e campanhas conservam a semântica existente.
- P04–P07 provam post de texto sem upload/URL/thumbnail fictícios, limites no servidor, leitores antigos/novos, paginação mista, moderação e exclusão.
- Texto/foto não instanciam players; um só vídeo fica ativo; acessibilidade e estados de erro/vazio também cobrem o feed misto.
- P02 inventaria marca textual e identificadores técnicos. P03 só troca arte pelo logo entregue, com resolução, transparência, recorte e contraste verificados.
- P09 executa os fluxos gerais e os legados em dados sintéticos; G02/G03 mantêm promoção, orçamento e recuperação separados.
- Política etária/privacidade e termos públicos são gates de produto antes do lançamento geral; não tratar a antiga descrição de atletas como decisão atual.
