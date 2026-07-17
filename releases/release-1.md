# Release 1 — Ajustes de produto 2026-07-13

Entregue em 2026-07-14.

Primeira release do protótipo NextStar: conta unificada, feed vertical, carteira simulada, bolsa por perfil e refinamentos de UI mobile/web.

## Tasks entregues

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

### Task HOTFIX-010 - Vincular bolsa de investimento ao perfil do atleta

Tipo: Produto/Frontend/Arquitetura

Objetivo: separar video, perfil e bolsa, permitindo que o atleta abra uma captacao vinculada ao proprio perfil e que outros usuarios transfiram saldo simulado para ela.

Tasks:

- [x] Criar entidade `AthleteFund` separada de video e avaliacao esportiva.
- [x] Vincular videos aprovados ao usuario proprietario do perfil.
- [x] Criar bolsa demonstrativa para teste imediato no perfil de demonstracao.
- [x] Exibir bolsa, meta, captado, restante e aporte minimo no perfil publico do atleta.
- [x] Transferir saldo simulado da carteira do investidor para a bolsa do perfil.
- [x] Bloquear aporte abaixo do minimo, acima do restante ou sem saldo.
- [x] Fechar automaticamente a bolsa quando a meta for atingida.
- [x] Bloquear novos aportes depois da conclusao.
- [x] Nao disponibilizar saque para o atleta.
- [x] Permitir que o atleta abra uma bolsa depois da aprovacao do perfil publico.
- [x] Criar formulario de abertura com meta e aporte minimo.
- [x] Exibir progresso da bolsa no perfil privado do atleta.
- [x] Exibir aviso de investimento concluido e busca por contratantes.
- [x] Separar saldos e aportes por conta de usuario.
- [x] Tornar o identificador local da conta estavel por papel e e-mail.
- [x] Remover projecoes de retorno e avancos manuais da carteira.
- [x] Atualizar README e plano de produto.

Criterios de aceite:

- O video apresenta o talento, mas nao armazena nem recebe o investimento.
- A transferencia acontece somente dentro do perfil que possui bolsa aberta.
- O atleta visualiza a captacao e nao possui acao de saque.
- Atingir 100% muda a bolsa para `Concluida` automaticamente.
- O perfil do atleta concluido mostra que esta em busca de contratantes.
- Toda operacao permanece local, temporaria e explicitamente simulada.

### Task HOTFIX-011 - Abrir perfil do atleta pelo feed

Tipo: Produto/Frontend/Arquitetura

Objetivo: transformar o nome exibido no feed em uma entrada clara para o perfil publico, reunindo os videos e a bolsa do atleta em uma unica identidade.

Tasks:

- [x] Criar `profileId` independente do identificador de cada video.
- [x] Migrar `AthleteFund` e `Investment` para vinculo por `profileId`.
- [x] Adicionar icone de perfil clicavel a esquerda do nome no feed mobile.
- [x] Manter o avatar do feed desktop clicavel e acessivel.
- [x] Agrupar todos os videos aprovados publicados pela mesma conta.
- [x] Exibir galeria horizontal de videos no perfil publico.
- [x] Permitir selecionar um video da galeria para reproduzir no player principal.
- [x] Exibir a mesma bolsa em qualquer video usado para acessar o perfil.
- [x] Atualizar README com o fluxo de navegacao pelo perfil.

Criterios de aceite:

- Tocar no icone ao lado do nome abre o perfil correto.
- O perfil lista todos os videos aprovados da mesma conta.
- Selecionar um item da galeria troca o video principal.
- A bolsa pertence ao perfil e nao e duplicada por video.
- O status `Captando` ou `Concluida` permanece igual ao alternar videos.

### Task HOTFIX-012 - Centralizar layout mobile na web

Tipo: Frontend/UI

Objetivo: preservar a experiencia mobile do aplicativo quando a versao web for aberta em telas largas.

Tasks:

- [x] Limitar o container principal da web a `480px`.
- [x] Centralizar o aplicativo e diferenciar o fundo externo.
- [x] Forcar os componentes responsivos da web a usar o layout compacto.
- [x] Manter o comportamento responsivo nativo inalterado no Android e iOS.

Criterios de aceite:

- A versao web nao estica o feed em monitores largos.
- Header, feed, envio, carteira e perfil usam a composicao mobile na web.
- Android e iOS continuam usando os breakpoints por largura da tela.

### Task HOTFIX-013 - Mostrar valor e porcentagem da cota

Tipo: Produto/Frontend

Objetivo: deixar claro no historico da Carteira quanto foi aportado e qual porcentagem da meta da bolsa foi adquirida.

Tasks:

- [x] Calcular a porcentagem da cota no momento do aporte.
- [x] Salvar `sharePercent` no registro de `Investment`.
- [x] Manter o valor do aporte formatado em reais.
- [x] Exibir `Cota X,XX%` abaixo do valor em reais.
- [x] Remover a repeticao do status `Confirmada` no lado direito.
- [x] Atualizar README com a informacao exibida na Carteira.

Criterios de aceite:

- Cada aporte mostra seu valor em reais.
- A porcentagem exibida corresponde a `valor do aporte / meta total da bolsa`.
- O status `Confirmada` aparece apenas uma vez por aporte.
- Percentuais usam duas casas decimais e formato brasileiro.

### Task HOTFIX-014 - Mostrar bolsa na legenda expandida do feed

Tipo: Produto/Frontend

Objetivo: permitir que o usuario identifique a disponibilidade e o progresso da bolsa sem sair do feed.

Tasks:

- [x] Disponibilizar as bolsas dos perfis para o componente `FeedScreen`.
- [x] Vincular a bolsa ao video por `profileId`.
- [x] Exibir o resumo abaixo das hashtags no estado expandido.
- [x] Mostrar valor captado e meta formatados em reais.
- [x] Criar barra de progresso baseada no valor real captado.
- [x] Diferenciar bolsas abertas e concluidas.
- [x] Exibir mensagem quando o perfil nao possuir bolsa aberta.
- [x] Atualizar README com o novo fluxo do feed.

Criterios de aceite:

- O resumo aparece imediatamente abaixo de `#Novo #Video aprovado`.
- Uma bolsa aberta mostra captado, meta e barra proporcional.
- Uma bolsa concluida permanece visivel com progresso completo.
- Perfil sem bolsa mostra `Este perfil nao possui um investimento aberto.`.
- Nenhum valor financeiro e inventado para perfis sem bolsa.

### Task HOTFIX-015 - Reorganizar marca e volume do player

Tipo: Frontend/UI

Objetivo: simplificar o topo do feed e oferecer ajuste de volume compacto junto aos controles do video.

Tasks:

- [x] Remover o texto `Radar` ao lado do simbolo da marca.
- [x] Manter o simbolo NextStar sobreposto ao video.
- [x] Posicionar o botao de volume abaixo do botao de tela cheia.
- [x] Abrir uma barra vertical curta ao tocar no volume.
- [x] Permitir ajuste de `0%` a `100%` por toque e arraste.
- [x] Atualizar o icone entre som ativo e mudo.
- [x] Adicionar acoes de acessibilidade em passos de `10%`.
- [x] Atualizar README com o controle vertical de volume.

Criterios de aceite:

- O texto `Radar` nao aparece mais no topo do feed.
- Tela cheia fica acima do controle de volume.
- Tocar no volume abre e fecha a barra vertical.
- Arrastar para cima aumenta o volume e arrastar para baixo diminui.
- Volume em `0%` deixa o video mudo.

### Task HOTFIX-016 - Fixar marca e navegacao do perfil publico

Tipo: Frontend/UI/Navegacao

Objetivo: manter os principais controles de orientacao acessiveis durante a rolagem do feed e do perfil publico.

Tasks:

- [x] Mover o simbolo NextStar para uma camada fixa do `FeedScreen`.
- [x] Remover a repeticao da marca dentro de cada item do feed.
- [x] Transformar o botao de voltar do perfil publico em overlay fixo.
- [x] Reservar espaco no topo do conteudo para o botao nao cobrir informacoes.
- [x] Manter `BottomTabs` visivel durante a visualizacao do perfil publico.
- [x] Fechar o perfil ao selecionar uma aba do footer.
- [x] Atualizar README com a navegacao persistente.

Criterios de aceite:

- A logo permanece na mesma posicao ao trocar de video no feed.
- O botao de voltar continua visivel ao rolar o perfil publico.
- O footer permanece visivel e fora da area rolavel do perfil.
- Tocar em Feed, Envio, Carteira ou Perfil fecha o perfil publico e abre a aba.
- Conteudo, botao fixo e footer nao se sobrepoem de forma incoerente.

### Task HOTFIX-017 - Criar HUD horizontal no perfil publico

Tipo: Frontend/UI

Objetivo: simplificar o topo fixo do perfil publico e manter somente navegacao de retorno e saldo disponivel.

Tasks:

- [x] Substituir o botao flutuante isolado por uma barra horizontal.
- [x] Fixar a barra em `top: 0` e `width: 100%`.
- [x] Manter somente o icone de voltar no lado esquerdo.
- [x] Exibir somente o valor do saldo disponivel no lado direito.
- [x] Remover `Demonstracao`, risco e status do HUD.
- [x] Reservar espaco superior no `ScrollView` para a barra fixa.
- [x] Atualizar README com o novo HUD.

Criterios de aceite:

- A barra ocupa toda a largura superior do perfil publico.
- O HUD permanece fixo durante a rolagem.
- Apenas seta e saldo ficam visiveis na barra.
- O saldo usa uma linha, sem box ou badge.
- O conteudo comeca abaixo da barra e nao sofre sobreposicao.

### Task HOTFIX-018 - Compactar HUD do perfil publico

Tipo: Frontend/UI

Objetivo: reduzir o peso visual do HUD superior e padronizar seus controles em preto.

Tasks:

- [x] Reduzir a altura do HUD de `62px` para `52px`.
- [x] Reduzir o icone de voltar de `25px` para `21px`.
- [x] Reduzir a area do botao para `40px`, preservando `hitSlop`.
- [x] Reduzir o saldo de `17px` para `15px`.
- [x] Aplicar `colors.text` no icone e no valor do saldo.
- [x] Ajustar o espaco superior do conteudo para a nova altura.
- [x] Atualizar README com o HUD compacto.

Criterios de aceite:

- HUD e icone ocupam menos espaco no perfil publico.
- Seta e saldo usam o preto padrao da interface.
- O saldo continua legivel em uma unica linha.
- A seta permanece confortavel para toque no celular.
- O conteudo nao fica escondido sob a barra.

### Task HOTFIX-019 - Modularizar arquitetura do frontend

Tipo: Frontend/Arquitetura

Objetivo: reduzir o acoplamento do arquivo raiz e organizar o codigo por responsabilidade para facilitar manutencao, revisao e evolucao do produto.

Tasks:

- [x] Reduzir o `App.tsx` de 6.834 para 231 linhas.
- [x] Separar as seis telas em `src/screens/`.
- [x] Extrair handlers de autenticacao, carteira, bolsa, envio e moderacao para `src/actions/createAppActions.ts`.
- [x] Extrair formatadores e builders compartilhados para `src/actions/appActions.ts`.
- [x] Extrair navegacao, shell, splash e componentes compartilhados para `src/components/`.
- [x] Mover o `StyleSheet` para `src/styles/appStyles.ts`.
- [x] Extrair constantes de assets e layout para `src/constants/`.
- [x] Remover o componente morto `PlayerCard`.
- [x] Atualizar `backlog.md`, `TechnicalDebt.md` e `README.md`.
- [x] Validar a nova estrutura com TypeScript.

Criterios de aceite:

- `App.tsx` fica responsavel principalmente por estado global simples e roteamento local.
- Cada tela principal possui um modulo proprio.
- Acoes de produto nao ficam declaradas no componente raiz.
- O layout e os fluxos existentes continuam com as mesmas props e regras.
- As subdivisoes restantes ficam identificadas no backlog, sem serem marcadas como concluidas.

### Task HOTFIX-020 - Reorganizar navegacao principal e menu do Perfil

Tipo: Frontend/UI/Navegacao

Objetivo: aproximar a navegacao do foco social em videos, retirar a Carteira do footer e centralizar opcoes de conta no Perfil.

Tasks:

- [x] Renomear a aba visivel `Feed` para `Inicio`.
- [x] Remover `Carteira` da navegacao inferior.
- [x] Adicionar a aba `Pesquisar` com busca por nome, posicao, cidade ou clube.
- [x] Abrir o perfil publico a partir de um resultado de pesquisa.
- [x] Adicionar a aba `Mensagens` com estado vazio sem dados inventados.
- [x] Criar menu de tres barras no Perfil.
- [x] Adicionar `Configuracoes`, `Carteira` e `Sair da conta` ao menu.
- [x] Reutilizar saldo, deposito e historico da Carteira dentro do Perfil.
- [x] Criar subarea de Configuracoes com preferencias de notificacao e reproducao automatica.
- [x] Ajustar o footer para cinco itens em telas mobile.
- [x] Atualizar textos, acessibilidade, README e backlog.
- [x] Validar os fluxos no viewport mobile de `390x844`.

Criterios de aceite:

- Footer do Usuario exibe Inicio, Envio, Pesquisar, Mensagens e Perfil.
- Os cinco rotulos cabem no celular sem sobreposicao.
- Carteira nao aparece como aba principal.
- Menu do Perfil abre como HUD e permite acessar Configuracoes, Carteira e Sair.
- Pesquisa usa somente perfis disponiveis no estado atual.
- Mensagens nao exibe conversas fake.
- Saldo, deposito e investimentos continuam usando o mesmo estado compartilhado.

### Task HOTFIX-021 - Transformar Perfil em vitrine de videos

Tipo: Frontend/UI/Perfil

Objetivo: separar conteudo publico de configuracoes da conta e priorizar os videos publicados pelo usuario.

Tasks:

- [x] Remover Verificacao e Conta NextStar da tela principal do Perfil.
- [x] Mover email, identidade, termos e status KYC para Configuracoes.
- [x] Mover reservas, total investido, quantidade de envios e moderacao para Configuracoes.
- [x] Mover abertura, progresso e conclusao da bolsa de investimento para Configuracoes.
- [x] Mover o aviso de ambiente demonstrativo para Configuracoes.
- [x] Criar galeria em tres colunas com videos aprovados da propria conta.
- [x] Abrir o video selecionado em um modal com controles de reproducao.
- [x] Exibir `Poste um video para mostra-lo aqui` quando nao houver publicacoes.
- [x] Atualizar as estatisticas do Perfil para envios, aprovados e publicados.
- [x] Atualizar backlog e README.

Criterios de aceite:

- Perfil principal nao exibe KYC, termos, reservas ou bolsa.
- Configuracoes reune dados operacionais e financeiros da conta.
- Somente videos aprovados e com arquivo valido aparecem na galeria.
- Nova conta recebe uma orientacao clara para publicar o primeiro video.
- Tocar em um item da galeria abre o video com controles.
- A gestao da bolsa continua usando o mesmo estado e modal existentes.

### Task HOTFIX-022 - Pesquisar contas cadastradas e fechar menu por toda a tela

Tipo: Frontend/UI/Pesquisa

Objetivo: tornar contas da sessao pesquisaveis antes da primeira publicacao e corrigir a area externa de fechamento do menu do Perfil.

Tasks:

- [x] Registrar contas de Usuario autenticadas no diretorio local da sessao.
- [x] Unificar contas cadastradas e perfis com video nos resultados de pesquisa.
- [x] Evitar duplicidade quando a conta cadastrada ja possui perfil com video aprovado.
- [x] Manter email e dados privados fora do resultado publico.
- [x] Criar perfil publico vazio para contas sem video aprovado.
- [x] Manter HUD de voltar, saldo e footer ao abrir esse perfil.
- [x] Fazer a camada do menu ignorar toques fora do painel.
- [x] Fechar o menu ao tocar acima, abaixo, a esquerda ou a direita do HUD.
- [x] Atualizar README e backlog.

Criterios de aceite:

- Uma conta criada aparece na pesquisa pelo nome mesmo sem ter enviado video.
- Perfis com video continuam abrindo a ficha completa existente.
- Perfis sem video mostram um estado vazio sem inventar dados esportivos.
- O menu de tres barras fecha ao tocar em qualquer regiao externa ao painel.
- Os botoes dentro do menu continuam funcionando normalmente.

### Task HOTFIX-023 - Unificar perfil publico, reels e pagina de investimento

Tipo: Frontend/UI/Perfil/Investimento

Objetivo: transformar o perfil visitado em uma vitrine consistente com o perfil da conta, manter a reproducao concentrada no Inicio e separar o aporte em uma pagina transacional.

Tasks:

- [x] Criar `ProfileVideoGallery` reutilizavel para perfil proprio e visitado.
- [x] Aplicar avatar, identidade, estatisticas e galeria no mesmo modelo visual dos dois perfis.
- [x] Remover o player grande do perfil publico.
- [x] Remover o modal de pre-visualizacao do perfil proprio.
- [x] Abrir o reel correspondente ao tocar em um video da galeria.
- [x] Permitir que o feed inicie diretamente no video selecionado.
- [x] Adicionar icone de investimento ao perfil proprio e ao perfil visitado.
- [x] Criar `InvestmentScreen.tsx` com meta, captado, restante, aporte minimo, saldo e valor.
- [x] Levar o botao `Investir` para a pagina dedicada de investimento.
- [x] Desabilitar icone e botao quando nao houver bolsa em captacao.
- [x] Manter HUD de voltar, saldo e footer nas paginas publicas e de investimento.
- [x] Atualizar README e backlog.

Criterios de aceite:

- Perfil visitado tem a mesma linguagem visual do Perfil da conta.
- Nenhum video e reproduzido dentro da pagina de perfil.
- Tocar em uma miniatura abre o video correto no Inicio.
- Perfil com bolsa aberta permite acessar a pagina de investimento.
- Perfil sem bolsa aberta mostra `Bolsa indisponivel` em estado desabilitado.
- Confirmacao do aporte continua usando saldo, bolsa e historico compartilhados.

### Task HOTFIX-024 - Retorno contextual do reel e marca padronizada

Tipo: Frontend/UI/Navegacao

Objetivo: simplificar as acoes do Perfil proprio e permitir que o usuario retorne ao perfil de origem depois de abrir um video no Inicio.

Tasks:

- [x] Remover o icone financeiro ao lado do menu de tres barras no Perfil proprio.
- [x] Manter investimento acessivel por Configuracoes no Perfil proprio.
- [x] Registrar se o reel foi aberto pelo Perfil proprio ou por um perfil visitado.
- [x] Criar seta contextual de retorno no canto superior esquerdo do Inicio.
- [x] Retornar ao Perfil proprio quando o video sair da galeria da conta.
- [x] Retornar ao perfil visitado correto quando o video sair da galeria publica.
- [x] Limpar o retorno contextual ao selecionar uma aba do footer.
- [x] Posicionar seta e logo em uma linha sem sobreposicao.
- [x] Aumentar a logo do Inicio de `25x25` para o padrao compacto `48x38`.
- [x] Atualizar README e backlog.

Criterios de aceite:

- Perfil proprio possui somente o menu de tres barras como acao no topo.
- Reel aberto normalmente nao exibe seta de retorno ao perfil.
- Reel aberto por uma galeria exibe a seta no canto superior esquerdo.
- A seta restaura exatamente o perfil que originou a navegacao.
- Logo e seta permanecem integralmente visiveis e nao se sobrepoem.
- A marca do Inicio possui o mesmo tamanho usado no header compacto.

### Task HOTFIX-025 - Mensagens pelo perfil e HUD com marca

Tipo: Frontend/UI/Navegacao

Objetivo: transformar a acao secundaria do perfil publico em contato direto e padronizar a marca nas paginas contextuais.

Tasks:

- [x] Substituir o icone financeiro superior do perfil publico por mensagem.
- [x] Manter o botao principal de investimento como unica entrada da bolsa.
- [x] Abrir a conversa com o perfil visitado ja selecionado.
- [x] Criar lista de conversas, thread, composer e envio local.
- [x] Manter o historico de mensagens durante a sessao atual.
- [x] Limpar mensagens locais ao sair da conta.
- [x] Criar HUD compartilhado com seta, logo compacta e saldo.
- [x] Reutilizar o HUD no perfil publico e na pagina de investimento.
- [x] Atualizar README e backlog tecnico.

Criterios de aceite:

- O icone pequeno do perfil abre Mensagens e nao duplica o investimento.
- A conversa aberta corresponde ao perfil visitado.
- Uma mensagem enviada aparece imediatamente no historico local.
- A marca ocupa a mesma posicao e dimensao nas paginas contextuais.
- Seta, logo e saldo permanecem fixos e sem sobreposicao.

### Task HOTFIX-026 - Fechar pagina da bolsa pelo card do perfil

Tipo: Frontend/UI/Navegacao

Objetivo: deixar o retorno ao perfil imediatamente visivel dentro da pagina de investimento.

Tasks:

- [x] Remover o icone financeiro sem acao do card superior.
- [x] Adicionar botao `X` no canto superior direito do card.
- [x] Reutilizar a mesma acao de retorno do HUD fixo.
- [x] Manter icone preto e area de toque de `40px`.
- [x] Atualizar README e backlog tecnico.

Criterios de aceite:

- Tocar no `X` fecha a pagina da bolsa.
- O usuario retorna ao mesmo perfil visitado.
- O botao permanece visivel sem competir com os dados financeiros.

### Task HOTFIX-027 - Padronizar transicoes das novas paginas

Tipo: Frontend/UI/Navegacao

Objetivo: aplicar a mesma animacao suave de entrada em todas as paginas adicionadas recentemente.

Tasks:

- [x] Reiniciar a transicao ao abrir um perfil publico.
- [x] Reiniciar a transicao ao abrir ou fechar a pagina de investimento.
- [x] Animar Pesquisa, Envio, Admin e a lista de Mensagens por rota.
- [x] Animar a abertura e o retorno de uma conversa.
- [x] Animar Perfil, Configuracoes e Carteira sem mover header e footer.
- [x] Reutilizar `ScreenTransition` sem criar estilos de movimento paralelos.
- [x] Atualizar README e backlog tecnico.

Criterios de aceite:

- Todas as novas paginas entram com fade e deslocamento vertical suave.
- Trocas entre perfil e investimento reiniciam a animacao.
- Trocas entre lista e conversa reiniciam a animacao.
- Header e footer permanecem fixos durante a transicao.
- Configuracoes e Carteira seguem o mesmo comportamento visual do restante do app.

### Task HOTFIX-028 - Exibir transicoes do Perfil e animar Ver mais

Tipo: Frontend/UI/Animacao

Objetivo: tornar perceptiveis as transicoes de Configuracoes e Carteira e suavizar a expansao da descricao do feed.

Tasks:

- [x] Aguardar o fechamento do menu antes de abrir Configuracoes.
- [x] Aguardar o fechamento do menu antes de abrir Carteira.
- [x] Preservar a transicao padrao de entrada nas duas subpaginas.
- [x] Animar altura e espacamento da descricao expandida.
- [x] Aplicar fade e deslocamento vertical ao conteudo de `Ver mais`.
- [x] Animar o recolhimento antes de restaurar a legenda compacta.
- [x] Reiniciar a legenda ao trocar de video.
- [x] Atualizar README e backlog tecnico.

Criterios de aceite:

- A animacao de Configuracoes fica visivel depois que o menu fecha.
- A animacao da Carteira fica visivel depois que o menu fecha.
- `mais` expande a descricao sem aparecimento brusco.
- `menos` recolhe a descricao antes de voltar ao estado compacto.
- A animacao nao altera a posicao do footer nem dos controles do video.

### Task FEATURE-029 - Follow e solicitacoes de mensagem

Tipo: Frontend/Dados/Produto

Objetivo: criar uma relacao social persistente entre perfis e usa-la para organizar o Inicio e proteger mensagens diretas.

Tasks:

- [x] Persistir perfis seguidos por conta com AsyncStorage.
- [x] Adicionar `Seguir` e `Seguindo` no Inicio.
- [x] Reutilizar o mesmo estado no perfil publico.
- [x] Exibir metricas de seguidores e seguindo.
- [x] Priorizar videos dos perfis seguidos no Inicio.
- [x] Separar Mensagens entre Conversas e Solicitacoes.
- [x] Permitir uma unica mensagem inicial para perfil nao seguido.
- [x] Ocultar mensagens recebidas ate o destinatario seguir o remetente.
- [x] Liberar e mover a conversa automaticamente depois do follow.
- [x] Isolar regras sociais em actions e services proprios.
- [x] Atualizar README e backlog tecnico.

Criterios de aceite:

- Feed e perfil exibem o mesmo estado de follow.
- O follow permanece salvo depois de reiniciar o app.
- Perfis seguidos ficam na area Conversas.
- Perfis nao seguidos ficam na area Solicitacoes.
- A thread recebida permanece protegida ate o follow.
- Seguir pela conversa libera imediatamente mensagens e composer.

### Task FEATURE-030 - Foto de perfil e investimento direto pelo Inicio

Tipo: Frontend/Dados/Navegacao

Objetivo: aplicar uma identidade visual consistente aos perfis e encurtar o acesso a bolsa exibida no reel.

Tasks:

- [x] Criar persistencia local de fotos por `profileId`.
- [x] Adicionar escolha, troca e remocao de foto em Configuracoes.
- [x] Exibir a foto no Inicio, Perfil, Pesquisa, Mensagens e investimento.
- [x] Preservar iniciais como fallback sem foto cadastrada.
- [x] Tornar o nome do autor clicavel no Inicio.
- [x] Substituir `Ver perfil` por `Investir` na descricao expandida.
- [x] Abrir diretamente a bolsa vinculada ao video atual.
- [x] Bloquear o CTA quando a bolsa nao estiver em captacao.
- [x] Atualizar README e backlog tecnico.

Criterios de aceite:

- A mesma foto aparece em todas as telas vinculadas ao perfil.
- A foto permanece salva no mesmo dispositivo depois de reiniciar o app.
- Avatar e nome abrem o perfil correto.
- `Investir` nunca abre uma bolsa diferente da vinculada ao reel.
- A ausencia de bolsa mantem o investimento indisponivel.

### Task FEATURE-031 - Repository local e persistencia do estado principal

Tipo: Frontend/Arquitetura/Dados

Objetivo: permitir testes continuos sem perder contas, postagens e operacoes simuladas ao recarregar o aplicativo.

Tasks:

- [x] Criar schema local com versao explicita.
- [x] Criar migracao defensiva para dados antigos ou incompletos.
- [x] Criar repository sobre `AsyncStorage`.
- [x] Extrair hidratacao e setters persistentes para hook proprio.
- [x] Persistir usuarios cadastrados e sessao ativa.
- [x] Persistir envios e decisoes de moderacao.
- [x] Persistir saldos, bolsas e investimentos.
- [x] Restaurar a rota Admin para sessao administrativa.
- [x] Preservar nome e dados da conta ao entrar novamente.
- [x] Adicionar quatro testes automatizados do repository.
- [x] Executar os testes no workflow de deploy.
- [x] Corrigir encoding e status do `TechnicalDebt.md`.
- [x] Atualizar README e backlog tecnico.

Criterios de aceite:

- Recarregar o app nao apaga o estado principal.
- Dados invalidos usam fallback seguro sem impedir a abertura.
- Estado antigo sem versao e migrado para a versao atual.
- Sair da conta limpa apenas a sessao ativa e preserva os dados cadastrados.
- O CI bloqueia o deploy quando os testes do repository falham.
- Video local continua identificado como temporario ate existir upload remoto.

### Task FEATURE-032 - HUD de enquadramento da foto de perfil

Tipo: Frontend/Dados/UX

Objetivo: permitir que o usuario controle qual area da foto aparece nos avatares circulares do aplicativo.

Tasks:

- [x] Transformar o avatar persistido em dado estruturado com URI, foco e dimensoes.
- [x] Migrar automaticamente o formato antigo salvo apenas como URI.
- [x] Criar componente compartilhado para renderizar o enquadramento.
- [x] Abrir a HUD ao tocar na foto do perfil ou na previa de Configuracoes.
- [x] Disponibilizar ponto focal arrastavel com previa imediata.
- [x] Abrir a HUD logo depois de escolher uma nova foto.
- [x] Aplicar o enquadramento no Inicio, Perfil, Pesquisa, Mensagens e investimento.
- [x] Adicionar testes de migracao, normalizacao e serializacao.
- [x] Atualizar README e backlog tecnico.

Criterios de aceite:

- Tocar na foto propria abre a HUD sem navegar para outra pagina.
- Cancelar preserva o enquadramento anterior.
- Salvar atualiza imediatamente todas as ocorrencias do avatar.
- O ponto focal permanece salvo depois de recarregar o aplicativo.
- Fotos do formato antigo continuam visiveis com foco central.

### Task FEATURE-033 - Ponto focal arrastavel

Tipo: Frontend/UX

Objetivo: dar controle continuo sobre o enquadramento da foto de perfil.

Tasks:

- [x] Substituir as nove posicoes fixas por coordenadas continuas.
- [x] Permitir mover o foco tocando ou arrastando sobre a previa.
- [x] Limitar o marcador aos limites circulares da foto.
- [x] Atualizar a foto em tempo real durante o gesto.
- [x] Manter as coordenadas compativeis com a persistencia existente.
- [x] Atualizar README, backlog e release notes.

Criterios de aceite:

- O marcador acompanha o dedo durante todo o gesto.
- Tocar em uma area da foto move imediatamente o ponto focal.
- O marcador nao sai da area circular da previa.
- Cancelar nao altera o enquadramento salvo.
- Salvar mantem a posicao escolhida depois de recarregar o app.

### Task FEATURE-034 - Recorte circular sobre a foto completa

Tipo: Frontend/UX/Produto

Objetivo: tornar o enquadramento previsivel sem esconder partes da foto durante a edicao.

Tasks:

- [x] Exibir a imagem completa com `contain`, sem recorte previo.
- [x] Substituir o marcador pelo circulo que representa o avatar final.
- [x] Permitir arrastar o circulo sobre toda a area valida da imagem.
- [x] Escurecer somente a regiao externa ao recorte circular.
- [x] Usar a mesma escala na HUD e no avatar publicado.
- [x] Remover a acao de excluir foto e manter apenas `Trocar foto`.
- [x] Adicionar testes da geometria, limites e correspondencia do recorte.
- [x] Atualizar README, backlog e release notes.

Criterios de aceite:

- A foto inteira permanece visivel enquanto o usuario enquadra.
- A area dentro do circulo permanece nitida e representa o avatar final.
- O circulo nunca ultrapassa os limites reais da imagem.
- Salvar mantem o mesmo enquadramento nas demais telas.
- Configuracoes nao exibe mais a opcao `Remover`.

### Task FEATURE-035 - Tamanho variavel do recorte circular

Tipo: Frontend/UX/Dados

Objetivo: permitir composicoes mais abertas ou fechadas sem trocar a foto escolhida.

Tasks:

- [x] Adicionar `cropScale` ao avatar persistido.
- [x] Migrar fotos antigas para o tamanho visual anterior.
- [x] Limitar o recorte ao intervalo de 30% a 100%.
- [x] Fazer o limite de 100% tocar o menor lado da imagem.
- [x] Criar slider arrastavel com metrica percentual.
- [x] Adicionar botoes de diminuir e aumentar em passos de 5%.
- [x] Aplicar o tamanho salvo em todas as ocorrencias do avatar.
- [x] Cobrir limites, slider, geometria e migracao com testes.
- [x] Atualizar README, backlog e release notes.

Criterios de aceite:

- O usuario consegue ajustar continuamente o tamanho do circulo.
- O indicador mostra valores entre 30% e 100%.
- O circulo nunca fica menor que 30% nem ultrapassa a imagem.
- O avatar publicado corresponde a posicao e ao tamanho da HUD.
- Recarregar o aplicativo preserva ambos os ajustes.

### Task FEATURE-036 - Login com senha e perfil do atleta

Tipo: Frontend/Dados/Autenticacao

Objetivo: tornar o acesso coerente com uma conta real e separar credenciais dos dados publicos do atleta.

Tasks:

- [x] Substituir nome e email por email e senha no cadastro e login.
- [x] Adicionar confirmacao e validacao de senha no cadastro.
- [x] Persistir somente salt e hash SHA-256 da senha local.
- [x] Migrar o schema do estado principal para a versao 2.
- [x] Permitir que contas antigas definam senha no proximo login.
- [x] Criar tela obrigatoria de configuracao no primeiro acesso.
- [x] Coletar nome, biografia, idade, posicao, cidade e clube ou projeto.
- [x] Reutilizar o formulario em `Configuracoes > Editar perfil`.
- [x] Exibir biografia e clube nos perfis proprio e publico.
- [x] Atualizar resultados da pesquisa com os dados do perfil.
- [x] Adicionar teste de migracao, preservacao das credenciais e ausencia de senha em texto puro.
- [x] Validar cadastro, primeiro acesso, perfil e edicao em viewport mobile.
- [x] Atualizar README, backlog e divida tecnica.

Criterios de aceite:

- Usuario novo informa apenas credenciais no cadastro e completa seus dados depois de entrar.
- Perfil incompleto bloqueia o acesso as abas ate ser salvo.
- Dados salvos reaparecem preenchidos em Editar perfil.
- Biografia e clube aparecem na vitrine do usuario.
- Senha em texto puro nao e persistida no estado local.

### Task FEATURE-037 - Envio vinculado ao perfil do atleta

Tipo: Frontend/Dados/UX

Objetivo: eliminar o preenchimento duplicado de dados pessoais em cada novo video.

Tasks:

- [x] Remover a secao `Dados do atleta` da tela de envio.
- [x] Usar nome, idade, posicao, cidade e clube do perfil ativo.
- [x] Preservar a validacao de idade minima e consentimento do responsavel.
- [x] Manter no formulario apenas os dados relacionados ao video.
- [x] Manter a biografia exclusivamente nos perfis proprio e publico.
- [x] Atualizar README e backlog tecnico.

Criterios de aceite:

- Usuario nao redigita dados pessoais ao publicar outro video.
- Moderacao recebe os dados do perfil vinculados ao envio.
- A postagem nao recebe nem exibe a biografia do atleta.
- Alterar o perfil atualiza a fonte usada nos proximos envios.

### Task FIX-038 - Reproducao exclusiva e persistencia local de video

Tipo: Frontend/Dados/Correcao

Objetivo: impedir reproducao simultanea no Inicio e preservar arquivos escolhidos depois de recarregar o navegador.

Tasks:

- [x] Atualizar o item ativo continuamente durante a rolagem do feed.
- [x] Pausar o player anterior e fechar seu controle de volume.
- [x] Persistir arquivos locais do navegador em um object store do IndexedDB.
- [x] Salvar referencias `nextstar-video:` no estado principal.
- [x] Resolver as referencias persistentes em Feed, Perfil, Admin e pre-visualizacoes.
- [x] Revogar URLs de objeto quando o player deixa a tela.
- [x] Tratar URLs `blob:` antigas como indisponiveis e orientar o reenvio.
- [x] Cobrir a referencia persistente e a deteccao de URLs temporarias com testes.
- [x] Atualizar README e backlog tecnico.

Criterios de aceite:

- Apenas o video mais visivel pode permanecer em reproducao.
- O video anterior pausa ainda durante a troca de item.
- Novo video selecionado continua disponivel apos atualizar a pagina no mesmo navegador.
- Video temporario antigo nao fica apenas preto: a interface solicita o reenvio.
- Upload definitivo entre dispositivos continua registrado em `P0-004` como dependencia de backend/storage.

### Task FIX-039 - Identidade unica e conversa com a propria conta

Tipo: Frontend/Dados/Correcao

Objetivo: separar nome publico de username, impedir contas duplicadas e remover a regra de follow ao enviar mensagens para si mesmo.

Tasks:

- [x] Adicionar `username` ao modelo de conta e elevar o schema local para a versao 3.
- [x] Migrar contas antigas para usernames validos e unicos.
- [x] Coletar nome do jogador e username durante o cadastro.
- [x] Bloquear email e username ja cadastrados sem impedir nomes publicos iguais.
- [x] Exibir username no cabecalho, Inicio, perfil proprio, perfil publico e mensagens.
- [x] Pesquisar perfis por nome ou username.
- [x] Tratar a propria conta como conversa liberada, sem follow ou solicitacao.
- [x] Cobrir username, conflitos de identidade, migracao e acesso social com testes.
- [x] Atualizar README e backlog tecnico.

Criterios de aceite:

- Duas pessoas podem usar o mesmo nome publico.
- Email e username nao podem ser reutilizados por outra conta no mesmo estado local.
- Username e comparado sem diferenca entre letras maiusculas e minusculas.
- Pesquisa por `Pedro Barberini` e por `@pedrobarberini` encontra o perfil correspondente.
- Mensagem para a propria conta abre o compositor normalmente e nunca solicita follow.

### Task FIX-040 - Publicacao direta e texto unico

Tipo: Frontend/Dados/UX

Objetivo: retirar a fila manual durante os testes e simplificar o conteudo da postagem.

Tasks:

- [x] Publicar novos videos diretamente com status interno aprovado.
- [x] Adicionar data de publicacao no momento do envio.
- [x] Migrar envios antigos em revisao para publicacoes visiveis.
- [x] Remover o campo `Objetivo do aporte` do formulario e do modelo do feed.
- [x] Renomear `Principal destaque` para `Texto da publicacao`.
- [x] Atualizar botao, toast, status, perfil e textos auxiliares.
- [x] Manter a estrutura administrativa reservada para a futura moderacao automatica.
- [x] Cobrir status direto e migracao de pendencias com testes.
- [x] Atualizar README e backlog tecnico.

Criterios de aceite:

- O usuario publica sem abrir ou aguardar a tela Admin.
- O video aparece imediatamente no Inicio e na galeria do perfil.
- A interface mostra apenas titulo e texto da publicacao, sem objetivo de aporte.
- Pendencias locais anteriores deixam de depender de aprovacao manual.

### Task FIX-041 - Exclusao de video pelo dono

Tipo: Frontend/Dados/UX

Objetivo: permitir que o usuario remova uma publicacao que nao deseja mais exibir.

Tasks:

- [x] Adicionar botao de lixeira somente na galeria do proprio perfil.
- [x] Exibir confirmacao antes de concluir a exclusao.
- [x] Remover a publicacao do Inicio e da galeria imediatamente.
- [x] Excluir do IndexedDB a copia local do video no navegador.
- [x] Validar o ID do dono antes de alterar a lista persistida.
- [x] Manter videos de outros usuarios protegidos contra exclusao.
- [x] Cobrir propriedade e exclusao com testes automatizados.
- [x] Atualizar README e backlog tecnico.

Criterios de aceite:

- A lixeira aparece apenas para videos da conta conectada.
- Cancelar o modal mantem o video publicado.
- Confirmar remove o video do Perfil e do Inicio sem recarregar.
- Uma conta nao consegue excluir o video de outra.

### Task FIX-042 - Username como identidade principal

Tipo: Frontend/UX

Objetivo: priorizar a identidade unica da plataforma nas telas de perfil.

Tasks:

- [x] Exibir `@username` como titulo do proprio perfil.
- [x] Manter o nome publico logo abaixo como informacao secundaria.
- [x] Aplicar a mesma hierarquia no perfil visitado e na pagina de investimento.
- [x] Preservar o nome publico como fallback para perfis antigos sem username.
- [x] Atualizar README e backlog tecnico.

Criterios de aceite:

- O username aparece antes e com maior destaque que o nome publico.
- O nome do jogador continua visivel no cabecalho do perfil.
- Usernames longos permanecem em uma unica linha sem sobrepor os controles.
