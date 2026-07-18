# dev-improv

Use este comando para resolver um item do `TechnicalDebt.md` e registrar a melhoria na release mais recente.

## Objetivo

Escolher uma divida tecnica acionavel, implementar a melhoria em etapas pequenas, validar que o comportamento existente foi preservado e mover o registro da melhoria para o arquivo mais recente em `releases/`.

## Fluxo

1. Leia `TechnicalDebt.md`.
2. Identifique o item pedido pelo usuario. Se o usuario nao indicar um item especifico, escolha o primeiro item pendente de maior prioridade que possa ser resolvido incrementalmente.
3. Leia os arquivos relacionados antes de editar.
4. Prefira refactors mecanicos e seguros:
   - extrair seletores puros;
   - dividir tipos por dominio;
   - mover estilos para a pasta do componente;
   - extrair componente reutilizavel;
   - reduzir prop drilling local;
   - remover codigo morto coberto por busca e testes.
5. Preserve comportamento visual e funcional, salvo se o usuario pedir mudanca explicita.
6. Atualize ou adicione testes quando a melhoria tocar regra de negocio, selectors, utils, repositories ou contratos entre modulos.
7. Rode validacoes:
   - `nvm exec 22 node node_modules/typescript/bin/tsc --noEmit`
   - `nvm exec 22 node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/*.test.mts`
8. Atualize `TechnicalDebt.md` alterando status, risco residual ou removendo o trecho obsoleto.
9. Localize a release mais recente em `releases/`.
10. Mova ou copie o resumo da melhoria para a release mais recente, mantendo contexto suficiente para auditoria.
11. No resumo final, informe:
    - item de divida tecnica atendido;
    - arquivos principais alterados;
    - validacoes executadas;
    - release atualizada.

## Regras

- Nao transforme melhoria tecnica em redesign.
- Nao extraia abstracao sem uso real.
- Componentes extraidos devem preferir pasta propria com implementacao, estilos e tipos locais:

```txt
src/components/NomeDoComponente/
  NomeDoComponente.tsx
  NomeDoComponente.styles.ts
  NomeDoComponente.types.ts
  index.ts
```

- Componentes especificos de uma pagina devem ficar dentro de `src/pages/NomePage/components/` ate existir reutilizacao real.
- `theme.ts` deve guardar tokens compartilhados; estilos estruturais devem ficar perto de quem usa.
- Preserve alteracoes locais que nao fazem parte da tarefa.
