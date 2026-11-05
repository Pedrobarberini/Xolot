# Contratos dos dados

[v1/data.json](v1/data.json) registra autoridades, leitores, escritores, campos
e unidades observadas no código. [v2/data.json](v2/data.json) é proposta local;
nenhum caminho v2 está ativo pela simples existência do arquivo. Os contratos
dos 24 endpoints existentes estão em `config/functions-exports.json` e são
comparados com os metadados de Functions nos testes.

Firestore Standard/Native e região foram confirmados em
[ambientes.md](../docs/architecture/ambientes.md). Os campos atuais sem
`schemaVersion` continuam v1. Não adicionar `schemaVersion` a documentos atuais
que usam `hasOnly` antes de atualizar/testar leitores e Rules; versões
desconhecidas não são reinterpretadas como a atual. Timestamp no banco não é
uma string JSON; as conversões para DTOs são responsabilidade dos adaptadores.

Configuração profissional permanece local durante a transição. S03 prepara sua
persistência privada por UID em `userData/{uid}/preferences/professional`, sem
usar `plan` local para conceder benefício e sem publicar automaticamente link
ou categoria. Campanhas permanecem simulação do dispositivo, isolada por conta
e explicitamente marcada em S04. Não há novo domínio de cobrança publicitária.

O preço/legado da assinatura e a combinação identidade aprovada + assinatura
autorizada permanecem iguais. Dinheiro novo v2 usa centavos inteiros com campo
distinto e conversão explícita na integração; valores v1 não mudam de unidade.
IDs seguem as primitives já implementadas. Estado de upload/post proposto não
entra no feed até a respectiva máquina de estados e compatibilidade serem
ensaiadas. Não criar campos físicos a partir de listas de estados aspiracionais.

A revisão de produto Folko, de 2026-11-05, mantém estes contratos como registro
do observado e do candidato anterior. P01 generaliza a apresentação conservando
as chaves sport/position/club. P04 deverá revisar o alvo de publicações para
texto/foto/vídeo, com leitores/Rules e promoção compatíveis; o JSON v2 atual não
é prova de suporte a texto. A [direção vigente](../docs/refatoracao/05-direcao-folko.md)
impede apagar campos/dados, simular mídia vazia ou ativar escritores novos sem
tratar clientes e consultas suportados.
