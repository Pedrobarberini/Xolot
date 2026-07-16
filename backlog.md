# Backlog tecnico - NextStar

Atualizado em 2026-07-16.

Este backlog e escrito para desenvolvimento. Cada item deve virar issue/task no GitHub, Trello, Jira ou similar.

Tarefas concluidas estao documentadas em `releases/release-1.md`.

## Prioridades

- P0: bloqueia lancamento publico.
- P1: necessario para MVP publico.
- P2: melhora operacao, escala e qualidade.
- P3: futuro, depende de validacao juridica/regulatoria.

## Definition of Done

- Codigo com TypeScript sem erro em `pnpm run typecheck`.
- Fluxo testado em web e Android via Expo Go ou build.
- Estados de loading, erro, vazio e sucesso tratados.
- Nao exibir dados fake como se fossem reais.
- UI responsiva sem sobreposicao em telas pequenas.
- Dados sensiveis protegidos e sem log indevido.
- Coverage tests feitos e funcionando.
- README ou docs atualizados quando houver mudanca de fluxo.

## Sprint 1 - Base real de produto

### Task P0-001 - Criar estrutura de screens

Tipo: Frontend

Status: Em andamento. A modularizacao principal foi entregue em 2026-07-15; componentes menores continuam pendentes.

Objetivo: quebrar o `App.tsx` em telas/componentes para o app ficar mais facil de manter.

Tasks:

- [x] Criar `src/screens/AuthScreen.tsx`.
- [x] Criar `src/screens/FeedScreen.tsx`.
- [x] Criar `src/screens/SubmissionScreen.tsx`.
- [x] Criar `src/screens/AdminScreen.tsx`.
- [x] Criar `src/screens/ProfileScreen.tsx`.
- [x] Criar `src/screens/WalletScreen.tsx`.
- [x] Criar `src/screens/SearchScreen.tsx` com pesquisa de perfis reais.
- [x] Incluir contas cadastradas na sessao nos resultados, mesmo sem video aprovado.
- [x] Criar estado publico navegavel para usuario cadastrado sem publicacoes.
- [x] Criar `src/screens/MessagesScreen.tsx` com estado vazio sem conversas fake.
- [x] Iniciar uma conversa pelo perfil visitado.
- [x] Enviar mensagens e manter o historico durante a sessao atual.
- [ ] Criar `src/components/VideoCard.tsx`.
- [ ] Criar `src/components/VideoPlayer.tsx`.
- [x] Extrair a navegacao inferior para `src/components/Navigation.tsx`.
- [x] Renomear a aba `Feed` para `Inicio`.
- [x] Substituir `Carteira` no footer por `Pesquisar` e adicionar `Mensagens`.
- [x] Mover o acesso da Carteira para o menu de tres barras do Perfil.
- [x] Permitir fechar o menu do Perfil tocando em qualquer lado fora do HUD.
- [ ] Criar `src/components/AppToast.tsx`.
- [x] Extrair estilos do `App.tsx` para `src/styles/appStyles.ts`.
- [x] Extrair handlers de produto para `src/actions/createAppActions.ts`.
- [x] Extrair helpers de dados para `src/actions/appActions.ts`.
- [x] Extrair shell, splash e transicoes para `src/components/AppShell.tsx`.
- [ ] Dividir `src/styles/appStyles.ts` por tela ou dominio.

Criterios de aceite:

- `App.tsx` deve ficar responsavel principalmente por estado global simples e roteamento local.
- Nenhuma tela deve depender de dados fake escondidos no componente.
- Layout atual deve continuar funcionando apos a quebra.

### Task P0-002 - Criar camada de dados local/API

Tipo: Frontend/Arquitetura

Status: Em andamento. Repository local versionado e persistencia dos estados principais entregues em 2026-07-16; services HTTP dependem do backend.

Objetivo: preparar o app para trocar estado local por backend sem reescrever as telas.

Tasks:

- [ ] Criar `src/services/authService.ts`.
- [ ] Criar `src/services/videoService.ts`.
- [ ] Criar `src/services/moderationService.ts`.
- [ ] Criar `src/services/profileService.ts`.
- [ ] Criar `src/services/messageService.ts`.
- [x] Criar `src/repositories/localRepository.ts` para estado temporario.
- [x] Criar schema versionado em `src/repositories/appStateSchema.ts`.
- [x] Criar hook de hidratacao e persistencia em `src/actions/usePersistentAppState.ts`.
- [x] Persistir usuarios, sessao, envios, moderacao, saldos, bolsas e investimentos.
- [x] Restaurar a sessao e a rota administrativa depois do refresh.
- [x] Criar migracao defensiva para estado sem versao ou parcialmente invalido.
- [x] Cobrir fallback, migracao, serializacao e repository com testes automatizados.
- [ ] Criar tipos de request/response em `src/types.ts` ou `src/api/types.ts`.

Criterios de aceite:

- Screens nao devem chamar diretamente arrays globais de usuarios/videos.
- Deve ser possivel trocar `localRepository` por API HTTP depois.
- Todos os dados demonstrativos devem estar marcados como `isDemo`.
- Estado local valido deve sobreviver ao refresh sem misturar dados entre contas.
- URI de arquivo local nao deve ser tratada como upload permanente.

### Task P0-003 - Backend minimo

Tipo: Backend

Objetivo: criar API real para usuarios, videos, moderacao e sessoes.

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

- Login retorna sessao/token.
- Video aprovado aparece no feed.
- Video reprovado ou pendente nao aparece no feed.
- Decisoes de admin ficam registradas.

### Task P0-004 - Upload real de video

Tipo: Backend/Frontend

Objetivo: substituir links temporarios por upload real de arquivo.

Tasks:

- [x] Persistir provisoriamente no IndexedDB os videos escolhidos no navegador.
- [x] Salvar no estado apenas uma referencia duravel, sem serializar URLs `blob:` temporarias.
- [x] Resolver a referencia local em Feed, Perfil e Admin depois de recarregar a pagina.
- [x] Exibir fallback de reenvio para videos antigos cujo arquivo temporario ja expirou.
- [ ] Definir provider de storage: Supabase Storage, S3, Cloudflare R2 ou Firebase Storage.
- [ ] Criar endpoint para gerar URL assinada de upload.
- [ ] Validar formato: mp4, mov ou webm.
- [ ] Validar tamanho maximo.
- [ ] Validar duracao maxima.
- [ ] Gerar thumbnail.
- [ ] Salvar duracao e proporcao do video.
- [ ] Exibir progresso de upload na tela de envio.
- [ ] Exibir erro amigavel quando upload falhar.

Criterios de aceite:

- Usuario consegue enviar video do celular.
- Video sobrevive ao refresh da pagina.
- Admin consegue assistir o video enviado.
- Feed reproduz o video aprovado.

### Task P0-005 - Cadastro com senha e configuracao do perfil

Tipo: Frontend/Dados/Autenticacao

Status: Concluido localmente em 2026-07-16. Autenticacao server-side continua bloqueante para o lancamento publico.

Objetivo: substituir o acesso por nome e email por credenciais locais e coletar os dados publicos do atleta no primeiro acesso.

Tasks:

- [x] Usar email e senha no cadastro e no login.
- [x] Separar nome publico do atleta e `@username` no cadastro.
- [x] Permitir nomes publicos repetidos e exigir username unico sem diferenca entre maiusculas e minusculas.
- [x] Bloquear email duplicado em toda a plataforma, independentemente do tipo de conta.
- [x] Migrar contas existentes para usernames validos e sem repeticao.
- [x] Solicitar confirmacao de senha durante o cadastro.
- [x] Armazenar somente salt e hash SHA-256 no estado local, sem senha em texto puro.
- [x] Migrar contas antigas para definicao de senha no proximo login.
- [x] Criar configuracao obrigatoria no primeiro acesso de contas Usuario.
- [x] Coletar nome, biografia, idade, posicao, cidade e clube ou projeto.
- [x] Persistir o perfil junto da conta cadastrada.
- [x] Reutilizar o formulario em `Perfil > Configuracoes > Editar perfil`.
- [x] Exibir biografia, clube e dados atualizados nos perfis proprio e publico.
- [x] Incluir os novos dados na pesquisa de perfis.
- [x] Permitir pesquisa tanto pelo nome publico quanto pelo `@username`.
- [x] Liberar conversa com a propria conta sem exigir follow.
- [x] Versionar a migracao e cobrir hash e perfil com teste automatizado.

Criterios de aceite:

- Conta nova nao entra no Inicio antes de completar os dados obrigatorios.
- Login posterior abre o app diretamente quando o perfil ja estiver completo.
- Editar e salvar o perfil atualiza imediatamente a vitrine publica.
- Recarregar o app preserva credenciais e dados do perfil neste dispositivo.
- Nenhuma senha em texto puro e serializada pelo repository local.
- A interface informa que autenticacao, recuperacao de senha e papeis reais ainda dependem do backend.

## Sprint 2 - Feed profissional

### Task P1-001 - Melhorar FeedScreen

Tipo: Frontend

Objetivo: deixar o feed pronto para uso publico.

Tasks:

- [ ] Implementar lista paginada de videos aprovados.
- [x] Reproduzir automaticamente apenas o video visivel.
- [x] Pausar videos fora da tela durante a troca de item.
- [ ] Manter estado de mute por usuario.
- [ ] Criar botao de compartilhar.
- [ ] Criar botao de denunciar.
- [ ] Criar estado vazio quando nao houver videos.
- [ ] Criar skeleton/loading inicial.
- [ ] Criar retry quando falhar carregar feed.

Criterios de aceite:

- Feed nao mostra contagem tecnica desnecessaria.
- Feed nao mostra score/metrica sem avaliacao real.
- Video ocupa bem a box, sem cortes estranhos ou barras indevidas.
- Barra de progresso permite avancar e retroceder em mobile e web.

### Task P1-002 - VideoPlayer reutilizavel

Tipo: Frontend

Objetivo: padronizar reproducao de video em Feed, Perfil e Admin.

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

### Task P1-003 - Ficha expansivel do atleta

Tipo: Frontend

Objetivo: melhorar a box de texto sobre o feed.

Tasks:

- [x] Criar versao compacta com nome, posicao, cidade e titulo do video.
- [x] Criar botao `Ver mais`.
- [x] Ao expandir, permitir cobrir parte do video de forma intencional.
- [x] Adicionar destaque, objetivo e tags somente quando existirem.
- [x] Evitar texto cortado em telas pequenas.

Criterios de aceite:

- Texto nao cobre o video quando esta compacto.
- Usuario consegue expandir e recolher.
- Layout fica estavel em telas pequenas.

## Sprint 3 - Envio e moderacao

### Task P1-004 - SubmissionScreen completa

Tipo: Frontend

Objetivo: criar fluxo de envio confiavel para atleta.

Campos:

- [x] Reutilizar nome, idade, cidade/UF, posicao e clube do perfil logado.
- [x] Titulo do video.
- [x] Principal destaque.
- [x] Objetivo.
- [x] Consentimento do responsavel quando menor de idade.
- [x] Arquivo de video.

Tasks:

- [x] Remover do envio os campos pessoais ja preenchidos no cadastro.
- [x] Usar o perfil ativo como fonte dos dados enviados para moderacao.
- [x] Manter a biografia somente nas paginas de perfil, sem copia-la para a postagem.

Criterios de aceite:

- Botao de enviar fica desabilitado ate os campos obrigatorios estarem validos.
- Apos envio, aparece toast/popup no rodape por cerca de 3 segundos.
- Usuario nao precisa rolar a tela para descobrir se o envio funcionou.
- Envio pendente aparece no status do atleta.
- Alteracoes futuras no perfil nao exigem redigitar os dados em cada envio.

### Task P1-005 - AdminScreen de moderacao

Tipo: Frontend/Backend

Objetivo: revisar videos com clareza e remover itens da fila apos decisao.

Tasks:

- [ ] Listar apenas videos pendentes.
- [ ] Abrir detalhe do video.
- [ ] Reproduzir video dentro da tela admin.
- [ ] Aprovar.
- [ ] Reprovar com motivo.
- [ ] Solicitar ajustes com mensagem.
- [ ] Mostrar loading na acao.
- [ ] Remover item da fila apos decisao confirmada.
- [ ] Criar filtro por data, atleta e status.

Criterios de aceite:

- Decisao nao duplica requisicao em toque repetido.
- Admin ve confirmacao apos acao.
- Fila atualiza sem precisar recarregar.

### Task P1-006 - Denuncias e seguranca de conteudo

Tipo: Frontend/Backend/Admin

Objetivo: permitir que usuarios denunciem conteudo e admins tratem casos sensiveis.

Tasks:

- [ ] Criar `POST /videos/:id/report`.
- [ ] Criar tela/aba Admin para denuncias.
- [ ] Criar motivos padrao de denuncia.
- [ ] Permitir remover video aprovado.
- [ ] Permitir bloquear usuario.
- [ ] Registrar auditoria da decisao.

Criterios de aceite:

- Denuncia cria registro persistente.
- Admin consegue tomar acao.
- Video removido sai do feed.

## Sprint 4 - Avaliacao por usuarios

### Task P1-007 - Sistema de avaliacao comunitaria

Tipo: Produto/Frontend/Backend

Objetivo: deixar usuarios determinarem avaliacoes em vez de exibir metricas inventadas.

Criterios sugeridos:

- [ ] Tecnica.
- [ ] Visao de jogo.
- [ ] Intensidade.
- [ ] Passe.
- [ ] Finalizacao.
- [ ] Disciplina tatica.

Tasks:

- [ ] Criar `POST /videos/:id/ratings`.
- [ ] Criar `GET /videos/:id/ratings-summary`.
- [ ] Permitir uma avaliacao por usuario por video.
- [ ] Calcular media por criterio.
- [ ] Exibir nota apenas com minimo de avaliacoes.
- [ ] Mostrar `Em avaliacao` enquanto nao houver amostra suficiente.
- [ ] Permitir denunciar avaliacao abusiva.

Criterios de aceite:

- Score nao e definido pelo sistema sem avaliacao.
- Usuario autenticado consegue avaliar.
- Autor do video nao pode inflar nota sem regra definida.
- Media publica mostra quantidade de avaliacoes.

## Sprint 5 - Perfil publico

### Task P1-008 - ProfileScreen do atleta

Tipo: Frontend/Backend

Objetivo: criar pagina publica e editavel do atleta.

Tasks:

- [x] Exibir avatar, nome, idade, posicao, cidade e clube.
- [x] Exibir bio curta.
- [x] Exibir videos aprovados do atleta em uma galeria no proprio perfil.
- [x] Reutilizar o mesmo modelo visual no perfil proprio e no perfil visitado.
- [x] Remover player grande e modal de pre-visualizacao das paginas de perfil.
- [x] Direcionar o toque em uma miniatura da galeria para o reel correspondente.
- [x] Adicionar acao com icone para investimento no perfil.
- [x] Criar pagina dedicada com dados da bolsa e formulario de aporte.
- [x] Desabilitar a acao de investir quando a bolsa nao estiver aberta.
- [x] Adicionar botao de fechar na pagina da bolsa para retornar ao perfil.
- [x] Padronizar a animacao de entrada nas novas paginas e subpaginas.
- [x] Sincronizar a transicao de Configuracoes e Carteira com o fechamento do menu.
- [x] Animar a expansao e o recolhimento da descricao `Ver mais` no feed.
- [x] Remover o atalho financeiro duplicado ao lado do menu do Perfil proprio.
- [x] Preservar a origem ao abrir um video do perfil no Inicio.
- [x] Exibir seta contextual para retornar do reel ao perfil de origem.
- [x] Posicionar seta e marca lado a lado sem sobreposicao.
- [x] Padronizar a marca do Inicio com o tamanho compacto do header.
- [ ] Exibir avaliacoes agregadas reais quando existirem.
- [x] Permitir editar dados do proprio perfil.
- [x] Criar estado de perfil sem videos com orientacao para publicar.
- [x] Manter no Perfil apenas identidade resumida e conteudo publicado.
- [x] Mover verificacao, KYC, Conta NextStar e bolsa para Configuracoes.
- [ ] Criar link compartilhavel do perfil na web.

Criterios de aceite:

- Perfil nao mostra metricas fake.
- Perfil funciona para atleta logado e visitante.
- Videos do perfil sao reproduzidos no Inicio, sem player duplicado na pagina.
- Investimento e preenchido em uma pagina propria, separada da vitrine publica.
- Usuario retorna ao perfil correto depois de assistir um video da galeria.
- Alteracoes salvas persistem apos refresh.

### Task P1-009 - Sistema de mensagens diretas

Tipo: Frontend/Backend

Status: Em andamento. O fluxo local por conta e a persistencia no dispositivo foram entregues; entrega remota e tempo real dependem do backend.

Objetivo: permitir contato direto entre usuarios a partir de um perfil publico, com historico confiavel e controles de seguranca.

Tasks:

- [x] Substituir o atalho financeiro duplicado do perfil publico por mensagem.
- [x] Abrir a aba Mensagens com o perfil correto selecionado.
- [x] Criar lista de conversas iniciadas pelo usuario.
- [x] Criar thread com composer, envio e historico local por conta.
- [x] Isolar contatos e mensagens ao trocar de conta.
- [x] Persistir contatos e mensagens locais no dispositivo.
- [x] Separar Conversas de Solicitacoes de perfis nao seguidos.
- [x] Ocultar mensagens recebidas de perfis nao seguidos ate o follow.
- [x] Permitir somente uma mensagem inicial como solicitacao.
- [x] Padronizar seta, logo e saldo no HUD das paginas de perfil e investimento.
- [ ] Persistir conversas e mensagens no backend.
- [ ] Entregar mensagens em tempo real entre contas autenticadas.
- [ ] Adicionar estados de envio, entregue, lida e falha.
- [ ] Adicionar paginacao e carregamento incremental do historico.
- [ ] Adicionar bloqueio, denuncia e protecao contra spam.
- [ ] Adicionar notificacoes push com preferencias por conta.

Criterios de aceite:

- O icone de mensagem do perfil abre uma conversa com o destinatario correto.
- Mensagens enviadas aparecem imediatamente na thread e na lista da sessao.
- Sair da conta nao deixa o historico de uma conta visivel para outra.
- Perfis seguidos aparecem em Conversas e perfis nao seguidos aparecem em Solicitacoes.
- Uma mensagem recebida por solicitacao so fica visivel depois que o destinatario segue o remetente.
- A versao publica nao trata estado local como entrega real ao destinatario.
- Backend, moderacao e privacidade devem estar prontos antes de liberar mensagens para o publico.

### Task P1-010 - Sistema de follow entre perfis

Tipo: Frontend/Dados/Produto

Status: Concluido localmente em 2026-07-16. Sincronizacao entre dispositivos depende do backend.

Objetivo: permitir que usuarios acompanhem atletas e usar essa relacao para personalizar Inicio e Mensagens.

Tasks:

- [x] Criar vinculo persistente entre usuario e perfil seguido.
- [x] Adicionar botao `Seguir` ao lado do perfil no Inicio.
- [x] Exibir estado `Seguindo` sem divergencia entre Inicio e perfil publico.
- [x] Permitir deixar de seguir pelas mesmas superficies.
- [x] Exibir contagem de seguidores no perfil publico.
- [x] Exibir seguidores e seguindo no perfil proprio.
- [x] Priorizar videos de perfis seguidos no Inicio.
- [x] Integrar follow com a liberacao de mensagens diretas.
- [x] Persistir follows, contatos e mensagens com AsyncStorage.
- [x] Separar estado e acoes sociais em `src/actions/useSocialActions.ts`.
- [x] Separar persistencia em `src/services/socialStorage.ts`.

Criterios de aceite:

- Seguir no Inicio atualiza imediatamente o perfil publico e vice-versa.
- O estado continua salvo depois de fechar e abrir o app.
- Videos de perfis seguidos aparecem primeiro sem remover outros videos.
- Contadores sociais usam a mesma fonte de dados do botao de follow.
- Mensagens de perfis nao seguidos entram em Solicitacoes.
- Seguir um contato move a solicitacao para Conversas e libera a thread.

### Task P1-011 - Foto de perfil e acesso direto ao investimento

Tipo: Frontend/Dados/Produto

Status: Concluido localmente em 2026-07-16. Sincronizacao remota da foto depende do backend e de storage de midia.

Objetivo: consolidar a identidade visual do perfil e reduzir passos entre descoberta e aporte.

Tasks:

- [x] Adicionar selecao de foto em Configuracoes com enquadramento personalizado.
- [x] Manter apenas a acao de trocar a foto, sem opcao de exclusao.
- [x] Abrir HUD de enquadramento ao tocar na foto escolhida.
- [x] Exibir a foto inteira, sem recorte previo, durante a edicao.
- [x] Permitir tocar e arrastar o circulo de recorte continuamente sobre a previa.
- [x] Permitir redimensionar o circulo continuamente entre 30% e 100%.
- [x] Exibir metrica percentual, slider e controles de menos/mais.
- [x] Persistir o tamanho do recorte junto ao ponto focal.
- [x] Migrar fotos antigas para o tamanho visual usado antes do slider.
- [x] Escurecer a area externa e manter nitida a imagem dentro do circulo.
- [x] Persistir ponto focal e dimensoes da imagem por perfil.
- [x] Migrar automaticamente fotos antigas salvas apenas como URI.
- [x] Persistir a foto por perfil com AsyncStorage.
- [x] Exibir a foto no Inicio, Perfil, Pesquisa, Mensagens e pagina da bolsa.
- [x] Manter iniciais como fallback quando nao houver foto.
- [x] Tornar o nome do perfil no Inicio clicavel.
- [x] Direcionar o clique no nome para o perfil publico correto.
- [x] Substituir `Ver perfil` por `Investir` na descricao expandida.
- [x] Abrir diretamente a bolsa vinculada ao video atual.
- [x] Desabilitar `Investir` quando a bolsa nao estiver captando.
- [ ] Enviar a foto para storage remoto e salvar `avatarUrl` no backend.
- [ ] Redimensionar e otimizar a imagem no servidor antes da publicacao.

Criterios de aceite:

- A foto escolhida permanece depois de fechar e abrir o app no mesmo dispositivo.
- Todas as superficies exibem a mesma foto para o mesmo `profileId`.
- O enquadramento escolhido e mantido em todas as superficies e apos reiniciar.
- Fotos salvas antes da HUD continuam carregando com foco central.
- A edicao mostra a foto completa e o circulo corresponde ao avatar final.
- O circulo varia de 30% ate tocar o menor lado da imagem em 100%.
- Posicao e tamanho salvos sao reproduzidos igualmente em todos os avatares.
- Configuracoes oferece troca de foto, mas nao permite deixar o perfil sem imagem depois da escolha.
- Tocar no nome do autor abre seu perfil, sem interferir no botao de follow.
- `Investir` abre a bolsa do perfil exibido no reel e nunca a bolsa de outro atleta.
- Perfil sem bolsa aberta nao permite iniciar aporte.

## Sprint 6 - Mobile e deploy

### Task P2-001 - Build Android com EAS

Tipo: Mobile/DevOps

Objetivo: gerar APK/AAB para teste fora do Expo Go.

Tasks:

- [ ] Configurar `eas.json`.
- [ ] Criar profile `preview` para APK.
- [ ] Criar profile `production` para AAB.
- [ ] Configurar icone, splash, package name e versionamento.
- [ ] Gerar primeiro APK interno.
- [ ] Documentar passo a passo no README.

Criterios de aceite:

- APK instala em Android real.
- App abre com splash correto.
- Feed, envio e login funcionam no build.

### Task P2-002 - Ambientes e CI

Tipo: DevOps

Objetivo: separar desenvolvimento, homologacao e producao.

Tasks:

- [ ] Criar `.env.example`.
- [ ] Configurar variaveis publicas do Expo.
- [ ] Configurar secrets do backend.
- [ ] Rodar typecheck no CI.
- [ ] Rodar build web no CI.
- [ ] Publicar web somente a partir de branch principal.

Criterios de aceite:

- Desenvolvedor novo consegue rodar localmente usando README.
- Build quebra se typecheck falhar.
- Deploy nao usa chave sensivel no codigo.

## Sprint 7 - Qualidade e observabilidade

### Task P2-003 - Testes principais

Tipo: QA/Frontend/Backend

Fluxos para cobrir:

- [ ] Cadastro/login.
- [ ] Envio de video.
- [ ] Moderacao aprovar/reprovar/pedir ajustes.
- [ ] Feed exibindo apenas aprovados.
- [ ] Avaliacao comunitaria.
- [ ] Denuncia de video.

Criterios de aceite:

- Fluxos criticos cobertos por testes automatizados ou checklist manual versionado.
- Bugs de regressao entram como task no backlog.

### Task P2-004 - Monitoramento

Tipo: DevOps/Produto

Tasks:

- [ ] Registrar erros de frontend.
- [ ] Registrar falhas de upload.
- [ ] Medir tempo de carregamento do feed.
- [ ] Medir taxa de envio concluido.
- [ ] Medir tempo medio de moderacao.
- [ ] Criar painel simples de saude do produto.

Criterios de aceite:

- Erros importantes chegam para o responsavel tecnico.
- E possivel saber se usuarios estao conseguindo enviar videos.

## P3 - Financeiro futuro

### Task P3-001 - Validacao juridica antes de qualquer dinheiro real

Tipo: Juridico/Produto

Tasks:

- [ ] Validar se reserva, aporte ou participacao em retorno caracteriza valor mobiliario.
- [ ] Definir instrumento contratual.
- [ ] Definir limites de comunicacao de risco e retorno.
- [ ] Definir KYC, AML, antifraude e provedor de pagamento.
- [ ] Definir extrato, comprovante, cancelamento e conciliacao.

Criterios de aceite:

- Nenhum fluxo financeiro real entra no app antes da aprovacao juridica.
- Carteira e reservas ficam ocultas ou claramente simuladas ate existir base legal.

## Ordem recomendada para o programador

1. P0-001 - Criar estrutura de screens.
2. P0-002 - Criar camada de dados local/API.
3. P0-003 - Backend minimo.
4. P0-004 - Upload real de video.
5. P1-001 - Melhorar FeedScreen.
6. P1-005 - AdminScreen de moderacao.
7. P1-007 - Sistema de avaliacao comunitaria.
8. P2-001 - Build Android com EAS.
