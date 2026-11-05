# Plano de refatoração e transição para o Folko

Revisão 3: 2026-11-05. Repositório técnico preservado: https://github.com/Pedrobarberini/Xolot.git. Base inicial: commit 2172dd5 com alterações locais anteriores; os trabalhos e as provas concluídos permanecem em estado.json.

## Objetivo vigente

Transformar o produto em **Folko**, uma rede social comum de divulgação para o Brasil, mantendo os recursos existentes. Retirar o foco obrigatório em esportes do cadastro e da apresentação do produto. Esportes continuam sendo um interesse possível.

O proprietário confirmou **texto, fotos e vídeos no feed** e forneceu o ícone e as duas assinaturas finais do Folko. Foto/vídeo e funcionalidades atuais são preservados; publicação de texto é uma ampliação planejada, não uma funcionalidade já comprovada. Não remover modo profissional, assinatura, campanhas, mensagens ou outros recursos por causa da mudança de público.

A [direção Folko](05-direcao-folko.md) tem precedência sobre descrições esportivas do plano original. O [plano de produto](../product-plan.md) descreve o objetivo; este diretório define a execução técnica.

## Como entregar a um modelo menos capaz

1. Ler a direção do produto, o [protocolo copiável](04-execucao-por-modelo.md) e estado.json.
2. Escolher uma ficha liberada no [índice](tarefas/README.md), verificando suas dependências.
3. Implementar uma tarefa por vez, sem executar migrações ou deploy de produção por inferência.
4. Validar o resultado, preservar dados/funcionalidades fora do escopo e registrar limitações reais.
5. Persistir provas em estado.json e remover apenas a ficha concluída com o controle de progresso.

As etapas técnicas concluídas não voltam a zero. Mudanças de produto recebem fichas P próprias, com testes e compatibilidade. A refatoração continua autorizada no escopo vigente, sem mudanças comerciais ou de segurança silenciosas.

## Documentos

| Referência | Conteúdo |
|---|---|
| [Direção Folko](05-direcao-folko.md) | Escopo aprovado, compatibilidade, marca, formatos de post e limites |
| [Arquitetura](01-arquitetura.md) | Fronteiras, Clean Code, módulos, tipos e destino dos arquivos |
| [Dados](02-dados.md) | Autoridades, schema candidato, queries e migrações |
| [Qualidade e operação](03-validacao-operacao.md) | Testes, segurança, desempenho, recuperação e entrega |
| [Protocolo](04-execucao-por-modelo.md) | Instruções pequenas para implementação e conclusão |
| [Fila executável](tarefas/README.md) | Títulos, dependências e estado de cada tarefa |
| [Progresso](estado.json) | Provas históricas, revisão de produto e trabalhos restantes |

## Ordem e marcos revisados

| Marco | Resultado verificável |
|---|---|
| M0 — fundação preservada | Reaproveitar ferramentas, CI, tipos, autorização, sessão e repositórios já validados |
| M1 — cadastro geral | P01: cadastrar pessoa comum, criador ou divulgação sem obrigação de modalidade/posição esportiva |
| M2 — marca Folko | P02 centraliza nome/textos; P03 aplica o logo fornecido com inventário de assets |
| M3 — base escalável | Queries por contexto, cursor, cancelamento, cache por UID, player isolado e navegação modular |
| M4 — conteúdo misto | P04–P07: contrato, comando de texto, leitor/renderização e compositor, preservando foto/vídeo |
| M5 — divulgação e confiança | Descoberta geral P08, recursos profissionais existentes, moderação, bloqueio e proteção dos dados |
| M6 — operação recuperável | Jobs, mídia, cobrança, exclusão, observabilidade, backup e recuperação conforme fichas originais |
| M7 — lançamento validado | P09 + G02/G03: ensaio do produto geral e promoção autorizada; G04 remove legado somente depois |

Esses marcos não são promessa de prazo. P03 usa as artes finais recebidas, inventariadas em [assets/brand](../../assets/brand/README.md). Nenhuma marcação de conclusão técnica significa produção pronta.

## Arquitetura e dados

- Manter React Native/Expo/TypeScript, Auth, Firestore, Functions, R2 e integrações atuais.
- Organizar por funcionalidade, com domínio sem SDK, casos de uso com portas e UI sem caminhos Firestore.
- Manter builds/deploys do app e backend independentes; não importar runtime do frontend em Functions.
- Preservar UIDs, usernames, relações, mídia, histórico, caches e chaves legadas durante a compatibilidade.
- Generalizar a apresentação do cadastro sem renomear campos físicos ou inventar valores para o banco.
- Introduzir texto por contrato explícito, sem arquivo falso nem relaxamento de autorização.
- Paginar e carregar por contexto; trabalho durável e migração com checkpoint antes de qualquer corte.
- Conservar assinatura, selo, profissional e campanhas no estado real atual; simulação não se transforma em cobrança.

## Estado conhecido e decisões pendentes

D00 confirmou Firestore Standard/Native, banco padrão e região southamerica-east1. Os detalhes observados, limites e lacunas estão em [ambientes.md](../architecture/ambientes.md) e nas provas de D00; não repetir o diagnóstico antigo de CLI indisponível nem criar outro projeto.

Domínios finais, identificadores de publicação nas lojas, política etária/privacidade final, volumetria, orçamento e metas operacionais exigem decisão ou ensaio próprios. Não presumir que o nome Folko autorize mudar Firebase, OAuth, buckets, URLs ou faturamento.

Os contratos v1 continuam descrevendo o que existe; a proposta v2 em contracts é candidata. P04 revisa o alvo para os três formatos antes de sua implementação. Instalação, código local, emulação, staging e produção devem permanecer distinguidos nas provas.

## Conclusão do programa

Encerrar somente quando as tarefas obrigatórias tiverem aceite, os recursos existentes estiverem preservados, o cadastro e conteúdo geral forem comprovados, a marca tiver a arte correta e as migrações autorizadas estiverem reconciliadas. Pendência externa permanece identificada; não apagar o histórico nem apresentar o plano como produto implantado.
