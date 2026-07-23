# Backlog técnico - Xolot

Atualizado em 2026-07-18.

Este backlog e escrito para desenvolvimento. Cada item deve virar issue/task no GitHub, Trello, Jira ou similar.

Tarefas concluídas estão documentadas em `releases/release-1.md`.

## Prioridades

- P0: bloqueia lançamento público.
- P1: necessário para MVP público.
- P2: melhora operação, escala e qualidade.
- P3: futuro, depende de validação jurídica/regulatória.

## Definition of Done

- Código com TypeScript sem erro em `pnpm run typecheck`.
- Fluxo testado em web e Android via Expo Go ou build.
- Estados de loading, erro, vazio e sucesso tratados.
- Não exibir dados fake como se fossem reais.
- UI responsiva sem sobreposição em telas pequenas.
- Dados sensíveis protegidos e sem log indevido.
- Coverage tests feitos e funcionando.
- README ou docs atualizados quando houver mudanca de fluxo.

## Sprint 1 - Base real de produto

### Task P0-001 - Criar estrutura de screens

Tipo: Frontend

Status: Em andamento. A modularização principal foi entregue em 2026-07-15; componentes menores continuam pendentes.

Objetivo: quebrar o `App.tsx` em telas/componentes para o app ficar mais facil de manter.

Tasks:

- [x] Criar `src/screens/AuthScreen.tsx`.
- [x] Criar `src/screens/FeedScreen.tsx`.
- [x] Criar `src/screens/SubmissionScreen.tsx`.
- [x] Criar `src/screens/AdminScreen.tsx`.
- [x] Criar `src/screens/ProfileScreen.tsx`.
- [x] Criar `src/screens/WalletScreen.tsx`.
- [x] Criar `src/screens/SearchScreen.tsx` com pesquisa de perfis reais.
- [x] Incluir contas cadastradas na sessão nos resultados, mesmo sem vídeo aprovado.
- [x] Criar estado público navegavel para usuário cadastrado sem publicações.
- [x] Criar `src/screens/MessagesScreen.tsx` com estado vazio sem conversas fake.
- [x] Iniciar uma conversa pelo perfil visitado.
- [x] Enviar mensagens e manter o histórico durante a sessão atual.
- [ ] Criar `src/components/VideoCard.tsx`.
- [ ] Criar `src/components/VideoPlayer.tsx`.
- [x] Extrair a navegação inferior para `src/components/Navigation.tsx`.
- [x] Renomear a aba `Feed` para `Início`.
- [x] Substituir `Carteira` no footer por `Pesquisar` e adicionar `Mensagens`.
- [x] Mover o acesso da Carteira para o menu de três barras do Perfil.
- [x] Permitir fechar o menu do Perfil tocando em qualquer lado fora do HUD.
- [ ] Criar `src/components/AppToast.tsx`.
- [x] Extrair estilos do `App.tsx` para `src/styles/appStyles.ts`.
- [x] Extrair handlers de produto para `src/actions/createAppActions.ts`.
- [x] Extrair helpers de dados para `src/actions/appActions.ts`.
- [x] Extrair shell, splash e transições para `src/components/AppShell.tsx`.
- [ ] Dividir `src/styles/appStyles.ts` por tela ou domínio.

Criterios de aceite:

- `App.tsx` deve ficar responsável principalmente por estado global simples e roteamento local.
- Nenhuma tela deve depender de dados fake escondidos no componente.
- Layout atual deve continuar funcionando após a quebra.

### Task P0-002 - Criar camada de dados local/API

Tipo: Frontend/Arquitetura

Status: Em andamento. Repository local versionado e persistência dos estados principais entregues em 2026-07-16; services HTTP dependem do backend.

Objetivo: preparar o app para trocar estado local por backend sem reescrever as telas.

Tasks:

- [ ] Criar `src/services/authService.ts`.
- [ ] Criar `src/services/videoService.ts`.
- [ ] Criar `src/services/moderationService.ts`.
- [ ] Criar `src/services/profileService.ts`.
- [ ] Criar `src/services/messageService.ts`.
- [x] Criar `src/repositories/localRepository.ts` para estado temporário.
- [x] Criar schema versionado em `src/repositories/appStateSchema.ts`.
- [x] Criar hook de hidratação e persistência em `src/actions/usePersistentAppState.ts`.
- [x] Persistir usuários, sessão, envios, moderação, saldos, bolsas e investimentos.
- [x] Restaurar a sessão e a rota administrativa depois do refresh.
- [x] Criar migração defensiva para estado sem versão ou parcialmente inválido.
- [x] Cobrir fallback, migração, serialização e repository com testes automatizados.
- [ ] Criar tipos de request/response em `src/types.ts` ou `src/api/types.ts`.

Criterios de aceite:

- Screens não devem chamar diretamente arrays globais de usuários/videos.
- Deve ser possível trocar `localRepository` por API HTTP depois.
- Todos os dados demonstrativos devem estar marcados como `isDemo`.
- Estado local válido deve sobreviver ao refresh sem misturar dados entre contas.
- URI de arquivo local não deve ser tratada como upload permanente.

### Task P0-003 - Backend mínimo

Tipo: Backend

Objetivo: criar API real para usuários, vídeos, moderação e sessões.

Endpoints sugeridos:

- [ ] `POST /auth/register`
- [ ] `POST /auth/login`
- [ ] `POST /auth/logout`
- [ ] `GET /me`
- [ ] `PATCH /me`
- [ ] `POST /videos`
- [ ] `GET /videos/feed`
- [ ] `GET /videos/:id`
- [ ] `PATCH /admin/videos/:id/approve`
- [ ] `PATCH /admin/videos/:id/reject`
- [ ] `PATCH /admin/videos/:id/request-changes`
- [ ] `GET /admin/videos/pending`
- [ ] `GET /conversations`
- [ ] `GET /conversations/:id/messages`
- [ ] `POST /conversations/:id/messages`

Modelo inicial:

- [ ] User: id, name, email, passwordHash, role, createdAt, updatedAt.
- [ ] AthleteProfile: userId, age, city, position, club, bio, avatarUrl.
- [ ] Video: id, athleteId, title, videoUrl, thumbnailUrl, durationMs, status, createdAt.
- [ ] ModerationDecision: id, videoId, adminId, status, note, createdAt.
- [ ] Consent: id, athleteId, guardianName, acceptedAt, ipHash.

Criterios de aceite:

- Login retorna sessão/token.
- Video aprovado aparece no feed.
- Video reprovado ou pendente não aparece no feed.
- Decisões de admin ficam registradas.

### Task P0-004 - Upload real de vídeo

Tipo: Backend/Frontend

Objetivo: substituir links temporários por upload real de arquivo.

Tasks:

- [x] Persistir provisoriamente no IndexedDB os vídeos escolhidos no navegador.
- [x] Salvar no estado apenas uma referência duravel, sem serializar URLs `blob:` temporárias.
- [x] Resolver a referência local em Feed, Perfil e Admin depois de recarregar a página.
- [x] Exibir fallback de reenvio para vídeos antigos cujo arquivo temporário já expirou.
- [ ] Definir provider de storage: Supabase Storage, S3, Cloudflare R2 ou Firebase Storage.
- [ ] Criar endpoint para gerar URL assinada de upload.
- [ ] Validar formato: mp4, mov ou webm.
- [ ] Validar tamanho máximo.
- [ ] Validar duração máxima.
- [ ] Gerar thumbnail.
- [ ] Salvar duração e proporção do vídeo.
- [ ] Exibir progresso de upload na tela de envio.
- [ ] Exibir erro amigavel quando upload falhar.

Criterios de aceite:

- Usuário consegue enviar vídeo do celular.
- Video sobrevive ao refresh da página.
- Admin consegue assistir o vídeo enviado.
- Feed reproduz o vídeo aprovado.

### Task P0-005 - Cadastro com senha e configuração do perfil

Tipo: Frontend/Dados/Autenticação

Status: Concluído localmente em 2026-07-16. Autenticação server-side continua bloqueante para o lançamento público.

Objetivo: substituir o acesso por nome e email por credenciais locais e coletar os dados públicos do atleta no primeiro acesso.

Tasks:

- [x] Usar email e senha no cadastro e no login.
- [x] Exibir login como tela inicial e oferecer `Cadastrar` como ação secundária.
- [x] Manter no cadastro somente email, senha, confirmação e aceite dos termos.
- [x] Preparar botão com ícone para a futura autenticação pelo Google.
- [x] Separar nome público do atleta e `@username` na configuração de perfil.
- [x] Permitir nomes públicos repetidos e exigir username único sem diferença entre maiúsculas e minúsculas.
- [x] Bloquear email duplicado em toda a plataforma, independentemente do tipo de conta.
- [x] Migrar contas existentes para usernames válidos e sem repeticao.
- [x] Solicitar confirmação de senha durante o cadastro.
- [x] Armazenar somente salt e hash SHA-256 no estado local, sem senha em texto puro.
- [x] Migrar contas antigas para definicao de senha no próximo login.
- [x] Criar configuração obrigatória no primeiro acesso de contas Usuário.
- [x] Apresentar a configuração inicial em modal sobre a área autenticada.
- [x] Validar disponibilidade do username no primeiro acesso e na edição do perfil.
- [x] Coletar nome, biografia, idade, posição, cidade e clube ou projeto.
- [x] Persistir o perfil junto da conta cadastrada.
- [x] Reutilizar o formulário em `Perfil > Configurações > Editar perfil`.
- [x] Exibir biografia, clube e dados atualizados nos perfis próprio e público.
- [x] Exibir `@username` antes do nome público no Início e nos perfis próprio, público e de investimento.
- [x] Incluir os novos dados na pesquisa de perfis.
- [x] Permitir pesquisa tanto pelo nome público quanto pelo `@username`.
- [x] Liberar conversa com a própria conta sem exigir follow.
- [x] Versionar a migração e cobrir hash e perfil com teste automatizado.

Criterios de aceite:

- Conta nova não entra no Início antes de completar os dados obrigatórios.
- Login posterior abre o app diretamente quando o perfil já estiver completo.
- Editar e salvar o perfil atualiza imediatamente a vitrine pública.
- Recarregar o app preserva credenciais e dados do perfil neste dispositivo.
- Nenhuma senha em texto puro e serializada pelo repository local.
- A interface informa que autenticação, recuperação de senha e papéis reais ainda dependem do backend.

## Sprint 2 - Feed profissional

### Task P1-001 - Melhorar FeedScreen

Tipo: Frontend

Objetivo: deixar o feed pronto para uso público.

Tasks:

- [ ] Implementar lista paginada de vídeos aprovados.
- [x] Reproduzir automaticamente apenas o vídeo visível.
- [x] Pausar vídeos fora da tela durante a troca de item.
- [ ] Manter estado de mute por usuário.
- [ ] Criar botão de compartilhar.
- [ ] Criar botão de denunciar.
- [ ] Criar estado vazio quando não houver vídeos.
- [ ] Criar skeleton/loading inicial.
- [ ] Criar retry quando falhar carregar feed.

Criterios de aceite:

- Feed não mostra contagem técnica desnecessária.
- Feed não mostra score/métrica sem avaliação real.
- Video ocupa bem a box, sem cortes estranhos ou barras indevidas.
- Barra de progresso permite avancar e retroceder em mobile e web.

### Task P1-002 - VideoPlayer reutilizável

Tipo: Frontend

Objetivo: padronizar reprodução de vídeo em Feed, Perfil e Admin.

Props sugeridas:

- [ ] `uri`
- [ ] `thumbnailUri`
- [ ] `title`
- [ ] `autoPlay`
- [ ] `muted`
- [ ] `showControls`
- [ ] `onReport`
- [ ] `onShare`
- [ ] `onPlaybackError`

Criterios de aceite:

- Mesmo componente funciona no feed, perfil e admin.
- Controles de play/pause, mute, fullscreen e progresso funcionam.
- Erros mostram fallback visual.

### Task P1-003 - Ficha expansível do atleta

Tipo: Frontend

Objetivo: melhorar a box de texto sobre o feed.

Tasks:

- [x] Criar versão compacta com nome, posição, cidade e título do vídeo.
- [x] Criar botão `Ver mais`.
- [x] Ao expandir, permitir cobrir parte do vídeo de forma intencional.
- [x] Adicionar texto da publicação e tags somente quando existirem.
- [x] Evitar texto cortado em telas pequenas.

Criterios de aceite:

- Texto não cobre o vídeo quando está compacto.
- Usuário consegue expandir e recolher.
- Layout fica estável em telas pequenas.

## Sprint 3 - Envio e publicação

### Task P1-004 - SubmissionScreen completa

Tipo: Frontend

Objetivo: criar fluxo de envio confiável para atleta.

Campos:

- [x] Reutilizar nome, idade, cidade/UF, posição e clube do perfil logado.
- [x] Título do vídeo.
- [x] Texto da publicação.
- [x] Remover o campo `Objetivo do aporte` do envio e do feed.
- [x] Consentimento do responsável quando menor de idade.
- [x] Arquivo de vídeo.

Tasks:

- [x] Remover do envio os campos pessoais já preenchidos no cadastro.
- [x] Usar o perfil ativo como fonte dos dados publicados.
- [x] Manter a biografia somente nas páginas de perfil, sem copiá-la para a postagem.
- [x] Publicar diretamente durante a fase de testes, sem fila manual.
- [x] Migrar envios antigos em revisão para publicados.
- [x] Permitir que o dono exclua um vídeo pela galeria do próprio perfil.
- [x] Remover a publicação do Início, do perfil e do armazenamento local ao excluir.
- [x] Exigir confirmação antes da exclusão definitiva.

Criterios de aceite:

- Botao de enviar fica desabilitado até os campos obrigatórios estarem válidos.
- Apos envio, aparece toast/popup no rodapé por cerca de 3 segundos.
- Usuário não precisa rolar a tela para descobrir se o envio funcionou.
- Publicação aparece imediatamente no Início e no perfil do atleta.
- Exclusão feita pelo dono atualiza Início e perfil sem recarregar a página.
- Uma conta não consegue excluir publicações pertencentes a outro usuário.
- Alterações futuras no perfil não exigem redigitar os dados em cada envio.

### Task P1-005 - Moderação automática de conteúdo

Tipo: Backend/IA/Seguranca

Objetivo: analisar vídeo e texto automaticamente antes da abertura ao público.

Status: Adiado. O teste atual usa publicação direta e não depende de fila manual.

Tasks:

- [ ] Definir provedor e regras para análise automática de vídeo e texto.
- [ ] Enviar a publicação para processamento assíncrono no backend.
- [ ] Bloquear conteúdo com alta confiança de violação antes da exibição pública.
- [ ] Criar estado de recurso para o usuário.
- [ ] Encaminhar casos inconclusivos e recursos para uma fila humana.
- [ ] Registrar versão da regra, resultado, motivo e timestamps em trilha de auditoria.
- [ ] Notificar o usuário quando uma publicação for restringida.
- [ ] Criar filtros de data, atleta, status e motivo para a fila de exceções.

Criterios de aceite:

- Conteudo claramente proibido não entra no Início.
- Cada decisão automática pode ser auditada e contestada.
- Falha do provedor não pública silenciosamente nem perde a postagem.

### Task P1-006 - Denuncias e segurança de conteúdo

Tipo: Frontend/Backend/Admin

Objetivo: permitir que usuários denunciem conteúdo e admins tratem casos sensíveis.

Tasks:

- [ ] Criar `POST /videos/:id/report`.
- [ ] Criar tela/aba Admin para denúncias.
- [ ] Criar motivos padrão de denúncia.
- [ ] Permitir remover vídeo aprovado.
- [ ] Permitir bloquear usuário.
- [ ] Registrar auditoria da decisão.

Criterios de aceite:

- Denuncia cria registro persistente.
- Admin consegue tomar ação.
- Video removido sai do feed.

## Sprint 4 - Avaliação por usuários

### Task P1-007 - Sistema de avaliação comunitária

Tipo: Produto/Frontend/Backend

Objetivo: deixar usuários determinarem avaliações em vez de exibir métricas inventadas.

Criterios sugeridos:

- [ ] Técnica.
- [ ] Visão de jogo.
- [ ] Intensidade.
- [ ] Passe.
- [ ] Finalização.
- [ ] Disciplina tatica.

Tasks:

- [ ] Criar `POST /videos/:id/ratings`.
- [ ] Criar `GET /videos/:id/ratings-summary`.
- [ ] Permitir uma avaliação por usuário por vídeo.
- [ ] Calcular media por criterio.
- [ ] Exibir nota apenas com mínimo de avaliações.
- [ ] Mostrar `Em avaliação` enquanto não houver amostra suficiente.
- [ ] Permitir denunciar avaliação abusiva.

Criterios de aceite:

- Score não é definido pelo sistema sem avaliação.
- Usuário autenticado consegue avaliar.
- Autor do vídeo não pode inflar nota sem regra definida.
- Media pública mostra quantidade de avaliações.

## Sprint 5 - Perfil público

### Task P1-008 - ProfileScreen do atleta

Tipo: Frontend/Backend

Objetivo: criar página pública e editável do atleta.

Tasks:

- [x] Exibir avatar, nome, idade, posição, cidade e clube.
- [x] Exibir bio curta.
- [x] Exibir vídeos aprovados do atleta em uma galeria no próprio perfil.
- [x] Reutilizar o mesmo modelo visual no perfil próprio e no perfil visitado.
- [x] Remover player grande e modal de pré-visualização das páginas de perfil.
- [x] Direcionar o toque em uma miniatura da galeria para o reel correspondente.
- [x] Adicionar ação com ícone para investimento no perfil.
- [x] Criar página dedicada com dados da bolsa e formulário de aporte.
- [x] Desabilitar a ação de investir quando a bolsa não estiver aberta.
- [x] Adicionar botão de fechar na página da bolsa para retornar ao perfil.
- [x] Padronizar a animação de entrada nas novas páginas e subpáginas.
- [x] Sincronizar a transição de Configurações e Carteira com o fechamento do menu.
- [x] Animar a expansão e o recolhimento da descrição `Ver mais` no feed.
- [x] Remover o atalho financeiro duplicado ao lado do menu do Perfil próprio.
- [x] Preservar a origem ao abrir um vídeo do perfil no Início.
- [x] Exibir seta contextual para retornar do reel ao perfil de origem.
- [x] Posicionar seta e marca lado a lado sem sobreposição.
- [x] Padronizar a marca do Início com o tamanho compacto do header.
- [ ] Exibir avaliações agregadas reais quando existirem.
- [x] Permitir editar dados do próprio perfil.
- [x] Criar estado de perfil sem vídeos com orientação para publicar.
- [x] Manter no Perfil apenas identidade resumida e conteúdo publicado.
- [x] Mover verificação, KYC, Conta Xolot e bolsa para Configurações.
- [ ] Criar link compartilhavel do perfil na web.

Criterios de aceite:

- Perfil não mostra métricas fake.
- Perfil funciona para atleta logado e visitante.
- Videos do perfil são reproduzidos no Início, sem player duplicado na página.
- Investimento e preenchido em uma página própria, separada da vitrine pública.
- Usuário retorna ao perfil correto depois de assistir um vídeo da galeria.
- Alterações salvas persistem após refresh.

### Task P1-009 - Sistema de mensagens diretas

Tipo: Frontend/Backend

Status: Em andamento. O fluxo local por conta e a persistência no dispositivo foram entregues; entrega remota e tempo real dependem do backend.

Objetivo: permitir contato direto entre usuários a partir de um perfil público, com histórico confiável e controles de segurança.

Tasks:

- [x] Substituir o atalho financeiro duplicado do perfil público por mensagem.
- [x] Abrir a aba Mensagens com o perfil correto selecionado.
- [x] Criar lista de conversas iniciadas pelo usuário.
- [x] Criar thread com composer, envio e histórico local por conta.
- [x] Isolar contatos e mensagens ao trocar de conta.
- [x] Persistir contatos e mensagens locais no dispositivo.
- [x] Separar Conversas de Solicitações de perfis não seguidos.
- [x] Ocultar mensagens recebidas de perfis não seguidos até o follow.
- [x] Permitir somente uma mensagem inicial como solicitação.
- [x] Abrir ações da conversa por toque longo no card.
- [x] Permitir fixar até três conversas no topo da lista.
- [x] Permitir silenciar notificações por conversa.
- [x] Permitir apagar a conversa somente para o usuário atual.
- [x] Substituir a confirmação nativa incompatível com web por uma confirmação própria no HUD.
- [x] Fazer uma conversa apagada reaparecer quando chegar uma nova mensagem.
- [x] Persistir fixação, silêncio e corte do histórico por conta.
- [x] Padronizar seta, logo e saldo no HUD das páginas de perfil e investimento.
- [ ] Persistir conversas e mensagens no backend.
- [ ] Entregar mensagens em tempo real entre contas autenticadas.
- [ ] Adicionar estados de envio, entregue, lida e falha.
- [ ] Adicionar paginação e carregamento incremental do histórico.
- [ ] Adicionar bloqueio, denúncia e proteção contra spam.
- [ ] Adicionar notificações push com preferências por conta.

Criterios de aceite:

- O ícone de mensagem do perfil abre uma conversa com o destinatário correto.
- Mensagens enviadas aparecem imediatamente na thread e na lista da sessão.
- Sair da conta não deixa o histórico de uma conta visível para outra.
- Perfis seguidos aparecem em Conversas e perfis não seguidos aparecem em Solicitações.
- Uma mensagem recebida por solicitação só fica visível depois que o destinatário segue o remetente.
- Toque longo oferece as ações Fixar, Silenciar notificações e Apagar conversa.
- No máximo três conversas permanecem fixadas e são exibidas antes das demais.
- Apagar uma conversa não remove o histórico armazenado para o outro participante.
- Confirmar `Apagar conversa` remove a conversa no navegador, Android e Expo.
- A versão pública não trata estado local como entrega real ao destinatário.
- Backend, moderação e privacidade devem estar prontos antes de liberar mensagens para o público.

### Task P1-010 - Sistema de follow entre perfis

Tipo: Frontend/Dados/Produto

Status: Concluído localmente em 2026-07-16. Sincronização entre dispositivos depende do backend.

Objetivo: permitir que usuários acompanhem atletas e usar essa relação para personalizar Início e Mensagens.

Tasks:

- [x] Criar vinculo persistente entre usuário é perfil seguido.
- [x] Adicionar botão `Seguir` ao lado do perfil no Início.
- [x] Exibir estado `Seguindo` sem divergencia entre Início e perfil público.
- [x] Permitir deixar de seguir pelas mesmas superfícies.
- [x] Exibir contagem de seguidores no perfil público.
- [x] Exibir seguidores e seguindo no perfil próprio.
- [x] Priorizar vídeos de perfis seguidos no Início.
- [x] Integrar follow com a liberação de mensagens diretas.
- [x] Persistir follows, contatos e mensagens com AsyncStorage.
- [x] Separar estado e ações sociais em `src/actions/useSocialActions.ts`.
- [x] Separar persistência em `src/services/socialStorage.ts`.
- [x] Abrir o perfil correspondente ao tocar em seguidores ou perfis seguidos.
- [x] Direcionar a própria conta para a aba Perfil em vez da visualização pública.

Criterios de aceite:

- Seguir no Início atualiza imediatamente o perfil público e vice-versa.
- Tocar na própria conta pela pesquisa, Início ou listas sociais abre o perfil próprio.
- O estado continua salvo depois de fechar e abrir o app.
- Vídeos de perfis seguidos aparecem primeiro sem remover outros vídeos.
- Contadores sociais usam a mesma fonte de dados do botão de follow.
- Mensagens de perfis não seguidos entram em Solicitações.
- Seguir um contato move a solicitação para Conversas e libera a thread.

### Task FEATURE-044 - Lista paginada de seguidores e seguindo

Tipo: Frontend/Dados/UX

Status: Concluído localmente em 2026-07-18. A lista continua limitada aos follows persistidos neste dispositivo até existir sincronização no backend.

Objetivo: permitir consultar quem segue o perfil e quais perfis a conta segue sem sair da tela atual.

Tasks:

- [x] Derivar IDs de seguidores a partir da mesma relação persistida usada pela contagem de follow.
- [x] Tornar a métrica de seguidores do próprio perfil uma ação acessível.
- [x] Resolver perfis seguidos por ID e tornar a métrica de seguindo uma ação acessível.
- [x] Criar popup reutilizável de listas de perfis com paginação incremental.
- [x] Criar item reutilizável de perfil com avatar, username, nome e dados públicos.
- [x] Exibir fallback de carregamento com altura estável ao abrir a lista.
- [x] Tratar estado vazio sem trocar de tela.
- [x] Cobrir a derivação social e a seleção de contas com testes automatizados.

Criterios de aceite:

- As contagens e listas de seguidores/seguindo usam a mesma fonte de dados social.
- Abrir e fechar a lista não muda a rota nem remove o contexto do Perfil.
- A primeira página exibe no máximo oito perfis e permite carregar as próximas páginas.
- Avatares ausentes preservam o fallback por iniciais.
- O popup pode receber qualquer coleção de perfis no futuro sem depender do Perfil.

### Task P1-011 - Foto de perfil e acesso direto ao investimento

Tipo: Frontend/Dados/Produto

Status: Concluído localmente em 2026-07-16. Sincronização remota da foto depende do backend e de storage de mídia.

Objetivo: consolidar a identidade visual do perfil e reduzir passos entre descoberta e aporte.

Tasks:

- [x] Adicionar seleção de foto em Configurações com enquadramento personalizado.
- [x] Manter apenas a ação de trocar a foto, sem opção de exclusão.
- [x] Abrir HUD de enquadramento ao tocar na foto escolhida.
- [x] Exibir a foto inteira, sem recorte prévio, durante a edição.
- [x] Permitir tocar e arrastar o círculo de recorte continuamente sobre a previa.
- [x] Permitir redimensionar o círculo continuamente entre 30% e 100%.
- [x] Exibir métrica percentual, slider e controles de menos/mais.
- [x] Persistir o tamanho do recorte junto ao ponto focal.
- [x] Migrar fotos antigas para o tamanho visual usado antes do slider.
- [x] Escurecer a área externa e manter nitida a imagem dentro do círculo.
- [x] Persistir ponto focal e dimensões da imagem por perfil.
- [x] Migrar automaticamente fotos antigas salvas apenas como URI.
- [x] Persistir a foto por perfil com AsyncStorage.
- [x] Exibir a foto no Início, Perfil, Pesquisa, Mensagens e página da bolsa.
- [x] Manter iniciais como fallback quando não houver foto.
- [x] Tornar o nome do perfil no Início clicavel.
- [x] Direcionar o clique no nome para o perfil público correto.
- [x] Substituir `Ver perfil` por `Investir` na descrição expandida.
- [x] Abrir diretamente a bolsa vinculada ao vídeo atual.
- [x] Desabilitar `Investir` quando a bolsa não estiver captando.
- [ ] Enviar a foto para storage remoto e salvar `avatarUrl` no backend.
- [ ] Redimensionar e otimizar a imagem no servidor antes da publicação.

Criterios de aceite:

- A foto escolhida permanece depois de fechar e abrir o app no mesmo dispositivo.
- Todas as superfícies exibem a mesma foto para o mesmo `profileId`.
- O enquadramento escolhido é mantido em todas as superfícies e após reiniciar.
- Fotos salvas antes da HUD continuam carregando com foco central.
- A edição mostra a foto completa e o círculo corresponde ao avatar final.
- O círculo varia de 30% até tocar o menor lado da imagem em 100%.
- Posicao e tamanho salvos são reproduzidos igualmente em todos os avatares.
- Configurações oferece troca de foto, mas não permite deixar o perfil sem imagem depois da escolha.
- Tocar no nome do autor abre seu perfil, sem interferir no botão de follow.
- `Investir` abre a bolsa do perfil exibido no reel e nunca a bolsa de outro atleta.
- Perfil sem bolsa aberta não permite iniciar aporte.

## Sprint 6 - Mobile e deploy

### Task P2-001 - Build Android com EAS

Tipo: Mobile/DevOps

Objetivo: gerar APK/AAB para teste fora do Expo Go.

Tasks:

- [ ] Configurar `eas.json`.
- [ ] Criar profile `preview` para APK.
- [ ] Criar profile `production` para AAB.
- [ ] Configurar ícone, splash, package name e versionamento.
- [ ] Gerar primeiro APK interno.
- [ ] Documentar passo a passo no README.

Criterios de aceite:

- APK instala em Android real.
- App abre com splash correto.
- Feed, envio e login funcionam no build.

### Task P2-002 - Ambientes e CI

Tipo: DevOps

Objetivo: separar desenvolvimento, homologação e producao.

Tasks:

- [ ] Criar `.env.example`.
- [ ] Configurar variáveis públicas do Expo.
- [ ] Configurar secrets do backend.
- [ ] Rodar typecheck no CI.
- [ ] Rodar build web no CI.
- [ ] Publicar web somente a partir de branch principal.

Criterios de aceite:

- Desenvolvedor novo consegue rodar localmente usando README.
- Build quebra se typecheck falhar.
- Deploy não usa chave sensível no código.

## Sprint 7 - Qualidade e observabilidade

### Task P2-003 - Testes principais

Tipo: QA/Frontend/Backend

Fluxos para cobrir:

- [ ] Cadastro/login.
- [ ] Envio de vídeo.
- [x] Publicação direta sem fila manual durante os testes.
- [x] Feed exibindo imediatamente as novas publicações.
- [ ] Moderação automática e fluxo de recurso antes da abertura ao público.
- [ ] Avaliação comunitária.
- [ ] Denuncia de vídeo.

Criterios de aceite:

- Fluxos críticos cobertos por testes automatizados ou checklist manual versionado.
- Bugs de regressão entram como task no backlog.

### Task P2-004 - Monitoramento

Tipo: DevOps/Produto

Tasks:

- [ ] Registrar erros de frontend.
- [ ] Registrar falhas de upload.
- [ ] Medir tempo de carregamento do feed.
- [ ] Medir taxa de envio concluído.
- [ ] Medir tempo e taxa de decisão da moderação automática.
- [ ] Criar painel simples de saude do produto.

Criterios de aceite:

- Erros importantes chegam para o responsável técnico.
- E possível saber se usuários estão conseguindo enviar vídeos.

### Task P2-005 - Centralizar informacoes financeiras da Carteira

Tipo: Frontend/UX/Financeiro

Status: Concluido em 2026-07-20.

Tasks:

- [x] Remover o card `Ambiente demonstrativo` das Configuracoes.
- [x] Remover o card permanente de custodia da Carteira.
- [x] Adicionar icone de informacao no cabecalho da Carteira.
- [x] Reunir em uma HUD as regras atuais de transacao, custodia, saque e rendimento.
- [x] Permitir fechar a HUD pelo botao ou por qualquer area externa.

Criterios de aceite:

- A Carteira prioriza saldo, deposito e reservas sem textos longos permanentes.
- As informacoes financeiras continuam acessiveis em um unico ponto.
- A interface nao apresenta promessa de rendimento ou saque indisponivel como funcionalidade ativa.

### Task P2-006 - Mover dados financeiros para a Carteira e adicionar saque

Tipo: Frontend/UX/Financeiro

Status: Concluido em 2026-07-20.

Tasks:

- [x] Remover os cards `Conta Xolot` e `Bolsa de investimento` das Configuracoes.
- [x] Exibir os dois cards dentro da Carteira.
- [x] Manter abertura e acompanhamento da bolsa pela Carteira.
- [x] Adicionar acao de saque ao lado do deposito.
- [x] Validar valor minimo, saldo disponivel e impedir saldo negativo.
- [x] Persistir o novo saldo depois do saque simulado.
- [x] Atualizar a HUD financeira para diferenciar saldo sacavel e valor aportado.
- [x] Cobrir deposito e saque com testes unitarios.

Criterios de aceite:

- Configuracoes exibe apenas preferencias e dados da conta.
- Carteira centraliza saldo, movimentacoes, reservas e bolsa do atleta.
- Saque nunca ultrapassa o saldo disponivel nem retira aportes ja confirmados.

### Task P2-007 - Organizar historico de investimentos em lista

Tipo: Frontend/UX/Financeiro

Status: Concluido em 2026-07-20.

Tasks:

- [x] Agrupar o historico de investimentos em uma unica secao.
- [x] Exibir cada investimento como uma linha da lista.
- [x] Separar os investimentos com divisores discretos.
- [x] Mostrar a quantidade de investimentos no cabecalho da secao.
- [x] Manter o estado vazio dentro do bloco de historico.

Criterios de aceite:

- O historico nao apresenta um card independente para cada investimento.
- Nome do perfil, status, valor e porcentagem da cota continuam visiveis.
- A lista permanece legivel em telas pequenas.

### Task P2-008 - Melhorar enquadramento da foto e cabecalho de envio

Tipo: Frontend/UX/Mobile

Status: Concluido em 2026-07-20.

Tasks:

- [x] Impedir que o gesto sobre a foto amplie a pagina no navegador mobile.
- [x] Permitir redimensionar o circulo de recorte com gesto de pinca.
- [x] Manter o limite do recorte entre 30% e 100%.
- [x] Adaptar a altura da previa para telas menores.
- [x] Remover o card introdutorio da tela Envio.
- [x] Remover o card Minhas publicacoes da tela Envio.
- [x] Exibir Publique seu video como cabecalho simples acima do formulario.

Criterios de aceite:

- Arrastar move o circulo e usar dois dedos altera seu tamanho sem ampliar a pagina.
- O modal permanece utilizavel em celulares com telas baixas.
- A tela Envio inicia com titulo e descricao sem card ao redor.

### Task P2-009 - Criar envio em duas etapas com camera e galeria

Tipo: Frontend/UX/Midia

Status: Concluido em 2026-07-20.

Tasks:

- [x] Transformar a primeira etapa do Envio em uma camera traseira em tela cheia.
- [x] Solicitar permissao de camera com estado alternativo quando indisponivel.
- [x] Adicionar obturador para capturar fotos diretamente no app.
- [x] Exibir no canto inferior esquerdo a ultima midia usada no Xolot.
- [x] Abrir a galeria ao tocar na miniatura e aceitar fotos ou videos.
- [x] Substituir a camera pela previa da midia selecionada.
- [x] Mover titulo, texto, tags e marcacoes para uma segunda etapa.
- [x] Persistir fotos e videos no armazenamento local do navegador.
- [x] Exibir publicacoes com foto no Inicio e nas galerias de perfil.
- [x] Manter videos anteriores compativeis com o novo formato.
- [x] Cobrir normalizacao de tags, marcacoes e conversao de fotos com testes.

Criterios de aceite:

- A aba Envio abre diretamente na camera traseira acima do footer.
- O usuario pode capturar uma foto ou selecionar foto/video da galeria.
- A midia selecionada ocupa a area da camera antes de avancar.
- Os dados textuais sao preenchidos somente na segunda etapa.
- Fotos nao exibem controles de reproducao e continuam visiveis apos recarregar a pagina.

### Task P2-010 - Adicionar modos Foto e Video na camera de envio

Tipo: Frontend/UX/Midia

Status: Concluido em 2026-07-20.

Tasks:

- [x] Adicionar as opcoes `Foto` e `Video` abaixo do obturador.
- [x] Manter o toque simples no modo Foto para capturar uma imagem.
- [x] Iniciar a gravacao ao segurar o obturador no modo Foto.
- [x] Encerrar a gravacao ao soltar o obturador no modo Foto.
- [x] Iniciar e encerrar a gravacao por toque no modo Video.
- [x] Limitar toda gravacao a dois minutos.
- [x] Solicitar permissao de microfone e permitir gravacao sem audio quando negada.
- [x] Implementar gravacao compativel com Expo Go e navegadores com MediaRecorder.
- [x] Mostrar uma foto como miniatura no botao da galeria.
- [x] Mostrar o primeiro frame como miniatura quando a ultima midia for um video.
- [x] Cobrir a selecao de formatos de gravacao web com testes automatizados.

Criterios de aceite:

- O usuario identifica facilmente se esta em Foto ou Video.
- No modo Foto, tocar fotografa e segurar grava enquanto o botao estiver pressionado.
- No modo Video, um toque inicia e outro toque encerra a gravacao.
- Nenhuma gravacao ultrapassa dois minutos.
- O quadrado da galeria representa visualmente a ultima foto ou video selecionado.

### Task P2-011 - Corrigir gravacao da camera no navegador

Tipo: Bugfix/Frontend/Midia

Status: Concluido em 2026-07-20.

Tasks:

- [x] Identificar por que os modos Foto e Video nao iniciavam a gravacao web.
- [x] Mover o identificador da camera para um elemento preservado pelo React Native Web.
- [x] Permitir que o MediaRecorder encontre o elemento de video e seu MediaStream.
- [x] Localizar como fallback qualquer video que possua um MediaStream ativo.
- [x] Manter o mesmo fluxo de arquivo e persistencia usado pela galeria.

Criterios de aceite:

- Segurar o obturador no modo Foto inicia a gravacao no navegador.
- Tocar no obturador no modo Video inicia e encerra a gravacao.
- A gravacao concluida aparece como midia selecionada antes da publicacao.

### Task P2-012 - Transformar o Envio em camera dedicada

Tipo: Frontend/UX/Midia

Status: Concluido em 2026-07-21.

Tasks:

- [x] Ocultar o cabecalho principal enquanto a aba Envio estiver aberta.
- [x] Ocultar o footer de navegacao enquanto a aba Envio estiver aberta.
- [x] Adicionar botao de voltar no canto superior esquerdo da camera.
- [x] Fazer o botao de voltar retornar para o Inicio.
- [x] Adicionar botao para alternar entre camera traseira e frontal.
- [x] Bloquear a troca de camera durante captura ou gravacao.

Criterios de aceite:

- A camera ocupa toda a area disponivel entre as barras do sistema.
- Galeria, obturador e troca de camera ficam alinhados na faixa inferior.
- O usuario consegue sair da camera sem depender do footer principal.
- A camera frontal ou traseira selecionada e remontada antes da captura.

### Task P2-013 - Corrigir controles do video selecionado no Envio

Tipo: Bugfix/Frontend/Midia

Status: Concluido em 2026-07-21.

Tasks:

- [x] Remover os controles nativos de video do navegador no preview do Envio.
- [x] Remover os atalhos de volume, tela cheia e menu de tres pontos.
- [x] Reintroduzir somente o volume com o mesmo visual usado no Inicio.
- [x] Compartilhar o controle de volume entre Inicio e Envio.
- [x] Corrigir o gesto para arrastar continuamente a bolinha branca do volume.
- [x] Adicionar controle proprio de reproducao por toque sobre o video.
- [x] Adicionar barra de progresso que aceita toque e arraste.
- [x] Posicionar a barra acima da faixa preta de acoes no preview em tela cheia.
- [x] Manter o mesmo player customizado nos previews compactos.

Criterios de aceite:

- Nenhum controle nativo fica cortado ou inacessivel no celular.
- O volume abre em uma barra vertical e responde tanto ao toque quanto ao arraste.
- Tocar no video alterna entre reproduzir e pausar.
- O usuario consegue avancar ou retroceder tocando ou arrastando a barra.
- No Envio, a barra nao disputa espaco com os botoes inferiores.

### Task P2-014 - Simplificar o topo da camera no Envio

Tipo: Frontend/UX

Status: Concluido em 2026-07-21.

Tasks:

- [x] Remover a faixa escura fixa do topo da camera.
- [x] Remover o titulo Nova publicacao da camera.
- [x] Retirar fundo, borda e sombra visual dos controles superiores.
- [x] Reduzir os icones de voltar e fechar.
- [x] Preservar uma area de toque acessivel ao redor dos icones.
- [x] Exibir o status apenas durante preparacao ou gravacao.

Criterios de aceite:

- O topo da camera mostra somente os icones durante o uso normal.
- O video ou a camera permanece visivel atras dos controles superiores.
- Voltar e fechar continuam confortaveis de tocar no celular.

### Task P2-015 - Integrar a galeria ao Envio

Tipo: Frontend/UX/Midia

Status: Concluido em 2026-07-21.

Tasks:

- [x] Manter o botao de galeria ligado diretamente ao seletor nativo de fotos e videos.
- [x] Consultar a midia mais recente quando a permissao da galeria ja estiver concedida.
- [x] Mostrar a foto mais recente ou o primeiro quadro do video mais recente no botao.
- [x] Manter um icone neutro quando o dispositivo nao permitir a consulta previa.
- [x] Configurar permissoes granulares apenas para fotos e videos.
- [x] Remover a faixa preta inferior da camera e manter os controles sobre a imagem.

Criterios de aceite:

- Tocar na miniatura abre imediatamente a galeria do aparelho.
- No Expo Go, o botao mostra o item mais recente autorizado pelo usuario.
- Videos usam o primeiro quadro como miniatura, sem iniciar a reproducao.
- A camera ocupa toda a area inferior sem uma faixa preta decorativa.

### Task P2-016 - Adicionar ações e compartilhamento às publicações

Tipo: Frontend/UX/Social

Status: Concluído em 2026-07-21.

Tasks:

- [x] Substituir o botão isolado de exclusão pelo menu vertical de três pontos.
- [x] Disponibilizar as ações de compartilhar, ocultar e excluir para o autor.
- [x] Limitar a exclusão ao autor da publicação e manter a confirmação existente.
- [x] Permitir ocultar uma publicação do Início sem removê-la da galeria do perfil.
- [x] Persistir as publicações ocultas por usuário e permitir exibi-las novamente.
- [x] Listar no compartilhamento perfis seguidos e contatos com conversa existente.
- [x] Evitar contatos duplicados e impedir o compartilhamento com a própria conta.
- [x] Enviar a publicação como uma referência estruturada dentro da conversa.
- [x] Exibir a publicação compartilhada como cartão clicável em Mensagens.
- [x] Abrir o vídeo compartilhado no Início e permitir voltar à conversa de origem.
- [x] Cobrir seleção de contatos e filtragem de publicações ocultas com testes.

Critérios de aceite:

- Cada item da galeria possui um único menu de ações no canto superior direito.
- Ocultar remove a publicação somente do Início e a opção muda para Mostrar no Início.
- Compartilhar apresenta apenas perfis seguidos ou contatos já conhecidos.
- O destinatário consegue tocar no cartão recebido para abrir a publicação correta.
- Ao sair da publicação compartilhada, o usuário retorna à mesma conversa.

### Task P2-017 - Adicionar curtidas, visualizações e preferências do Início

Tipo: Frontend/UX/Social/Dados locais

Status: Concluído em 2026-07-21.

Tasks:

- [x] Persistir curtidas únicas por conta e permitir removê-las.
- [x] Persistir visualizações únicas depois que o post permanece ativo no Início.
- [x] Agregar as contagens de curtidas e visualizações por publicação.
- [x] Alterar as métricas do Perfil para Envios, Posts e Curtidas.
- [x] Exibir visualizações somente nas miniaturas das galerias de perfil.
- [x] Adicionar coração, compartilhamento e menu de três pontos na lateral do post.
- [x] Preencher o coração em vermelho quando a publicação estiver curtida.
- [x] Reutilizar o compartilhamento por Mensagens diretamente no Início.
- [x] Permitir bloquear e desbloquear o perfil vinculado à publicação.
- [x] Permitir registrar interesse por categoria e priorizar conteúdo semelhante.
- [x] Permitir ocultar ou restaurar posts da mesma categoria.
- [x] Preservar a abertura direta de conteúdo bloqueado ou silenciado pelo Perfil.
- [x] Ignorar tags genéricas ao identificar a categoria de uma publicação.
- [x] Exibir um estado vazio quando todas as publicações forem filtradas.
- [x] Cobrir agregação, categorias, filtros e prioridade com testes automatizados.

Critérios de aceite:

- Cada conta pode curtir uma publicação apenas uma vez e desfazer a curtida.
- Uma visualização é registrada após 800 ms com a publicação ativa.
- A galeria do Perfil mostra olho e contagem no canto inferior direito.
- O Início mantém os três controles laterais acessíveis sem cobrir a descrição.
- Preferências continuam disponíveis após fechar e abrir o app no mesmo dispositivo.
- O conteúdo aberto diretamente pode restaurar bloqueios ou categorias silenciadas.

Observação técnica:

- As métricas são agregadas no estado local atual. A sincronização global entre dispositivos depende do backend previsto nas tarefas P0-003 e P0-004.

### Task P2-018 - Aplicar a nova identidade Xolot

Tipo: Branding/Frontend/Configuracao/Migracao local

Status: Concluido em 2026-07-21.

Tasks:

- [x] Substituir a marca visivel Xolot em cabecalhos, login, splash e feed.
- [x] Criar assinatura, simbolo transparente e icone de aplicativo a partir da nova logo.
- [x] Atualizar nome, slug, scheme, favicon, PWA e permissoes do Expo.
- [x] Atualizar documentacao tecnica e dados demonstrativos para Xolot.
- [x] Atualizar os nomes dos novos arquivos capturados e caches web.
- [x] Migrar estado, avatares e dados sociais das chaves locais legadas.
- [x] Aceitar referencias de videos legadas e gravar novas referencias como Xolot.
- [x] Atualizar os testes automatizados para a nova identidade.

Criterios de aceite:

- Nenhuma tela do aplicativo exibe a marca anterior.
- O simbolo Xolot permanece legivel no cabecalho e sobre o video.
- Login e carregamento exibem a assinatura completa Xolot.
- Instalacao PWA e configuracao nativa usam o novo nome e os novos icones.
- Dados criados antes da troca continuam disponiveis no mesmo dispositivo.

### Task P2-019 - Refinar a tipografia e as assinaturas da marca Xolot

Tipo: Branding/Frontend

Status: Concluido em 2026-07-21.

Tasks:

- [x] Criar uma tipografia geometrica e esportiva que acompanhe os cortes diagonais do simbolo.
- [x] Atualizar a assinatura vertical usada no login, carregamento e configuracao inicial.
- [x] Criar uma assinatura horizontal especifica para os cabecalhos do aplicativo.
- [x] Manter o simbolo isolado nas interfaces compactas sobre o video.
- [x] Preservar fundo transparente, legibilidade e proporcao nos assets finais.

Criterios de aceite:

- O nome Xolot possui identidade visual coerente com o simbolo da marca.
- A assinatura horizontal cabe no cabecalho mobile sem sobrepor saldo ou acoes.
- A assinatura vertical permanece legivel nas telas de entrada e carregamento.

### Task P2-020 - Padronizar retornos e animacoes de paineis sobrepostos

Tipo: Frontend/UX/Acessibilidade

Status: Concluido em 2026-07-22.

Tasks:

- [x] Criar um componente unico para todas as acoes de voltar.
- [x] Exibir somente a seta, sem fundo, borda, sombra ou caixa visivel.
- [x] Preservar area de toque de 40 px, estado pressionado e acessibilidade.
- [x] Aplicar o retorno padrao no Inicio, mensagens, perfil, configuracoes, carteira, envio, camera e telas de detalhe.
- [x] Remover o retorno duplicado da tela de investimento.
- [x] Padronizar os paineis sobrepostos com a animacao fade usada no menu do Perfil.
- [x] Remover estilos locais de retorno que ficaram obsoletos.

Criterios de aceite:

- Todas as telas usam a mesma seta, tamanho, espessura e resposta ao toque.
- Nenhum retorno exibe uma div, caixa ou fundo proprio.
- A camera usa a mesma seta em branco para manter contraste sobre a imagem.
- Todos os modais e paineis temporarios aparecem com a mesma transicao suave.

### Task P2-021 - Estruturar descricao e marcacoes de usuarios nas publicacoes

Tipo: Frontend/UX/Dados sociais

Status: Concluido em 2026-07-22.

Tasks:

- [x] Renomear o campo de texto da publicacao para Descricao.
- [x] Exibir a descricao abaixo do titulo no Inicio, em estados recolhido e expandido.
- [x] Substituir marcacoes em texto livre por busca de contas cadastradas.
- [x] Permitir selecionar e remover ate oito usuarios antes da publicacao.
- [x] Persistir as marcacoes pelo username unico de cada conta.
- [x] Exibir um icone com a contagem de pessoas marcadas apenas no conteudo expandido.
- [x] Abrir a lista de perfis marcados em modal com animacao padronizada.
- [x] Permitir abrir o perfil correspondente a partir da lista de marcacoes.
- [x] Cobrir busca, filtro, remocao e limite de marcacoes com testes automatizados.

Criterios de aceite:

- Titulo e descricao nunca aparecem unidos pela mesma linha no Inicio.
- Somente contas cadastradas podem ser marcadas em novas publicacoes.
- A propria conta e contas administrativas nao aparecem na busca de marcacoes.
- O icone de marcacoes fica no canto inferior direito da descricao expandida.
- A lista mostra username, nome, contexto do perfil e permite abrir o perfil.
- Publicacoes sem marcacoes nao exibem o icone.

### Task P2-022 - Selecionar e gerenciar publicacoes em lote no perfil

Tipo: Frontend/UX/Dados sociais

Status: Concluido em 2026-07-22.

Tasks:

- [x] Remover o selo de reproducao redundante dos cards da galeria.
- [x] Exibir os tres pontos sem contorno branco.
- [x] Ativar o modo de selecao ao manter uma publicacao pressionada.
- [x] Permitir adicionar e remover outras publicacoes com toques simples.
- [x] Exibir contagem, cancelar e um unico botao de acoes durante a selecao.
- [x] Oferecer envio, ocultacao e exclusao na HUD de acoes em lote.
- [x] Encaminhar todas as publicacoes selecionadas ao contato escolhido.
- [x] Confirmar exclusao plural e apagar somente midias da conta conectada.
- [x] Restringir a selecao destrutiva ao proprio perfil.
- [x] Cobrir a logica de inclusao, remocao e deduplicacao com testes.

Criterios de aceite:

- O toque normal continua abrindo a publicacao quando a selecao esta inativa.
- O toque longo seleciona o primeiro item sem abrir o video.
- Itens selecionados recebem borda verde e indicador de confirmacao.
- O menu individual permanece disponivel fora do modo de selecao.
- A exclusao em lote exige confirmacao e atualiza Inicio e perfil.

## P3 - Financeiro futuro

### Task P3-001 - Validação jurídica antes de qualquer dinheiro real

Tipo: Juridico/Produto

Tasks:

- [ ] Validar se reserva, aporte ou participação em retorno caracteriza valor mobiliario.
- [ ] Definir instrumento contratual.
- [ ] Definir limites de comúnicação de risco e retorno.
- [ ] Definir KYC, AML, antifraude e provedor de pagamento.
- [ ] Definir extrato, comprovante, cancelamento e conciliação.

Criterios de aceite:

- Nenhum fluxo financeiro real entra no app antes da aprovação jurídica.
- Carteira e reservas ficam ocultas ou claramente simuladas até existir base legal.

## Ordem recomendada para o programador

1. P0-001 - Criar estrutura de screens.
2. P0-002 - Criar camada de dados local/API.
3. P0-003 - Backend mínimo.
4. P0-004 - Upload real de vídeo.
5. P1-001 - Melhorar FeedScreen.
6. P1-005 - Moderação automática de conteúdo.
7. P1-007 - Sistema de avaliação comunitária.
8. P2-001 - Build Android com EAS.
