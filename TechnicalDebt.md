# Technical Debt - NextStar

Documento de divida tecnica do estado atual do repositorio, atualizado em 2026-07-18.

## Legenda

- P0: bloqueia o MVP publico.
- P1: importante para escala e manutencao.
- P2: qualidade e produtividade.
- P3: evolucao futura ou dependente de validacao externa.

## 1. Composicao central em `App.tsx`

**Status:** Parcialmente resolvido.

O `App.tsx` possui cerca de 535 linhas e ainda concentra boot do Expo, montagem de telas e conexao com actions. Telas, actions, repositories, services, seletores puros, navegacao local e estilos ja estao separados em `src/`.

**Risco residual:** mudancas em rotas autenticadas e shells de entrada ainda passam pelo mesmo arquivo central. `FeedScreen.tsx` e `src/styles/appStyles.ts` continuam grandes. `VideoPlayer`, cards e estilos por dominio ainda devem ser extraidos.

**Acao:** Reduzir o `App.tsx` para inicializacao, providers e montagem de um root app. Extrair seletores puros, navegacao local, shells de entrada e rotas autenticadas em passos separados.

**Prioridade:** P1

## Convencao de refactor

Durante a reorganizacao, novas telas devem viver em `src/pages/` e componentes reutilizaveis em `src/components/`. Cada componente extraido deve preferir uma pasta propria, mantendo implementacao, estilos e tipos locais juntos.

Formato recomendado:

```txt
src/components/VideoPlayer/
  VideoPlayer.tsx
  VideoPlayer.styles.ts
  VideoPlayer.types.ts
  index.ts
```

Para componentes especificos de uma pagina, manter dentro da propria pagina ate existir reutilizacao real:

```txt
src/pages/FeedPage/
  FeedPage.tsx
  FeedPage.styles.ts
  components/
    FeedCaption/
      FeedCaption.tsx
      FeedCaption.styles.ts
      FeedCaption.types.ts
      index.ts
```

`theme.ts` deve guardar apenas tokens compartilhados, como cores, espacamento, raio, sombras e tipografia base. Estilos estruturais de tela ou componente nao devem continuar crescendo dentro de `src/styles/appStyles.ts`.

## 1.1. Seletores e dados derivados ainda dentro do `App.tsx`

**Status:** Concluido em 2026-07-18.

Players aprovados, players disponiveis, ordenacao do feed, videos do perfil selecionado, fundos, contagem de pendencias, investimentos do usuario e outros dados derivados foram movidos para `src/app/appSelectors.ts`.

**Risco residual:** `App.tsx` ainda concentra JSX de rotas autenticadas. Os proximos passos sao shells de entrada e `AppRoutes`.

**Prioridade:** P1

## 1.2. Navegacao local sem isolamento

**Status:** Concluido em 2026-07-18.

Estados como `tab`, `selectedPlayer`, `selectedAccount`, `investmentPlayer`, `feedFocusPlayerId`, `reelReturnTarget` e `activeMessageContactId` foram movidos para `src/app/useAppNavigation.ts`.

**Risco residual:** `createAppActions` ainda recebe setters React para manter compatibilidade com o fluxo atual. A adocao futura de Expo Router ou React Navigation continua pendente no item 6.

**Prioridade:** P1

## 1.3. Shells de entrada duplicados

**Status:** Pendente.

Loading, login e setup obrigatorio repetem `View`, `SafeAreaView`, `StatusBar` e `BrandLaunchScreen`. A inicializacao de splash/system UI tambem esta acoplada ao componente raiz.

**Acao:** Extrair `useExpoBoot` ou `AppProviders`, alem de componentes pequenos como `LoadingAppShell`, `LoggedOutAppShell` e `AccountSetupGate`.

**Prioridade:** P2

## 1.4. Rotas autenticadas embutidas no JSX principal

**Status:** Pendente.

As renderizacoes de `InvestmentScreen`, `PublicProfileScreen`, `FeedScreen`, `SearchScreen`, `MessagesScreen`, `SubmitVideoScreen`, `AdminScreen` e `ProfileScreen` ficam no mesmo bloco condicional. Isso aumenta o risco de regressao ao mexer em uma unica tela.

**Acao:** Criar `AppRoutes` e, se necessario, subcomponentes `FeedRoute`, `SearchRoute`, `MessagesRoute`, `SubmitRoute`, `AdminRoute` e `ProfileRoute` para reduzir o JSX do root.

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

**Status:** Parcialmente resolvido localmente em 2026-07-16.

Cadastro e login agora usam email e senha. A senha nao e serializada em texto puro: o dispositivo armazena salt aleatorio e hash SHA-256, e contas antigas definem uma credencial no proximo acesso. O primeiro login tambem exige a conclusao do perfil do atleta.

**Risco residual:** Nao existe backend, sessao/token server-side, verificacao de email, recuperacao de senha, limitacao de tentativas nem sincronizacao entre dispositivos. O papel Admin ainda e escolhido no cliente para permitir a demonstracao; por isso, o fluxo atual nao e autenticacao segura para publico.

**Acao:** Implementar auth no backend com hash apropriado no servidor, sessao segura, recuperacao de senha, verificacao de email, rate limit e atribuicao de papel somente no servidor.

**Prioridade:** P0

## 5. Upload de video por URI ou link

**Status:** Pendente.

Arquivos nao sao enviados para bucket nem validados no servidor. URI local pode expirar ou deixar de funcionar em outro aparelho.

**Acao:** Usar S3, R2, Supabase Storage ou equivalente com URL assinada, limites, thumbnail e metadados.

**Prioridade:** P0

## 6. Navegacao manual por estado

**Status:** Pendente.

Rotas usam `useState<Tab>` e selecao condicional. Nao existe deep link, URL de perfil ou historico real do navegador.

**Acao:** Primeiro isolar a navegacao manual em `useAppNavigation`. Depois adotar Expo Router ou React Navigation com rotas tipadas, deep links e historico real quando os fluxos estiverem estabilizados.

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

O `StyleSheet` saiu do componente raiz, mas `appStyles.ts` possui aproximadamente 4.400 linhas.

**Acao:** Separar estilos por pagina e por componente. Cada componente extraido deve carregar seus proprios estilos em uma pasta dedicada, evitando mover tudo para arquivos grandes de estilo da pagina. Manter somente tokens compartilhados em `theme.ts`.

**Prioridade:** P2

## 13. Cobertura automatizada limitada

**Status:** Parcialmente resolvido em 2026-07-16.

Existe uma suite nativa do Node cobrindo fallback, migracao, serializacao, credenciais locais, perfil e operacoes do repository local.

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
2. Extrair seletores puros e navegacao local do `App.tsx`.
3. Extrair shells de entrada e rotas autenticadas do `App.tsx`.
4. Extrair `VideoPlayer` e virtualizar o feed.
5. Limpar o dominio financeiro e codigo morto.
6. Adicionar ErrorBoundary, lint e testes dos fluxos criticos.
7. Adotar navegacao tipada e deep links.
8. Separar estilos por dominio.
9. Configurar EAS e validacao mobile no CI.
