# Qualidade incremental

`pnpm run lint` executa ESLint com a configuração Expo fixada. Os 23 diagnósticos
legados estão registrados em `config/lint-baseline.json`, com arquivo, regra,
mensagem, conteúdo da linha e quantidade. Nova ocorrência ou mudança desse
conteúdo falha. Erros de parser e violações de arquitetura nunca entram no orçamento.
O baseline continua visível e não é atualizado durante o check.

`@typescript-eslint/no-explicit-any` sinaliza `any` explícito como erro. A regra
local de arquitetura impede SDKs no domínio, Firebase na UI, imports profundos
entre funcionalidades e dependência de funcionalidades em `shared`. As fronteiras
se aplicam às novas pastas; o código legado é migrado nas respectivas fichas.

`pnpm run format:check` verifica arquivos novos e migrados com Prettier.
`config/format-legacy-files.json` registra os caminhos legados ainda dispensados
temporariamente de formatação. Fachadas já migradas e arquivos apagados saem
dessa exceção. Ao mover um arquivo, seu novo caminho passa a ser
verificado. `pnpm run format` formata apenas esse mesmo escopo incremental.
Não reformatar todo o legado para concluir uma extração.

Para revisar a dívida: `node scripts/lint.mjs --update-baseline`. Esse comando
só aceita diagnósticos em caminhos legados; o diff do baseline exige revisão.
Não executá-lo para esconder regressões. O gate usa `pnpm run lint`, inclusive
na CI preparada em F06. Os testes em `tests/lintBudget.test.mts` exercitam a
contagem da dívida, fronteiras válidas/inválidas e rejeição de `any` novo.

Limites: a regra local cobre imports e reexports estáticos; não substitui revisão
de arquitetura ou detecção completa de ciclos. `any` implícito é verificado pelo
TypeScript estrito. Estes checks não alteram comportamento do aplicativo.
