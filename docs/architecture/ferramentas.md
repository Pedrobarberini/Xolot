# Matriz reproduzível de ferramentas

Referência: `.node-version` fixa **Node 22.23.4** para CI e backend. O cliente continua compatível com o requisito declarado Node >=22. O ambiente do Codex originalmente usa Node 24.22.1; a validação da fundação também foi executada com a distribuição oficial de Node 22.23.4, conferida por SHA-256.

- pnpm: **11.25.0**, declarado em `packageManager`.
- Firebase CLI: **15.34.1**, dependência de desenvolvimento congelada no lockfile. Usar `pnpm exec firebase`, evitando resolução variável via `dlx ...@latest`.
- TypeScript: **5.9.3** resolvido no lockfile, sem upgrade do runtime do app.
- Expo: SDK **54**; React **19.1.0** e React Native **0.81.5** preservados.
- Emuladores Firestore/Storage: exigir JDK **21** conforme a CLI fixada. A instalação/execução real e a evidência ficam na etapa de emuladores, não são presumidas pela existência da configuração.
- Rules Unit Testing **5.0.0**: peer compatível com Firebase 12. A versão 6 exige Firebase 13 e não foi adotada.
- Jest **29.7.0**, jest-expo **54.0.17**, React Native Testing Library **13.3.3** e renderer **19.1.0**: compatíveis com as versões atuais de Expo/React. Não adotar automaticamente Testing Library 14 ou outro renderer.

Instalação: `pnpm install --frozen-lockfile`. App: `pnpm run typecheck`. Backend: `pnpm run typecheck:functions`. Não é necessário manter cópias locais de `node_modules` nem alterar o Node global do computador para executar uma validação isolada.

Os ambientes de deploy e as credenciais continuam separados do preparo das ferramentas. `--version`/`--help` não provam login, permissão no projeto, edição do banco ou capacidade de executar uma migração.

Functions declara `nodejs22`; o patch do runtime implantado é gerenciado pela
plataforma e não foi inferido da versão local usada no teste.
