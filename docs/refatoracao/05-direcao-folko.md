# Direção do produto — Folko

Revisão 3, de 2026-11-05. Este documento substitui a premissa de preservar o nicho esportivo no plano anterior. Mantém os contratos e funcionalidades fora das mudanças explicitamente descritas.

## Decisões confirmadas

| Tema | Decisão do proprietário |
|---|---|
| Público | Rede social comum para divulgação no Brasil |
| Nome | Folko |
| Recursos existentes | Manter; mudar o foco, não apagar o produto |
| Cadastro | Retirar o direcionamento esportivo |
| Conteúdo | Texto, fotos e vídeos no feed |
| Logo | Ícone F/tucano e duas assinaturas recebidos em 2026-11-05; substituem as duas primeiras artes descartadas |

Esportes são um dos assuntos possíveis. Não eliminar posts, contas ou interesses esportivos. Não transformar Folko em uma rede exclusivamente de folclore/cultura, nem remover profissional, planos ou campanhas sem novo pedido.

## Matriz de transição

| Área | Agora | Execução planejada |
|---|---|---|
| Identidade e segurança | Preservar Auth, email confirmado, UID e autorização | Manutenção das fichas B/SEC e dos testes |
| Cadastro | Linguagem geral; sugestões de arte, música, humor, tecnologia e outros temas | P01 |
| Perfis antigos | Preservar valores e edição por texto livre | P01; nenhuma conversão em massa |
| Marca escrita | Folko centralizado na apresentação pública; integrações preservadas | P02 |
| Logo e cores | Escuro como padrão; recortes por cor autorizados preservam pena, bico e olho da versão horizontal | P03; aceite de dispositivo/PWA instalado pendente; origem e usos em assets/brand/README.md |
| Foto/vídeo e interações | Preservar funcionamento e dados | Refatoração original continua |
| Texto no feed | Requisito confirmado, ainda não implementado | P04 contrato; P05 backend; P06 leitor; P07 compositor |
| Descoberta | Pessoas e divulgação por interesse, sem filtro esportivo obrigatório | P08 + Q03/Q08 |
| Profissional, assinatura e campanhas | Manter escopo, autoridade e estado de implementação atuais | S03/S04/B11/I05/I06 |
| Domínios e identificadores técnicos | Preservar Xolot/NextStar onde são chaves, URLs ou IDs de integração | Inventário e alteração separada em P02/G03, quando autorizada |

## Compatibilidade do cadastro imediato

| Apresentação do formulário | Chave atual | Política nesta etapa |
|---|---|---|
| Área legada (retirada do formulário) | sport | Preservar valores existentes; novas contas usam vazio; interesses são escolhidos em hashtags |
| Como você se apresenta | position | Perfil pessoal, criador, artista, negócio, serviço ou descrição livre; não é role administrativa |
| Marca, projeto ou organização | club | Opcional; conservar valor existente |
| Nome, username, bio, idade, cidade, interesses e avatar | Chaves atuais | Conservar validações, consentimento e autoridade existentes |

Os nomes legados são detalhe do adaptador; não aparecem como campos técnicos para o usuário. A área de interesse textual foi retirada por solicitação do proprietário: a seleção existente de uma a seis hashtags é o único campo de interesses no cadastro e na edição. Não preencher campos escondidos com atleta, jogador ou valores fictícios. Não limpar sport/position/club dos registros antigos.

Novas contas conservam a chave `sport` com texto vazio. A validação do cliente e o protótipo das Rules aceitam esse caso; a alteração de schema deve acompanhar a publicação do formulário. Não exige renomear campos nem migrar documentos existentes.

A simplificação futura de campos obrigatórios ou a adoção de nomes físicos gerais exige versão, leitores, Rules e migração testada; este plano não declara essa migração pronta. A idade pública atual merece revisão de privacidade em SEC01/SEC02 antes de ampliar o lançamento, sem inventar outra política etária nesta tarefa.

## Post de texto como mudança de contrato

P04 deve definir uma união por tipo de conteúdo e limites explícitos, autoria, estado, versão e timestamps. Mídia é obrigatória apenas para foto/vídeo; texto exige corpo válido. Galeria, feed, métricas, compartilhamento, moderação, denúncias, notificações e exclusão precisam reconhecer o formato.

Leitores e Rules vêm antes da ativação de novos escritores. Não inserir texto em um feed v1 limitado a 50 e presumir que clientes antigos continuarão completos só porque ignoram schema desconhecido. P04 deve definir a estratégia de compatibilidade por leitor/capacidade/coorte e testá-la; G02 ensaia antes de promover.

O upload R2 e o processamento binário permanecem exclusivos de arquivos. Não gerar thumbnail fictícia, mídia vazia ou duração para texto. Os 24 endpoints existentes são a referência de compatibilidade; se P05 introduzir um novo comando, registrar a adição deliberada no contrato e no teste de exports.

## Fronteiras e escalabilidade

Manter cliente Expo e Functions independentes; UI, casos de uso e adaptadores por domínio. Reutilizar auth, profiles, posts, feed, engagement, follows, comments, messaging, notifications, preferences, professional e billing. Não criar um backend paralelo só para a nova marca.

Consultas continuam limitadas e paginadas; o feed misto conserva um único vídeo ativo e evita montar players para texto/foto. Busca por nome, username, área/interesse e tags não deve exigir baixar todas as contas. Catálogo amplo é sugestão, não exigência de enquadramento do usuário.

## Ordem para o executor

- Ler esta direção antes de qualquer ficha. A nova instrução do proprietário prevalece sobre descrições esportivas antigas.
- Não reabrir ou apagar as 25 provas técnicas anteriores. A apresentação geral é validada em P01; contratos de novos formatos são revalidados em P04–P07.
- P01 validou o cadastro geral. Concluir P02/P03 com a marca Folko e as três artes finais recebidas; continuar os pré-requisitos técnicos liberados.
- Tratar as fichas P como mudanças de produto explícitas. Nas extrações técnicas, preservar o comportamento fora desse escopo.
- Completar P09 e os gates técnicos antes de promover o Folko. Não confundir plano revisado, código local, teste emulado e produção.
- Continuar removendo apenas a ficha concluída depois de persistir suas provas em estado.json.

## O que não está autorizado por esta revisão

Não apagar usuários, publicações, conversas ou dados de cobrança; não mudar regras de selo/preço; não liberar acesso anônimo; não criar projeto/cloud/checkout; não renomear domínios ou IDs de apps; não publicar ou migrar produção automaticamente. As propostas concretas dessas ações seguem os gates existentes.
