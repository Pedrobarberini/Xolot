# Technical Debt - Xolot

Documento de dívida técnica do estado atual do repositório, atualizado em 2026-07-18.

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

Durante a reorganização, novas telas devem viver em `src/pages/` e componentes reutilizáveis em `src/components/`. Cada componente extraído deve preferir uma pasta própria, mantendo implementação, estilos e tipos locais juntos.

Formato recomendado:

```txt
src/components/VideoPlayer/
  VideoPlayer.tsx
  VideoPlayer.styles.ts
  VideoPlayer.types.ts
  index.ts
```

Para componentes específicos de uma página, manter dentro da própria página até existir reutilização real:

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

## 3. Estado volátil sem persistência

**Status:** Curto prazo resolvido em 2026-07-16.

Usuários cadastrados, sessão ativa, envios, decisões de moderação, saldos, bolsas e investimentos agora usam estado local versionado com `AsyncStorage`. Follows, mensagens e fotos já possuíam persistência própria.

**Risco residual:** URI de vídeo escolhida no aparelho pode apontar para cache temporário. O registro da postagem sobrevive ao refresh, mas o arquivo só terá disponibilidade garantida depois do upload para storage remoto.

**Prioridade:** P0 para upload remoto

## 4. Autenticação simulada sem segurança

**Status:** Parcialmente resolvido localmente em 2026-07-16.

Cadastro e login agora usam email e senha. A senha não é serializada em texto puro: o dispositivo armazena salt aleatório e hash SHA-256, e contas antigas definem uma credencial no próximo acesso. O primeiro login também exige a conclusão do perfil do atleta.

**Risco residual:** Não existe backend, sessão/token server-side, verificação de email, recuperação de senha, limitação de tentativas nem sincronização entre dispositivos. O papel Admin ainda é escolhido no cliente para permitir a demonstração; por isso, o fluxo atual não é autenticação segura para público.

**Ação:** Implementar auth no backend com hash apropriado no servidor, sessão segura, recuperação de senha, verificação de email, rate limit e atribuição de papel somente no servidor.

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
