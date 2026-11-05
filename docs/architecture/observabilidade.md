# Erros operacionais sem payload privado

Os adaptadores de cliente e Functions seguem o mesmo protocolo: `operation`,
`correlationId` aleatório, `outcome`, `code` fechado e `expected`. Erros conhecidos
de autorização/validação/disponibilidade são warnings; erro desconhecido vira
`internal` e nível error. Correlation ID nunca é UID, email, documento ou nome de
usuário. O usuário continua recebendo a mensagem do caso de uso, não o evento.

Cache load/save no cliente e falha de assinatura do upload R2 no servidor são os
primeiros consumidores. O último deixou de registrar `Error.message/name`, que
poderia incluir detalhes de infraestrutura. O callable mantém o mesmo código
`failed-precondition` e a mesma mensagem segura. Falha do sink de log não muda
o resultado da operação. Fallback de cache continua disponível, agora observável.

Nunca registrar corpo de mensagens, perfil, KYC, email, UID, senha, token, cookie,
URL assinada, chave de objeto, detalhes de cartão ou payload de webhook. Não
aceitar objetos arbitrários em metadata nem serializar Error/stack. Novos nomes
de operação/códigos exigem revisão das listas e dos testes de sanitização.
Os codecs pequenos ficam em cada pacote para manter Functions independente;
testes de conformidade exercitam a mesma política nos dois, sem pacote runtime
compartilhado. Isso não é um mecanismo de transporte entre navegador/servidor.

Métricas a medir nas tarefas de cada domínio: listeners ativos/cancelados por
tela; leituras e bytes por página/sessão; tentativas e retries; duração p50/p95
de operação; lag de projeções e divergência; jobs pendentes/idade/falhas; cache
hit/miss por schema. Usar contagens, faixas e nomes de operação, sem identificador
de pessoa como label. Correlation IDs são para eventos, nunca labels de métricas.

Não foi adicionado fornecedor de telemetria nem coleta externa. Sucesso de cada
save não é logado para não gerar volume proporcional ao estado do feed. O03
implementa e mede o orçamento completo; SEC01/O05 definem acesso e retenção dos
logs existentes antes da promoção. Outros logs legados ainda precisam de revisão
nas tarefas de domínio; esta etapa não declara sanitização completa do sistema.
