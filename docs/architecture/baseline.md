# Base da execução de refatoração

Data: 2026-11-01. Revisão de origem: `2172dd5732e581b850ff8438e1f577d9370434a8`, com alterações locais da limpeza já presentes.

Antes de alterar as ferramentas, passaram:

- `pnpm run typecheck`;
- `pnpm test`: 164 testes, zero falhas;
- `pnpm --dir functions exec tsc --noEmit`;
- `pnpm run build:web`: bundle e service worker gerados, 12 URLs no precache.

Ambiente observado: Node 24.22.1 e pnpm 11.25.0. A implantação de Functions declara Node 22; a tarefa F01 deve fixar e testar a matriz correspondente. O snapshot de arquivos alterados anteriormente está em [baseline.json](baseline.json), sem credenciais nem cópia de dados pessoais.

Contratos a preservar: login/email/Google e onboarding; avatar e recorte; feed, reprodução e gestos; perfis, pesquisa e relações; mensagens/recibos/compartilhamentos; notificações; publicação e armazenamento; assinatura/identidade; exclusão autorizada de conta. O registro visual anterior está em `output/testes/` e não substitui testes de integração ou produção.

Parte da suíte existente lê nomes e texto de arquivos, especialmente regras, sincronização e interface. Esses testes devem ser substituídos por comportamento equivalente conforme as fichas, preservando as proteções atuais durante a transição.
