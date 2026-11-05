# Testes de autorização isolados

`pnpm run test:rules` inicia Auth, Firestore e Storage com `firebase.emulators.json`,
CLI fixada e JDK 21. Usa exclusivamente `demo-xolot-rules`, Firestore
`127.0.0.1:8085`, Auth `127.0.0.1:9095` e Storage `127.0.0.1:9195`. A guarda recusa projeto real,
endpoint diferente e substituição de argumentos antes de criar clientes.

As fixtures são sintéticas e recriadas em cada teste. Há casos de dono, outro
usuário, participante, não participante, anônimo e email não confirmado. Get e
queries são executados pelo SDK cliente; o contexto administrativo só semeia
as fixtures. Nenhum documento real é lido ou apagado pela suíte.

O teste de sessão usa o SDK real conectado explicitamente ao Auth emulado antes
de autenticar. Exercita cadastro pendente e verificação, login, perfil próprio,
logout e uma segunda conta com onboarding. O Admin local simula a confirmação do
email e o cadastro ativado; não há email real nem chamada de ativação implantada.

A suíte verifica contas, perfis, concessão indevida de selo/plano, mensagens,
notificações, métricas privadas, assinaturas, verificações e mídia/avatar. Os
testes estruturais antigos continuam cobrindo os caminhos ainda não migrados.

O segundo upload do próprio objeto é uma limitação observada das Rules atuais,
registrada em [rules-assessment.json](rules-assessment.json). O teste conserva
essa prova e também nega alteração isolada de metadados, upload alheio e MIME
inválido. A distinção entre upload e update de metadados foi confirmada na
[discussão do mantenedor Firebase](https://github.com/firebase/firebase-tools/issues/10302).
Não houve relaxamento de Rules para aprovar o teste.

Emulador não substitui avaliação de IAM, validação do binário, staging ou teste
dos comandos privilegiados de Functions. Cada tarefa de domínio deve adicionar
seus casos positivos/negativos antes de trocar as Rules correspondentes.
