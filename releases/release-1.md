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
