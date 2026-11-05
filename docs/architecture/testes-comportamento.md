# Proteções durante extrações

Executar `pnpm test` para os testes Node e `pnpm run test:ui` para componentes
e hooks. Jest usa o preset Expo 54, renderer React 19.1 e Testing Library Native
13 já fixados em F01. Não depende de Firebase real, conta ou acesso à rede.
SDKs e portas externas são simulados na suíte UI; hook, componente, estado React
e estilos são executados. A integração com SDKs e Rules roda separadamente nos
emuladores, sem serviços de produção.

| Proteção anterior | Prova atual | Estado |
|---|---|---|
| `remoteSync.test.mts`: regex de cache e snapshot | `firebasePosts.test.tsx`: não assina antes do cache, limpa dados, recebe snapshot, atualiza loading e cancela assinatura | Substituída |
| `profileGalleryVisual.test.mts`: regex da sombra do título | `profileGallery.test.tsx`: renderiza foto/título com sombra e pressiona a publicação correta | Substituída |
| Proibição da camada de sombra e tamanho/ícone das opções | Asserções antigas preservadas; teste renderizado adicional de contraste/tamanho | Migração parcial, completar em U04 |
| Restauração de perfil legado e retenção da identidade Google sem cadastro | `sessionController.test.mts`: execução de restauração, polling, A/B, erros e descarte; `sessionProvider.test.tsx`: renderização dos estados e lista social; `authSession.test.mts`: SDK emulado com Rules | Regex da restauração e do logout Google substituídas em C06; diagnóstico remoto permanece até Q01 |
| `feedPlayback.test.mts`: seleção e ajuste do player | Funções puras executadas com diferentes índices e overlays | Preservada; integração do player em U01/U03 |
| `firestoreRules.test.mts`: regex da leitura de conta/perfil em auth.ts | `tests/backend/registration.test.mjs`: conta existente, perfil legado concluído, recusa do incompleto, código externo e falha de infraestrutura | Duas asserções estruturais substituídas por execução do caso de uso com porta falsa |
| `accountRegistrationFlow.test.mts`: texto exato de deleteUser(uid) | `requestPolicies.test.mjs`: callable de exclusão executado com Auth simulado; só UID do token é usado e sessão inválida não chega ao efeito | Asserção substituída; demais proteções da limpeza permanecem |
| `firestoreRules.test.mts`: caminho literal do post em setPostLike/recordPostView | `backend/engagement.test.mjs` executa os parsers v1 e o adaptador com retry; `rules/engagementRepository.test.mts` interage com `approved-post-1` e confere post/contadores e marcadores reais | Asserção substituída em B06; proteções de compartilhamento/comentários permanecem |
| Rótulos e sugestões exclusivamente esportivos no cadastro | `ui/accountSetup.test.tsx`: cadastro geral em três etapas, payload v1 válido, organização opcional, edição existente e falha; `profilePresentation.test.mts`: catálogo geral e busca em português | Requisito alterado pelo proprietário em P01; regex dos rótulos antigos removidas após prova equivalente |

O hook também rejeita snapshot atrasado de uma conta anterior e propaga falha
remota. Essas provas continuam válidas se o componente/hook mudar de pasta,
atualizando apenas o import. Nenhuma regex do fonte é usada na suíte UI.

Limites: renderização de teste não mede pixels no navegador, decodifica vídeo ou
substitui testes em aparelho. Os testes estruturais restantes continuam ativos
até existir prova equivalente na tarefa do domínio. Não excluí-los em lote.
