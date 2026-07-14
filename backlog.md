# Backlog tecnico - NextStar

Atualizado em 2026-07-14.

Este backlog e escrito para desenvolvimento. Cada item deve virar issue/task no GitHub, Trello, Jira ou similar.

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
- README ou docs atualizados quando houver mudanca de fluxo.

## Sprint atual - Ajustes de produto 2026-07-13

### Task HOTFIX-001 - Unificar conta de atleta e investidor

Tipo: Produto/Frontend

Objetivo: substituir a divisao `Atleta`/`Investidor` por uma conta comum `Usuario`, permitindo que a mesma pessoa envie videos e tambem acesse a carteira/feed.

Tasks:

- [x] Trocar `UserRole` para `Usuario` e `Admin`.
- [x] Atualizar AuthScreen para exibir apenas `Usuario` e `Admin`.
- [x] Ajustar tabs do `Usuario` para mostrar Feed, Envio, Carteira e Perfil.
- [x] Permitir reserva simulada para `Usuario`.
- [x] Atualizar ProfileScreen para refletir conta unificada.
- [x] Atualizar README com o novo fluxo.

Criterios de aceite:

- Conta comum consegue enviar video.
- Conta comum consegue acessar carteira.
- Nao existe mais escolha separada entre atleta e investidor.
- Admin continua com acesso de moderacao.

### Task HOTFIX-002 - Limitar largura maxima do footer

Tipo: Frontend/UI

Objetivo: ajustar a bottom navigation para ficar centralizada com largura maxima, evitando que o footer fique esticado demais em telas maiores.

Tasks:

- [x] Aplicar `maxWidth` na tab bar tambem fora do modo desktop.
- [x] Centralizar footer horizontalmente.
- [x] Manter espacamento seguro acima da navegacao do sistema.

Criterios de aceite:

- Footer fica visualmente mais compacto.
- Footer nao ultrapassa a tela em mobile.
- Footer continua facil de tocar.

### Task HOTFIX-003 - Remover box/badge de sem avaliacao

Tipo: Frontend/UI

Objetivo: retirar chamadas visuais de `Sem avaliacoes` para deixar o app mais limpo enquanto nao existe sistema de avaliacao comunitaria.

Tasks:

- [x] Remover badge `Sem avaliacoes` do feed.
- [x] Remover box de `Sem avaliacoes` no detalhe do atleta.
- [x] Ajustar textos condicionais para nao ocupar espaco visual sem necessidade.

Criterios de aceite:

- Publicacoes sem avaliacao nao exibem score, metricas nem box de aviso.
- A interface permanece limpa e sem espacos vazios.

### Task HOTFIX-004 - Transformar bottom navigation em full footer

Tipo: Frontend/UI

Objetivo: substituir a barra flutuante por um footer full-width estilo app social, mantendo o video acima da navegacao.

Tasks:

- [x] Remover comportamento flutuante da bottom navigation.
- [x] Fazer footer ocupar largura total com borda superior.
- [x] Ajustar altura disponivel do feed para o video nao ficar atras do footer.
- [x] Remover compensacoes antigas do feed ligadas ao footer flutuante.

Criterios de aceite:

- Footer fica fixo no fluxo inferior da tela.
- Video e ficha ficam acima do footer.
- Abas continuam acessiveis em conta Usuario e Admin.

### Task HOTFIX-005 - Fazer video preencher o feed mobile

Tipo: Frontend/UI

Objetivo: eliminar o espaco morto ao redor do player no celular e usar o video como plano principal do feed, mantendo a marca sobreposta.

Tasks:

- [x] Remover limite de largura e margem superior da box de video no mobile.
- [x] Fazer o player preencher toda a largura e altura util do feed.
- [x] Manter a marca no topo como overlay sobre o video.
- [x] Preservar o player contido no layout desktop.

Criterios de aceite:

- O feed mobile nao exibe faixas vazias ao redor do video.
- O video termina acima do full footer.
- A marca e os controles permanecem legiveis e clicaveis sobre o video.
- O layout desktop nao e ampliado para tela cheia.

### Task HOTFIX-006 - Refinar ficha sobre o video

Tipo: Frontend/UI

Objetivo: integrar melhor a ficha compacta ao video, reduzindo seu peso visual e aproveitando o limite inferior do feed.

Tasks:

- [x] Aplicar fundo translucido na ficha compacta.
- [x] Posicionar a ficha compacta no limite inferior do video.
- [x] Manter fundo opaco no estado expandido para preservar a leitura.
- [x] Reduzir a sombra da ficha compacta.

Criterios de aceite:

- O video permanece visivel por baixo da ficha compacta.
- A ficha nao deixa espaco morto antes do footer.
- Textos e controles continuam legiveis.
- O estado expandido mantem contraste suficiente.

### Task HOTFIX-007 - Converter ficha mobile em legenda expansivel

Tipo: Frontend/UI

Objetivo: aproximar a descricao do padrao visual de feeds de video, exibindo texto diretamente sobre a midia e detalhes em uma camada expandida.

Tasks:

- [x] Remover card, avatar, selo e botao retangular da descricao compacta.
- [x] Exibir nome, localizacao e descricao com tipografia branca sobre o video.
- [x] Posicionar a acao `mais` em linha com a descricao.
- [x] Criar estado expandido com blur e degrade vertical de 0% a 100%.
- [x] Exibir tags e metadados reais do perfil no estado expandido.
- [x] Adicionar acoes textuais `Ver perfil` e `menos`.
- [x] Instalar `expo-blur` e `expo-linear-gradient` em versoes compativeis com Expo SDK 54.
- [x] Preservar a ficha estruturada no layout desktop.

Criterios de aceite:

- A descricao compacta nao possui fundo, borda ou sombra de card.
- A acao `mais` expande os detalhes sem trocar de tela.
- O degrade expandido e transparente no topo e opaco no rodape.
- O blur funciona em Expo Go, Android e web.
- A acao `menos` retorna para a legenda compacta.

### Task HOTFIX-008 - Reorganizar legenda e barra do player

Tipo: Frontend/UI

Objetivo: remover sobreposicoes entre legenda e controles do video e melhorar a hierarquia dos dados do perfil no mobile.

Tasks:

- [x] Mover a barra de progresso para a borda inferior do video.
- [x] Reservar espaco acima da barra para a legenda expansivel.
- [x] Remover a faixa duplicada de titulo e duracao no player mobile.
- [x] Exibir posicao e cidade acima do nome do perfil no mobile.
- [x] Preservar titulo, duracao e layout estruturado no desktop.

Criterios de aceite:

- A barra de progresso nao atravessa os textos da legenda.
- A barra continua permitindo avancar e retroceder o video.
- `Ponta | Sao Paulo, SP` aparece acima de `Perfil demonstrativo`.
- O titulo do video nao aparece duplicado no mobile.

### Task HOTFIX-009 - Adicionar saldo e deposito simulado

Tipo: Produto/Frontend

Objetivo: permitir testes do fluxo de carteira com saldo disponivel, mantendo a operacao explicitamente simulada ate existir infraestrutura financeira real.

Tasks:

- [x] Criar estado compartilhado de saldo disponivel.
- [x] Exibir somente o valor do saldo, sem box, no topo de Feed, Carteira e Perfil.
- [x] Posicionar o saldo do Feed antes dos controles do canto superior direito.
- [x] Adicionar botao `Depositar` na Carteira.
- [x] Criar modal de deposito com campo numerico e valores predefinidos.
- [x] Validar depositos simulados entre R$ 10 e R$ 100.000.
- [x] Atualizar o saldo imediatamente apos a confirmacao.
- [x] Descontar reservas simuladas do saldo disponivel.
- [x] Bloquear reserva quando o saldo for insuficiente.
- [x] Informar claramente que nao existe cobranca ou transferencia real.
- [x] Atualizar README e plano de produto com o novo fluxo.

Criterios de aceite:

- O mesmo saldo aparece em Feed, Carteira e Perfil.
- O indicador global possui apenas o valor em uma linha, sem fundo ou borda.
- Depositar atualiza todas as telas sem recarregar.
- Reserva reduz o saldo e nao permite valor superior ao disponivel.
- Recarregar a pagina limpa o saldo enquanto nao houver backend.

## Sprint 1 - Base real de produto

### Task P0-001 - Criar estrutura de screens

Tipo: Frontend

Objetivo: quebrar o `App.tsx` em telas/componentes para o app ficar mais facil de manter.

Tasks:

- [ ] Criar `src/screens/AuthScreen.tsx`.
- [ ] Criar `src/screens/FeedScreen.tsx`.
- [ ] Criar `src/screens/SubmissionScreen.tsx`.
- [ ] Criar `src/screens/AdminScreen.tsx`.
- [ ] Criar `src/screens/ProfileScreen.tsx`.
- [ ] Criar `src/screens/WalletScreen.tsx` ou remover/ocultar enquanto for simulado.
- [ ] Criar `src/components/VideoCard.tsx`.
- [ ] Criar `src/components/VideoPlayer.tsx`.
- [ ] Criar `src/components/BottomNavigation.tsx`.
- [ ] Criar `src/components/AppToast.tsx`.
- [ ] Mover estilos compartilhados para `src/theme.ts` e componentes base.

Criterios de aceite:

- `App.tsx` deve ficar responsavel principalmente por estado global simples e roteamento local.
- Nenhuma tela deve depender de dados fake escondidos no componente.
- Layout atual deve continuar funcionando apos a quebra.

### Task P0-002 - Criar camada de dados local/API

Tipo: Frontend/Arquitetura

Objetivo: preparar o app para trocar estado local por backend sem reescrever as telas.

Tasks:

- [ ] Criar `src/services/authService.ts`.
- [ ] Criar `src/services/videoService.ts`.
- [ ] Criar `src/services/moderationService.ts`.
- [ ] Criar `src/services/profileService.ts`.
- [ ] Criar `src/repositories/localRepository.ts` para estado temporario.
- [ ] Criar tipos de request/response em `src/types.ts` ou `src/api/types.ts`.

Criterios de aceite:

- Screens nao devem chamar diretamente arrays globais de usuarios/videos.
- Deve ser possivel trocar `localRepository` por API HTTP depois.
- Todos os dados demonstrativos devem estar marcados como `isDemo`.

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

## Sprint 2 - Feed profissional

### Task P1-001 - Melhorar FeedScreen

Tipo: Frontend

Objetivo: deixar o feed pronto para uso publico.

Tasks:

- [ ] Implementar lista paginada de videos aprovados.
- [ ] Reproduzir automaticamente apenas o video visivel.
- [ ] Pausar videos fora da tela.
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

- [ ] Criar versao compacta com nome, posicao, cidade e titulo do video.
- [ ] Criar botao `Ver mais`.
- [ ] Ao expandir, permitir cobrir parte do video de forma intencional.
- [ ] Adicionar destaque, objetivo e tags somente quando existirem.
- [ ] Evitar texto cortado em telas pequenas.

Criterios de aceite:

- Texto nao cobre o video quando esta compacto.
- Usuario consegue expandir e recolher.
- Layout fica estavel em telas pequenas.

## Sprint 3 - Envio e moderacao

### Task P1-004 - SubmissionScreen completa

Tipo: Frontend

Objetivo: criar fluxo de envio confiavel para atleta.

Campos:

- [ ] Nome do atleta.
- [ ] Idade.
- [ ] Cidade/UF.
- [ ] Posicao.
- [ ] Clube atual ou `Nenhum`.
- [ ] Titulo do video.
- [ ] Principal destaque.
- [ ] Objetivo.
- [ ] Consentimento do responsavel quando menor de idade.
- [ ] Arquivo de video.

Criterios de aceite:

- Botao de enviar fica desabilitado ate os campos obrigatorios estarem validos.
- Apos envio, aparece toast/popup no rodape por cerca de 3 segundos.
- Usuario nao precisa rolar a tela para descobrir se o envio funcionou.
- Envio pendente aparece no status do atleta.

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

- [ ] Exibir avatar, nome, idade, posicao, cidade e clube.
- [ ] Exibir bio curta.
- [ ] Exibir videos aprovados do atleta.
- [ ] Exibir avaliacoes agregadas reais quando existirem.
- [ ] Permitir editar dados do proprio perfil.
- [ ] Criar estado de perfil sem videos.
- [ ] Criar link compartilhavel do perfil na web.

Criterios de aceite:

- Perfil nao mostra metricas fake.
- Perfil funciona para atleta logado e visitante.
- Alteracoes salvas persistem apos refresh.

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
