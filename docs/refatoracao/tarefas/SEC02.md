# SEC02 — Versionar Rules dos novos caminhos e comandos

- Fase: Segurança.
- Risco/escopo de execução: `critica-local`.
- Dependências: [D03](../estado.json), [B03](../estado.json), [M01](M01.md), [S01](S01.md), [I03](I03.md), [I08](I08.md), [F04](../estado.json), [P01](../estado.json).
- Estado inicial: planejada. Não presumir conclusão por código parcialmente existente.

## Direção do produto — revisão 2

Aplicar a [direção Folko](../05-direcao-folko.md): rede social geral de divulgação no Brasil, mantendo as funcionalidades existentes. Esportes são um assunto possível, não requisito de cadastro. Texto no feed entra por P04–P07; logo fornecido em P03. Não apagar conteúdo, profissional, assinatura ou campanhas por mudar o foco.

Contrato específico da revisão: Revisar os contratos Folko de P04/P05 antes da ativação de texto. Campo opcional por tipo não pode permitir forjar autor, publicar draft, conceder benefício ou acesso anônimo.

## Contexto mínimo

Leia o [protocolo](../04-execucao-por-modelo.md), os trechos relevantes de [arquitetura](../01-arquitetura.md), [dados](../02-dados.md) e [validação](../03-validacao-operacao.md). Registre as provas no campo `evidence` de `estado.json`; após validar todos os aceites, use o controle de progresso para remover esta ficha.

## Ler na base ou no destino equivalente do mapa

- firestore.rules
- storage.rules
- matriz SEC01
- catálogo D03

## Entregáveis

- Rules aditivas v1/v2
- matriz de testes completa
- plano de retirada de escritores legados

## Passos delimitados

1. Testar queries e acesso individual em cada novo caminho.
2. Proteger campos imutáveis e documentos privados; manter limites.
3. Apertar acesso legado somente no corte autorizado de clientes compatíveis.

## Critérios de aceite

- [ ] Todos os negativos da matriz são executados no emulador.
- [ ] Nenhum get permitido implica listagem privada ampla por acidente.
- [ ] Dependências conferidas por evidência, diff revisado e alterações anteriores preservadas.
- [ ] Nenhum resultado não executado foi apresentado como aprovado.

## Verificações

- test:rules e query integration
- revisão humana antes de promoção

Scripts novos citados na ficha são entregáveis das tarefas de fundação; verificar sua existência e implementação antes de usá-los. Prova local não substitui staging/produção. Aplicar somente os checks adequados à mudança, conforme a matriz.

## Recuperação e limites

Manter estado intermediário compilável e compatível. Reverter somente o patch desta tarefa se necessário, sem reset destrutivo e sem apagar trabalho anterior. Mudança de dados implantados exige protocolo de migração separado.

Não ampliar o escopo para outro domínio ou upgrade principal. Se necessário, dividir esta ficha em subtarefas com resultado independente e compilável antes de implementar. Mudanças de foco autorizadas seguem a direção Folko e as fichas P; fora desse escopo, preservar o contrato. Não alterar preço, política de selo ou permissões por conveniência.
