# Backlog técnico - Folko

Situação consolidada em 06/11/2026: [entregas, pendências, métricas e evolução](docs/refatoracao/06-status-metricas-e-evolucao.md). As seções antigas abaixo preservam histórico e podem ter estados anteriores às publicações recentes; consultar a consolidação e as provas das fichas antes de executar ou repetir trabalho.

Atualizado em 2026-07-27.

Este arquivo é orientado a desenvolvimento. Cada item deve virar issue ou task rastreável antes de entrar em implementação.

## Direção vigente — 2026-11-05

Manter as funcionalidades existentes e abrir a rede à divulgação em geral no Brasil. Cadastro sem nicho esportivo, nome Folko e logo a ser fornecido. Feed com texto, fotos e vídeos confirmado; texto ainda será implementado em P04–P07. O [plano revisado](docs/refatoracao/README.md), a [direção de produto](docs/refatoracao/05-direcao-folko.md) e estado.json prevalecem sobre as fases históricas abaixo. Não reabrir itens concluídos nem criar outro controle concorrente.

## Prioridades

- P0: bloqueia o lançamento público.
- P1: necessário para o MVP comercial.
- P2: melhora qualidade, conversão ou operação.
- P3: expansão após validação do produto.

## Definition of Done

- [ ] TypeScript sem erros em `pnpm run typecheck`.
- [ ] Testes automatizados passando em `pnpm test`.
- [ ] Build web concluído em `pnpm run build:web`.
- [ ] Fluxos críticos validados em viewport mobile e desktop.
- [ ] Estados de loading, erro, vazio e sucesso tratados.
- [ ] Interface sem conteúdo falso apresentado como dado real.
- [ ] Persistência e migrações cobertas por testes.
- [ ] README e backlog atualizados.
- [ ] Deploy verificado em `https://xolot.com.br`.

## Migração concluída - Rede profissional de publicidade

### Task PIVOT-001 - Remover o domínio anterior

Tipo: Produto/Frontend/Dados

Status: Concluído em 2026-07-25.

- [x] Remover tipos, seletores e ações do domínio anterior.
- [x] Remover telas, rotas e componentes que não pertencem à rede de publicidade.
- [x] Remover valores, indicadores e chamadas financeiras do Início e dos perfis.
- [x] Remover estilos e utilitários obsoletos.
- [x] Atualizar o schema local da versão 4 para a versão 5.
- [x] Preservar contas, perfis, publicações e relações sociais na migração.
- [x] Descartar com segurança os dados locais incompatíveis com o novo produto.
- [x] Cobrir a migração com testes automatizados.

### Task PIVOT-002 - Criar perfis profissionais

Tipo: Frontend/Produto

Status: Concluído em 2026-07-25.

- [x] Criar modo profissional opcional por perfil.
- [x] Adicionar categorias: Talento, Criador, Negócio, Marca, Projeto e Serviço.
- [x] Adicionar link profissional externo.
- [x] Exibir categoria profissional na Pesquisa e no perfil público.
- [x] Criar painel com publicações, visualizações, curtidas e mensagens.
- [x] Exibir a quantidade de compartilhamentos no Início e simplificar os controles laterais para ícones sem círculos.
- [x] Animar o coração ao curtir uma publicação e manter o estado ativo em vermelho.
- [x] Remover fundo e borda dos controles flutuantes de tela cheia e volume.
- [x] Permitir curtir fotos e vídeos com dois toques e exibir confirmação animada.
- [x] Manter o perfil social e a galeria como vitrine principal.
- [x] Exibir títulos diretamente sobre as miniaturas da galeria e compactar o botão de opções.
- [x] Substituir o item secundário do menu do Perfil por `Painel profissional`.

### Task PIVOT-003 - Preparar planos de monetização

Tipo: Produto/Frontend

Status: Concluído em modo de pré-lançamento em 2026-07-25.

- [x] Definir plano Gratuito.
- [x] Redefinir Xolot Plus por R$ 9,90/mês exclusivamente para o selo de identidade verificada (2026-08-23).
- [x] Retirar o plano Negócios da oferta atual até existir uma proposta real de benefícios.
- [x] Exibir comparação resumida de benefícios no painel.
- [x] Manter assinatura e selo como estados autoritativos do backend, sem entitlement financeiro local.
- [x] Informar que o Plus é recorrente e que impulsionamentos terão cobrança individual separada.
- [ ] Integrar produtos reais no Google Play Billing e App Store.
- [x] Integrar checkout web recorrente com o Mercado Pago.
- [x] Validar status da assinatura e webhooks assinados no backend.
- [x] Implementar cancelamento, renovação e restauração do estado da assinatura web.

### Task PIVOT-004 - Criar campanhas de publicação promovida

Tipo: Frontend/Produto/Dados

Status: Protótipo antigo arquivado; checkout de impulsionamento real pendente.

- [x] Criar página dedicada para promover uma publicação própria.
- [x] Oferecer objetivos de alcance, visitas ao perfil e mensagens.
- [x] Oferecer duração de 3, 7 ou 14 dias.
- [x] Oferecer orçamentos de teste de R$ 20, R$ 50 ou R$ 100.
- [x] Remover a estimativa determinística que exibia alcance sem dados reais.
- [x] Impedir criação local de campanha sem pagamento confirmado.
- [x] Relacionar campanha, publicação, perfil e conta proprietária.
- [x] Remover campanhas relacionadas quando a publicação é excluída.
- [ ] Priorizar no Início somente campanhas pagas, aprovadas e ativas no backend.
- [x] Identificar conteúdo promovido de forma explícita.
- [x] Cobrir regras de campanha e ordenação com testes automatizados.

### Task PIVOT-005 - Atualizar documentação e validação

Tipo: Engenharia

Status: Concluído em 2026-07-25, com validação visual manual ainda recomendada.

- [x] Atualizar o README para o posicionamento de publicidade.
- [x] Reescrever o backlog para o novo objetivo do produto.
- [x] Remover referências funcionais ao escopo anterior.
- [x] Executar `pnpm run typecheck`.
- [x] Executar `pnpm test` com 68 testes aprovados.
- [x] Executar build web de produção.
- [ ] Validar visualmente em mobile e desktop após a publicação. O navegador automatizado ficou indisponível nesta sessão.
- [x] Criar commit, enviar ao GitHub e verificar o deploy.

## P0 - Backend público

### Task P0-001 - Contas e perfis no Firebase

Tipo: Backend/Frontend/Infra/Segurança

Status: Fase 1 implementada; Hosting e Firestore publicados em 2026-07-28. Email/Senha e Google configurados; domínio Auth personalizado e App Check ainda pendentes.

- [x] Escolher Firebase Authentication e Cloud Firestore para contas e perfis.
- [x] Implementar cadastro por email/senha sem credencial local.
- [x] Implementar login, logout e restauração de sessão pelo Firebase Auth.
- [x] Exigir verificação de email antes de acessar dados sociais.
- [x] Implementar recuperação de senha com resposta antienumeração.
- [x] Integrar login Google à mesma autoridade de sessão.
- [x] Criar automaticamente a conta Xolot no primeiro login Google após um único aceite explícito dos termos.
- [x] Manter Continuar em largura total na primeira etapa do perfil e animar Voltar para a proporção 30/70 nas etapas seguintes.
- [x] Remover o Google da tela de cadastro por email e manter o provedor apenas na entrada principal.
- [x] Remover o login Apple Web e seu código específico por decisão de produto.
- [x] Exibir Google em largura total, com ícone oficial, carregamento e acessibilidade.
- [x] Usar o asset oficial do Google Identity, sem dependência de fonte web.
- [x] Tratar domínio OAuth não autorizado, popup bloqueado, conta já vinculada e URI de retorno inválida com mensagens específicas.
- [x] Exibir requisitos de senha em tempo real e traduzir erros de cadastro do Firebase, incluindo email já cadastrado por provedor social.
- [x] Retirar o planejamento de Sign in with Apple nativo nesta fase.
- [x] Criar `accounts/{uid}` privado com metadados mínimos e imutáveis.
- [x] Criar `profiles/{uid}` sem email, senha ou papel administrativo.
- [x] Garantir unicidade de `@username` com transação e coleção `usernames`.
- [x] Aplicar regras Firestore deny-by-default, propriedade por UID e allowlist de campos.
- [x] Remover hash, salt, contas e sessão do estado persistido local.
- [x] Atualizar o schema local da versão 5 para a versão 6.
- [x] Configurar persistência do Firebase Auth no React Native com AsyncStorage.
- [x] Preparar App Check web com reCAPTCHA Enterprise por variável de ambiente.
- [x] Adicionar testes de normalização de perfil, descarte de credenciais e invariantes das regras.
- [x] Documentar variáveis, modelo de dados e práticas de segurança.
- [x] Reconhecer contas legadas com perfil concluído sem liberar leitura social para identidades sem cadastro.
- [x] Incluir perfis legados sem `updatedAt` na assinatura pública de até 200 contas.
- [x] Recuperar nome e username sanitizados de perfis públicos legados sem dispensar a configuração obrigatória do próprio usuário.
- [x] Concluir `accounts/{uid}` por Function autenticada após a verificação do e-mail.
- [x] Recuperar identidades antigas sem metadados mediante nova aceitação explícita dos termos.
- [x] Executar pnpm run typecheck, 74 testes e build web de produção.
- [ ] Criar projetos Firebase separados para desenvolvimento, staging e produção.
- [x] Habilitar Email/Senha, Google e política forte de senha no console.
- [ ] Ativar proteção contra enumeração de emails.
- [ ] Adicionar `xolot.com.br` aos domínios autorizados do Firebase Authentication.
- [ ] Revisar domínios autorizados para OAuth e links de ação após a emissão do certificado TLS.
- [x] Publicar `firestore.rules` e `firestore.indexes.json` no projeto correto.
- [ ] Cobrir regras com Firebase Emulator Suite e `@firebase/rules-unit-testing`.
- [ ] Registrar App Check e ativar enforcement após monitorar clientes legítimos.
- [ ] Implementar custom claims e backend confiável para funções administrativas.
- [ ] Implementar exclusão/exportação de conta e dados conforme LGPD.
- [x] Implementar exclusão autoritativa de conta, perfil, publicações, dados sociais e mídias com gatilho do Firebase Auth.
- [ ] Criar trilha de auditoria para ações administrativas.

Coleções desta fase:

- [x] `accounts/{uid}` para metadados privados mínimos.
- [x] `profiles/{uid}` para dados públicos do perfil.
- [x] `usernames/{username}` para reserva única e transacional.
### Task P0-002 - Publicações e storage

Tipo: Backend/Frontend/Infra

Status: Integracao Cloudflare R2 publicada em producao em 2026-08-11. Credenciais validadas com upload, copia e exclusao reais; teste funcional pelo app com uma conta verificada ainda pendente.

#### Migracao para Cloudflare R2

- [x] Configurar Account ID, buckets `xolot-uploads` e `xolot-media` e dominio `media.xolot.com.br` somente no backend.
- [x] Criar Firebase Functions Node.js 22 com credenciais R2 armazenadas por Secret Manager.
- [x] Gerar URL PUT assinada e temporaria para upload direto ao bucket privado.
- [x] Validar autenticacao, email confirmado, conta registrada, MIME, tamanho e propriedade no servidor.
- [x] Promover a midia validada para uma chave imutavel no bucket publico.
- [x] Persistir no Firestore apenas metadados, provedor e chave do objeto.
- [x] Excluir publicacao R2 apenas pelo proprietario por meio de Function autenticada.
- [x] Manter leitura e exclusao compativeis com posts legados do Firebase Storage.
- [x] Adicionar suporte a foto, GIF e video com progresso de upload.
- [x] Adicionar CORS restrito aos dominios Xolot e ambientes locais de desenvolvimento.
- [x] Validar Functions, typecheck, 99 testes automatizados e build web.
- [x] Cadastrar `R2_ACCESS_KEY_ID` e `R2_SECRET_ACCESS_KEY` no Firebase Secret Manager.
- [x] Validar o par de credenciais com upload no bucket privado, copia para o bucket publico e limpeza dos objetos de diagnostico.
- [x] Aplicar as politicas CORS aos dois buckets e conferir com Wrangler.
- [x] Publicar as Functions no Firebase e confirmar protecao contra chamadas anonimas.
- [x] Exibir erros especificos de upload e retornar ao Inicio somente depois da publicacao concluida.
- [x] Persistir avatar e enquadramento no R2 por Functions autenticadas e sincronizar `profileMedia/{uid}` em tempo real.
- [x] Separar troca de arquivo e ajuste de enquadramento para persistir foco e escala sem reenviar o avatar.
- [x] Tornar o snapshot do Firestore autoritativo depois da restauração do cache local e na troca de conta.
- [x] Unificar as publicacoes do perfil aberto pela conta ou pelo reel usando UID e `profileId`.
- [x] Isolar reels incompatíveis ou com mídia indisponível sem ocultar os demais e registrar diagnóstico de sincronização.
- [ ] Executar teste real de upload, recarga e exclusao com uma conta verificada.
- [x] Ativar `EXPO_PUBLIC_R2_MEDIA_ENABLED=true` e publicar o Hosting.
- [ ] Criar limpeza agendada de uploads temporarios e objetos orfaos.
- [ ] Gerar thumbnails, posters e versoes otimizadas no processamento assincrono.
- [ ] Registrar clientes nativos no App Check e ativar enforcement apos monitoramento.

- [x] Persistir mídia provisoriamente no IndexedDB do navegador.
- [x] Adicionar chave de recurso para manter mídia local enquanto o Storage estiver inativo.
- [x] Preservar feed, envio e avatar locais sem bloquear o restante do app.
- [x] Pausar vídeos fora da área visível.
- [x] Preservar a proporção completa de fotos e vídeos no feed sem cortar as bordas.
- [x] Preencher as laterais em mídias verticais compatíveis e manter o enquadramento completo nos formatos cuja proporção causaria corte relevante.
- [x] Isolar o gesto do volume da rolagem do feed e preservar o nível ao trocar ou remontar o player.
- [x] Suportar foto, vídeo, descrição, tags e marcações no frontend.
- [x] Escolher Firebase Storage para mídia e Cloud Firestore para metadados.
- [x] Criar upload autenticado e resumível pelo SDK Firebase, com progresso visual.
- [x] Persistir posts em `posts/{postId}` e arquivos em `posts/{uid}/{postId}/media`.
- [x] Persistir avatar e enquadramento em `profileMedia/{uid}` e `avatars/{uid}/profile`.
- [x] Validar MIME, tamanho e metadados no cliente, Firestore e Storage Rules.
- [x] Assinar em tempo real a primeira página com limite de 50 publicações.
- [x] Excluir documento e arquivo remoto apenas para o proprietário.
- [x] Publicar e validar a compilação das regras do Firestore.
- [x] Validar integração com TypeScript, 84 testes automatizados e build web.
- [ ] Ativar Firebase Storage no projeto `xolot-384e9` e vincular o plano Blaze.
- [ ] Publicar `storage.rules` após a criação do bucket.
- [ ] Validar duração e resolução reais em processamento confiável no servidor.
- [ ] Gerar thumbnail, poster e versões otimizadas.
- [ ] Implementar paginação incremental além das 50 publicações iniciais.
- [ ] Implementar exclusão lógica e limpeza assíncrona de mídia.

### Task P0-003 - Mensagens em tempo real

Tipo: Backend/Frontend


Status: Sincronizacao multi-dispositivo, recibos e central de notificacoes no app publicados em 2026-08-13; paginacao, criptografia ponta a ponta e push externo continuam pendentes.

- [x] Persistir mensagens privadas no Firestore com leitura restrita ao remetente e destinatario.
- [x] Sincronizar follows, preferencias de seguranca e configuracoes de conversa por conta.
- [x] Persistir curtidas e visualizacoes individuais em colecoes privadas.
- [x] Atualizar contadores de curtidas, visualizacoes e compartilhamentos somente por Functions.
- [x] Migrar comentarios para o Firestore com atualizacao em tempo real.
- [x] Migrar de forma idempotente o cache social existente de cada dispositivo.
- [x] Manter o AsyncStorage apenas como cache local e modo de abertura rapida.
- [x] Corrigir o contrato entre IDs visuais `approved-<id>` e documentos `posts/<id>` em mensagens, curtidas, visualizacoes e comentarios.
- [x] Implementar experiência local de conversas e solicitações.
- [x] Implementar follow como regra de liberação de conversa.
- [x] Permitir compartilhar publicações com mensagem anexada.
- [x] Selecionar os destinatários antes do envio e preservar a mensagem opcional junto da publicação compartilhada.
- [x] Exibir a publicação compartilhada como uma mídia única, com título sobreposto e sem fundo colorido.
- [x] Persistir a mensagem opcional do compartilhamento separada da publicação no chat.
- [x] Abrir o perfil correto ao tocar no nome ou na foto do cabeçalho de uma conversa privada.
- [x] Fixar até três conversas, silenciar e apagar histórico localmente.
- [x] Pesquisar conversas por nome público ou @username.
- [x] Limitar a aba Pesquisar aos perfis que a conta segue.
- [x] Criar comentarios nos reels com contagem, lista, envio e exclusao pelo autor.
- [x] Persistir comentarios no estado social local durante a fase de testes.
- [x] Permitir responder comentarios com encadeamento e marcacao do autor.
- [x] Sugerir perfis em pop-up ao marcar pessoas na publicação ou ao digitar `@` em comentários, com inserção no cursor e acesso ao perfil.
- [x] Permitir rolagem interna e exibir até cinquenta perfis nas sugestões de marcação.
- [x] Exibir a foto de perfil nas sugestões de marcação de publicações e comentários, com inicial como fallback.
- [x] Recolher respostas por padrao e permitir ver ou ocultar cada topico.
- [x] Corrigir a exclusao de comentarios no web com confirmacao interna.
- [x] Recarregar e retornar ao primeiro reel ao tocar na logo do Inicio.
- [x] Enviar mensagens e comentarios pela tecla Enter.
- [ ] Migrar comentarios para o Cloud Firestore com paginacao e atualizacao em tempo real.
- [ ] Criar tabelas Conversation, ConversationMember e Message.
- [ ] Implementar WebSocket ou serviço realtime.
- [x] Persistir recibos de envio, entrega e leitura.
- [x] Criar central de notificacoes em tempo real para mensagens, compartilhamentos, curtidas, comentarios e respostas.
- [x] Restringir alertas no Firestore ao destinatario e gerar eventos somente por Cloud Functions.
- [x] Exibir sino com contador de nao lidas e navegacao direta para conversa ou publicacao.
- [x] Persistir no Firestore as preferencias de pop-up do dispositivo e reproducao automatica por conta.
- [x] Fazer o player ativo obedecer a reproducao automatica, mantendo a reproducao manual disponivel.
- [x] Manter a central interna independente da preferencia de pop-up do dispositivo.
- [x] Solicitar permissao do navegador e exibir pop-ups apenas para notificacoes novas da sessao.
- [ ] Implementar anexos por referência segura à publicação.
- [ ] Implementar paginação e sincronização offline.
- [ ] Criar notificações push.

### Task P0-004 - Segurança, privacidade e moderação

Tipo: Backend/Produto/Jurídico

- [x] Implementar bloqueio e preferências locais de conteúdo.
- [x] Permitir restaurar publicações próprias ocultadas e tipos marcados como sem interesse.
- [x] Criar denúncia local de publicação no feed com opção de retirada.
- [x] Criar central de Segurança para revisar ocultações, denúncias e bloqueios.
- [x] Padronizar em branco a seta de retorno sobre o vídeo.
- [ ] Criar denúncia de perfil, publicação e mensagem.
- [ ] Implementar moderação automática de texto, imagem e vídeo.
- [ ] Criar fila humana para exceções e recursos.
- [ ] Implementar proteção de menores e consentimento responsável.
- [ ] Criar exportação e exclusão de dados conforme LGPD.
- [ ] Definir política de publicidade e conteúdo proibido.
- [ ] Registrar por que um anúncio foi mostrado ao usuário.

### Task P0-005 - Personalização orgânica do Início

Tipo: Backend/Data/Frontend/Produto

- [x] Permitir selecionar até seis hashtags de interesse ao concluir o perfil.
- [x] Permitir editar as hashtags de interesse nas configurações da conta.
- [ ] Exigir de uma a cinco hashtags normalizadas em cada publicação.
- [x] Criar catálogo pesquisável de hashtags e impedir duplicatas ou variações equivalentes.
- [x] Permitir criar hashtags no onboarding e na publicação usando a mesma chave normalizada.
- [x] Exibir quantas pessoas e publicações utilizaram cada hashtag sugerida.
- [x] Manter os contadores do catálogo por Function idempotente, sem escrita direta do cliente.
- [x] Derivar afinidade com todas as hashtags das publicações curtidas e priorizar interesses declarados.
- [ ] Armazenar preferências e afinidades em documentos privados do usuário.
- [x] Armazenar preferências de hashtags em documento privado sincronizado por conta.
- [x] Criar abas Seguindo e Sugestões na pesquisa, sem misturar descoberta com perfis já seguidos.
- [x] Abrir a busca em Sugestões e pesquisar todas as contas públicas quando houver texto.
- [x] Sugerir somente contas cadastradas pelo cruzamento entre interesses declarados e afinidade comportamental.
- [x] Remover publicações e perfis sem conta registrada do cálculo de sugestões.
- [x] Usar perfis aleatórios da mesma cidade ou UF como fallback, sem coletar GPS preciso.
- [x] Revisar ortografia, acentuação, concordância e consistência dos textos visíveis do aplicativo e das mensagens do backend.
- [ ] Registrar impressão, tempo assistido, conclusão, curtida, comentário, compartilhamento, follow, pulo rápido e desinteresse.
- [ ] Agregar eventos no backend e impedir que o cliente altere diretamente a própria pontuação.
- [ ] Implementar ranking inicial configurável: 55% interesse declarado, 25% afinidade aprendida, 10% perfis seguidos e 10% novidade/diversidade.
- [ ] Aplicar decaimento gradual das afinidades para que interesses antigos não dominem o feed para sempre.
- [ ] Reservar exploração controlada para conteúdos novos sem abandonar as hashtags escolhidas.
- [ ] Inserir campanhas promovidas em frequência limitada e sempre identificadas, separadas do score orgânico.
- [ ] Exibir uma explicação curta de por que cada publicação foi recomendada.
- [ ] Cobrir cálculo, desempate, diversidade e privacidade com testes automatizados.

## P1 - Plataforma de publicidade

### Task P1-001 - Entrega de campanhas no servidor

Tipo: Backend/Data

- [ ] Criar modelos Campaign, Creative, Audience e CampaignEvent.
- [ ] Validar propriedade da publicação antes de promover.
- [ ] Implementar estados draft, pending, active, paused, completed e rejected.
- [ ] Aplicar orçamento diário e total no servidor.
- [ ] Implementar pacing e limite de frequência por usuário.
- [ ] Garantir que conteúdo promovido sempre tenha identificação visual.
- [ ] Interromper entrega quando o orçamento ou período terminar.

### Task P1-002 - Segmentação responsável

Tipo: Produto/Data

- [ ] Permitir segmentação por região, categoria e interesse declarado.
- [ ] Proibir segmentação por atributos sensíveis.
- [ ] Oferecer controles de privacidade e personalização.
- [ ] Criar audiência estimada antes da publicação.
- [ ] Evitar sobre-exposição do mesmo anúncio.
- [ ] Documentar critérios de ranking orgânico e promovido.

### Task P1-003 - Métricas confiáveis

Tipo: Backend/Data/Frontend

- [ ] Registrar impressão quando a publicação estiver visível pelo tempo mínimo.
- [ ] Registrar visualização de vídeo por regra documentada.
- [ ] Registrar clique, visita ao perfil, follow e mensagem atribuída.
- [ ] Deduplicar eventos por sessão, conta e janela de tempo.
- [ ] Criar relatório por campanha, publicação e período.
- [ ] Exibir alcance, frequência, custo por resultado e taxa de conversão.
- [ ] Permitir exportação CSV para contas Negócios.

### Task P1-004 - Assinaturas e cobrança

Tipo: Backend/Mobile/Web

- [ ] Criar catálogo único de produtos e benefícios.
- [x] Implementar entitlement server-side.
- [ ] Integrar Google Play Billing.
- [ ] Integrar StoreKit/App Store.
- [x] Integrar checkout web recorrente do Xolot Plus com Mercado Pago.
- [x] Processar webhooks idempotentes com validação de assinatura.
- [x] Criar a aplicação do Mercado Pago e cadastrar os segredos de teste no Firebase.
- [x] Separar checkout de teste e produção e vincular o sandbox ao comprador de teste sem persistir seu e-mail em texto aberto.
- [x] Abrir o checkout do Mercado Pago na mesma aba no navegador para evitar bloqueio de popup após a chamada assíncrona.
- [x] Publicar no perfil o selo Xolot Plus somente quando a assinatura estiver autorizada pelo backend.
- [x] Exigir status documental aprovado pelo backend para iniciar o checkout e manter o selo junto à assinatura Xolot Plus.
- [x] Proteger `identityVerified` e `plusActive` contra escrita do cliente e recalcular ambos por gatilhos do backend.
- [x] Criar tela de status da identidade antes do pagamento, sem coletar RG/CPF no armazenamento próprio.
- [ ] Selecionar e contratar provedor especializado de KYC para validar RG, CPF, prova de vida e fraude.
- [ ] Integrar criação de sessão KYC no backend, callback assinado do provedor e política de retenção mínima.
- [ ] Criar fluxo de consentimento do responsável legal para menores de 18 anos.
- [x] Alterar novas assinaturas web para R$ 9,90/mês.
- [x] Manter assinaturas antigas de R$ 19,90 reconhecidas sem alterar automaticamente a cobrança recorrente.
- [ ] Definir migração consentida das assinaturas antigas para R$ 9,90.
- [x] Publicar checkout, sincronização, webhook e regras privadas no Firebase.
- [x] Exibir no checkout o motivo seguro e específico quando as contas de teste do vendedor e comprador forem incompatíveis.
- [x] Validar o fluxo completo no sandbox antes de habilitar credenciais de produção.
- [x] Sincronizar automaticamente a assinatura ao retornar do checkout.
- [x] Permitir cancelamento autenticado, validado no servidor e confirmado no Mercado Pago.
- [x] Corrigir o cancelamento para o status oficial canceled, mantendo compatibilidade com registros antigos.
- [x] Confirmar preço, recorrência e benefícios antes de encaminhar ao checkout.
- [x] Repetir a sincronização no retorno do Mercado Pago e abrir diretamente o painel profissional.
- [x] Registrar transições de ativação e cancelamento e exibir a próxima renovação no painel.
- [ ] Ativar credenciais e webhook de produção após a revisão final da conta vendedora.
- [ ] Emitir recibos e histórico de cobrança.
- [ ] Tratar trial, falha de pagamento, grace period e reembolso.

### Task P1-005 - Painel profissional completo

Tipo: Frontend/Produto

- [x] Criar painel local com métricas agregadas.
- [x] Criar seleção de categoria, plano e link profissional.
- [x] Listar campanhas e permitir pausar ou retomar.
- [x] Liberar métricas detalhadas, categoria, link profissional e acesso ao painel sem exigir assinatura.
- [x] Remover campanhas e estimativas de alcance simuladas do painel profissional.
- [x] Separar o Xolot Plus das ferramentas profissionais: assinatura mantém apenas o selo verificado.
- [x] Desabilitar a ativação de impulsionamento até existir confirmação de pagamento por campanha.
- [ ] Implementar checkout avulso de impulsionamento com idempotência, webhook assinado e status server-side.
- [ ] Definir inventário real, segmentação, orçamento, pacing e limites antes de estimar alcance.
- [ ] Adicionar filtros por período.
- [ ] Criar gráficos acessíveis de crescimento e conversão.
- [ ] Exibir origem das visitas e melhores publicações.
- [ ] Adicionar recomendações acionáveis sem inventar dados.
- [x] Criar estado de carregamento e atualização manual conectado à API de assinatura.

## P2 - Qualidade do frontend

### Task P2-001 - Componentização

Tipo: Frontend

- [x] Separar screens, actions, repositories e estilos do `App.tsx`.
- [x] Extrair shell e navegação compartilhados.
- [ ] Criar `src/components/VideoPlayer.tsx` reutilizável.
- [ ] Criar `src/components/VideoCard.tsx` reutilizável.
- [ ] Criar `src/components/AppToast.tsx`.
- [ ] Extrair controles de câmera para componentes menores.
- [ ] Dividir os módulos de estilo restantes por domínio.

### Task P2-002 - Experiência e acessibilidade

Tipo: Frontend/UX

- [x] Padronizar retornos com ícone simples.
- [x] Padronizar animações de entrada e HUDs.
- [x] Ajustar avatar com foco e escala por gesto.
- [x] Abrir o avatar do Perfil em uma visualizacao circular sem acessar o editor.
- [x] Exibir as ações individuais da galeria em um menu contextual ancorado aos três pontos, sem escurecer a tela.
- [x] Criar navegação inferior fixa e responsiva.
- [x] Criar tema escuro persistente com alternância em Configurações.
- [x] Remover o fundo do resumo de envios, posts e curtidas nos perfis.
- [x] Reforçar a legibilidade dos ícones de ação dos reels sobre mídias claras.
- [ ] Testar leitor de tela em Android, iOS e web.
- [ ] Garantir foco de teclado em todos os modais.
- [ ] Auditar contraste e áreas mínimas de toque.
- [ ] Implementar skeletons e estados de retry.
- [ ] Criar testes E2E dos fluxos principais.

### Task P2-003 - Observabilidade e CI

Tipo: Infra/Qualidade

- [x] Publicar a versão web anterior por GitHub Actions e domínio próprio.
- [x] Executar testes unitários do estado local.
- [ ] Executar typecheck, testes e build em toda pull request.
- [ ] Adicionar monitoramento de erros com contexto não sensível.
- [ ] Adicionar métricas de desempenho e Web Vitals.
- [ ] Criar alertas para falha de deploy e API.
- [ ] Criar política de backup e restauração do banco.

### Task P2-004 - Migrar publicação para Firebase Hosting

Tipo: Infra/Segurança

Status: Preparação local concluída em 2026-07-28; ativação externa pendente.

- [x] Configurar `dist` como raiz pública do Firebase Hosting.
- [x] Configurar fallback de SPA para `index.html`.
- [x] Definir cache curto para manifest e sem cache para o service worker.
- [x] Tornar o pós-processamento do PWA independente do GitHub Pages.
- [x] Remover o workflow que publicava novos builds no GitHub Pages.
- [x] Adicionar scripts de deploy de Hosting e Firestore.
- [x] Associar o projeto Firebase local ao projeto `xolot-384e9`.
- [x] Publicar e validar o app no subdomínio `web.app`.
- [ ] Migrar `xolot.com.br` usando os registros DNS fornecidos pelo Firebase.
- [ ] Confirmar certificado HTTPS e só então despublicar o GitHub Pages.
- [ ] Tornar o repositório privado depois de confirmar que nenhum fluxo público depende dele.
## P3 - Expansão após validação

- [ ] Marketplace de serviços entre profissionais e marcas.
- [ ] Comissão por contratação concluída com regras transparentes.
- [ ] Perfis de equipe e permissões para agências.
- [ ] Biblioteca de mídia e calendário de publicações.
- [ ] Integrações com analytics e CRM.
- [ ] Programa de afiliados para criadores.
- [ ] API pública com chaves e limites por plano.

## Decisão de produto arquivada

O escopo anterior de captação e participação em atletas foi removido em 2026-07-25. Ele não deve voltar ao código sem nova decisão de produto, análise jurídica e arquitetura própria. A direção ativa da Xolot é rede social profissional com publicidade, assinaturas e promoção de conteúdo.

## P2 - Conteúdo real

- [x] Remover o perfil e a publicação demonstrativos; o Início agora depende apenas de conteúdo real publicado.
- [x] Padronizar perfis próprio e público com totais de posts, visualizações e curtidas, mantendo seguidores e seguindo separados.
- [x] Estabilizar toques repetidos nos reels, impedindo pausa residual após toque duplo e mantendo a reprodução em 1x.
- [x] Corrigir a reprodução do reel aberto por compartilhamento, descartando toques atrasados e evitando alternâncias consecutivas no celular.
- [x] Garantir apenas um player de vídeo montado no Início, pausando durante a rolagem e ativando o reel somente após o encaixe final.
- [x] Centralizar o ícone de reprodução exibido enquanto o reel aguarda a ativação do player.
- [x] Criar visualização limpa ao manter foto, vídeo ou GIF pressionado no Início, com ocultação e retorno animados das sobreposições e do rodapé.
- [x] Exibir data e horário nas mensagens e persistir os estados enviada, entregue e visualizada entre os dispositivos.

## P1 - Onboarding multiesportivo

Tipo: Produto/Frontend/Dados

- [x] Dividir a conclusão do perfil em identidade, atuação e interesses.
- [x] Permitir escolher a foto no primeiro passo e salvar somente após criar o perfil.
- [x] Adicionar modalidade para esportes tradicionais e e-sports.
- [x] Reapresentar posição como função ou especialidade vinculada à modalidade.
- [x] Atualizar equipe, clube ou projeto para contemplar diferentes contextos.
- [x] Ampliar os interesses usados no Para você com esportes e e-sports.
- [x] Preservar a leitura de perfis antigos sem modalidade.
- [x] Exibir modalidade, função e cidade de forma consistente no perfil, feed, busca e mensagens.
- [x] Manter cabeçalho, conteúdo rolável e rodapé de ações estáveis entre as etapas.
- [x] Animar a saída e a entrada lateral do conteúdo ao avançar ou voltar.
- [x] Tornar equipe, clube ou projeto opcional em todas as camadas de validação.
- [x] Criar catálogo centralizado e expansível de modalidades e funções relacionadas.
- [x] Sugerir funções conforme a modalidade selecionada.
- [ ] Migrar o catálogo para configuração remota quando houver painel de conteúdo.
