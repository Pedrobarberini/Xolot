# Xolot

Aplicativo mobile-first para descoberta e publicação de vídeos de atletas de futebol.

## Estado atual

- Interface React Native com Expo e TypeScript para Android, iOS e web.
- Identidade visual clara em verde, branco e tons neutros.
- Ícone do app com o símbolo Xolot e splash animada com a marca completa.
- Início com vídeos verticais 9:16, reprodução automática, controle vertical de volume, tela cheia e ficha expansível.
- Logo fixa no feed e HUD contextual padronizado com voltar, marca e saldo nas páginas públicas.
- Vídeo demonstrativo real de 5 segundos enquanto não houver publicação de usuário.
- Login por email e senha como tela inicial, com salt e hash persistidos no dispositivo.
- Cadastro local simplificado para email, senha e aceite dos termos; novos cadastros são sempre contas Usuário.
- Login com Google via Firebase Auth (popup na web; OAuth + credential no mobile).
- Primeiro acesso abre um modal obrigatório para username, nome, biografia, idade, posição, cidade e clube ou projeto.
- Conta comum `Usuário` com Início, Envio, Pesquisar, Mensagens e Perfil no mesmo acesso.
- Pesquisa por nome, posição, cidade ou clube abre diretamente o perfil público do atleta.
- Perfis podem ser seguidos pelo Início ou pela página pública, com estado persistente e contagem social.
- Vídeos de perfis seguidos recebem prioridade no Início sem ocultar os demais atletas.
- Mensagens separa conversas liberadas de solicitações enviadas por perfis ainda não seguidos.
- Uma solicitação inicial é permitida; mensagens recebidas e respostas são liberadas ao seguir o perfil.
- Páginas e subpáginas usam a mesma transição suave de entrada, mantendo header e footer estáveis.
- A descrição `Ver mais` expande e recolhe suavemente sobre o vídeo.
- Perfil possui menu de três barras com Configurações, Carteira e Sair da conta.
- Configurações oferece `Editar perfil` com o mesmo formulário usado no primeiro acesso.
- Configurações permite escolher, enquadrar ou trocar a foto pública do perfil.
- Tocar na própria foto abre uma HUD com a imagem inteira e um recorte circular arrastável e redimensionável de 30% a 100%; posição e tamanho ficam persistidos no Início, Pesquisa, Mensagens, Perfil e página da bolsa.
- Perfil principal funciona como vitrine, exibe a biografia e o clube informados, possui galeria de vídeos publicados e estado vazio para novas contas.
- Configurações concentra preferências, verificação/KYC, dados da Conta Xolot e gestão da bolsa.
- Bolsa simulada vinculada ao perfil do atleta, separada do vídeo de apresentação.
- Perfil público acessível pelo feed, com todos os vídeos publicados do atleta e o estado da bolsa.
- Legenda expandida do feed mostra bolsa aberta, valores captados, meta e progresso real.
- Envio por galeria ou link direto, com dados do atleta reutilizados do perfil, texto da publicação, validação e confirmação animada.
- Durante os testes, novos vídeos são publicados diretamente no Início e no perfil, sem fila manual.
- O dono pode excluir um vídeo pela própria galeria; a publicação sai imediatamente do Início e do perfil.
- O campo `Objetivo do aporte` foi removido das postagens; a bolsa continua vinculada ao perfil do atleta.
- A biografia permanece exclusiva do perfil e não é copiada para as postagens.
- Nome público e `@username` são identidades separadas: nomes podem se repetir, usernames e emails não.
- Nos perfis e no Início, o `@username` aparece como identidade principal e o nome do jogador como informação secundária.
- A pesquisa encontra atletas pelo nome ou username, e mensagens para a própria conta dispensam follow.
- Vídeos escolhidos no navegador ficam no IndexedDB e sobrevivem ao recarregamento local da página.
- O Início pausa o vídeo anterior assim que outro item se torna o mais visível.
- Vídeos reais publicados substituem o perfil demonstrativo.
- Score, risco, métricas e valores financeiros só aparecem quando existe uma avaliação explícita.
- Saldo, depósitos, aportes e bolsas permanecem simulados, sem pagamento, saque ou contrato real.
- Carteira, acessada pelo menu do Perfil, mostra saldo, depósito, valor em reais e porcentagem da cota adquirida.
- Usuários, sessão, publicações, saldos, bolsas e investimentos usam repository local versionado.
- O repository possui testes de fallback, migração, serialização e persistência.

## Teste online

A versão web é publicada em:

https://pedrobarberini.github.io/NextStar/

Follows, contatos, mensagens, fotos, contas, credenciais locais, perfis, sessão, saldos, publicações, bolsas e investimentos ficam persistidos neste dispositivo. O registro e o arquivo local da postagem sobrevivem ao refresh no mesmo navegador; disponibilidade entre aparelhos depende de upload para storage remoto.

A versão web é um PWA: no Chrome/Edge/Safari é possível instalar o Xolot na tela inicial ou como aplicativo. O service worker faz cache dos assets para uso offline básico após a primeira visita.

## Como rodar

Requisitos: Node.js 22 ou superior e pnpm 11.

```bash
pnpm install
cp .env.example .env
pnpm start --tunnel
```

O modo `--tunnel` permite abrir o projeto no Expo Go mesmo quando computador e celular não estão na mesma rede local.

### Login com Google (Firebase)

O Firebase UI do React web não é usado aqui. A integração é:

- **Web / PWA:** Firebase Auth com `signInWithPopup` (Google).
- **iOS / Android:** `expo-auth-session` obtém o ID token e o Firebase conclui com `signInWithCredential`.

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/) e ative **Authentication > Sign-in method > Google**.
2. Em Project settings, copie as chaves do app web para o `.env` (`EXPO_PUBLIC_FIREBASE_*`).
3. No Google Cloud Console vinculado ao Firebase, copie o **OAuth 2.0 Client ID** do tipo Web para `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.
4. Em Authentication > Settings > Authorized domains, inclua `localhost` e `pedrobarberini.github.io` (GitHub Pages).
5. Reinicie o Expo após alterar o `.env`.
6. Para o GitHub Pages, cadastre as mesmas chaves como Secrets do repositório (nomes iguais aos do `.env.example`). O workflow de deploy já as injeta no `build:web`.

Sem essas variáveis, o botão Google mostra o aviso de configuração e o login por email/senha continua funcionando.

Para gerar a versão web usada pelo GitHub Pages:

```bash
pnpm run build:web
```

Para executar os testes do repository local:

```bash
pnpm test
```

## Arquitetura do frontend

O `App.tsx` mantém somente estado compartilhado, composição e roteamento local. O restante está organizado em:

- `src/screens/`: telas de autenticação, início, envio, pesquisa, mensagens, moderação, carteira e perfil.
- `src/components/`: shell visual, navegação e componentes compartilhados.
- `src/actions/`: handlers de produto, formatadores e builders de dados.
- `src/repositories/`: schema versionado e adaptador de persistência do estado principal.
- `src/services/`: persistência local dos domínios social e de perfil.
- `src/styles/`: estilos React Native extraídos do componente raiz.
- `src/constants/` e `src/ui/`: constantes de layout, assets e tipos de interface.

As próximas subdivisões planejadas, como `VideoPlayer`, `VideoCard`, `AppToast` e estilos por domínio, estão marcadas em `backlog.md`.

## Fluxo principal de teste

1. Na tela inicial de login, toque em `Cadastrar` e crie uma conta usando email e senha.
2. Complete username, nome, biografia, idade, posição, cidade e clube ou projeto no modal de primeiro acesso.
3. Abra `Perfil > Configurações > Editar perfil`, altere um dado e confirme a atualização no Perfil.
4. Publique um vídeo e confirme o toast de sucesso no rodapé.
5. Abra o `Início` e o Perfil e confirme que o vídeo apareceu imediatamente.
6. Na galeria do próprio Perfil, toque na lixeira, confirme a exclusão e confira que o vídeo saiu também do Início.
7. Verifique que a postagem mostra apenas título e texto, sem `Objetivo do aporte`.
8. Verifique que publicações sem avaliação não exibem score, risco, box de aviso ou valores inventados.
9. Abra `Perfil`, toque no menu de três barras e entre em `Carteira`.
10. Use `Depositar` para adicionar saldo simulado.
11. Abra o perfil demonstrativo e transfira saldo para a bolsa do atleta.
12. Toque no avatar ou no nome do autor para abrir o perfil e alternar entre os vídeos publicados.
13. Pesquise uma conta pela aba `Pesquisar`; usuários sem vídeo também aparecem e abrem um perfil público vazio.
14. No perfil visitado, toque no ícone de mensagem, escreva uma mensagem e confirme que ela aparece na conversa.
15. Volte para a lista de conversas e reabra o histórico criado durante a sessão.
16. No perfil visitado, toque em um vídeo para voltar ao reel correspondente ou use `Investir` para abrir a página da bolsa; use o `X` para retornar ao perfil.
17. Perfis sem bolsa em captação exibem a ação de investimento desabilitada.
18. Ao abrir um vídeo pela galeria, use a seta no Início para retornar ao mesmo perfil.
19. Expanda a legenda do vídeo e confira o estado e o progresso da bolsa abaixo das hashtags.
20. Use `Investir` na legenda expandida e confirme que a bolsa do mesmo perfil foi aberta.
21. Em Perfil > Configurações, escolha uma foto, arraste o círculo sobre a imagem, ajuste o tamanho entre 30% e 100% e confira a mesma composição no Perfil, Início e Pesquisa.
22. Confirme que o saldo diminui e que a Carteira mostra o valor e a porcentagem da cota comprada.
23. Para testar como atleta, publique um vídeo e abra uma bolsa pelo Perfil.
24. Complete a meta e confirme o aviso de busca por contratantes no Perfil do atleta.
25. Recarregue a página e confirme que a sessão, perfil, saldo e postagens continuam disponíveis.

## Antes da abertura ao público

- Implementar autenticação e sessões reais.
- Persistir usuários, vídeos e consentimentos em backend.
- Armazenar mídia em bucket privado com processamento e verificação de formato.
- Implementar moderação automática de vídeo e texto, com fila humana somente para exceções e recursos.
- Adicionar trilha de auditoria, denúncia, bloqueio e política de conteúdo.
- Aplicar LGPD, proteção de menores, termos e controles de acesso.
- Validar juridicamente qualquer oferta, reserva ou distribuição financeira.
- Definir enquadramento CVM da oferta e contratar plataforma autorizada ou outro parceiro regulado antes de captar dinheiro real.
- Integrar instituição financeira ou de pagamento autorizada para custódia e transferência de recursos.
- Adicionar monitoramento, testes automatizados e recuperação de falhas.

O plano de evolução está em `docs/product-plan.md`. A origem do vídeo demonstrativo está documentada em `docs/third-party-assets.md`.
