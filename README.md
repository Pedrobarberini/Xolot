# NextStar

Aplicativo mobile-first para descoberta, envio e moderacao de videos de atletas de futebol.

## Estado atual

- Interface React Native com Expo e TypeScript para Android, iOS e web.
- Identidade visual clara em verde, branco e tons neutros.
- Icone do app com o simbolo NextStar e splash animada com a marca completa.
- Inicio com videos verticais 9:16, reproducao automatica, controle vertical de volume, tela cheia e ficha expansivel.
- Logo fixa no feed e HUD contextual padronizado com voltar, marca e saldo nas paginas publicas.
- Video demonstrativo real de 5 segundos enquanto nao houver publicacao aprovada.
- Cadastro e login locais por email e senha, com salt e hash persistidos no dispositivo.
- Primeiro acesso solicita nome, biografia, idade, posicao, cidade e clube ou projeto antes de liberar o aplicativo.
- Conta comum `Usuario` com Inicio, Envio, Pesquisar, Mensagens e Perfil no mesmo acesso.
- Pesquisa por nome, posicao, cidade ou clube abre diretamente o perfil publico do atleta.
- Perfis podem ser seguidos pelo Inicio ou pela pagina publica, com estado persistente e contagem social.
- Videos de perfis seguidos recebem prioridade no Inicio sem ocultar os demais atletas.
- Mensagens separa conversas liberadas de solicitacoes enviadas por perfis ainda nao seguidos.
- Uma solicitacao inicial e permitida; mensagens recebidas e respostas sao liberadas ao seguir o perfil.
- Paginas e subpaginas usam a mesma transicao suave de entrada, mantendo header e footer estaveis.
- A descricao `Ver mais` expande e recolhe suavemente sobre o video.
- Perfil possui menu de tres barras com Configuracoes, Carteira e Sair da conta.
- Configuracoes oferece `Editar perfil` com o mesmo formulario usado no primeiro acesso.
- Configuracoes permite escolher, enquadrar ou trocar a foto publica do perfil.
- Tocar na propria foto abre uma HUD com a imagem inteira e um recorte circular arrastavel e redimensionavel de 30% a 100%; posicao e tamanho ficam persistidos no Inicio, Pesquisa, Mensagens, Perfil e pagina da bolsa.
- Perfil principal funciona como vitrine, exibe a biografia e o clube informados, possui galeria de videos aprovados e estado vazio para novas contas.
- Configuracoes concentra preferencias, verificacao/KYC, dados da Conta NextStar e gestao da bolsa.
- Bolsa simulada vinculada ao perfil do atleta, separada do video de apresentacao.
- Perfil publico acessivel pelo feed, com todos os videos aprovados do atleta e o estado da bolsa.
- Legenda expandida do feed mostra bolsa aberta, valores captados, meta e progresso real.
- Envio por galeria ou link direto, com validacao e confirmacao animada.
- Moderacao local por perfil Admin: aprovar, pedir ajustes ou reprovar.
- Solicitacoes revisadas saem imediatamente da fila administrativa.
- Videos reais aprovados substituem o perfil demonstrativo.
- Score, risco, metricas e valores financeiros so aparecem quando existe uma avaliacao explicita.
- Saldo, depositos, aportes e bolsas permanecem simulados, sem pagamento, saque ou contrato real.
- Carteira, acessada pelo menu do Perfil, mostra saldo, deposito, valor em reais e porcentagem da cota adquirida.
- Usuarios, sessao, envios, moderacao, saldos, bolsas e investimentos usam repository local versionado.
- O repository possui testes de fallback, migracao, serializacao e persistencia.

## Teste online

A versao web e publicada em:

https://pedrobarberini.github.io/NextStar/

Follows, contatos, mensagens, fotos, contas, credenciais locais, perfis, sessao, saldos, envios, moderacoes, bolsas e investimentos ficam persistidos neste dispositivo. O registro da postagem sobrevive ao refresh, mas um video escolhido da galeria ainda pode usar uma URI temporaria; disponibilidade entre aparelhos depende de upload para storage remoto.

A versao web e um PWA: no Chrome/Edge/Safari e possivel instalar o NextStar na tela inicial ou como aplicativo. O service worker faz cache dos assets para uso offline basico apos a primeira visita.

## Como rodar

Requisitos: Node.js 20.19 ou superior e pnpm.

```bash
pnpm install
pnpm start --tunnel
```

O modo `--tunnel` permite abrir o projeto no Expo Go mesmo quando computador e celular nao estao na mesma rede local.

Para gerar a versao web usada pelo GitHub Pages:

```bash
pnpm run build:web
```

Para executar os testes do repository local:

```bash
pnpm test
```

## Arquitetura do frontend

O `App.tsx` mantem somente estado compartilhado, composicao e roteamento local. O restante esta organizado em:

- `src/screens/`: telas de autenticacao, inicio, envio, pesquisa, mensagens, moderacao, carteira e perfil.
- `src/components/`: shell visual, navegacao e componentes compartilhados.
- `src/actions/`: handlers de produto, formatadores e builders de dados.
- `src/repositories/`: schema versionado e adaptador de persistencia do estado principal.
- `src/services/`: persistencia local dos dominios social e de perfil.
- `src/styles/`: estilos React Native extraidos do componente raiz.
- `src/constants/` e `src/ui/`: constantes de layout, assets e tipos de interface.

As proximas subdivisoes planejadas, como `VideoPlayer`, `VideoCard`, `AppToast` e estilos por dominio, estao marcadas em `backlog.md`.

## Fluxo principal de teste

1. Crie uma conta como `Usuario` usando email e senha.
2. Complete nome, biografia, idade, posicao, cidade e clube ou projeto no primeiro acesso.
3. Abra `Perfil > Configuracoes > Editar perfil`, altere um dado e confirme a atualizacao no Perfil.
4. Envie um video, saia e crie uma conta como `Admin`.
5. Aprove, reprove ou solicite ajustes no envio.
6. Confirme que a solicitacao revisada saiu da fila.
7. Abra o `Inicio` e confira o video aprovado.
8. Verifique que publicacoes sem avaliacao nao exibem score, risco, box de aviso ou valores inventados.
9. Abra `Perfil`, toque no menu de tres barras e entre em `Carteira`.
10. Use `Depositar` para adicionar saldo simulado.
11. Abra o perfil demonstrativo e transfira saldo para a bolsa do atleta.
12. Toque no avatar ou no nome do autor para abrir o perfil e alternar entre os videos publicados.
13. Pesquise uma conta pela aba `Pesquisar`; usuarios sem video tambem aparecem e abrem um perfil publico vazio.
14. No perfil visitado, toque no icone de mensagem, escreva uma mensagem e confirme que ela aparece na conversa.
15. Volte para a lista de conversas e reabra o historico criado durante a sessao.
16. No perfil visitado, toque em um video para voltar ao reel correspondente ou use `Investir` para abrir a pagina da bolsa; use o `X` para retornar ao perfil.
17. Perfis sem bolsa em captacao exibem a acao de investimento desabilitada.
18. Ao abrir um video pela galeria, use a seta no Inicio para retornar ao mesmo perfil.
19. Expanda a legenda do video e confira o estado e o progresso da bolsa abaixo das hashtags.
20. Use `Investir` na legenda expandida e confirme que a bolsa do mesmo perfil foi aberta.
21. Em Perfil > Configuracoes, escolha uma foto, arraste o circulo sobre a imagem, ajuste o tamanho entre 30% e 100% e confira a mesma composicao no Perfil, Inicio e Pesquisa.
22. Confirme que o saldo diminui e que a Carteira mostra o valor e a porcentagem da cota comprada.
23. Para testar como atleta, envie e aprove um video, volte a mesma conta e abra uma bolsa pelo Perfil.
24. Complete a meta e confirme o aviso de busca por contratantes no Perfil do atleta.
25. Recarregue a pagina e confirme que a sessao, perfil, saldo, postagens e decisoes de moderacao continuam disponiveis.

## Antes da abertura ao publico

- Implementar autenticacao e sessoes reais.
- Persistir usuarios, videos, consentimentos e moderacoes em backend.
- Armazenar midia em bucket privado com processamento e verificacao de formato.
- Adicionar trilha de auditoria, denuncia, bloqueio e politica de moderacao.
- Aplicar LGPD, protecao de menores, termos e controles de acesso.
- Validar juridicamente qualquer oferta, reserva ou distribuicao financeira.
- Definir enquadramento CVM da oferta e contratar plataforma autorizada ou outro parceiro regulado antes de captar dinheiro real.
- Integrar instituicao financeira ou de pagamento autorizada para custodia e transferencia de recursos.
- Adicionar monitoramento, testes automatizados e recuperacao de falhas.

O plano de evolucao esta em `docs/product-plan.md`. A origem do video demonstrativo esta documentada em `docs/third-party-assets.md`.
