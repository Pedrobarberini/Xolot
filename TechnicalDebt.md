# Technical Debt - Folko

Inventário histórico de dívida técnica, com convenção de refatoração atualizada em 2026-11-01. As seções antigas descrevem fases anteriores; o diagnóstico atual e a execução ficam em `docs/refatoracao/` e `docs/architecture/`.

## Direção vigente

Em 2026-11-05 o proprietário manteve os recursos existentes e mudou o público para uma rede social geral de divulgação no Brasil, chamada Folko. O cadastro deve deixar de exigir enquadramento esportivo. Texto no feed e nova marca têm fichas P próprias, sem apagar provas técnicas. Ver [direção Folko](docs/refatoracao/05-direcao-folko.md). As referências esportivas/profissionais e de páginas abaixo são histórico, não autorização para restaurar nicho ou remover recursos.

## Legenda

- P0: bloqueia o MVP público.
- P1: importante para escala e manutenção.
- P2: qualidade e produtividade.
- P3: evolução futura ou dependente de validação externa.

## 1. Composição central em `App.tsx`

**Status:** Parcialmente resolvido.

O `App.tsx` possui cerca de 300 linhas e ainda concentra conexão entre hooks globais, actions e o roteador local. Telas, actions, repositories, services, seletores puros, navegação local, shells de entrada, rotas autenticadas, boot do Expo e estilos já estão separados em `src/`.

**Risco residual:** `AppRoutes.tsx` ainda concentra todas as rotas autenticadas em um único arquivo. `FeedScreen.tsx` continua grande. `VideoPlayer`, cards e estilos por domínio ainda devem ser extraídos para pastas de páginas/componentes.

**Ação:** Reduzir o `App.tsx` para inicialização, providers e montagem de um root app. Extrair seletores puros, navegação local, shells de entrada e rotas autenticadas em passos separados.

**Prioridade:** P1

## Convenção de refactor

Conforme ADR-002 em `docs/architecture/decisoes.md`, novas unidades e extrações devem viver em `src/features/<dominio>/`, com componentes e estilos locais. Unidades reutilizadas por domínios distintos podem viver em `src/shared/ui`. `src/screens`, `src/actions` e `src/services` são origens legadas; não criar uma organização paralela em `src/pages`.

Formato recomendado:

```txt
src/shared/ui/VideoPlayer/
  VideoPlayer.tsx
  VideoPlayer.styles.ts
  VideoPlayer.types.ts
  index.ts
```

Para componentes específicos de uma funcionalidade, manter junto da tela até existir reutilização real:

```txt
src/features/feed/ui/FeedScreen/
  FeedScreen.tsx
  FeedScreen.styles.ts
  components/
    FeedCaption/
      FeedCaption.tsx
      FeedCaption.styles.ts
      FeedCaption.types.ts
      index.ts
```

`theme.ts` deve guardar apenas tokens compartilhados, como cores, espaçamento, raio, sombras e tipografia base. Estilos estruturais de tela ou componente não devem continuar crescendo dentro de `src/styles/appStyles.ts`.

## 1.1. Seletores e dados derivados ainda dentro do `App.tsx`

**Status:** Concluído em 2026-07-18.

Players aprovados, players disponíveis, ordenação do feed, vídeos do perfil selecionado, fundos, contagem de pendências, investimentos do usuário e outros dados derivados foram movidos para `src/app/appSelectors.ts`.

**Risco residual:** `AppRoutes.tsx` ainda concentra JSX de rotas autenticadas. O próximo passo é quebrar rotas maiores em subcomponentes ou páginas.

**Prioridade:** P1

## 1.2. Navegação local sem isolamento

**Status:** Concluído em 2026-07-18.

Estados como `tab`, `selectedPlayer`, `selectedAccount`, `investmentPlayer`, `feedFocusPlayerId`, `reelReturnTarget` e `activeMessageContactId` foram movidos para `src/app/useAppNavigation.ts`.

**Risco residual:** `createAppActions` ainda recebe setters React para manter compatibilidade com o fluxo atual. A adoção futura de Expo Router ou React Navigation continua pendente no item 6.

**Prioridade:** P1

## 1.3. Shells de entrada duplicados

**Status:** Concluído em 2026-07-18.

Loading, login e setup obrigatório foram movidos para `src/app/AppEntryShells.tsx`. A inicialização de splash/system UI foi movida para `src/app/useExpoBoot.ts`.

**Risco residual:** o shell autenticado e as rotas condicionais ainda vivem no `App.tsx` e devem ser extraídos no item 1.4.

**Prioridade:** P2

## 1.4. Rotas autenticadas embutidas no JSX principal

**Status:** Concluído em 2026-07-18.

As renderizações de `InvestmentScreen`, `PublicProfileScreen`, `FeedScreen`, `SearchScreen`, `MessagesScreen`, `SubmitVideoScreen`, `AdminScreen` e `ProfileScreen` foram movidas para `src/app/AppRoutes.tsx`.

**Risco residual:** `AppRoutes.tsx` ainda tem uma lista longa de props e deve ser quebrado em subcomponentes `FeedRoute`, `SearchRoute`, `MessagesRoute`, `SubmitRoute`, `AdminRoute` e `ProfileRoute` quando as telas forem migradas para `src/pages/`.

**Prioridade:** P1

## 2. Camada de services e repositories

**Status:** Parcialmente resolvido em 2026-07-16.

Foram criados repositories para o estado principal e services para dados sociais e fotos:

- `src/repositories/appStateSchema.ts`
- `src/repositories/localRepository.ts`
- `src/services/socialStorage.ts`
- `src/services/profileStorage.ts`

**Risco residual:** Actions de autenticação, vídeo, moderação e carteira ainda recebem setters React. A futura API deve implementar os mesmos contratos do repository local.

**Prioridade:** P0

## 3. Persistência parcialmente local

**Status:** Contas e perfis migrados para Firebase em 2026-07-27.

Firebase Authentication agora é a autoridade de credenciais e sessão. Metadados privados mínimos ficam em `accounts/{uid}` e o perfil público em `profiles/{uid}`. O estado local versão 6 não serializa conta ativa, lista de usuários, hash ou salt.

**Risco residual:** Publicações, mídia, follows, mensagens, avatares personalizados, preferências e campanhas continuam locais. URI de mídia pode expirar e não sincroniza entre aparelhos.

**Ação:** A integração de Firebase Storage e publicações foi preparada em 2026-07-29. Falta ativar o bucket no plano Blaze, publicar `storage.rules` e então implantar o cliente no Hosting. Processamento confiável de duração, resolução e thumbnails continua pendente.

**Prioridade:** P0 para mídia e conteúdo social remoto

## 4. Autenticação e autorização Firebase

**Status:** Fase 1 implementada em 2026-07-27.

Cadastro, login, logout, verificação de email, recuperação de senha, Google e restauração de sessão usam Firebase Authentication. Perfis e usernames usam transações do Firestore e regras deny-by-default. Papel administrativo não é aceito no perfil público.

**Risco residual:** As regras ainda precisam ser testadas no Emulator Suite e publicadas no projeto correto. App Check precisa ser registrado e colocado em enforcement após observação. Funções administrativas futuras dependem de custom claims e execução server-side.

**Ação:** Concluir configuração do console, testes de regras, App Check, custom claims, auditoria e fluxos LGPD.

**Prioridade:** P0
## 5. Upload de vídeo por URI ou link

**Status:** Pendente.

Arquivos não são enviados para bucket nem validados no servidor. URI local pode expirar ou deixar de funcionar em outro aparelho.

**Ação:** Usar S3, R2, Supabase Storage ou equivalente com URL assinada, limites, thumbnail e metadados.

**Prioridade:** P0

## 6. Navegação manual por estado

**Status:** Pendente.

Rotas usam `useState<Tab>` e seleção condicional. Não existe deep link, URL de perfil ou histórico real do navegador.

**Ação:** Primeiro isolar a navegação manual em `useAppNavigation`. Depois adotar Expo Router ou React Navigation com rotas tipadas, deep links e histórico real quando os fluxos estiverem estabilizados.

**Prioridade:** P1

## 7. Feed sem virtualização

**Status:** Pendente.

O feed usa `ScrollView` e monta um player para cada item.

**Ação:** Migrar para `FlatList` ou `FlashList`, paginar e manter montado apenas o player relevante.

**Prioridade:** P1

## 8. `VideoPlayer` não reutilizável

**Status:** Pendente.

Controles de reprodução ainda ficam dentro de `FeedScreen.tsx` e componentes de envio/moderação.

**Ação:** Extrair `src/components/VideoPlayer.tsx` e reutilizar nos contextos de feed, perfil e admin.

**Prioridade:** P1

## 9. Prop drilling de estado global

**Status:** Parcialmente resolvido.

Persistência foi movida para hooks, mas saldo, fundos, investimentos e handlers ainda atravessam várias props.

**Ação:** Avaliar Context API depois da estabilização dos contratos de repository.

**Prioridade:** P1

## 10. Código e domínio financeiro residuais

**Status:** Pendente.

Existem funções de distribuição sem uso e `PlayerEvaluation` ainda mistura avaliação esportiva com campos financeiros. `AthleteFund` deve ser a única fonte da bolsa.

**Ação:** Remover código morto e separar `AthleteEvaluation` de `AthleteFund`.

**Prioridade:** P1

## 11. Utilitários agrupados como actions

**Status:** Parcialmente resolvido.

Helpers saíram do `App.tsx`, mas `appActions.ts` ainda mistura builders, formatadores e utilitários de vídeo.

**Ação:** Mover para `src/utils/` e ampliar testes.

**Prioridade:** P2

## 12. Estilos globais ainda agrupados por domínio amplo

**Status:** Parcialmente resolvido.

O `StyleSheet` saiu do componente raiz e `src/styles/appStyles.ts` agora funciona como agregador. Os estilos foram separados em módulos por domínio dentro de `src/styles/app/`, preservando a API pública `styles` para reduzir risco durante o refactor.

**Risco residual:** os estilos ainda não estão colocalizados nas futuras pastas de `src/pages/` e `src/components/`. Ao extrair telas e componentes, cada pasta deve assumir seus próprios arquivos `.styles.ts` e `.types.ts`.

**Ação:** Separar estilos por página e por componente. Cada componente extraído deve carregar seus próprios estilos em uma pasta dedicada, evitando mover tudo para arquivos grandes de estilo da página. Manter somente tokens compartilhados em `theme.ts`.

**Prioridade:** P2

## 13. Cobertura automatizada limitada

**Status:** Parcialmente resolvido em 2026-07-16.

Existe uma suíte nativa do Node cobrindo fallback, migração, serialização, credenciais locais, perfil e operações do repository local.

**Risco residual:** Ainda faltam testes de UI, moderação, envio, follow, mensagens e aporte.

**Prioridade:** P2

## 14. Sem lint e formatação automática

**Status:** Pendente.

O projeto usa TypeScript strict, mas ainda não possui ESLint, Prettier ou hook de pre-commit.

**Ação:** Adicionar preset Expo, formatação e scripts de CI.

**Prioridade:** P2

## 15. CI concentrado na web

**Status:** Parcialmente resolvido em 2026-07-16.

O workflow executa testes, typecheck, build web e deploy. Ainda não existe validação mobile, `eas.json` ou pipeline de pull request separado.

**Prioridade:** P2

## 16. Strings hardcoded sem i18n

**Status:** Pendente.

Textos permanecem em português dentro dos componentes.

**Ação:** Adotar i18n somente quando houver plano real de outro idioma.

**Prioridade:** P3

## 17. Tratamento de erro e observabilidade

**Status:** Pendente.

Existem alerts pontuais e falhas silenciosas. Não há ErrorBoundary nem monitoramento remoto.

**Ação:** Criar ErrorBoundary e estados de retry localmente; Sentry depende de conta e DSN externos.

**Prioridade:** P2

## 18. Modelo de avaliação com campos financeiros

**Status:** Pendente.

`Player.evaluation` ainda possui meta, ticket e projeção financeira, apesar de a bolsa usar `AthleteFund`.

**Ação:** Remover campos financeiros da avaliação e usar o fundo em todas as telas.

**Prioridade:** P1

## 19. Moderação e denúncia locais

**Status:** Parcialmente resolvido apenas para demonstração.

Decisões administrativas agora persistem no dispositivo, mas não possuem auditoria remota, denúncia, bloqueio ou remoção distribuída.

**Ação:** Criar endpoints e trilha com `adminId`, nota e timestamp.

**Prioridade:** P1

## 20. Regulação e LGPD

**Status:** Pendente e bloqueante para dinheiro real.

Consentimentos, KYC e termos não possuem registro server-side auditável. A carteira continua explicitamente simulada.

**Ação:** Validação jurídica, backend auditável e parceiros autorizados antes de qualquer captação real.

**Prioridade:** P0 para lançamento financeiro

## Ordem atual recomendada

1. Upload remoto, backend e autenticação real.
2. Extrair seletores puros e navegação local do `App.tsx`.
3. Extrair shells de entrada e rotas autenticadas do `App.tsx`.
4. Extrair `VideoPlayer` e virtualizar o feed.
5. Limpar o domínio financeiro e código morto.
6. Adicionar ErrorBoundary, lint e testes dos fluxos críticos.
7. Adotar navegação tipada e deep links.
8. Separar estilos por domínio.
9. Configurar EAS e validação mobile no CI.
