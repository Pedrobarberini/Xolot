# Inventário de ambientes

Consulta somente leitura em **2026-11-04**, usando Firebase CLI 15.34.1 e a
configuração existente do repositório. Nenhum documento, índice, Rule, backup,
permissão ou serviço foi modificado.

| Item | Evidência observada |
|---|---|
| Projeto vinculado | `xolot-384e9`, único alvo registrado em `.firebaserc` |
| Banco | `(default)`, edição **STANDARD**, API `FIRESTORE_NATIVE` |
| Região | `southamerica-east1` |
| Concorrência e realtime | `PESSIMISTIC`; realtime habilitado |
| Proteção contra exclusão | Habilitada |
| PITR e retenção de versões | PITR desabilitado; `versionRetentionPeriod: 3600s` |
| Índices compostos / field overrides | Consulta devolveu `indexes: []`, `fieldOverrides: []` |
| TTL | Nenhuma configuração retornada na consulta de fields/overrides, que inclui TTL |
| Backups na região | `firestore:backups:list --location southamerica-east1` retornou objeto sem backups |
| Agendamentos de backup do banco | `firestore:backups:schedules:list --database '(default)'` retornou lista vazia |
| Functions implantadas | 24; todas `nodejs22` e `southamerica-east1`; 23 gcfv2 e `cleanupDeletedAccount` gcfv1 |
| IAM | Política efetiva não inventariada por estas consultas; não presumir privilégio mínimo nem autorização para implantar |

Os comandos usados foram `firestore:databases:get`, `firestore:indexes`,
`firestore:backups:list`, `firestore:backups:schedules:list` e `functions:list`,
sempre com `--project xolot-384e9 --json --non-interactive`. Somente nomes,
região e runtime foram retidos da listagem de Functions.

O cliente local usa o projeto configurado por variáveis `EXPO_PUBLIC_FIREBASE_*`.
Os valores e credenciais não são copiados para este inventário. O repositório
usa `https://xolot.com.br` como endereço padrão do produto. Não existe alvo de
dev/staging separado registrado na configuração examinada; isso não prova que
outros projetos ou buckets não existam na conta.

R2 está configurado no código com buckets lógicos `xolot-uploads` e
`xolot-media`, e domínio público `media.xolot.com.br`. Região, lifecycle,
versionamento, retenção e IAM efetivos do provedor não foram consultados.
Mercado Pago possui parâmetro `MERCADO_PAGO_ENVIRONMENT`, cujo padrão no fonte é
`production`; não se confirmou o valor implantado e não se acessaram tokens ou
dados financeiros. Não tratar esse padrão como prova de conta/ambiente real.

Os testes automáticos usam `demo-xolot-rules` e emuladores de loopback. Para
qualquer implantação ou migração física, ainda é necessário identificar um
staging independente, conferir IAM/retentores nos dois provedores, ensaiar backup
e restauração e preparar autorização para o alvo exato. A ausência de backups
na consulta não autoriza criar nem excluir recursos por conveniência.
