# dev-feat

Use este comando para implementar um item do `backlog.md` e registrar a entrega na release mais recente.

## Objetivo

Escolher um item acionavel do backlog, implementar a mudanca de ponta a ponta, validar o resultado e mover o registro do item para o arquivo mais recente em `releases/`.

## Fluxo

1. Leia `backlog.md`.
2. Identifique o item pedido pelo usuario. Se o usuario nao indicar um item especifico, escolha o primeiro item pendente de maior prioridade que seja pequeno o bastante para uma mudanca incremental.
3. Leia os arquivos relacionados antes de editar.
4. Implemente a menor mudanca completa possivel.
5. Atualize testes existentes ou crie testes focados quando houver regra de negocio, migracao, utilitario ou comportamento compartilhado.
6. Rode validacoes:
   - `nvm exec 22 node node_modules/typescript/bin/tsc --noEmit`
   - `nvm exec 22 node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/*.test.mts`
7. Atualize `backlog.md` marcando o item entregue.
8. Localize a release mais recente em `releases/`.
9. Mova ou copie o resumo do item entregue para a release mais recente, mantendo contexto suficiente para auditoria.
10. No resumo final, informe:
    - item do backlog atendido;
    - arquivos principais alterados;
    - validacoes executadas;
    - release atualizada.

## Regras

- Nao misture refactors grandes com feature pequena.
- Nao marque item como concluido se a implementacao nao estiver validada.
- Preserve alteracoes locais que nao fazem parte da tarefa.
- Se a tarefa exigir backend, servico externo, credenciais ou decisao de produto ausente, registre o bloqueio e escolha uma subtarefa local segura somente se ela ainda entregar valor.
- Ao mover para release, mantenha o backlog como fonte do que ainda falta e a release como historico do que foi entregue.
