# Acesso, ameaças e retenção

Esta é a política de compatibilidade para a refatoração local. Não altera Rules,
IAM, preço, direitos de usuários ou retenção implantada. O inventário real fica
em [ambientes.md](ambientes.md), as autoridades em
[contracts/v1](../../contracts/v1/data.json) e a avaliação parcial das Rules em
[rules-assessment.json](rules-assessment.json).

| Dado / operação | Classificação e acesso | Autoridade e proteção |
|---|---|---|
| Email, provedor e aceite de cadastro | Privado da conta | Firebase Auth / accounts; cliente não concede papel ou altera conta alheia |
| Nome, bio, username, modalidade, cidade, idade exata | Perfil social para contas registradas verificadas | Dono edita allowlist social; não ampliar para anônimo nem inventar consentimento/DOB |
| Avatares e posts em R2 | Bytes públicos por URL conhecida | Não prometer sigilo, bloqueio de download ou revogação de cópias por esconder documento |
| Arquivos em Firebase Storage | Rules de token/UID e MIME/tamanho | Dono escreve; listagem negada; sobrescrita própria conhecida na avaliação parcial |
| Likes/views e preferências | Dados privados por UID; métricas agregadas são projeção social | Marcadores e contagens privilegiados no servidor; arrays privados não são controles de acesso a mídia pública |
| Mensagens e recibos | Participantes e backend autorizado | Remetente vem do token; recibo só do destinatário e monotônico; não alegar criptografia ponta a ponta |
| Assinatura e IDs do provedor | Financeiro restrito ao dono/backend | Cliente não concede authorized/plus; webhook/reconciliação precisam provar origem e repetição |
| Verificação de identidade | Resultado mínimo privado | Backend autorizado escreve; documentos KYC não são coletados por esta refatoração nem entram no perfil social/log |
| Intenção de upload, rate limits e jobs | Operacional restrito | Servidor controla proprietário, expiração, estado e repetição; expiração não implica limpeza física já implementada |
| Denúncia, moderação, auditoria | Restrito a atores autorizados por operação | Novos comandos privilegiados exigem claim confiável e revisão; papel de UI não é autorização |
| Cache/rascunho/simulação | Privado no dispositivo, futuro isolamento por UID | S02 migra chaves; não misturar contas nem apagar rascunho por logout sem contrato explícito |
| Logs | Operacional com mínimo de dados | Protocolo allowlist de O01; nunca payload, token, URL assinada, email, UID ou KYC |

Bloqueio social atual contém filtros/preferências do aplicativo. Não equivale a
ACL de todos os arquivos e comandos. B07/I08 devem explicitar operações negadas
entre pessoas bloqueadas e comprovar a política no servidor antes de prometer
essa proteção. Ocultar um post não o exclui, e excluir um documento não prova a
remoção de objeto, backup, cache externo ou cópia de terceiro.

Admin SDK ignora Rules: cada comando precisa conferir token, conta, propriedade
e, quando aplicável, autenticação recente/claim administrativa. `role: Admin`
em JSON ou perfil nunca concede privilégio. A nova administração depende de
claim assinada e email confirmado; nenhuma claim foi concedida ou alterada.
O fluxo atual de exclusão da própria conta usa autenticação recente de dez
minutos. Não reutilizar esse privilégio para excluir conta de outra pessoa.

O selo continua exigindo identidade aprovada E assinatura autorizada. Flags
de perfil são projeções reconstruíveis do servidor. Não confiar em estado local
de plano, simulação de campanha, texto do cliente ou webhook não verificado.

| Ameaça | Prova atual | Trabalho restante |
|---|---|---|
| Perfil/conta alheia ou concessão de selo | Rules em emulador; accountViews; cadastro com porta falsa | Novos caminhos em SEC02 e casos por comando |
| Query privada sem escopo / UID alheio | queries.test.mts e permissions.test.mts | Repositórios ativos e autorização Admin nas extrações |
| Mistura de conta por callback atrasado | hook de posts e provider de tema testados | Sessão C06 e cache S02 |
| Upload indevido/MIME declarado inválido | Storage emulado e validações existentes | Conteúdo binário/CPU em I02; finalização e limpeza I01/I04 |
| Log com token/URL/KYC | operationLogging e testes de falha do cache | Revisar logs legados por domínio e retenção operacional |
| Duplicação/perda por retry e corrida | Cursores e contratos locais | Comandos sociais, billing I05, projeções I06/I07 e jobs duráveis |

Retenção proposta: testes demo são efêmeros; tema é preferência do dispositivo;
cache é reconstruível; rascunho pertence ao dono e não é apagado implicitamente;
intenção expirada deve ser processada por limpeza retomável. Para mensagens,
cobrança, verificações, denúncias, auditoria e backups, ainda falta confirmar
prazos e responsáveis. Não inventar prazo legal ou habilitar TTL/purge enquanto
essa decisão não estiver aprovada. A ausência de TTL/backups retornados em D00
não autoriza descarte nem garante possibilidade de recuperação.

Antes de migração física: decidir exposição da idade (inclusive menores), efeito
do bloqueio, direitos do destinatário sobre histórico, retenção de cada classe,
acesso de operadores, provedores de KYC e staging/backup. As tarefas posteriores
devem preparar mudanças revisáveis e manter esses pontos como gates. Nenhuma
dessas decisões pendentes será preenchida silenciosamente para liberar deploy.
