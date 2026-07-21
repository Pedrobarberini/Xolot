# Release 1 — Ajustes de produto 2026-07-13

Entregue em 2026-07-14.

Primeira release do protótipo Xolot: conta unificada, feed vertical, carteira simulada, bolsa por perfil e refinamentos de UI mobile/web.

## Tasks entregues

### Task HOTFIX-001 - Unificar conta de atleta e investidor

Tipo: Produto/Frontend

Objetivo: substituir a divisão `Atleta`/`Investidor` por uma conta comum `Usuário`, permitindo que a mesma pessoa envie vídeos e também acesse a carteira/feed.

Tasks:

- [x] Trocar `UserRole` para `Usuário` e `Admin`.
- [x] Atualizar AuthScreen para exibir apenas `Usuário` e `Admin`.
- [x] Ajustar tabs do `Usuário` para mostrar Feed, Envio, Carteira e Perfil.
- [x] Permitir reserva simulada para `Usuário`.
- [x] Atualizar ProfileScreen para refletir conta unificada.
- [x] Atualizar README com o novo fluxo.

Criterios de aceite:

- Conta comum consegue enviar vídeo.
- Conta comum consegue acessar carteira.
- Não existe mais escolha separada entre atleta e investidor.
- Admin continua com acesso de moderação.

### Task HOTFIX-002 - Limitar largura máxima do footer

Tipo: Frontend/UI

Objetivo: ajustar a bottom navigation para ficar centralizada com largura máxima, evitando que o footer fique esticado demais em telas maiores.

Tasks:

- [x] Aplicar `maxWidth` na tab bar também fora do modo desktop.
- [x] Centralizar footer horizontalmente.
- [x] Manter espaçamento seguro acima da navegação do sistema.

Criterios de aceite:

- Footer fica visualmente mais compacto.
- Footer não ultrapassa a tela em mobile.
- Footer continua facil de tocar.

### Task HOTFIX-003 - Remover box/badge de sem avaliação

Tipo: Frontend/UI

Objetivo: retirar chamadas visuais de `Sem avaliações` para deixar o app mais limpo enquanto não existe sistema de avaliação comunitária.

Tasks:

- [x] Remover badge `Sem avaliações` do feed.
- [x] Remover box de `Sem avaliações` no detalhe do atleta.
- [x] Ajustar textos condicionais para não ocupar espaço visual sem necessidade.

Criterios de aceite:

- Publicações sem avaliação não exibem score, métricas nem box de aviso.
- A interface permanece limpa e sem espaços vazios.

### Task HOTFIX-004 - Transformar bottom navigation em full footer

Tipo: Frontend/UI

Objetivo: substituir a barra flutuante por um footer full-width estilo app social, mantendo o vídeo acima da navegação.

Tasks:

- [x] Remover comportamento flutuante da bottom navigation.
- [x] Fazer footer ocupar largura total com borda superior.
- [x] Ajustar altura disponível do feed para o vídeo não ficar atras do footer.
- [x] Remover compensações antigas do feed ligadas ao footer flutuante.

Criterios de aceite:

- Footer fica fixo no fluxo inferior da tela.
- Video e ficha ficam acima do footer.
- Abas continuam acessiveis em conta Usuário e Admin.

### Task HOTFIX-005 - Fazer vídeo preencher o feed mobile

Tipo: Frontend/UI

Objetivo: eliminar o espaço morto ao redor do player no celular e usar o vídeo como plano principal do feed, mantendo a marca sobreposta.

Tasks:

- [x] Remover limite de largura e margem superior da box de vídeo no mobile.
- [x] Fazer o player preencher toda a largura e altura util do feed.
- [x] Manter a marca no topo como overlay sobre o vídeo.
- [x] Preservar o player contido no layout desktop.

Criterios de aceite:

- O feed mobile não exibe faixas vazias ao redor do vídeo.
- O vídeo termina acima do full footer.
- A marca e os controles permanecem legiveis e clicaveis sobre o vídeo.
- O layout desktop não é ampliado para tela cheia.

### Task HOTFIX-006 - Refinar ficha sobre o vídeo

Tipo: Frontend/UI

Objetivo: integrar melhor a ficha compacta ao vídeo, reduzindo seu peso visual e aproveitando o limite inferior do feed.

Tasks:

- [x] Aplicar fundo translucido na ficha compacta.
- [x] Posicionar a ficha compacta no limite inferior do vídeo.
- [x] Manter fundo opaco no estado expandido para preservar a leitura.
- [x] Reduzir a sombra da ficha compacta.

Criterios de aceite:

- O vídeo permanece visível por baixo da ficha compacta.
- A ficha não deixa espaço morto antes do footer.
- Textos e controles continuam legiveis.
- O estado expandido mantém contraste suficiente.

### Task HOTFIX-007 - Converter ficha mobile em legenda expansível

Tipo: Frontend/UI

Objetivo: aproximar a descrição do padrão visual de feeds de vídeo, exibindo texto diretamente sobre a mídia e detalhes em uma camada expandida.

Tasks:

- [x] Remover card, avatar, selo e botão retangular da descrição compacta.
- [x] Exibir nome, localização e descrição com tipografia branca sobre o vídeo.
- [x] Posicionar a ação `mais` em linha com a descrição.
- [x] Criar estado expandido com blur e degrade vertical de 0% a 100%.
- [x] Exibir tags e metadados reais do perfil no estado expandido.
- [x] Adicionar ações textuais `Ver perfil` e `menos`.
- [x] Instalar `expo-blur` e `expo-linear-gradient` em versoes compativeis com Expo SDK 54.
- [x] Preservar a ficha estruturada no layout desktop.

Criterios de aceite:

- A descrição compacta não possui fundo, borda ou sombra de card.
- A ação `mais` expande os detalhes sem trocar de tela.
- O degrade expandido e transparente no topo e opaco no rodapé.
- O blur funciona em Expo Go, Android e web.
- A ação `menos` retorna para a legenda compacta.

### Task HOTFIX-008 - Reorganizar legenda e barra do player

Tipo: Frontend/UI

Objetivo: remover sobreposicoes entre legenda e controles do vídeo e melhorar a hierarquia dos dados do perfil no mobile.

Tasks:

- [x] Mover a barra de progresso para a borda inferior do vídeo.
- [x] Reservar espaço acima da barra para a legenda expansível.
- [x] Remover a faixa duplicada de título e duração no player mobile.
- [x] Exibir posição e cidade acima do nome do perfil no mobile.
- [x] Preservar título, duração e layout estruturado no desktop.

Criterios de aceite:

- A barra de progresso não atravessa os textos da legenda.
- A barra continua permitindo avancar e retroceder o vídeo.
- `Ponta | São Paulo, SP` aparece acima de `Perfil demonstrativo`.
- O título do vídeo não aparece duplicado no mobile.

### Task HOTFIX-009 - Adicionar saldo e depósito simulado

Tipo: Produto/Frontend

Objetivo: permitir testes do fluxo de carteira com saldo disponível, mantendo a operação explicitamente simulada até existir infraestrutura financeira real.

Tasks:

- [x] Criar estado compartilhado de saldo disponível.
- [x] Exibir somente o valor do saldo, sem box, no topo de Feed, Carteira e Perfil.
- [x] Posicionar o saldo do Feed antes dos controles do canto superior direito.
- [x] Adicionar botão `Depositar` na Carteira.
- [x] Criar modal de depósito com campo numerico e valores predefinidos.
- [x] Validar depósitos simulados entre R$ 10 e R$ 100.000.
- [x] Atualizar o saldo imediatamente após a confirmação.
- [x] Descontar reservas simuladas do saldo disponível.
- [x] Bloquear reserva quando o saldo for insuficiente.
- [x] Informar claramente que não existe cobranca ou transferência real.
- [x] Atualizar README e plano de produto com o novo fluxo.

Criterios de aceite:

- O mesmo saldo aparece em Feed, Carteira e Perfil.
- O indicador global possui apenas o valor em uma linha, sem fundo ou borda.
- Depositar atualiza todas as telas sem recarregar.
- Reserva reduz o saldo e não permite valor superior ao disponível.
- Recarregar a página limpa o saldo enquanto não houver backend.

### Task HOTFIX-010 - Vincular bolsa de investimento ao perfil do atleta

Tipo: Produto/Frontend/Arquitetura

Objetivo: separar vídeo, perfil e bolsa, permitindo que o atleta abra uma captação vinculada ao próprio perfil e que outros usuários transfiram saldo simulado para ela.

Tasks:

- [x] Criar entidade `AthleteFund` separada de vídeo e avaliação esportiva.
- [x] Vincular vídeos aprovados ao usuário proprietario do perfil.
- [x] Criar bolsa demonstrativa para teste imediato no perfil de demonstração.
- [x] Exibir bolsa, meta, captado, restante e aporte mínimo no perfil público do atleta.
- [x] Transferir saldo simulado da carteira do investidor para a bolsa do perfil.
- [x] Bloquear aporte abaixo do mínimo, acima do restante ou sem saldo.
- [x] Fechar automaticamente a bolsa quando a meta for atingida.
- [x] Bloquear novos aportes depois da conclusao.
- [x] Não disponibilizar saque para o atleta.
- [x] Permitir que o atleta abra uma bolsa depois da aprovação do perfil público.
- [x] Criar formulário de abertura com meta e aporte mínimo.
- [x] Exibir progresso da bolsa no perfil privado do atleta.
- [x] Exibir aviso de investimento concluído e busca por contratantes.
- [x] Separar saldos e aportes por conta de usuário.
- [x] Tornar o identificador local da conta estável por papel e e-mail.
- [x] Remover projecoes de retorno e avancos manuais da carteira.
- [x] Atualizar README e plano de produto.

Criterios de aceite:

- O vídeo apresenta o talento, mas não armazena nem recebe o investimento.
- A transferência acontece somente dentro do perfil que possui bolsa aberta.
- O atleta visualiza a captação e não possui ação de saque.
- Atingir 100% muda a bolsa para `Concluída` automaticamente.
- O perfil do atleta concluído mostra que está em busca de contratantes.
- Toda operação permanece local, temporária e explicitamente simulada.

### Task HOTFIX-011 - Abrir perfil do atleta pelo feed

Tipo: Produto/Frontend/Arquitetura

Objetivo: transformar o nome exibido no feed em uma entrada clara para o perfil público, reunindo os vídeos e a bolsa do atleta em uma única identidade.

Tasks:

- [x] Criar `profileId` independente do identificador de cada vídeo.
- [x] Migrar `AthleteFund` e `Investment` para vinculo por `profileId`.
- [x] Adicionar ícone de perfil clicavel a esquerda do nome no feed mobile.
- [x] Manter o avatar do feed desktop clicavel e acessível.
- [x] Agrupar todos os vídeos aprovados publicados pela mesma conta.
- [x] Exibir galeria horizontal de vídeos no perfil público.
- [x] Permitir selecionar um vídeo da galeria para reproduzir no player principal.
- [x] Exibir a mesma bolsa em qualquer vídeo usado para acessar o perfil.
- [x] Atualizar README com o fluxo de navegação pelo perfil.

Criterios de aceite:

- Tocar no ícone ao lado do nome abre o perfil correto.
- O perfil lista todos os vídeos aprovados da mesma conta.
- Selecionar um item da galeria troca o vídeo principal.
- A bolsa pertence ao perfil e não é duplicada por vídeo.
- O status `Captando` ou `Concluída` permanece igual ao alternar vídeos.

### Task HOTFIX-012 - Centralizar layout mobile na web

Tipo: Frontend/UI

Objetivo: preservar a experiencia mobile do aplicativo quando a versão web for aberta em telas largas.

Tasks:

- [x] Limitar o container principal da web a `480px`.
- [x] Centralizar o aplicativo e diferenciar o fundo externo.
- [x] Forcar os componentes responsivos da web a usar o layout compacto.
- [x] Manter o comportamento responsivo nativo inalterado no Android e iOS.

Criterios de aceite:

- A versão web não estica o feed em monitores largos.
- Header, feed, envio, carteira e perfil usam a composição mobile na web.
- Android e iOS continuam usando os breakpoints por largura da tela.

### Task HOTFIX-013 - Mostrar valor e porcentagem da cota

Tipo: Produto/Frontend

Objetivo: deixar claro no histórico da Carteira quanto foi aportado e qual porcentagem da meta da bolsa foi adquirida.

Tasks:

- [x] Calcular a porcentagem da cota no momento do aporte.
- [x] Salvar `sharePercent` no registro de `Investment`.
- [x] Manter o valor do aporte formatado em reais.
- [x] Exibir `Cota X,XX%` abaixo do valor em reais.
- [x] Remover a repeticao do status `Confirmada` no lado direito.
- [x] Atualizar README com a informação exibida na Carteira.

Criterios de aceite:

- Cada aporte mostra seu valor em reais.
- A porcentagem exibida corresponde a `valor do aporte / meta total da bolsa`.
- O status `Confirmada` aparece apenas uma vez por aporte.
- Percentuais usam duas casas decimais e formato brasileiro.

### Task HOTFIX-014 - Mostrar bolsa na legenda expandida do feed

Tipo: Produto/Frontend

Objetivo: permitir que o usuário identifique a disponibilidade e o progresso da bolsa sem sair do feed.

Tasks:

- [x] Disponibilizar as bolsas dos perfis para o componente `FeedScreen`.
- [x] Vincular a bolsa ao vídeo por `profileId`.
- [x] Exibir o resumo abaixo das hashtags no estado expandido.
- [x] Mostrar valor captado e meta formatados em reais.
- [x] Criar barra de progresso baseada no valor real captado.
- [x] Diferenciar bolsas abertas e concluídas.
- [x] Exibir mensagem quando o perfil não possuir bolsa aberta.
- [x] Atualizar README com o novo fluxo do feed.

Criterios de aceite:

- O resumo aparece imediatamente abaixo de `#Novo #Video aprovado`.
- Uma bolsa aberta mostra captado, meta e barra proporcional.
- Uma bolsa concluída permanece visível com progresso completo.
- Perfil sem bolsa mostra `Este perfil não possui um investimento aberto.`.
- Nenhum valor financeiro e inventado para perfis sem bolsa.

### Task HOTFIX-015 - Reorganizar marca e volume do player

Tipo: Frontend/UI

Objetivo: simplificar o topo do feed e oferecer ajuste de volume compacto junto aos controles do vídeo.

Tasks:

- [x] Remover o texto `Radar` ao lado do símbolo da marca.
- [x] Manter o símbolo Xolot sobreposto ao vídeo.
- [x] Posicionar o botão de volume abaixo do botão de tela cheia.
- [x] Abrir uma barra vertical curta ao tocar no volume.
- [x] Permitir ajuste de `0%` a `100%` por toque e arraste.
- [x] Atualizar o ícone entre som ativo e mudo.
- [x] Adicionar ações de acessibilidade em passos de `10%`.
- [x] Atualizar README com o controle vertical de volume.

Criterios de aceite:

- O texto `Radar` não aparece mais no topo do feed.
- Tela cheia fica acima do controle de volume.
- Tocar no volume abre e fecha a barra vertical.
- Arrastar para cima aumenta o volume e arrastar para baixo diminui.
- Volume em `0%` deixa o vídeo mudo.

### Task HOTFIX-016 - Fixar marca e navegação do perfil público

Tipo: Frontend/UI/Navegação

Objetivo: manter os principais controles de orientação acessiveis durante a rolagem do feed e do perfil público.

Tasks:

- [x] Mover o símbolo Xolot para uma camada fixa do `FeedScreen`.
- [x] Remover a repeticao da marca dentro de cada item do feed.
- [x] Transformar o botão de voltar do perfil público em overlay fixo.
- [x] Reservar espaço no topo do conteúdo para o botão não cobrir informações.
- [x] Manter `BottomTabs` visível durante a visualização do perfil público.
- [x] Fechar o perfil ao selecionar uma aba do footer.
- [x] Atualizar README com a navegação persistente.

Criterios de aceite:

- A logo permanece na mesma posição ao trocar de vídeo no feed.
- O botão de voltar continua visível ao rolar o perfil público.
- O footer permanece visível e fora da área rolavel do perfil.
- Tocar em Feed, Envio, Carteira ou Perfil fecha o perfil público e abre a aba.
- Conteudo, botão fixo e footer não se sobrepoem de forma incoerente.

### Task HOTFIX-017 - Criar HUD horizontal no perfil público

Tipo: Frontend/UI

Objetivo: simplificar o topo fixo do perfil público e manter somente navegação de retorno e saldo disponível.

Tasks:

- [x] Substituir o botão flutuante isolado por uma barra horizontal.
- [x] Fixar a barra em `top: 0` e `width: 100%`.
- [x] Manter somente o ícone de voltar no lado esquerdo.
- [x] Exibir somente o valor do saldo disponível no lado direito.
- [x] Remover `Demonstração`, risco e status do HUD.
- [x] Reservar espaço superior no `ScrollView` para a barra fixa.
- [x] Atualizar README com o novo HUD.

Criterios de aceite:

- A barra ocupa toda a largura superior do perfil público.
- O HUD permanece fixo durante a rolagem.
- Apenas seta e saldo ficam visiveis na barra.
- O saldo usa uma linha, sem box ou badge.
- O conteúdo comeca abaixo da barra e não sofre sobreposição.

### Task HOTFIX-018 - Compactar HUD do perfil público

Tipo: Frontend/UI

Objetivo: reduzir o peso visual do HUD superior e padronizar seus controles em preto.

Tasks:

- [x] Reduzir a altura do HUD de `62px` para `52px`.
- [x] Reduzir o ícone de voltar de `25px` para `21px`.
- [x] Reduzir a área do botão para `40px`, preservando `hitSlop`.
- [x] Reduzir o saldo de `17px` para `15px`.
- [x] Aplicar `colors.text` no ícone e no valor do saldo.
- [x] Ajustar o espaço superior do conteúdo para a nova altura.
- [x] Atualizar README com o HUD compacto.

Criterios de aceite:

- HUD e ícone ocupam menos espaço no perfil público.
- Seta e saldo usam o preto padrão da interface.
- O saldo continua legivel em uma única linha.
- A seta permanece confortavel para toque no celular.
- O conteúdo não fica escondido sob a barra.

### Task HOTFIX-019 - Modularizar arquitetura do frontend

Tipo: Frontend/Arquitetura

Objetivo: reduzir o acoplamento do arquivo raiz e organizar o código por responsabilidade para facilitar manutenção, revisão e evolução do produto.

Tasks:

- [x] Reduzir o `App.tsx` de 6.834 para 231 linhas.
- [x] Separar as seis telas em `src/screens/`.
- [x] Extrair handlers de autenticação, carteira, bolsa, envio e moderação para `src/actions/createAppActions.ts`.
- [x] Extrair formatadores e builders compartilhados para `src/actions/appActions.ts`.
- [x] Extrair navegação, shell, splash e componentes compartilhados para `src/components/`.
- [x] Mover o `StyleSheet` para `src/styles/appStyles.ts`.
- [x] Extrair constantes de assets e layout para `src/constants/`.
- [x] Remover o componente morto `PlayerCard`.
- [x] Atualizar `backlog.md`, `TechnicalDebt.md` e `README.md`.
- [x] Validar a nova estrutura com TypeScript.

Criterios de aceite:

- `App.tsx` fica responsável principalmente por estado global simples e roteamento local.
- Cada tela principal possui um modulo próprio.
- Acoes de produto não ficam declaradas no componente raiz.
- O layout e os fluxos existentes continuam com as mesmas props e regras.
- As subdivisões restantes ficam identificadas no backlog, sem serem marcadas como concluídas.

### Task HOTFIX-020 - Reorganizar navegação principal e menu do Perfil

Tipo: Frontend/UI/Navegação

Objetivo: aproximar a navegação do foco social em vídeos, retirar a Carteira do footer e centralizar opções de conta no Perfil.

Tasks:

- [x] Renomear a aba visível `Feed` para `Início`.
- [x] Remover `Carteira` da navegação inferior.
- [x] Adicionar a aba `Pesquisar` com busca por nome, posição, cidade ou clube.
- [x] Abrir o perfil público a partir de um resultado de pesquisa.
- [x] Adicionar a aba `Mensagens` com estado vazio sem dados inventados.
- [x] Criar menu de três barras no Perfil.
- [x] Adicionar `Configurações`, `Carteira` e `Sair da conta` ao menu.
- [x] Reutilizar saldo, depósito e histórico da Carteira dentro do Perfil.
- [x] Criar subárea de Configurações com preferências de notificação e reprodução automática.
- [x] Ajustar o footer para cinco itens em telas mobile.
- [x] Atualizar textos, acessibilidade, README e backlog.
- [x] Validar os fluxos no viewport mobile de `390x844`.

Criterios de aceite:

- Footer do Usuário exibe Início, Envio, Pesquisar, Mensagens e Perfil.
- Os cinco rotulos cabem no celular sem sobreposição.
- Carteira não aparece como aba principal.
- Menu do Perfil abre como HUD e permite acessar Configurações, Carteira e Sair.
- Pesquisa usa somente perfis disponíveis no estado atual.
- Mensagens não exibe conversas fake.
- Saldo, depósito e investimentos continuam usando o mesmo estado compartilhado.

### Task HOTFIX-021 - Transformar Perfil em vitrine de vídeos

Tipo: Frontend/UI/Perfil

Objetivo: separar conteúdo público de configurações da conta e priorizar os vídeos publicados pelo usuário.

Tasks:

- [x] Remover Verificação e Conta Xolot da tela principal do Perfil.
- [x] Mover email, identidade, termos e status KYC para Configurações.
- [x] Mover reservas, total investido, quantidade de envios e moderação para Configurações.
- [x] Mover abertura, progresso e conclusão da bolsa de investimento para Configurações.
- [x] Mover o aviso de ambiente demonstrativo para Configurações.
- [x] Criar galeria em três colunas com vídeos aprovados da própria conta.
- [x] Abrir o vídeo selecionado em um modal com controles de reprodução.
- [x] Exibir `Poste um vídeo para mostra-lo aqui` quando não houver publicações.
- [x] Atualizar as estatisticas do Perfil para envios, aprovados e publicados.
- [x] Atualizar backlog e README.

Criterios de aceite:

- Perfil principal não exibe KYC, termos, reservas ou bolsa.
- Configurações reune dados operacionais e financeiros da conta.
- Somente vídeos aprovados e com arquivo válido aparecem na galeria.
- Nova conta recebe uma orientação clara para publicar o primeiro vídeo.
- Tocar em um item da galeria abre o vídeo com controles.
- A gestão da bolsa continua usando o mesmo estado e modal existentes.

### Task HOTFIX-022 - Pesquisar contas cadastradas e fechar menu por toda a tela

Tipo: Frontend/UI/Pesquisa

Objetivo: tornar contas da sessão pesquisaveis antes da primeira publicação e corrigir a área externa de fechamento do menu do Perfil.

Tasks:

- [x] Registrar contas de Usuário autenticadas no diretório local da sessão.
- [x] Unificar contas cadastradas e perfis com vídeo nos resultados de pesquisa.
- [x] Evitar duplicidade quando a conta cadastrada já possui perfil com vídeo aprovado.
- [x] Manter email e dados privados fora do resultado público.
- [x] Criar perfil público vazio para contas sem vídeo aprovado.
- [x] Manter HUD de voltar, saldo e footer ao abrir esse perfil.
- [x] Fazer a camada do menu ignorar toques fora do painel.
- [x] Fechar o menu ao tocar acima, abaixo, a esquerda ou a direita do HUD.
- [x] Atualizar README e backlog.

Criterios de aceite:

- Uma conta criada aparece na pesquisa pelo nome mesmo sem ter enviado vídeo.
- Perfis com vídeo continuam abrindo a ficha completa existente.
- Perfis sem vídeo mostram um estado vazio sem inventar dados esportivos.
- O menu de três barras fecha ao tocar em qualquer regiao externa ao painel.
- Os botoes dentro do menu continuam funcionando normalmente.

### Task HOTFIX-023 - Unificar perfil público, reels e página de investimento

Tipo: Frontend/UI/Perfil/Investimento

Objetivo: transformar o perfil visitado em uma vitrine consistente com o perfil da conta, manter a reprodução concentrada no Início e separar o aporte em uma página transacional.

Tasks:

- [x] Criar `ProfileVideoGallery` reutilizável para perfil próprio e visitado.
- [x] Aplicar avatar, identidade, estatisticas e galeria no mesmo modelo visual dos dois perfis.
- [x] Remover o player grande do perfil público.
- [x] Remover o modal de pré-visualização do perfil próprio.
- [x] Abrir o reel correspondente ao tocar em um vídeo da galeria.
- [x] Permitir que o feed inicie diretamente no vídeo selecionado.
- [x] Adicionar ícone de investimento ao perfil próprio e ao perfil visitado.
- [x] Criar `InvestmentScreen.tsx` com meta, captado, restante, aporte mínimo, saldo e valor.
- [x] Levar o botão `Investir` para a página dedicada de investimento.
- [x] Desabilitar ícone e botão quando não houver bolsa em captação.
- [x] Manter HUD de voltar, saldo e footer nas páginas públicas e de investimento.
- [x] Atualizar README e backlog.

Criterios de aceite:

- Perfil visitado tem a mesma linguagem visual do Perfil da conta.
- Nenhum vídeo e reproduzido dentro da página de perfil.
- Tocar em uma miniatura abre o vídeo correto no Início.
- Perfil com bolsa aberta permite acessar a página de investimento.
- Perfil sem bolsa aberta mostra `Bolsa indisponível` em estado desabilitado.
- Confirmação do aporte continua usando saldo, bolsa e histórico compartilhados.

### Task HOTFIX-024 - Retorno contextual do reel e marca padronizada

Tipo: Frontend/UI/Navegação

Objetivo: simplificar as ações do Perfil próprio e permitir que o usuário retorne ao perfil de origem depois de abrir um vídeo no Início.

Tasks:

- [x] Remover o ícone financeiro ao lado do menu de três barras no Perfil próprio.
- [x] Manter investimento acessível por Configurações no Perfil próprio.
- [x] Registrar se o reel foi aberto pelo Perfil próprio ou por um perfil visitado.
- [x] Criar seta contextual de retorno no canto superior esquerdo do Início.
- [x] Retornar ao Perfil próprio quando o vídeo sair da galeria da conta.
- [x] Retornar ao perfil visitado correto quando o vídeo sair da galeria pública.
- [x] Limpar o retorno contextual ao selecionar uma aba do footer.
- [x] Posicionar seta e logo em uma linha sem sobreposição.
- [x] Aumentar a logo do Início de `25x25` para o padrão compacto `48x38`.
- [x] Atualizar README e backlog.

Criterios de aceite:

- Perfil próprio possui somente o menu de três barras como ação no topo.
- Reel aberto normalmente não exibe seta de retorno ao perfil.
- Reel aberto por uma galeria exibe a seta no canto superior esquerdo.
- A seta restaura exatamente o perfil que originou a navegação.
- Logo e seta permanecem integralmente visiveis e não se sobrepoem.
- A marca do Início possui o mesmo tamanho usado no header compacto.

### Task HOTFIX-025 - Mensagens pelo perfil e HUD com marca

Tipo: Frontend/UI/Navegação

Objetivo: transformar a ação secundária do perfil público em contato direto e padronizar a marca nas páginas contextuais.

Tasks:

- [x] Substituir o ícone financeiro superior do perfil público por mensagem.
- [x] Manter o botão principal de investimento como única entrada da bolsa.
- [x] Abrir a conversa com o perfil visitado já selecionado.
- [x] Criar lista de conversas, thread, composer e envio local.
- [x] Manter o histórico de mensagens durante a sessão atual.
- [x] Limpar mensagens locais ao sair da conta.
- [x] Criar HUD compartilhado com seta, logo compacta e saldo.
- [x] Reutilizar o HUD no perfil público e na página de investimento.
- [x] Atualizar README e backlog técnico.

Criterios de aceite:

- O ícone pequeno do perfil abre Mensagens e não duplica o investimento.
- A conversa aberta corresponde ao perfil visitado.
- Uma mensagem enviada aparece imediatamente no histórico local.
- A marca ocupa a mesma posição e dimensão nas páginas contextuais.
- Seta, logo e saldo permanecem fixos e sem sobreposição.

### Task HOTFIX-026 - Fechar página da bolsa pelo card do perfil

Tipo: Frontend/UI/Navegação

Objetivo: deixar o retorno ao perfil imediatamente visível dentro da página de investimento.

Tasks:

- [x] Remover o ícone financeiro sem ação do card superior.
- [x] Adicionar botão `X` no canto superior direito do card.
- [x] Reutilizar a mesma ação de retorno do HUD fixo.
- [x] Manter ícone preto e área de toque de `40px`.
- [x] Atualizar README e backlog técnico.

Criterios de aceite:

- Tocar no `X` fecha a página da bolsa.
- O usuário retorna ao mesmo perfil visitado.
- O botão permanece visível sem competir com os dados financeiros.

### Task HOTFIX-027 - Padronizar transições das novas páginas

Tipo: Frontend/UI/Navegação

Objetivo: aplicar a mesma animação suave de entrada em todas as páginas adicionadas recentemente.

Tasks:

- [x] Reiniciar a transição ao abrir um perfil público.
- [x] Reiniciar a transição ao abrir ou fechar a página de investimento.
- [x] Animar Pesquisa, Envio, Admin e a lista de Mensagens por rota.
- [x] Animar a abertura e o retorno de uma conversa.
- [x] Animar Perfil, Configurações e Carteira sem mover header e footer.
- [x] Reutilizar `ScreenTransition` sem criar estilos de movimento paralelos.
- [x] Atualizar README e backlog técnico.

Criterios de aceite:

- Todas as novas páginas entram com fade e deslocamento vertical suave.
- Trocas entre perfil e investimento reiniciam a animação.
- Trocas entre lista e conversa reiniciam a animação.
- Header e footer permanecem fixos durante a transição.
- Configurações e Carteira seguem o mesmo comportamento visual do restante do app.

### Task HOTFIX-028 - Exibir transições do Perfil e animar Ver mais

Tipo: Frontend/UI/Animação

Objetivo: tornar perceptíveis as transições de Configurações e Carteira e suavizar a expansão da descrição do feed.

Tasks:

- [x] Aguardar o fechamento do menu antes de abrir Configurações.
- [x] Aguardar o fechamento do menu antes de abrir Carteira.
- [x] Preservar a transição padrão de entrada nas duas subpáginas.
- [x] Animar altura e espaçamento da descrição expandida.
- [x] Aplicar fade e deslocamento vertical ao conteúdo de `Ver mais`.
- [x] Animar o recolhimento antes de restaurar a legenda compacta.
- [x] Reiniciar a legenda ao trocar de vídeo.
- [x] Atualizar README e backlog técnico.

Criterios de aceite:

- A animação de Configurações fica visível depois que o menu fecha.
- A animação da Carteira fica visível depois que o menu fecha.
- `mais` expande a descrição sem aparecimento brusco.
- `menos` recolhe a descrição antes de voltar ao estado compacto.
- A animação não altera a posição do footer nem dos controles do vídeo.

### Task FEATURE-029 - Follow e solicitações de mensagem

Tipo: Frontend/Dados/Produto

Objetivo: criar uma relação social persistente entre perfis e usa-la para organizar o Início e proteger mensagens diretas.

Tasks:

- [x] Persistir perfis seguidos por conta com AsyncStorage.
- [x] Adicionar `Seguir` e `Seguindo` no Início.
- [x] Reutilizar o mesmo estado no perfil público.
- [x] Exibir métricas de seguidores e seguindo.
- [x] Priorizar vídeos dos perfis seguidos no Início.
- [x] Separar Mensagens entre Conversas e Solicitações.
- [x] Permitir uma única mensagem inicial para perfil não seguido.
- [x] Ocultar mensagens recebidas até o destinatário seguir o remetente.
- [x] Liberar e mover a conversa automaticamente depois do follow.
- [x] Isolar regras sociais em actions e services próprios.
- [x] Atualizar README e backlog técnico.

Criterios de aceite:

- Feed e perfil exibem o mesmo estado de follow.
- O follow permanece salvo depois de reiniciar o app.
- Perfis seguidos ficam na área Conversas.
- Perfis não seguidos ficam na área Solicitações.
- A thread recebida permanece protegida até o follow.
- Seguir pela conversa libera imediatamente mensagens e composer.

### Task FEATURE-030 - Foto de perfil e investimento direto pelo Início

Tipo: Frontend/Dados/Navegação

Objetivo: aplicar uma identidade visual consistente aos perfis e encurtar o acesso a bolsa exibida no reel.

Tasks:

- [x] Criar persistência local de fotos por `profileId`.
- [x] Adicionar escolha, troca e remoção de foto em Configurações.
- [x] Exibir a foto no Início, Perfil, Pesquisa, Mensagens e investimento.
- [x] Preservar iniciais como fallback sem foto cadastrada.
- [x] Tornar o nome do autor clicavel no Início.
- [x] Substituir `Ver perfil` por `Investir` na descrição expandida.
- [x] Abrir diretamente a bolsa vinculada ao vídeo atual.
- [x] Bloquear o CTA quando a bolsa não estiver em captação.
- [x] Atualizar README e backlog técnico.

Criterios de aceite:

- A mesma foto aparece em todas as telas vinculadas ao perfil.
- A foto permanece salva no mesmo dispositivo depois de reiniciar o app.
- Avatar e nome abrem o perfil correto.
- `Investir` nunca abre uma bolsa diferente da vinculada ao reel.
- A ausência de bolsa mantém o investimento indisponível.

### Task FEATURE-031 - Repository local e persistência do estado principal

Tipo: Frontend/Arquitetura/Dados

Objetivo: permitir testes continuos sem perder contas, postagens e operações simuladas ao recarregar o aplicativo.

Tasks:

- [x] Criar schema local com versão explícita.
- [x] Criar migração defensiva para dados antigos ou incompletos.
- [x] Criar repository sobre `AsyncStorage`.
- [x] Extrair hidratação e setters persistentes para hook próprio.
- [x] Persistir usuários cadastrados e sessão ativa.
- [x] Persistir envios e decisões de moderação.
- [x] Persistir saldos, bolsas e investimentos.
- [x] Restaurar a rota Admin para sessão administrativa.
- [x] Preservar nome e dados da conta ao entrar novamente.
- [x] Adicionar quatro testes automatizados do repository.
- [x] Executar os testes no workflow de deploy.
- [x] Corrigir encoding e status do `TechnicalDebt.md`.
- [x] Atualizar README e backlog técnico.

Criterios de aceite:

- Recarregar o app não apaga o estado principal.
- Dados inválidos usam fallback seguro sem impedir a abertura.
- Estado antigo sem versão e migrado para a versão atual.
- Sair da conta limpa apenas a sessão ativa e preserva os dados cadastrados.
- O CI bloqueia o deploy quando os testes do repository falham.
- Video local continua identificado como temporário até existir upload remoto.

### Task FEATURE-032 - HUD de enquadramento da foto de perfil

Tipo: Frontend/Dados/UX

Objetivo: permitir que o usuário controle qual área da foto aparece nos avatares circulares do aplicativo.

Tasks:

- [x] Transformar o avatar persistido em dado estruturado com URI, foco e dimensões.
- [x] Migrar automaticamente o formato antigo salvo apenas como URI.
- [x] Criar componente compartilhado para renderizar o enquadramento.
- [x] Abrir a HUD ao tocar na foto do perfil ou na previa de Configurações.
- [x] Disponibilizar ponto focal arrastável com previa imediata.
- [x] Abrir a HUD logo depois de escolher uma nova foto.
- [x] Aplicar o enquadramento no Início, Perfil, Pesquisa, Mensagens e investimento.
- [x] Adicionar testes de migração, normalização e serialização.
- [x] Atualizar README e backlog técnico.

Criterios de aceite:

- Tocar na foto própria abre a HUD sem navegar para outra página.
- Cancelar preserva o enquadramento anterior.
- Salvar atualiza imediatamente todas as ocorrencias do avatar.
- O ponto focal permanece salvo depois de recarregar o aplicativo.
- Fotos do formato antigo continuam visiveis com foco central.

### Task FEATURE-033 - Ponto focal arrastável

Tipo: Frontend/UX

Objetivo: dar controle continuo sobre o enquadramento da foto de perfil.

Tasks:

- [x] Substituir as nove posicoes fixas por coordenadas continuas.
- [x] Permitir mover o foco tocando ou arrastando sobre a previa.
- [x] Limitar o marcador aos limites circulares da foto.
- [x] Atualizar a foto em tempo real durante o gesto.
- [x] Manter as coordenadas compativeis com a persistência existente.
- [x] Atualizar README, backlog e release notes.

Criterios de aceite:

- O marcador acompanha o dedo durante todo o gesto.
- Tocar em uma área da foto move imediatamente o ponto focal.
- O marcador não sai da área circular da previa.
- Cancelar não altera o enquadramento salvo.
- Salvar mantém a posição escolhida depois de recarregar o app.

### Task FEATURE-034 - Recorte circular sobre a foto completa

Tipo: Frontend/UX/Produto

Objetivo: tornar o enquadramento previsível sem esconder partes da foto durante a edição.

Tasks:

- [x] Exibir a imagem completa com `contain`, sem recorte prévio.
- [x] Substituir o marcador pelo círculo que representa o avatar final.
- [x] Permitir arrastar o círculo sobre toda a área valida da imagem.
- [x] Escurecer somente a regiao externa ao recorte circular.
- [x] Usar a mesma escala na HUD e no avatar publicado.
- [x] Remover a ação de excluir foto e manter apenas `Trocar foto`.
- [x] Adicionar testes da geometria, limites e correspondencia do recorte.
- [x] Atualizar README, backlog e release notes.

Criterios de aceite:

- A foto inteira permanece visível enquanto o usuário énquadra.
- A área dentro do círculo permanece nitida e representa o avatar final.
- O círculo nunca ultrapassa os limites reais da imagem.
- Salvar mantém o mesmo enquadramento nas demais telas.
- Configurações não exibe mais a opção `Remover`.

### Task FEATURE-035 - Tamanho variavel do recorte circular

Tipo: Frontend/UX/Dados

Objetivo: permitir composicoes mais abertas ou fechadas sem trocar a foto escolhida.

Tasks:

- [x] Adicionar `cropScale` ao avatar persistido.
- [x] Migrar fotos antigas para o tamanho visual anterior.
- [x] Limitar o recorte ao intervalo de 30% a 100%.
- [x] Fazer o limite de 100% tocar o menor lado da imagem.
- [x] Criar slider arrastável com métrica percentual.
- [x] Adicionar botoes de diminuir e aumentar em passos de 5%.
- [x] Aplicar o tamanho salvo em todas as ocorrencias do avatar.
- [x] Cobrir limites, slider, geometria e migração com testes.
- [x] Atualizar README, backlog e release notes.

Criterios de aceite:

- O usuário consegue ajustar continuamente o tamanho do círculo.
- O indicador mostra valores entre 30% e 100%.
- O círculo nunca fica menor que 30% nem ultrapassa a imagem.
- O avatar publicado corresponde a posição e ao tamanho da HUD.
- Recarregar o aplicativo preserva ambos os ajustes.

### Task FEATURE-036 - Login com senha e perfil do atleta

Tipo: Frontend/Dados/Autenticação

Objetivo: tornar o acesso coerente com uma conta real e separar credenciais dos dados públicos do atleta.

Tasks:

- [x] Substituir nome e email por email e senha no cadastro e login.
- [x] Adicionar confirmação e validação de senha no cadastro.
- [x] Persistir somente salt e hash SHA-256 da senha local.
- [x] Migrar o schema do estado principal para a versão 2.
- [x] Permitir que contas antigas definam senha no próximo login.
- [x] Criar tela obrigatória de configuração no primeiro acesso.
- [x] Coletar nome, biografia, idade, posição, cidade e clube ou projeto.
- [x] Reutilizar o formulário em `Configurações > Editar perfil`.
- [x] Exibir biografia e clube nos perfis próprio e público.
- [x] Atualizar resultados da pesquisa com os dados do perfil.
- [x] Adicionar teste de migração, preservação das credenciais e ausência de senha em texto puro.
- [x] Validar cadastro, primeiro acesso, perfil e edição em viewport mobile.
- [x] Atualizar README, backlog e dívida técnica.

Criterios de aceite:

- Usuário novo informa apenas credenciais no cadastro e completa seus dados depois de entrar.
- Perfil incompleto bloqueia o acesso as abas até ser salvo.
- Dados salvos reaparecem preenchidos em Editar perfil.
- Biografia e clube aparecem na vitrine do usuário.
- Senha em texto puro não é persistida no estado local.

### Task FEATURE-037 - Envio vinculado ao perfil do atleta

Tipo: Frontend/Dados/UX

Objetivo: eliminar o preenchimento duplicado de dados pessoais em cada novo vídeo.

Tasks:

- [x] Remover a secao `Dados do atleta` da tela de envio.
- [x] Usar nome, idade, posição, cidade e clube do perfil ativo.
- [x] Preservar a validação de idade minima e consentimento do responsável.
- [x] Manter no formulário apenas os dados relacionados ao vídeo.
- [x] Manter a biografia exclusivamente nos perfis próprio e público.
- [x] Atualizar README e backlog técnico.

Criterios de aceite:

- Usuário não redigita dados pessoais ao publicar outro vídeo.
- Moderação recebe os dados do perfil vinculados ao envio.
- A postagem não recebe nem exibe a biografia do atleta.
- Alterar o perfil atualiza a fonte usada nos próximos envios.

### Task FIX-038 - Reproducao exclusiva e persistência local de vídeo

Tipo: Frontend/Dados/Correcao

Objetivo: impedir reprodução simultanea no Início e preservar arquivos escolhidos depois de recarregar o navegador.

Tasks:

- [x] Atualizar o item ativo continuamente durante a rolagem do feed.
- [x] Pausar o player anterior e fechar seu controle de volume.
- [x] Persistir arquivos locais do navegador em um object store do IndexedDB.
- [x] Salvar referências `nextstar-video:` no estado principal.
- [x] Resolver as referências persistentes em Feed, Perfil, Admin e pre-visualizações.
- [x] Revogar URLs de objeto quando o player deixa a tela.
- [x] Tratar URLs `blob:` antigas como indisponíveis e orientar o reenvio.
- [x] Cobrir a referência persistente e a deteccao de URLs temporárias com testes.
- [x] Atualizar README e backlog técnico.

Criterios de aceite:

- Apenas o vídeo mais visível pode permanecer em reprodução.
- O vídeo anterior pausa ainda durante a troca de item.
- Novo vídeo selecionado continua disponível após atualizar a página no mesmo navegador.
- Video temporário antigo não fica apenas preto: a interface solicita o reenvio.
- Upload definitivo entre dispositivos continua registrado em `P0-004` como dependência de backend/storage.

### Task FIX-039 - Identidade única e conversa com a própria conta

Tipo: Frontend/Dados/Correcao

Objetivo: separar nome público de username, impedir contas duplicadas e remover a regra de follow ao enviar mensagens para si mesmo.

Tasks:

- [x] Adicionar `username` ao modelo de conta e elevar o schema local para a versão 3.
- [x] Migrar contas antigas para usernames válidos e únicos.
- [x] Coletar nome do jogador e username durante o cadastro.
- [x] Bloquear email e username já cadastrados sem impedir nomes públicos iguais.
- [x] Exibir username no cabeçalho, Início, perfil próprio, perfil público e mensagens.
- [x] Pesquisar perfis por nome ou username.
- [x] Tratar a própria conta como conversa liberada, sem follow ou solicitação.
- [x] Cobrir username, conflitos de identidade, migração e acesso social com testes.
- [x] Atualizar README e backlog técnico.

Criterios de aceite:

- Duas pessoas podem usar o mesmo nome público.
- Email e username não podem ser reutilizados por outra conta no mesmo estado local.
- Username e comparado sem diferença entre letras maiúsculas e minúsculas.
- Pesquisa por `Pedro Barberini` e por `@pedrobarberini` encontra o perfil correspondente.
- Mensagem para a própria conta abre o compositor normalmente e nunca solicita follow.

### Task FIX-040 - Publicação direta e texto único

Tipo: Frontend/Dados/UX

Objetivo: retirar a fila manual durante os testes e simplificar o conteúdo da postagem.

Tasks:

- [x] Publicar novos vídeos diretamente com status interno aprovado.
- [x] Adicionar data de publicação no momento do envio.
- [x] Migrar envios antigos em revisão para publicações visiveis.
- [x] Remover o campo `Objetivo do aporte` do formulário e do modelo do feed.
- [x] Renomear `Principal destaque` para `Texto da publicação`.
- [x] Atualizar botão, toast, status, perfil e textos auxiliares.
- [x] Manter a estrutura administrativa reservada para a futura moderação automática.
- [x] Cobrir status direto e migração de pendências com testes.
- [x] Atualizar README e backlog técnico.

Criterios de aceite:

- O usuário pública sem abrir ou aguardar a tela Admin.
- O vídeo aparece imediatamente no Início e na galeria do perfil.
- A interface mostra apenas título e texto da publicação, sem objetivo de aporte.
- Pendencias locais anteriores deixam de depender de aprovação manual.

### Task FIX-041 - Exclusão de vídeo pelo dono

Tipo: Frontend/Dados/UX

Objetivo: permitir que o usuário remova uma publicação que não desejá mais exibir.

Tasks:

- [x] Adicionar botão de lixeira somente na galeria do próprio perfil.
- [x] Exibir confirmação antes de concluir a exclusão.
- [x] Remover a publicação do Início e da galeria imediatamente.
- [x] Excluir do IndexedDB a copia local do vídeo no navegador.
- [x] Validar o ID do dono antes de alterar a lista persistida.
- [x] Manter vídeos de outros usuários protegidos contra exclusão.
- [x] Cobrir propriedade e exclusão com testes automatizados.
- [x] Atualizar README e backlog técnico.

Criterios de aceite:

- A lixeira aparece apenas para vídeos da conta conectada.
- Cancelar o modal mantém o vídeo publicado.
- Confirmar remove o vídeo do Perfil e do Início sem recarregar.
- Uma conta não consegue excluir o vídeo de outra.

### Task FIX-042 - Username como identidade principal

Tipo: Frontend/UX

Objetivo: priorizar a identidade única da plataforma nas telas de perfil.

Tasks:

- [x] Exibir `@username` como título do próprio perfil.
- [x] Manter o nome público logo abaixo como informação secundária.
- [x] Aplicar a mesma hierarquia no perfil visitado e na página de investimento.
- [x] Exibir `@username` em destaque no Início e mover o nome para a linha de posição e cidade.
- [x] Preservar o nome público como fallback para perfis antigos sem username.
- [x] Atualizar README e backlog técnico.

Criterios de aceite:

- O username aparece antes e com maior destaque que o nome público.
- No Início, a linha secundária mostra `Nome | Posicao | Cidade`.
- O nome do jogador continua visível no cabeçalho do perfil.
- Usernames longos permanecem em uma única linha sem sobrepor os controles.

### Task FIX-043 - Login principal e perfil após cadastro

Tipo: Frontend/Dados/UX

Objetivo: reduzir o formulário de cadastro e concluir a identidade pública em uma etapa separada.

Tasks:

- [x] Abrir a autenticação sempre no modo Login.
- [x] Trocar o acesso ao cadastro por uma ação clara `Cadastrar`.
- [x] Remover nome, username e tipo de conta da tela de cadastro.
- [x] Criar novas contas Usuário usando somente email, senha e aceite dos termos.
- [x] Adicionar comandos com ícones para entrar, cadastrar e preparar login com Google.
- [x] Informar que a autenticação Google ainda depende de integração futura.
- [x] Mover nome e username para a configuração do perfil.
- [x] Validar formato e unicidade do username antes de concluir o perfil.
- [x] Exibir a configuração obrigatória em modal após o cadastro.
- [x] Reutilizar os mesmos campos em `Configurações > Editar perfil`.
- [x] Atualizar README e backlog técnico.

Criterios de aceite:

- Usuário sem sessão visualiza primeiro o formulário de login.
- Cadastro não solicita nome, username ou seleção entre Usuário e Admin.
- Conta nova abre o modal de perfil antes de acessar o Início.
- Username duplicado impede a conclusão do perfil.
- Fechar e reabrir o editor mantém os dados persistidos da conta.

### Task IMPROV-001 - Seletores puros do App

Tipo: Refactor/Arquitetura

Objetivo: reduzir a responsabilidade do `App.tsx` movendo dados derivados para seletores puros e testáveis.

Tasks:

- [x] Criar `src/app/appSelectors.ts`.
- [x] Mover seleção de vídeos aprovados, players disponíveis e ordenação do feed.
- [x] Mover seleção de perfil público, vídeos do perfil, fundos e investimentos.
- [x] Mover contagem de pendências, submissões do usuário e lookup de player por dono/submissão.
- [x] Cobrir seletores com testes automatizados.
- [x] Atualizar `TechnicalDebt.md`.

Criterios de aceite:

- `App.tsx` não faz mais derivações com `filter`, `find`, `sort` ou `map` diretamente.
- Seletores preservam a regra do demo player, prioridade de perfis seguidos e dados do perfil completo.
- Typecheck e testes automatizados passam com Node 22.

### Task IMPROV-002 - Hook de navegação local do App

Tipo: Refactor/Arquitetura

Objetivo: reduzir a responsabilidade do `App.tsx` centralizando estado e handlers de navegação local.

Tasks:

- [x] Criar `src/app/useAppNavigation.ts`.
- [x] Mover estado de aba, perfil selecionado, investimento, foco do feed, retorno do reel e conversa ativa.
- [x] Mover handlers de troca de aba, abertura de reel, retorno ao perfil, abertura de investimento e abertura de contato de mensagem.
- [x] Preservar setters usados por `createAppActions` durante a transição incremental.
- [x] Atualizar `TechnicalDebt.md`.

Criterios de aceite:

- `App.tsx` não declara mais estados locais de navegação com `useState`.
- Trocar de aba continua limpando perfil, investimento e retorno de reel.
- Abrir vídeo pelo perfil continua preservando o retorno correto.
- Typecheck e testes automatizados passam com Node 22.

### Task IMPROV-003 - Shells de entrada e boot do App

Tipo: Refactor/Arquitetura

Objetivo: reduzir duplicação no `App.tsx` extraindo shells de loading, login, setup obrigatório e inicialização do Expo.

Tasks:

- [x] Criar `src/app/AppEntryShells.tsx`.
- [x] Extrair `LoadingAppShell`, `LoggedOutAppShell`, `AccountSetupGate` e `BrandLaunchOverlay`.
- [x] Criar `src/app/useExpoBoot.ts`.
- [x] Mover `SplashScreen.preventAutoHideAsync`, `SystemUI.setBackgroundColorAsync` e `SplashScreen.hideAsync`.
- [x] Atualizar `TechnicalDebt.md`.

Criterios de aceite:

- Loading, login e setup obrigatório não repetem mais o mesmo shell no `App.tsx`.
- O overlay de brand launch continua disponível nos estados de entrada e no app autenticado.
- Typecheck e testes automatizados passam com Node 22.

### Task IMPROV-004 - Rotas autenticadas do App

Tipo: Refactor/Arquitetura

Objetivo: reduzir o JSX do `App.tsx` movendo a montagem das telas autenticadas para um roteador local dedicado.

Tasks:

- [x] Criar `src/app/AppRoutes.tsx`.
- [x] Mover renderização de investimento, perfil público, feed, pesquisa, mensagens, envio, admin e perfil próprio.
- [x] Manter `App.tsx` responsável por hooks globais, actions e gatés de entrada.
- [x] Atualizar `TechnicalDebt.md`.

Criterios de aceite:

- `App.tsx` não contem mais o bloco condicional das telas autenticadas.
- O comportamento de tabs, perfil público, investimento e retorno ao reel permanece centralizado em `useAppNavigation`.
- Typecheck e testes automatizados passam com Node 22.

### Task IMPROV-005 - Divisão inicial dos estilos do App

Tipo: Refactor/Arquitetura

Objetivo: reduzir o tamanho fisico de `src/styles/appStyles.ts` sem quebrar os imports atuais de `styles`.

Tasks:

- [x] Transformar `src/styles/appStyles.ts` em agregador.
- [x] Separar estilos em módulos por domínio dentro de `src/styles/app/`.
- [x] Preservar a API pública `styles` para manter as telas atuais estáveis.
- [x] Atualizar `TechnicalDebt.md` com a divida residual de estilos colocalizados.

Criterios de aceite:

- `src/styles/appStyles.ts` continua exportando `styles`.
- Os módulos de estilo preservam literais de React Native para manter o typecheck estável.
- Typecheck e testes automatizados passam com Node 22.

### Task FEATURE-044 - Lista paginada de seguidores e seguindo

Tipo: Frontend/Dados/UX

Objetivo: permitir consultar quem segue o perfil e quais perfis a conta segue sem sair da tela atual.

Tasks:

- [x] Derivar IDs de seguidores da relação de follow persistida.
- [x] Transformar a métrica de seguidores em ação acessível no Perfil.
- [x] Resolver perfis seguidos por ID e transformar a métrica de seguindo em ação acessível.
- [x] Criar `ProfileListModal` reutilizável, com paginação incremental e fallback de carregamento estável.
- [x] Criar `ProfileListItem` reutilizável com avatar, username, nome e dados públicos.
- [x] Preservar estado vazio e fallback por iniciais para avatares ausentes.
- [x] Cobrir derivação social e seleção de perfis com testes automatizados.

Criterios de aceite:

- As contagens e listas de seguidores/seguindo usam a mesma fonte de dados social.
- A lista abre como popup, sem alterar a rota do Perfil.
- A primeira página exibe no máximo oito perfis e novas páginas são carregadas por comando explícito.
- Typecheck e testes automatizados passam com Node 22.
