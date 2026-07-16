# Technical Debt - NextStar

Documento de divida tecnica do estado atual do repositorio, atualizado em 2026-07-16.

## Legenda

- P0: bloqueia o MVP publico.
- P1: importante para escala e manutencao.
- P2: qualidade e produtividade.
- P3: evolucao futura ou dependente de validacao externa.

## 1. Composicao central em `App.tsx`

**Status:** Parcialmente resolvido.

O `App.tsx` possui cerca de 520 linhas e concentra composicao, roteamento local e integracao dos hooks globais. Telas, actions, repositories, services e estilos ja estao separados em `src/`.

**Risco residual:** `FeedScreen.tsx` e `src/styles/appStyles.ts` continuam grandes. `VideoPlayer`, cards e estilos por dominio ainda devem ser extraidos.

**Prioridade:** P1

## 2. Camada de services e repositories

**Status:** Parcialmente resolvido em 2026-07-16.

Foram criados repositories para o estado principal e services para dados sociais e fotos:

- `src/repositories/appStateSchema.ts`
- `src/repositories/localRepository.ts`
- `src/services/socialStorage.ts`
- `src/services/profileStorage.ts`

**Risco residual:** Actions de autenticacao, video, moderacao e carteira ainda recebem setters React. A futura API deve implementar os mesmos contratos do repository local.

**Prioridade:** P0

## 3. Estado volatil sem persistencia

**Status:** Curto prazo resolvido em 2026-07-16.

Usuarios cadastrados, sessao ativa, envios, decisoes de moderacao, saldos, bolsas e investimentos agora usam estado local versionado com `AsyncStorage`. Follows, mensagens e fotos ja possuiam persistencia propria.

**Risco residual:** URI de video escolhida no aparelho pode apontar para cache temporario. O registro da postagem sobrevive ao refresh, mas o arquivo so tera disponibilidade garantida depois do upload para storage remoto.

**Prioridade:** P0 para upload remoto

## 4. Autenticacao simulada sem seguranca

**Status:** Pendente.

Login e cadastro validam apenas email e nome. Nao existe senha, token ou verificacao server-side. O papel Admin ainda e escolhido no cliente para permitir a demonstracao.

**Acao:** Implementar auth no backend e atribuir papel somente no servidor.

**Prioridade:** P0

## 5. Upload de video por URI ou link

**Status:** Pendente.

Arquivos nao sao enviados para bucket nem validados no servidor. URI local pode expirar ou deixar de funcionar em outro aparelho.

**Acao:** Usar S3, R2, Supabase Storage ou equivalente com URL assinada, limites, thumbnail e metadados.

**Prioridade:** P0

## 6. Navegacao manual por estado

**Status:** Pendente.

Rotas usam `useState<Tab>` e selecao condicional. Nao existe deep link, URL de perfil ou historico real do navegador.

**Acao:** Adotar Expo Router ou React Navigation com rotas tipadas.

**Prioridade:** P1

## 7. Feed sem virtualizacao

**Status:** Pendente.

O feed usa `ScrollView` e monta um player para cada item.

**Acao:** Migrar para `FlatList` ou `FlashList`, paginar e manter montado apenas o player relevante.

**Prioridade:** P1

## 8. `VideoPlayer` nao reutilizavel

**Status:** Pendente.

Controles de reproducao ainda ficam dentro de `FeedScreen.tsx` e componentes de envio/moderacao.

**Acao:** Extrair `src/components/VideoPlayer.tsx` e reutilizar nos contextos de feed, perfil e admin.

**Prioridade:** P1

## 9. Prop drilling de estado global

**Status:** Parcialmente resolvido.

Persistencia foi movida para hooks, mas saldo, fundos, investimentos e handlers ainda atravessam varias props.

**Acao:** Avaliar Context API depois da estabilizacao dos contratos de repository.

**Prioridade:** P1

## 10. Codigo e dominio financeiro residuais

**Status:** Pendente.

Existem funcoes de distribuicao sem uso e `PlayerEvaluation` ainda mistura avaliacao esportiva com campos financeiros. `AthleteFund` deve ser a unica fonte da bolsa.

**Acao:** Remover codigo morto e separar `AthleteEvaluation` de `AthleteFund`.

**Prioridade:** P1

## 11. Utilitarios agrupados como actions

**Status:** Parcialmente resolvido.

Helpers sairam do `App.tsx`, mas `appActions.ts` ainda mistura builders, formatadores e utilitarios de video.

**Acao:** Mover para `src/utils/` e ampliar testes.

**Prioridade:** P2

## 12. Estilos em arquivo unico

**Status:** Parcialmente resolvido.

O `StyleSheet` saiu do componente raiz, mas `appStyles.ts` possui aproximadamente 3.800 linhas.

**Acao:** Separar estilos por tela ou dominio, mantendo tokens em `theme.ts`.

**Prioridade:** P2

## 13. Cobertura automatizada limitada

**Status:** Parcialmente resolvido em 2026-07-16.

Existem quatro testes nativos do Node cobrindo fallback, migracao, serializacao e operacoes do repository local.

**Risco residual:** Ainda faltam testes de UI, moderacao, envio, follow, mensagens e aporte.

**Prioridade:** P2

## 14. Sem lint e formatacao automatica

**Status:** Pendente.

O projeto usa TypeScript strict, mas ainda nao possui ESLint, Prettier ou hook de pre-commit.

**Acao:** Adicionar preset Expo, formatacao e scripts de CI.

**Prioridade:** P2

## 15. CI concentrado na web

**Status:** Parcialmente resolvido em 2026-07-16.

O workflow executa testes, typecheck, build web e deploy. Ainda nao existe validacao mobile, `eas.json` ou pipeline de pull request separado.

**Prioridade:** P2

## 16. Strings hardcoded sem i18n

**Status:** Pendente.

Textos permanecem em portugues dentro dos componentes.

**Acao:** Adotar i18n somente quando houver plano real de outro idioma.

**Prioridade:** P3

## 17. Tratamento de erro e observabilidade

**Status:** Pendente.

Existem alerts pontuais e falhas silenciosas. Nao ha ErrorBoundary nem monitoramento remoto.

**Acao:** Criar ErrorBoundary e estados de retry localmente; Sentry depende de conta e DSN externos.

**Prioridade:** P2

## 18. Modelo de avaliacao com campos financeiros

**Status:** Pendente.

`Player.evaluation` ainda possui meta, ticket e projecao financeira, apesar de a bolsa usar `AthleteFund`.

**Acao:** Remover campos financeiros da avaliacao e usar o fundo em todas as telas.

**Prioridade:** P1

## 19. Moderacao e denuncia locais

**Status:** Parcialmente resolvido apenas para demonstracao.

Decisoes administrativas agora persistem no dispositivo, mas nao possuem auditoria remota, denuncia, bloqueio ou remocao distribuida.

**Acao:** Criar endpoints e trilha com `adminId`, nota e timestamp.

**Prioridade:** P1

## 20. Regulacao e LGPD

**Status:** Pendente e bloqueante para dinheiro real.

Consentimentos, KYC e termos nao possuem registro server-side auditavel. A carteira continua explicitamente simulada.

**Acao:** Validacao juridica, backend auditavel e parceiros autorizados antes de qualquer captacao real.

**Prioridade:** P0 para lancamento financeiro

## Ordem atual recomendada

1. Upload remoto, backend e autenticacao real.
2. Extrair `VideoPlayer` e virtualizar o feed.
3. Limpar o dominio financeiro e codigo morto.
4. Adicionar ErrorBoundary, lint e testes dos fluxos criticos.
5. Adotar navegacao tipada e deep links.
6. Separar estilos por dominio.
7. Configurar EAS e validacao mobile no CI.
