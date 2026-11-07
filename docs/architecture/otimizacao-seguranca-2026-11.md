# Otimização e segurança do Folko

Execução iniciada em 2026-11-05; rollout web atualizado em 2026-11-06. Código
validado localmente e em preview web; quatro índices e a configuração de CAPTCHA
em monitoramento foram ativados no Google. Não houve migração de documentos nem
carga contra produção. As evidências de execução ficam em `output/testes/`
(ignorado pelo Git); este documento registra resultados e limitações sem dados
pessoais.

| Etapa | Escopo | Critério de conclusão | Estado |
| --- | --- | --- | --- |
| 1 | Banco, consultas, endpoints e segredos | Inventário de leitura e riscos reproduzíveis | Concluída |
| 2 | Curtidas, visualizações, feed e mensagens | Concorrência, rollback, reconexão e ordem corretos | Concluída localmente |
| 3 | Câmera e privacidade da sessão | Recursos liberados em falha/saída; dados isolados | Implementada e testada com streams simulados |
| 4 | CAPTCHA e controle de abuso | Integração verificável, limites atômicos e testes locais | Agente e chave web restrita aplicados; token, SDK Auth, tela de login e nove probes aprovados em monitoramento |
| 5 | Segurança e regressão | Rules, segredos, build e relatório de latência | Concluída localmente |

## Inventário e achados

O banco `(default)` é STANDARD, na região `southamerica-east1`, com proteção
contra exclusão habilitada e PITR desabilitado. Em 2026-11-05, foram observados 16 accounts,
13 profiles, 6 posts, 8 agregados de interação, 32 mensagens, 25 notificações,
22 follows e 12 comentários. O volume atual é pequeno; os limites globais dos
listeners representam um problema de crescimento, não milhares de leituras
já observadas nesta inspeção.

A inspeção de 100 documentos selecionou apenas referências, tipos de datas e
presença de campos privados conhecidos. Não baixou corpos de mensagens, nomes,
fotos ou documentos pessoais. Não encontrou `email`, `phone`, `cpf`, `password`
ou `accessToken` nos perfis, nem os campos de credenciais examinados em accounts.
Datas, participantes e autores examinados são válidos. Existem **dois agregados
de métricas sem post correspondente**: foram preservados para reconciliação,
sem apagar histórico ou marcadores privados.

As Rules Firestore implantadas correspondiam à versão anterior às alterações
locais desta auditoria. As novas regras restringem posts não publicados ao autor.
Os cinco probes isolados de `setPostLike`, `recordPostView`, `sendDirectMessage`,
`finalizeAccountRegistration` e `mercadoPagoWebhook` responderam HTTP 401 sem
credenciais. Isso testa apenas esses caminhos, não todos os possíveis ataques.

R2 e Mercado Pago têm segredos no Secret Manager. A chave Firebase usada pelo
cliente permite 27 APIs e **não tem restrição efetiva de referrer**: o objeto
`browserKeyRestrictions` existe, mas sua lista está vazia. A inspeção inicial
confundiu a presença desse objeto com uma restrição válida; o readback corrigiu
essa conclusão. Nenhuma restrição dessa chave foi alterada. Uma mudança precisa
considerar que o mesmo código de configuração também atende clientes nativos.
**Nenhum índice composto
estava implantado** no início da inspeção. Foram adicionados somente os quatro
índices necessários ao feed, às duas direções de mensagens e às notificações.
A confirmação de estado READY e das consultas fica em
`output/testes/query-index-verification.json`; os outros quatro continuam candidatos.

## Mudanças no aplicativo

- Curtidas: contador e seleção otimistas; envio sequencial por post; última
  intenção preservada em cliques rápidos; rollback na falha; callbacks antigos
  não alteram outra sessão.
- Visualizações: uma solicitação pendente por post; confirmação por conta no
  servidor; falha permite retry. Re-render não reinicia os 800 ms de permanência.
  Sair da tela, mudar de conta ou interromper a reprodução cancela a espera.
- Leituras: métricas, curtidas e visualizações usam somente IDs dos posts
  carregados, em lotes de até 30. Para 50 posts, o escopo passa a no máximo 150
  documentos relacionados, em vez de até 2.000 métricas globais mais o histórico
  inteiro de marcadores. É um limite de leitura estimado, não uma medição de fatura.
- Feed: reset fecha overlays, cancela a navegação pendente, volta ao início e
  reinicia a reprodução sem trocar as chaves de todos os itens. URLs de mídia
  são reutilizadas dentro da assinatura e callbacks após unsubscribe são ignorados.
- Mensagens/notificações: ordem por data e ID antes de aplicar o limite. A prova
  usa 512 mensagens para verificar que as novas continuam chegando. Pendentes
  locais são preservadas durante snapshots concorrentes. Recibos são enviados
  em lotes de 100; nenhum item após o primeiro lote é descartado.
- Entrega: gravar uma mensagem não a marca como entregue. Somente o destinatário
  confirma entrega/leitura, de forma monotônica. Retry do mesmo ID retorna a
  mensagem original; colisão de dono ou conteúdo é rejeitada. Contadores de
  recibos/notificações pertencem à tentativa confirmada da transação.
- Sessão: cache social separado por UID; migração projeta apenas dados do dono e
  preserva a origem legada. Escritas locais são agrupadas em 250 ms. O cache no
  dispositivo continua sem criptografia própria; não equivale a E2EE.
- Câmera: somente o preview do componente pode ser gravado. Microfone e clone
  são liberados em cancelamento, erro de construção/início e permissão tardia.
  Sair da tela descarta o resultado e libera sua URL temporária.

Listeners globais de perfis, follows e comentários ainda exigem a paginação e
as projeções previstas no plano original. O histórico de mensagens continua
limitado a 500 por direção: a janela agora é a mais recente, mas navegação para
histórico anterior exige paginação/inbox. Não declarar escalabilidade ilimitada.

## Proteções implementadas localmente

Os 17 comandos callable passam pelo mesmo guard: identidade verificada antes de
acessar o banco, payload máximo de 32 KiB, orçamento por conta/operação, CORS
para origens conhecidas, máximo de 20 instâncias e concorrência 40 por instância.
A quota usa transação no Firestore; uma recusa em cache, limitada a 2.048 entradas
por instância, evita novas leituras do mesmo abuso durante a janela. Não concede
permissão nem substitui a autoridade transacional. As quotas novas entram na
limpeza de conta. O job legado de exclusão também recebe teto de 20 instâncias.

Limites por minuto: curtida/visualização/recibo 120; mensagens e leitura de notificações
60; cadastro 10; upload 10; finalização de post 20; exclusão de post 20; avatar
5; finalização de avatar 10; enquadramento 20; hashtag 20; criar/cancelar Plus 5;
sincronizar Plus 20; excluir conta 3. São valores iniciais para monitoramento,
não garantia contra contas automatizadas distribuídas.

Logs de erros de avatar/pagamentos passam a usar o protocolo sanitizado, sem
copiar respostas do provedor, UID, tokens ou URLs assinadas. O scanner
`pnpm run security:scan` entra no CI e pode examinar o export com `--dist`.
Ele busca padrões conhecidos; não certifica histórico Git nem todos os segredos.

### Dependências

A consulta de advisories de produção caiu de **98 para 6** alertas após 22
overrides compatíveis com as versões principais existentes: críticos 2 → 0,
altos 63 → 2, moderados 26 → 3 e baixos 7 → 1. O pacote isolado de Functions
deve preservar esses overrides, inclusive fora do workspace.

Pendências não escondidas: `image-size` 1.x (dois altos, cadeia Metro/Expo),
`uuid` 7/9 (moderado, inclui cadeia de Functions), `glob` 13 e `minimatch` 9/10
(moderados, ferramentas Expo) e `deepmerge` (baixo, sem versão corrigida indicada).
Os cinco primeiros exigem avaliar versões principais e consumidores; não foram
forçados para APIs incompatíveis. Auditar novamente após atualização do Expo e
dos SDKs. Ausência de críticos não significa ausência de vulnerabilidades.

## CAPTCHA e rollout web

No início, a API reCAPTCHA Enterprise estava desabilitada e o web app não tinha
provedor App Check registrado. Após autorização explícita do usuário para
ativação no Google e preparação de rollout **somente web**, foram concluídos:

- APIs reCAPTCHA Enterprise e Firebase App Check habilitadas em `xolot-384e9`;
  Identity Platform inicializado (subtype `IDENTITY_PLATFORM`). Chave de produção
  baseada em score criada, sem score de teste. Somente `xolot.com.br`,
  `www.xolot.com.br`, `xolot.web.app` e o hostname exato do preview estão
  autorizados. `localhost` e `127.0.0.1` não foram adicionados a essa chave.
- Provedor Enterprise registrado no único web app, limiar 0,5 e TTL de 3.600 s.
  O enforcement dos serviços App Check não foi habilitado.
- Identity Platform configurado em **AUDIT** para e-mail/senha, com regra de
  score 0,5. AUDIT coleta sinais; não bloqueia requisições sem CAPTCHA. O
  estado do provedor de telefone não foi alterado. As chaves de reCAPTCHA
  administradas pelo Auth não foram editadas ou removidas.
- `.env.production.local`, ignorado pelo Git, define a chave pública App Check,
  `EXPO_PUBLIC_FIREBASE_WEB_API_KEY`, `EXPO_PUBLIC_REQUIRE_WEB_APP_CHECK=true`,
  `EXPO_PUBLIC_REQUIRE_APP_CHECK=false` e o preload de Auth. O código seleciona
  a chave específica e a exigência adicional somente no web. Android/iOS usam
  a chave compartilhada e não recebem a exigência web, mesmo se o arquivo de
  ambiente de produção for carregado. Essas flags não ativam enforcement no
  servidor. Quatro testes novos cobrem esse isolamento e o fallback legado.
- Domínios Auth foram acrescidos de `www.xolot.com.br`, `xolot.web.app` e
  do preview. Os domínios anteriores foram preservados.
- Build web aprovado e publicado apenas no canal temporário
  `folko-security-web`, versão limpa `22faf794e3af824a`, bundle
  `index-910ad1faa040caaaf8bb5be043d15742.js`. O gerador verificou que o bundle
  contém a chave web nova e a site key de produção.

Preview: <https://xolot--folko-security-web-10rou0lb.web.app>.
Expiração observada: `2026-11-07T12:18:58Z` (09:18:58 de 07/11 em São Paulo).
A página temporária `/security-check.html` carregou o SDK oficial e permitiu
validar emissão e assinatura de um token real, incluindo rejeição de assinatura
adulterada. O teste de entrada usa uma identidade aleatória em `example.invalid`;
não cria conta, não envia e-mail e não usa credenciais reais. O usuário autorizou
os dois testes no momento da execução. O primeiro ensaio mostrou App Check 403:
a API pública ainda estava desabilitada, embora endpoints administrativos
permitissem configurar o provedor. Essa dependência foi habilitada.

Após ativar App Check e Identity Platform, o ensaio mostrou App Check HTTP 400
`FAILED_PRECONDITION` na chamada a CreateAssessment e Auth HTTP 500
`INTERNAL` ao consultar a configuração pública. Os três serviços constam ENABLED
e a chave pertence ao projeto correto. O agente App Check recebeu automaticamente
seu papel padrão com a habilitação da API. O agente Identity Platform e seu
binding padrão estavam ausentes. Os logs do Google registraram negação de
`recaptchaenterprise.keys.create` nas tentativas de provisionar as chaves do
Auth. Um teste REST de entrada com identidade inexistente retornou
`INVALID_LOGIN_CREDENTIALS`, confirmando que esse caminho comum ainda valida
credenciais, embora o preload de CAPTCHA do Auth estivesse indisponível.

Após a propagação da ativação e reaplicar a mesma configuração de provedor,
sem mudar chave, score, IAM ou enforcement, o App Check **emitiu um token real
válido** no navegador. O teste verificou assinatura RS256 contra as chaves
públicas do Google, emissor, audiência, app ID e expiração; adulterar a assinatura
causou rejeição criptográfica. Não foi usado token de debug nem score de teste.
O token não foi exibido ou salvo nas evidências. Isso valida a atestação App
Check, sem comprovar que os serviços a exigem. Em 06/11, os mesmos critérios
foram aprovados novamente com a chave web restrita. Evidência atual:
`output/testes/captcha-web-restrito-ui-result.json` e
`output/testes/captcha-web-restrito-validado.jpg`. Nenhum token completo foi
registrado. A prova anterior foi preservada como histórico.

O procedimento oficial exige provisionar
`service-239260393879@gcp-sa-identitytoolkit.iam.gserviceaccount.com` e conceder
**somente** `roles/identitytoolkit.serviceAgent` nesse projeto. Esse papel permite
ao agente gerenciar chaves/avaliações reCAPTCHA e invocar Cloud Functions; deve
ser concedido apenas ao agente oficial, não a usuários ou runtimes do app.
A revisão automática inicialmente recusou a execução por exigir autorização
específica. O usuário aprovou expressamente o agente e o papel; em 06/11 o
agente foi provisionado e o binding padrão aplicado, preservando os outros
bindings com o etag da política. Os papéis dos runtimes não foram alterados.
Auth continua em AUDIT. A configuração pública reCAPTCHA passou a retornar
HTTP 200 com a chave gerenciada do Auth para os seis hosts aprovados. Após
confirmação do usuário no momento da execução, o teste real do SDK com a chave
web nova passou: `initializeRecaptchaConfig` concluiu, e a entrada fictícia
retornou `auth/invalid-credential`, sem criar conta. A tentativa REST sem CAPTCHA
retornou `INVALID_LOGIN_CREDENTIALS`, como esperado em AUDIT. Isso comprova o
fluxo de inicialização e validação de credenciais; não comprova rejeição de bots
nem o fluxo de uma conta real autenticada.

A própria tela do aplicativo foi aberta com o novo build. A entrada fictícia
exibiu **"E-mail ou senha inválidos."**, voltou a habilitar o formulário e não
mostrou erro interno. A tela foi recarregada com campos vazios para o
demonstrativo. Nenhuma senha de usuário, e-mail real ou conta de teste foi usada.
Depois disso, a página de diagnóstico foi removida do artefato, o service worker
foi regenerado (15 URLs, 5,13 MB) e o preview limpo foi publicado e reaberto.
O hash do bundle é o mesmo do teste técnico da versão `b4dd60c3c87176ae`.
Provas: `output/testes/folko-login-chave-restrita-teste.jpg` e
`output/testes/folko-preview-seguranca-login.jpg`.
Referência: [pré-requisito de agente do Identity Platform](https://docs.cloud.google.com/identity-platform/docs/recaptcha-enterprise#create_a_service_account).

Próximos critérios do rollout:

1. Concluído no preview: assinatura RS256, emissor, audiência, web app, validade
   e assinatura adulterada recusada. Continuar sem registrar tokens completos.
2. Concluído: fluxo do SDK Auth com identidade inexistente, resposta sem CAPTCHA
   e erro apresentado na tela de login. Em AUDIT, a ausência de CAPTCHA chega à
   validação de credenciais; isso não comprova bloqueio de bots.
3. Testar login/cadastro/recuperação reais, acessibilidade e métricas de
   atestação com usuários válidos. Não baixar o score só para passar automação.
4. Concluído no preview: página de diagnóstico removida e service worker
   regenerado. Promoção ao site principal continua separada da preparação e
   dos testes autorizados. Confirmar a versão live a preservar como rollback
   imediatamente antes de uma promoção aprovada.
5. Fazer rollout de enforcement separado da publicação do cliente. Auth
   `ENFORCE`, App Check de Firestore/Storage e `ENFORCE_APP_CHECK=true` nos
   comandos compartilhados podem afetar Android/iOS. A autorização somente
   web não foi interpretada como autorização para bloquear esses consumidores.
   Validar provedores nativos ou separar o caminho web antes de exigir proteção
   global. No código preparado, tokens ausentes/consumidos são recusados quando
   o guard está ativo; consumo de uso único não foi habilitado.
6. Ao encerrar o canal, remover o hostname temporário das listas de App Check,
   Auth e referrers da chave web. Não remover domínios permanentes nem chaves
   gerenciadas pelo Auth.

A política de senha consultada permanece OFF, embora os requisitos de
tamanho/complexidade já estivessem definidos. A proteção contra enumeração
de e-mail estava habilitada. Não houve mudança desses controles nesta etapa.

### Chave Firebase exclusiva web — aplicada no preview

A revisão automática rejeitou a tentativa de alterar a chave compartilhada:
reduzir APIs e adicionar referrers locais não estavam especificamente
autorizados, com risco para consumidores existentes. A ação não foi executada.

A alternativa aprovada foi criar uma chave separada e limitar o uso web aos
hosts de produção/preview, com padrões de origem e caminho, e às
APIs `identitytoolkit.googleapis.com`, `securetoken.googleapis.com`,
`firestore.googleapis.com`, `firebasestorage.googleapis.com`,
`firebaseappcheck.googleapis.com`, `firebaseinstallations.googleapis.com` e
`firebase.googleapis.com`. Os 27 serviços atuais e a ausência de referrers
permanecem intactos. Incluir um referrer não autoriza esse domínio a ler dados;
Rules e autenticação continuam necessárias.

Em 06/11, após autorização específica do usuário, foi criada a chave
`projects/239260393879/locations/global/keys/folko-web-production`, com somente
as sete APIs listadas e os hosts `xolot.com.br`, `www.xolot.com.br`, `xolot.web.app`,
`xolot-384e9.firebaseapp.com`, `xolot-384e9.web.app` e o hostname exato do preview,
com origem e caminho (12 padrões de referrer); sem localhost. Sua string foi
gravada somente na variável web do arquivo ignorado `.env.production.local` e
usada no build de teste; nenhuma variável do CI foi alterada. `.env` e a chave
dos clientes nativos foram preservados. O hash das restrições da chave original
é idêntico antes/depois. Restringir essa chave compartilhada ainda exige
inventariar seus consumidores e planejar migração nativa.

Nove probes isolados contra a configuração pública Auth confirmaram HTTP 200
e chave gerenciada presente para os seis hosts autorizados. Origem ausente,
`https://not-authorized.example.invalid/` e `http://localhost:8082/` retornaram
HTTP 403 `API_KEY_HTTP_REFERRER_BLOCKED`. Isso verifica as restrições da chave;
referrers podem ser falsificados fora do navegador, portanto não substituem
Rules, autenticação e atestação no servidor. Evidência:
`output/testes/web-key-verification.json`.

## Infraestrutura pendente

A política IAM do projeto não tem bindings públicos, e os runtimes consultados
não têm chaves de conta de serviço geradas por usuário. Entretanto, **as 24
Functions compartilham dois runtimes com `roles/editor`**, um privilégio amplo.
Preparar identidades separadas e validar em staging antes de remover Editor:

| Responsabilidade | Permissões a ensaiar | Limite necessário |
| --- | --- | --- |
| Social, métricas, recibos, tags | Firestore `datastore.user` | Sem administração do projeto ou acesso a segredos R2/pagamentos |
| Cadastro/exclusão de conta | Firestore e Firebase Auth Admin apenas onde necessário | Exclusão exige autenticação recente e propriedade |
| Mídia/avatar e limpeza | Firestore e Secret Accessor nos dois segredos R2 | Firebase Storage legado exige acesso apenas aos buckets usados |
| Pagamentos/webhook | Firestore e Secret Accessor nos segredos de pagamento exigidos por função | Webhook conserva verificação de assinatura; sem credenciais R2 |
| Triggers/eventos | Papéis de entrega/invocação específicos do serviço | Separar identidade de entrega da identidade de execução quando aplicável |

Esta matriz é proposta de menor privilégio; não foi aplicada ao IAM. Falta
inventariar políticas de recurso/herdadas e os acessos Cloudflare/R2. O PITR,
agendamento e ensaio de restauração de backups devem ter uma etapa própria.

## Princípios de armazenamento

Metadados sociais permanecem no Firestore; mídia no armazenamento de objetos;
senhas e identidades no Firebase Auth. Credenciais de R2 e pagamentos pertencem
ao Secret Manager, acessível apenas ao backend. Guardá-las em uma coleção lida
pelo aplicativo não as protege. Chaves públicas de configuração do Firebase e
site keys de reCAPTCHA identificam o aplicativo; autorização depende de Rules,
tokens e verificações do servidor.

## Implantação

Na preparação da etapa de segurança, as mudanças do aplicativo ficaram apenas
no preview; Functions e Rules dessa etapa **não foram publicadas**.
O readback dessa preparação confirmou o preview `22faf794e3af824a` e o live
`1031b69f935120f3`. O bundle servido tem o mesmo SHA-256 do artefato testado;
a página de diagnóstico não é mais servida e não aparece no service worker.
A raiz do preview responde HTTP 200 com `no-cache, max-age=0, must-revalidate`.
Evidência: `output/testes/preview-final-verification.json`.

Em publicação posterior autorizada em 06/11, o ajuste de interesses foi isolado
no commit `2d5a6d3`: retirada da área textual duplicada, seleção existente de
hashtags preservada e regra de perfil compatível com `sport` vazio. Esse ajuste
foi publicado em `xolot.com.br` e `xolot.web.app`, versão `f3530745811e0c85`, e
enviado à main com CI aprovada. A regra publicada nessa operação contém apenas
a mudança de validação da área; a restrição de posts e os comandos/guardas da
auditoria continuam pendentes de seu rollout próprio. A configuração Firebase
do site foi preservada; a chave web restrita continua no preview de segurança.
Provas da publicação isolada: `output/testes/publicacao-interesses-20261106/`.

No Google foram adicionados os quatro índices e a configuração de CAPTCHA e
domínios descrita acima; nenhum documento de usuário, segredo, Rule ou papel
IAM dos runtimes foi alterado. A ativação App Check provisionou automaticamente
seu agente e binding de serviço padrão; o agente e binding Identity Platform
foram aplicados após autorização específica. A chave Firebase compartilhada
permanece inalterada, e a chave nova é usada somente no preview web. O código das Rules
é um protótipo testado, sujeito à revisão e ao rollout dos clientes. Clientes
antigos que ainda consultam posts sem filtrar `status=published` precisam ser
atualizados antes de exigir essa restrição no servidor.

Testes de burst usam somente o projeto demo e loopback. Não demonstram resistência
a DDoS volumétrico nem medem latência de rede/cold start em produção. A ativação
de App Check deve acompanhar clientes compatíveis e métricas de atestação;
ativá-lo antes disso bloqueia usuários legítimos. Índices novos precisam estar
READY antes de publicar consumidores. WAF, IAM e backups devem ser verificados
nos provedores; não são garantidos por mudanças no cliente.

O tráfego direto para `cloudfunctions.net` não atravessa automaticamente o proxy
do domínio `xolot.com.br`. A auditoria não verificou as regras de borda Cloudflare.
Planejar WAF/rate limiting no caminho realmente usado, inclusive a proteção da
origem. CORS e limites de instâncias não comprovam resistência a DDoS volumétrico.

## Validação e medições

| Verificação | Resultado |
| --- | --- |
| Domínio e compatibilidade Node | 221 testes aprovados; inclui quatro novos contratos de isolamento web/nativo |
| Backend e contrato de exports | 29 testes aprovados; 24 exports preservados |
| Rules, concorrência e integração emulada | 39 testes aprovados |
| Interface e hooks | 31 testes aprovados na suíte completa, 12 suites |
| Tipos do app/backend, lint e formatação | Aprovados; 22 diagnósticos legados de lint, nenhuma regressão |
| Catálogo/índices | 10 consultas e 8 definições conferidas; quatro índices ativados nesta etapa |
| Pacote Functions isolado | Instalação congelada, compilação e carga dos 24 exports aprovadas |
| Build web | Aprovado; bundle de aproximadamente 4,12 MB, precache 5,13 MB |
| CAPTCHA web | Token real com chave nova validado; SDK Auth e tela de login passaram com credenciais fictícias; Auth AUDIT |
| Chave web | Nove probes aprovados: seis hosts aceitos e três origens recusadas; chave original preservada |
| Scanner de código e export | 472 arquivos no preview limpo; nenhum padrão conhecido de segredo detectado |
| Acesso anônimo em produção | Cinco probes isolados rejeitados com HTTP 401 |

As quatro suítes funcionais somam **320 testes aprovados** (221 domínio, 29
backend, 39 Rules/integração emulada e 31 interface). Domínio e interface foram
reexecutados após separar as políticas web/nativas; o backend e as Rules não
mudaram desde a execução registrada na etapa anterior. Tipos do app, lint e
formatação também passaram após essa alteração, sem novas regressões.

Amostra de **12 operações de cada tipo**, em loopback, com verificação de
registro e quota transacional incluídas. P95 é o maior valor nessa amostra pequena.

| Medida | Mediana | P95 |
| --- | ---: | ---: |
| Confirmar curtida | 105,3 ms | 113,6 ms |
| Confirmar visualização | 102,0 ms | 129,3 ms |
| Curtida observada no listener | 108,2 ms | 127,8 ms |
| Confirmar envio de mensagem | 98,3 ms | 152,1 ms |
| Mensagem observada pelo destinatário | 98,5 ms | 152,2 ms |
| Confirmar recibo | 96,7 ms | 145,0 ms |

Não são medições de produção nem um SLA: excluem internet, cold start e o
provedor de CAPTCHA. Resposta visual otimista é verificada antes de resolver a
promessa do backend; não se atribui latência de 0 ms à renderização real.

O burst emulado usou 40 chamadas, concorrência máxima 4 e duas instâncias do
limiter. Aceitou 5, recusou 35, isolou outra conta e reabriu após a janela. A câmera
foi testada com streams simulados; ainda falta ensaio em hardware Android/iOS e
dispositivos web reais. Não foram feitos ataques de carga contra produção.

Evidências locais: `data-config-audit.json`, `data-integrity-audit.json`,
`security-inventory-private.json`, `runtime-iam-audit.json`,
`public-endpoint-audit.json`, `query-index-activation.json`,
`query-index-verification.json`, `latency-local.json`, `abuse-local.json`,
`captcha-web-rollout.json`, `captcha-web-ui-result.json`,
`captcha-service-readiness.json`, `captcha-appcheck-errors.json`,
`web-key-verification.json`, `captcha-web-restrito-ui-result.json` e
`preview-final-verification.json`, todos em `output/testes/`. Logs de execução
ficam em `tmp/security-*.log` e `tmp/captcha-*.log`; o scan final está em
`tmp/captcha-security-scan-final.json`.

Referências: [chaves públicas Firebase](https://firebase.google.com/docs/projects/api-keys),
[App Check web](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider),
[enforcement de Functions](https://firebase.google.com/docs/app-check/cloud-functions),
[bot protection de Auth](https://docs.cloud.google.com/identity-platform/docs/recaptcha-enterprise)
e [proteção de DDoS Cloudflare](https://developers.cloudflare.com/ddos-protection/).
