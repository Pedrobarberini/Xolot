# Fila de refatoração

27 concluídas; 65 pendentes de 92 tarefas.

As fichas concluídas foram removidas a pedido do proprietário. As provas e os contratos de dependência ficam no [controle de progresso](../estado.json). Execute uma tarefa liberada por vez e continue enquanto houver trabalho autorizado com pré-requisitos satisfeitos.

## Pendentes

| Ordem | Tarefa | Dependências | Estado |
|---:|---|---|---|
| 1 | [P03 — Aplicar o logo e a paleta Folko fornecidos pelo proprietário](P03.md) | P02 | em_revisao |
| 2 | [P04 — Versionar contratos do feed de texto, fotos e vídeos](P04.md) | P01, C02, D02, D03 | planejada |
| 3 | [P05 — Publicar texto por comando autenticado e idempotente](P05.md) | P04, B03, G01 | planejada |
| 4 | [P06 — Renderizar texto no feed, perfil e detalhes sem quebrar mídia](P06.md) | P05, U02, Q02 | planejada |
| 5 | [P07 — Adicionar texto ao compositor existente de fotos e vídeos](P07.md) | P05, P06, U06 | planejada |
| 6 | [P08 — Generalizar descoberta e exemplos sem remover interesses existentes](P08.md) | P01, Q03, Q08 | planejada |
| 7 | [P09 — Validar a experiência Folko e as funcionalidades preservadas](P09.md) | P01, P02, P03, P07, P08, N05, O02 | planejada |
| 8 | [B05 — Extrair avatar e enquadramento em módulo próprio](B05.md) | B02, B03, C07, P01 | planejada |
| 9 | [B07 — Definir comandos protegidos de follow e comentário](B07.md) | B03, D02, F04, P01 | planejada |
| 10 | [B08 — Extrair o envio e recibos de mensagens existentes](B08.md) | B02, B03, D01, P01 | planejada |
| 11 | [B09 — Isolar catálogo de tags e sua projeção](B09.md) | B02, B03, P01 | planejada |
| 12 | [B10 — Isolar geração e leitura de notificações](B10.md) | B02, B03, P01 | planejada |
| 13 | [B11 — Extrair a integração de assinatura sem mudar cobrança](B11.md) | B02, B03, SEC01, P01 | planejada |
| 14 | [B12 — Extrair exclusão de conta e sua lista de recursos](B12.md) | B02, B03, B11, D02, P01 | planejada |
| 15 | [G01 — Criar o mecanismo de migração retomável](G01.md) | D02, D03, B02, O01, SEC01, P01 | planejada |
| 16 | [Q01 — Paginar o feed sem baixar toda a base](Q01.md) | C02, D03, B04, P01, P04 | planejada |
| 17 | [Q02 — Consultar publicações por autor para a galeria](Q02.md) | Q01, C07, D03, P01 | planejada |
| 18 | [Q03 — Substituir download global de perfis na descoberta geral](Q03.md) | C07, D03, P01 | planejada |
| 19 | [Q04 — Limitar follows a seguidor ou perfil consultado](Q04.md) | B07, D03, C07, P01 | planejada |
| 20 | [Q05 — Carregar métricas e seleção social somente para os posts necessários](Q05.md) | B06, D03, Q01, P01 | planejada |
| 21 | [Q06 — Paginar comentários pelo post aberto](Q06.md) | B07, D03, P01 | planejada |
| 22 | [Q07 — Ordenar e paginar notificações por destinatário](Q07.md) | B10, D03, C06, P01 | planejada |
| 23 | [Q08 — Limitar catálogo e buscas de temas gerais](Q08.md) | B09, D03, P01 | planejada |
| 24 | [M01 — Definir conversa individual e escrita v2 idempotente](M01.md) | B08, D02, D03, G01, P01 | planejada |
| 25 | [M02 — Preparar o backfill do histórico legado de mensagens](M02.md) | M01, G01, D01, P01 | planejada |
| 26 | [S01 — Separar preferências crescentes em documentos privados](S01.md) | M02, G01, D02, P01 | planejada |
| 27 | [S02 — Isolar cache e rascunhos por conta](S02.md) | S01, C06, G01, P01 | planejada |
| 28 | [S03 — Preservar modo profissional e autoridade das configurações](S03.md) | D02, C07, S02, G01, P01 | planejada |
| 29 | [S04 — Preservar campanhas e isolar funcionalidades simuladas](S04.md) | D02, S02, S03, P01 | planejada |
| 30 | [M03 — Ler a inbox privada sem carregar todo o histórico](M03.md) | M02, S01, S02, D03, P01 | planejada |
| 31 | [M04 — Paginar histórico somente da conversa ativa](M04.md) | M03, M01, D03, P01 | planejada |
| 32 | [M05 — Adicionar outbox local e recibos recuperáveis](M05.md) | M04, S02, B08, P01 | planejada |
| 33 | [U01 — Extrair o player e seu controlador](U01.md) | C02, C03, C04, F05, P01 | planejada |
| 34 | [U02 — Decompor o item e os overlays do feed](U02.md) | U01, Q01, C04, P01 | planejada |
| 35 | [U03 — Virtualizar o feed e limitar players ativos](U03.md) | U02, Q01, Q05, P01 | planejada |
| 36 | [U04 — Decompor perfil, galeria e configurações](U04.md) | C07, Q02, Q04, C03, C04, S03, P01 | planejada |
| 37 | [U05 — Separar lista de conversas e tela de conversa](U05.md) | M05, C03, C04, P01 | planejada |
| 38 | [U06 — Decompor o envio existente de fotos e vídeos](U06.md) | B04, B05, C03, C04, S02, P01 | planejada |
| 39 | [U07 — Decompor autenticação e onboarding geral preservando o contrato](U07.md) | C06, C07, C03, C04, P01 | planejada |
| 40 | [N01 — Introduzir um contrato de intenção de navegação](N01.md) | C06, C07, D01, F02, P01 | planejada |
| 41 | [N02 — Preparar o bootstrap do Expo Router sem corte de produto](N02.md) | N01, U02, U04, U05, U06, U07, P01 | planejada |
| 42 | [N03 — Migrar rotas de autenticação e onboarding](N03.md) | N02, C06, U07, P01 | planejada |
| 43 | [I01 — Tornar a finalização do upload repetível e recuperável](I01.md) | B04, B05, G01, U06, P01 | planejada |
| 44 | [I02 — Implementar verificação real de conteúdo em worker isolado](I02.md) | I01, O01, SEC01, P01 | planejada |
| 45 | [I03 — Conectar fila durável, processamento e publicação](I03.md) | I02, B04, G01, U06, O01, P01 | planejada |
| 46 | [I04 — Tornar exclusão de post e limpeza de órfãos recuperáveis](I04.md) | I03, B12, G01, P01 | planejada |
| 47 | [I05 — Persistir e reconciliar eventos de cobrança](I05.md) | B11, G01, O01, SEC01, P01 | planejada |
| 48 | [I06 — Unificar a projeção de identidade e benefícios](I06.md) | I05, C06, C07, G01, P01 | planejada |
| 49 | [I07 — Conciliar contadores e medir a necessidade de fragmentação](I07.md) | B06, B09, Q05, G01, O01, P01 | planejada |
| 50 | [I08 — Criar moderação e denúncias com autoridade server-side](I08.md) | B07, B03, G01, SEC01, P01, P05 | planejada |
| 51 | [I09 — Retomar exclusão de conta por etapas duráveis](I09.md) | B12, I04, M02, S01, I05, G01, P01 | planejada |
| 52 | [U08 — Separar a interface administrativa do domínio de decisão](U08.md) | I08, C03, C04, C06, P01 | planejada |
| 53 | [N04 — Migrar abas e telas de detalhe para rotas finas](N04.md) | N03, U08, U03, U04, U05, U06, P01 | planejada |
| 54 | [N05 — Concluir deep links e histórico web/native](N05.md) | N04, Q03, M04, P01 | planejada |
| 55 | [SEC02 — Versionar Rules dos novos caminhos e comandos](SEC02.md) | D03, B03, M01, S01, I03, I08, F04, P01 | planejada |
| 56 | [SEC03 — Preparar App Check, rate limits e proteção por plataforma](SEC03.md) | B03, C06, O01, F04, P01 | planejada |
| 57 | [O02 — Padronizar estados de falha e acessibilidade](O02.md) | U03, U04, U05, U06, U07, N04, O01, P01 | planejada |
| 58 | [O03 — Medir desempenho, concorrência e custo por sessão](O03.md) | U03, N05, M05, Q08, SEC02, I07, O01, P01 | planejada |
| 59 | [O04 — Ensaiar backup e restauração de dados e mídia](O04.md) | D00, G01, O01, SEC01, P01 | planejada |
| 60 | [O07 — Controlar atualização e cache do PWA](O07.md) | N05, S02, C06, SEC01, P01 | planejada |
| 61 | [O05 — Preparar release, recuperação e resposta a incidentes](O05.md) | F06, O04, O03, SEC03, O07, P01 | planejada |
| 62 | [G02 — Executar o ensaio integral de staging e migração](G02.md) | G01, I09, I06, I04, I08, S04, Q08, M05, N05, SEC02, O02, O04, O05, O07, P01, P09 | planejada |
| 63 | [G03 — Promover clientes e dados por coortes autorizadas](G03.md) | G02, O05, P01 | planejada |
| 64 | [G04 — Retirar compatibilidade e dados antigos após a janela](G04.md) | G03, P01 | planejada |
| 65 | [O06 — Concluir documentação e manutenção contínua](O06.md) | G04, O02, O03, O05, N05, C05, SEC03, I06, I07, S04, B10, Q06, Q07, P01 | planejada |

## Concluídas

- F00 — Registrar a base funcional e preservar o trabalho existente: [provas](../estado.json).
- F01 — Fixar ferramentas e separar os alvos de compilação: [provas](../estado.json).
- F02 — Registrar fronteiras e a convenção de pastas: [provas](../estado.json).
- F03 — Adicionar lint e formatação com adoção incremental: [provas](../estado.json).
- F04 — Criar testes reais das Rules em emuladores: [provas](../estado.json).
- F05 — Preparar testes de comportamento para extrações: [provas](../estado.json).
- F06 — Criar a CI de qualidade e empacotamento: [provas](../estado.json).
- D00 — Confirmar o ambiente real de dados sem modificá-lo: [provas](../estado.json).
- D01 — Definir IDs canônicos e mapas legados: [provas](../estado.json).
- D02 — Fechar os contratos lógicos e a autoridade dos dados: [provas](../estado.json).
- D03 — Versionar consultas, índices e paginação: [provas](../estado.json).
- O01 — Estabelecer logs, erros e métricas sanitizados: [provas](../estado.json).
- SEC01 — Definir ameaça, visibilidade e retenção: [provas](../estado.json).
- C01 — Separar tipos de autenticação e perfil: [provas](../estado.json).
- C02 — Separar Post, MediaAsset, Draft e FeedItem: [provas](../estado.json).
- C03 — Extrair primitives visuais realmente compartilhados: [provas](../estado.json).
- C04 — Estabelecer estilos colocados junto dos componentes: [provas](../estado.json).
- C05 — Remover efeito de tema durante renderização: [provas](../estado.json).
- C06 — Isolar a sessão e o ciclo de autenticação: [provas](../estado.json).
- C07 — Isolar repositório e casos de uso de perfis: [provas](../estado.json).
- B01 — Transformar o entrypoint do backend em composição: [provas](../estado.json).
- B02 — Criar portas de infraestrutura e erros do backend: [provas](../estado.json).
- B03 — Centralizar autorização e validação de comandos: [provas](../estado.json).
- B04 — Extrair handlers e serviço de mídia de posts: [provas](../estado.json).
- P01 — Generalizar cadastro para a rede social Folclore: [provas](../estado.json).
- P02 — Centralizar a marca Folko preservando integrações: [provas](../estado.json).
- B06 — Isolar curtidas e visualizações idempotentes: [provas](../estado.json).
