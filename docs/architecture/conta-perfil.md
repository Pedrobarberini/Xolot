# Sessão e perfil são dados diferentes

`features/profiles/domain` define o formulário de perfil, seu DTO normalizado e
`SocialUser`, a vista usada pelo legado. Ela contém identidade social e nenhuma
credencial, email, provedor ou aceite de termos. `toSocialUser` faz uma projeção
explícita; campos extras recebidos não são copiados. `role: Usuário` é somente o
rótulo compatível da interface, nunca uma permissão.

`features/auth/domain` define identidade autenticada, conta autenticada e conta
em onboarding. Os adaptadores só compõem dados privados se o UID da sessão
corresponder ao perfil. Conta provisória mantém `profileCompleted: false`, idade
nula e o fallback de username atual. O adaptador Firebase continua conferindo
cadastro e token pelos fluxos existentes; não foi habilitado outro provedor.

`src/types.ts` reexporta os tipos e mantém `AppUser` como união temporária.
Perfis de terceiros não precisam receber email vazio ou consentimento fictício
para entrar em listas e buscas. O próprio usuário continua composto com seus
dados autenticados. C06 especializa o estado de sessão; C07 separa a atualização
e a reserva de username e Q03 substitui a leitura global de perfis. Não confiar
na fachada como verificação de autorização.

O valor legado de aceite na vista autenticada permanece compatível nesta
extração. A prova do aceite vem do cadastro privado validado pelo backend;
construir uma vista de perfil não é prova jurídica nem permissão de escrita.

## Ciclo de sessão

`auth/application/sessionController.ts` depende de `SessionRepository`, sem SDK
nem React. Cada evento de identidade invalida a geração anterior, limpa a conta,
cancela o polling de cadastro e encerra o listener do próprio perfil. Resultados,
snapshots e erros antigos não publicam estado. A retomada também identifica a
instância do observer, protegendo a remontagem do provider.

`SessionProvider` expõe estado, usuário autenticado e substituição do próprio
usuário. `src/bootstrap/authServices.ts` compõe os adaptadores Firebase; a API de
UI não reexporta SDKs. As inicializações web e native e os hooks Google conservam
popup, OAuth e persistência existentes. Conta por senha exige email verificado,
recarrega a identidade e força renovação do token como antes. Cadastro pendente,
termos e chamada de ativação permanecem separados da restauração da sessão.

Perfil concluído legado ainda dispensa o polling de `accounts`; conta privada
existente sem perfil abre onboarding. Identidade Google sem cadastro permanece
no fluxo de termos, sem logout automático. A ausência de cadastro por senha
solicita logout. O adaptador só encerra o UID esperado, evitando que uma operação
atrasada encerre outra conta.

`useFirebaseAccounts` é a fachada temporária da composição legada. Ela mantém a
lista pública para os consumidores atuais, sem usá-la para restaurar sessão ou
atualizar suas credenciais. O listener próprio independe do limite público de 200
perfis. O setter compatível recusa perfil social e conta de outro UID; ele não
substitui a autorização do backend. U07/N04 retiram as fachadas ao migrar as telas.

Os testes do controlador e do provider cobrem A/B, resposta/erro tardio, unmount,
logout, verificação e onboarding. `tests/rules/authSession.test.mts` executa o SDK
de Auth e Firestore com Rules reais e contas sintéticas locais. O Admin emulado
semeia um cadastro ativado; esse teste não executa o callable remoto, o envio de
email real, o popup OAuth do Google nem um build em dispositivo native.

Referências: [integração com Auth Emulator](https://firebase.google.com/docs/emulator-suite/connect_auth)
e [identidade, verificação e renovação](https://firebase.google.com/docs/auth/web/manage-users).

## Atualização do perfil e username

`profiles/application` declara portas de leitura e de gravação atômica, sem tipos
do SDK. `createProfileCommands` recebe o repositório e a identidade atual pela
composição. Confere UID e email verificado antes de normalizar a projeção de
campos permitidos; dados adicionais do formulário não concedem papel, selo ou
plano. Os limites v1 são preservados. Idade não inteira, NaN e infinito passam a
ser recusados no cliente antes da chamada; as Rules já recusavam esses valores.

`firebaseProfileRepository` grava perfil e reserva de username na mesma
transação. Lê todas as referências antes de escrever, recusa reserva de outra
conta, conserva `createdAt` e os campos booleanos administrados pelo servidor e
libera a reserva anterior somente se pertence ao mesmo UID. Repetir a gravação
conserva as datas de criação. O erro `UsernameAlreadyInUseError` mantém classe,
mensagem e tratamento usados pelas telas atuais. Busca local de disponibilidade
é apenas uma indicação; a transação e as Rules são autoritativas.

Na disputa observada no emulador, as Rules podem negar o commit concorrente antes
de o SDK repetir a leitura. O adaptador consulta a reserva no servidor somente
nesse caminho de erro e retorna "nome em uso" apenas se comprovar outro UID como
proprietário. Falha dessa leitura ou reserva ainda própria conserva o erro
original. Não há relaxamento de Rules nem tradução genérica de permissão negada.

O teste emulado usa dois clientes distintos disputando o mesmo username e
confere que existe somente um perfil e uma reserva. Também verifica repetição,
renomeação, reload pelo repositório, preservação de selo/plano e ausência de
alteração parcial em conflitos ou reserva anterior inconsistente. Não altera
coleções, IDs ou documentos implantados. Avatar e enquadramento mantêm o serviço
atual; sua extração e recuperação têm fichas próprias B05/I07.

## Apresentação geral do Folko

Em 2026-11-05, P01 atualiza cadastro/edição para áreas de interesse e formas de
apresentação gerais. As sugestões incluem perfil pessoal, criador, artista,
negócio, serviço e projeto, sem serem enum obrigatório ou permissão de conta.
Texto livre e valores de quem já tinha perfil esportivo são preservados.

`sport`, `position` e `club` continuam sendo as chaves v1 de área de interesse,
apresentação e organização. A UI não expõe esses nomes técnicos nem preenche
campos ocultos com dados inventados. Não houve alteração de Rules, schema físico,
preço, consentimento ou política etária. Fotos, username, bio e interesses
mantêm os limites existentes; organização continua opcional.

`accountSetup.test.tsx` executa as três etapas com dados gerais, valida o payload
pelo caso de uso atual, conserva edição legada e mantém o formulário quando a
gravação falha. O smoke visual usa a tela compartilhada de edição e descarta a
prévia; não cria uma conta real nem grava mudanças na conta existente.
