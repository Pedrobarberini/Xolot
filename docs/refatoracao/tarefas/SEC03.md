# SEC03 — Preparar App Check, rate limits e proteção por plataforma

- Fase: Segurança.
- Risco/escopo de execução: `critica-local`.
- Dependências: [B03](../estado.json), [C06](../estado.json), [O01](../estado.json), [F04](../estado.json), [P01](../estado.json).
- Estado inicial: planejada. Não presumir conclusão por código parcialmente existente.

## Direção do produto — revisão 2

Aplicar a [direção Folko](../05-direcao-folko.md): rede social geral de divulgação no Brasil, mantendo as funcionalidades existentes. Esportes são um assunto possível, não requisito de cadastro. Texto no feed entra por P04–P07; logo fornecido em P03. Não apagar conteúdo, profissional, assinatura ou campanhas por mudar o foco.

## Contexto mínimo

Leia o [protocolo](../04-execucao-por-modelo.md), os trechos relevantes de [arquitetura](../01-arquitetura.md), [dados](../02-dados.md) e [validação](../03-validacao-operacao.md). Registre as provas no campo `evidence` de `estado.json`; após validar todos os aceites, use o controle de progresso para remover esta ficha.

## Ler na base ou no destino equivalente do mapa

- src/config/firebase.ts
- functions/src/config.ts
- limites atuais de mídia/social/tags

## Entregáveis

- matriz de clientes/token providers
- telemetria de rejeição
- política de limites e enforcement gradual

## Passos delimitados

1. Validar configuração por plataforma sem expor segredo no cliente.
2. Observar clientes legítimos antes de exigir atestação.
3. Testar abuso, limite e erro de retry, sem ativar proteção que bloqueie cliente suportado.

## Critérios de aceite

- [ ] Plano de enforcement tem evidência por plataforma e reversão controlada.
- [ ] Atestação não substitui owner/claims no servidor.
- [ ] Dependências conferidas por evidência, diff revisado e alterações anteriores preservadas.
- [ ] Nenhum resultado não executado foi apresentado como aprovado.

## Verificações

- testes de token ausente/inválido e rate limit
- ensaio em staging

Scripts novos citados na ficha são entregáveis das tarefas de fundação; verificar sua existência e implementação antes de usá-los. Prova local não substitui staging/produção. Aplicar somente os checks adequados à mudança, conforme a matriz.

## Recuperação e limites

Manter estado intermediário compilável e compatível. Reverter somente o patch desta tarefa se necessário, sem reset destrutivo e sem apagar trabalho anterior. Mudança de dados implantados exige protocolo de migração separado.

Não ampliar o escopo para outro domínio ou upgrade principal. Se necessário, dividir esta ficha em subtarefas com resultado independente e compilável antes de implementar. Mudanças de foco autorizadas seguem a direção Folko e as fichas P; fora desse escopo, preservar o contrato. Não alterar preço, política de selo ou permissões por conveniência.
