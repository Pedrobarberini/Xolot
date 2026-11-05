# Mapa de arquivos e fachadas

Data inicial: 2026-11-01. Atualizar este mapa quando uma movimentação ocorrer. `Planejado` não significa que o destino já existe.

| Origem | Destino | Estado | Retirada da fachada |
|---|---|---|---|
| `App.tsx` | `src/bootstrap/AppRoot.tsx` | Planejado | N04 |
| `src/app/AppRoutes.tsx` | `src/navigation` e rotas finas | Planejado | N04 |
| `src/app/useAppNavigation.ts` | adaptador legado em `src/navigation` | Planejado | N05 |
| `src/types.ts` | tipos por domínio em `src/features` | Planejado | Depois de migrar consumidores |
| `src/types.ts`: conta/perfil/provedor; DTO público em utils | `features/auth/domain`, `features/profiles/domain` e adaptadores de aplicação | Extraídos em C01; fachada AppUser compatível como união de conta autenticada/perfil social | C06/C07 migram estado e repositórios; U04/U07 migram props específicas |
| `src/services/firebaseProfileService.ts` | `features/profiles/{application,data,domain}` e `bootstrap/profileServices.ts` | C07 extrai validação, porta e transação de perfil/username; fachada mantém projeção SDK→legado | U04/U07 retiram imports legados; Q03 pagina a leitura |
| `src/actions/useFirebaseAccounts.ts`, `src/services/firebaseAccountService.ts` | `features/auth/{domain,application,data,ui/SessionProvider}` e `bootstrap/authServices.ts` | C06 separa controle, cadastro, SDK e composição; fachada do hook conserva somente lista social e setter compatível | U07/N04; facade de conta retirada após migração de todos os imports |
| Leitura própria/pública de `firebaseProfileService.ts` | `features/profiles/data/firebaseProfileReader.ts` | C06 fornece leitura à sessão; C07 define porta sem SDK e integra reserva/escrita | Q03 pagina lista pública |
| `src/services/firebasePostService.ts` | `src/features/posts/data` | Planejado | Q01 e Q02 |
| `src/types.ts`: Player/VideoSubmission/entrada de mídia; `utils/firebasePostDocument.ts` | `features/posts/{domain,application,data}` e `features/feed/domain` | C02 separa Post/MediaAsset/Draft/FeedItem; fachadas preservadas | Q01/U01/U02/U06 migram consumidores e removem os formatos mistos |
| `src/services/firebaseSocialService.ts` | repositórios sociais por domínio | Planejado | Q04–Q07 e M03–M05 |
| `src/actions/useSocialActions.ts` | hooks por funcionalidade | Planejado | Migração de cada consumidor |
| `src/components/Navigation.tsx`: BackButton/LabeledInput | `src/shared/ui/BackButton.tsx`, `src/shared/ui/LabeledInput.tsx` | Extraídos em C03; exports legados preservados | Migrar os imports de cada tela em U02–U07/N04; Header/BottomTabs continuam na composição legada |
| `src/screens/FeedScreen.tsx` | `src/features/feed/ui/FeedScreen` | Planejado | U02–U03 |
| `src/screens/ProfileScreen.tsx` | perfil, preferências e profissional | Planejado | U04 |
| `src/screens/MessagesScreen.tsx` | lista/conversa em messaging | Planejado | U05 |
| `src/screens/SubmissionScreen.tsx` | posts/ui e platform/media | Planejado | U06 |
| `src/ThemeProvider.tsx`, `src/theme.ts` | `src/shared/theme`: tokens, contexto, persistência, efeito web e adaptador legado | Extraídos em C05; duas fachadas pequenas preservam imports | Migrar estilos/consumidores em U02–U08 e remover o adaptador somente após não haver usos |
| `functions/src/index.ts` | `bootstrap/admin.ts` e `modules/posts/handlers.ts` | B01/B04: composição e serviço de mídia separados; 24 exports preservados | Arquivo legacyMediaHandlers removido em B04; recuperação evolui em I01/I04 |
| `functions/src/mercadoPago.ts` | `functions/src/modules/billing` | Planejado | B11/I05 |
| `functions/src/social.ts`: setPostLike/recordPostView | `functions/src/modules/engagement` | B06: transições, porta atômica, adaptador e handlers; retorno confirmado sem variável externa | Implementações antigas removidas; sendDirectMessage permanece até B07 |
| Sugestões esportivas no cadastro | `features/profiles/domain/presentationCatalog.ts`, exposto pela API de profiles | P01 usa áreas/apresentações gerais e conserva as chaves v1; catálogo esportivo antigo não define a nova UI | U07 decompõe o formulário já geral; P08 revisa descoberta e exemplos sem apagar dados |

Não mover arquivos para cumprir a tabela antes de caracterizar seus contratos. Quando houver movimento, registrar os nomes exatos e a evidência da resolução de imports.
