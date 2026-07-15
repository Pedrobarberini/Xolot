# Technical Debt — NextStar

Documento de dívida técnica do estado atual do repositório (jul/2026). Cada item descreve o problema, o impacto e a ação recomendada.

---

## 1. Monolito `App.tsx` — resolvido

**Status:** Resolvido em 2026-07-15.

**Solução aplicada:** O `App.tsx` foi reduzido de ~6.800 para 231 linhas e agora concentra estado, composição e roteamento local. Telas, ações, navegação, shell, constantes e estilos foram movidos para módulos em `src/`.

**Risco residual:** `FeedScreen.tsx` e `src/styles/appStyles.ts` ainda são grandes. A extração de `VideoPlayer`, `VideoCard`, `AppToast` e estilos por domínio permanece em `backlog.md` (P0-001 e P1-002).

**Prioridade:** Concluída

---

## 2. Ausência de camada de serviços/repositório

**Problema:** Os handlers foram extraídos para `src/actions/createAppActions.ts`, mas ainda manipulam estado local (`useState`) sem uma interface de persistência.

**Impacto:** Impossível trocar persistência local por API sem reescrever a UI. Lógica de negócio acoplada à apresentação.

**Ação:** Criar `src/services/` e `src/repositories/localRepository.ts` com interfaces estáveis (`authService`, `videoService`, `moderationService`, `profileService`, `walletService`). Telas consomem serviços, não arrays globais.

**Prioridade:** P0

---

## 3. Estado volátil sem persistência

**Problema:** Usuários, envios, saldos, bolsas e investimentos existem só em memória React. Recarregar a página ou fechar o app apaga tudo.

**Impacto:** Impede testes realistas, demos longas e qualquer uso além de protótipo local.

**Ação:** Curto prazo — persistir em `AsyncStorage` (mobile) / `localStorage` (web) via repositório local. Médio prazo — backend com banco e storage de mídia (P0-003, P0-004 em `backlog.md`).

**Prioridade:** P0

---

## 4. Autenticação simulada sem segurança

**Problema:** Login/cadastro validam apenas e-mail e nome. Não há senha, token, sessão ou verificação server-side. O papel `Admin` é escolhido no cliente.

**Impacto:** Qualquer usuário pode assumir perfil de moderador. Inviável para ambiente público.

**Ação:** Implementar autenticação real (registro, login, logout, sessão/token) no backend. Remover seleção de `Admin` da UI de cadastro comum; atribuir papel apenas server-side.

**Prioridade:** P0

---

## 5. Upload de vídeo por link local

**Problema:** Envios aceitam URI local (`expo-image-picker`) ou URL HTTP colada manualmente. Arquivos não sobrevivem ao refresh e não passam por validação de formato, tamanho ou duração no servidor.

**Impacto:** Vídeos de produção não são confiáveis; admin pode não conseguir reproduzir conteúdo enviado.

**Ação:** Upload para bucket privado (S3, R2, Supabase Storage), URL assinada, validação de mp4/mov/webm, limite de tamanho/duração, geração de thumbnail e metadados no servidor.

**Prioridade:** P0

---

## 6. Navegação manual por abas

**Problema:** Roteamento implementado com `useState<Tab>` e renderização condicional. Detalhe de perfil usa `selectedPlayer` no mesmo nível. Sem deep linking, histórico de navegação ou biblioteca de rotas.

**Impacto:** URLs não abrem telas específicas na web; botão voltar do navegador não funciona como esperado; difícil compartilhar perfil ou vídeo.

**Ação:** Adotar `@react-navigation/native` (ou Expo Router) com rotas tipadas para feed, envio, carteira, perfil, admin e detalhe de atleta.

**Prioridade:** P1

---

## 7. Feed sem virtualização

**Problema:** `FeedScreen` usa `ScrollView` mapeando todos os `feedPlayers`. Cada item monta `FeedVideoPlayback` com `useVideoPlayer`, mesmo quando inativo (apenas pausado).

**Impacto:** Consumo de memória e CPU cresce linearmente com o número de vídeos. Escala mal além de dezenas de itens.

**Ação:** Migrar para `FlatList`/`FlashList` com paginação. Montar player somente para o item visível (`isActive`). Pausar e descartar instâncias fora da viewport.

**Prioridade:** P1

---

## 8. `VideoPlayer` não reutilizável

**Problema:** A lógica de reprodução (play/pause, seek, volume vertical, fullscreen, loop) continua distribuída entre `FeedScreen.tsx` e `SubmissionComponents.tsx`, sem um player compartilhado.

**Impacto:** Correções e melhorias precisam ser replicadas manualmente em três lugares.

**Ação:** Extrair `src/components/VideoPlayer.tsx` com props (`uri`, `autoPlay`, `muted`, `showControls`, `onPlaybackError`). Usar nos três contextos.

**Prioridade:** P1

---

## 9. Prop drilling de estado global

**Problema:** Saldo, fundos, investimentos e handlers passam por múltiplos níveis de props (`App` → `FeedScreen` → `FeedReel` → …).

**Impacto:** Interfaces de componentes infladas; difícil adicionar novos consumidores de estado.

**Ação:** Introduzir Context API ou store leve (Zustand) para `user`, `wallet`, `funds`, `investments` e `submissions`. Manter handlers nos serviços.

**Prioridade:** P1

---

## 10. Código e tipos mortos

**Problema:**
- `calculatePoolShare` e `calculateProjectedDistribution` em `src/utils/investment.ts` não são importados em nenhum lugar.
- `PlayerEvaluation` em `src/types.ts` ainda expõe `projectedMonthlyEarnings`, removido do produto.
- `getCardPalette` / `getCardPaletteFromId` sempre retornam `CARD_PALETTE` fixo; `CardPalette` não varia por item.

**Impacto:** Confunde leitores sobre o que está ativo; aumenta superfície de manutenção.

**Ação:** Remover funções e campos não usados. Se `CardPalette` for sempre único, eliminar a abstração e usar `colors`/`theme` diretamente.

**Prioridade:** P2

---

## 11. Utilitários presos ao componente — parcialmente resolvido

**Status:** Helpers foram removidos do `App.tsx` e agrupados em `src/actions/appActions.ts`.

**Risco residual:** O nome `appActions.ts` mistura formatadores e builders; esses helpers ainda devem migrar para `src/utils/` e receber testes unitários.

**Ação:** Mover para `src/utils/` (ex.: `format.ts`, `video.ts`, `player.ts`).

**Prioridade:** P2

---

## 12. Estilos centralizados em bloco único — parcialmente resolvido

**Status:** O `StyleSheet.create` foi removido do `App.tsx` e movido para `src/styles/appStyles.ts`.

**Risco residual:** Telas distintas ainda compartilham um único arquivo de estilos com muitas chaves.

**Ação:** Co-localizar estilos com cada screen/component ou criar `src/styles/` por domínio (`auth.ts`, `feed.ts`, `profile.ts`). Manter tokens em `src/theme.ts`.

**Prioridade:** P2

---

## 13. Zero testes automatizados

**Problema:** Não há Jest, Vitest, Testing Library nem arquivos `*.test.ts`. CI executa apenas `typecheck` e build web.

**Impacto:** Regressões em fluxos críticos (cadastro, envio, moderação, aporte simulado) só são detectadas manualmente.

**Ação:** Configurar Jest + `@testing-library/react-native`. Cobrir primeiro utilitários (`formatBRL`, validações de aporte) e serviços. Adicionar smoke tests dos fluxos principais.

**Prioridade:** P2

---

## 14. Sem lint/format no projeto

**Problema:** Não existem ESLint, Prettier nem hooks de pre-commit. Apenas `strict: true` no TypeScript.

**Impacto:** Estilo inconsistente entre contribuições; erros comuns (deps de hooks, imports não usados) passam despercebidos.

**Ação:** Adicionar ESLint (Expo preset), Prettier e script `pnpm lint`. Integrar no CI antes do typecheck.

**Prioridade:** P2

---

## 15. CI limitado a web

**Problema:** `.github/workflows/pages.yml` faz typecheck e deploy web. Não há `eas.json`, build Android/iOS nem `.env.example`.

**Impacto:** Builds mobile podem quebrar sem detecção precoce; onboarding depende de conhecimento tácito de variáveis.

**Ação:** Criar `eas.json` com profiles `preview` e `production`. Adicionar workflow de typecheck em PR. Documentar variáveis em `.env.example`.

**Prioridade:** P2

---

## 16. Strings hardcoded sem i18n

**Problema:** Todos os textos de UI, alertas e labels estão em português fixo dentro dos componentes.

**Impacto:** Expansão para outros mercados exige busca manual em ~6.800 linhas.

**Ação:** Adotar `i18next` ou similar com namespace por tela. Manter pt-BR como locale padrão.

**Prioridade:** P3

---

## 17. Tratamento de erro e observabilidade ausentes

**Problema:** Falhas de vídeo, picker e rede usam `Alert` pontual ou `.catch(() => undefined)`. Sem error boundary React, sem Sentry/logs estruturados.

**Impacto:** Erros silenciosos em produção; impossível medir taxa de falha de upload ou reprodução.

**Ação:** Adicionar `ErrorBoundary` global. Integrar serviço de crash reporting. Padronizar estados de loading/erro/retry nas telas de feed, envio e admin.

**Prioridade:** P2

---

## 18. Modelo de domínio com resquícios financeiros

**Problema:** `Player.evaluation` mistura avaliação esportiva com campos financeiros (`fundingGoal`, `projectedMonthlyEarnings`). Bolsa real usa `AthleteFund` separado, mas tipos e UI ainda referenciam `evaluation` para progresso e labels.

**Impacto:** Dois caminhos paralelos para dados financeiros; risco de exibir valores inconsistentes.

**Ação:** Separar tipos: `AthleteEvaluation` (esportivo, futuro) e `AthleteFund` (financeiro). Remover campos financeiros de `PlayerEvaluation`. UI do feed usa exclusivamente `AthleteFund`.

**Prioridade:** P1

---

## 19. Moderação e denúncia só locais

**Problema:** Fila admin filtra `submissions` em memória. Não há endpoint de denúncia, auditoria, bloqueio de usuário ou remoção de vídeo aprovado.

**Impacto:** Conteúdo inadequado não pode ser tratado de forma rastreável em produção.

**Ação:** Persistir decisões de moderação com `adminId`, `note` e timestamp. Implementar fluxo de denúncia (`POST /videos/:id/report`) e painel admin correspondente.

**Prioridade:** P1

---

## 20. Conformidade regulatória e LGPD pendentes

**Problema:** Fluxo financeiro é simulado, mas coleta dados de menores (`hasGuardianConsent`) sem armazenamento auditável. Termos aceitos ficam só no objeto `AppUser` local.

**Impacto:** Bloqueia lançamento público e qualquer captacao real (CVM, KYC, LGPD).

**Ação:** Registrar consentimentos com timestamp e hash de IP no backend. Ocultar ou rotular explicitamente carteira até validação jurídica. Ver `docs/product-plan.md` e P3-001 em `backlog.md`.

**Prioridade:** P0 (para lançamento) / P3 (para financeiro real)

---

## Ordem sugerida de execução

1. Quebrar `App.tsx` (item 1)
2. Camada de serviços + persistência local (itens 2, 3)
3. Backend mínimo + auth real + upload (itens 4, 5)
4. Feed virtualizado + VideoPlayer compartilhado (itens 7, 8)
5. Navegação, testes, lint e CI (itens 6, 13, 14, 15)
6. Limpeza de tipos/código morto (itens 10, 11, 18)
7. Moderação, observabilidade e conformidade (itens 17, 19, 20)
