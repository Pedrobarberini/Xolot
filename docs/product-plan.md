# Folko — plano de produto

Revisão: 2026-11-05. Direção aprovada pelo proprietário: manter os recursos atuais e abrir o público para uma rede social comum de divulgação no Brasil.

## Proposta

Um espaço para pessoas, criadores, artistas, negócios, serviços, projetos e comunidades compartilharem o que fazem e descobrirem conteúdo. Esportes continuam sendo um assunto possível; não definem quem pode criar uma conta. O nome Folko não restringe as publicações a temas folclóricos.

## O que permanece

- Contas por email/senha e Google, confirmação de email, recuperação e restauração de sessão.
- Perfis, username único, biografia, avatar, interesses, galeria e métricas existentes.
- Fotos e vídeos, feed, curtidas, visualizações, comentários e compartilhamento.
- Seguir pessoas, descoberta, notificações e mensagens.
- Modo profissional, categorias, links, assinatura/verificação e campanhas no estado real atual de cada recurso.
- Stack, dados, UIDs, relações, histórico e controles de segurança existentes.

Manter um recurso não o promove de simulação para serviço real. Não alterar preços, benefícios, pagamentos, políticas ou permissões por causa da nova marca.

## Mudança imediata: cadastro geral

O cadastro apresenta identidade, seu espaço e interesses, com exemplos diversos. Modalidade, posição de jogador e equipe deixam de ser a linguagem do formulário. Área de interesse e apresentação aceitam texto livre, inclusive perfil pessoal; marca/projeto/organização continua opcional.

Esta etapa preserva as chaves de dados existentes por compatibilidade. Não inventa dados para satisfazer o banco, não sobrescreve perfis antigos e não muda a política de idade/consentimento. Uma mudança futura de obrigatoriedade ou privacidade precisa de contrato, Rules e migração próprios.

## Feed de texto, fotos e vídeos

Os três formatos foram confirmados pelo proprietário. Fotos e vídeos existentes continuam funcionando. Texto é ampliação planejada: ainda precisa de modelo, comando protegido, leitor, renderização e composição, nas tarefas P04–P07.

Um post de texto não recebe vídeo vazio, URL fictícia nem upload obrigatório. Ele participa de autoria, comentários, curtidas, denúncias e exclusão, com as permissões do produto. Não presumir suporte porque uma legenda já aceita texto.

## Marca

- Nome de produto: Folko.
- Idioma e exemplos: português do Brasil.
- O ícone F/tucano e duas assinaturas finais foram fornecidos em 2026-11-05; substituem as primeiras duas artes descartadas. Origem, tamanhos e usos: [inventário de marca](../assets/brand/README.md).
- Textos públicos centralizados em P02; P03 aplica as três artes e a paleta, com aceite em dispositivo/PWA instalado antes da promoção.
- Nome público não autoriza renomear automaticamente projeto Firebase, repositório, buckets, domínio, OAuth, identificadores de apps, chaves locais ou contratos de cobrança.

## Entrega

1. Cadastro geral compatível e testado — P01.
2. Textos/identidade da marca e nova arte — P02/P03.
3. Refatoração técnica já planejada, sem desfazer as etapas concluídas.
4. Contratos e publicação de texto, depois feed/compositor mistos — P04–P07.
5. Descoberta geral e validação dos fluxos existentes — P08/P09.
6. Ensaio e promoção de ambiente conforme G02/G03, com autorização e recuperação concretas.

Calendário, público etário final, política de moderação, retenção e domínios definitivos precisam de definição própria; não inventar decisões comerciais ou jurídicas. Política atual de acesso não se torna pública/anônima por se tratar de uma rede social comum.

O [plano executável](refatoracao/README.md), a [direção detalhada](refatoracao/05-direcao-folko.md) e o [controle de progresso](refatoracao/estado.json) são as referências de implementação. O [plano esportivo anterior](archive/product-plan-esportes.md) é apenas histórico.
