# NextStar

Aplicativo mobile-first para descoberta, envio e moderacao de videos de atletas de futebol.

## Estado atual

- Interface React Native com Expo e TypeScript para Android, iOS e web.
- Identidade visual clara em verde, branco e tons neutros.
- Icone do app com o simbolo NextStar e splash animada com a marca completa.
- Inicio com videos verticais 9:16, reproducao automatica, controle vertical de volume, tela cheia e ficha expansivel.
- Logo fixa no feed e navegacao persistente no perfil publico, com HUD horizontal compacto de voltar/saldo e footer sempre acessiveis.
- Video demonstrativo real de 5 segundos enquanto nao houver publicacao aprovada.
- Conta comum `Usuario` com Inicio, Envio, Pesquisar, Mensagens e Perfil no mesmo acesso.
- Pesquisa por nome, posicao, cidade ou clube abre diretamente o perfil publico do atleta.
- Mensagens possui uma area propria e estado vazio sem conversas demonstrativas.
- Perfil possui menu de tres barras com Configuracoes, Carteira e Sair da conta.
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

## Teste online

A versao web e publicada em:

https://pedrobarberini.github.io/NextStar/

O estado ainda fica apenas na memoria do navegador. Recarregar a pagina apaga contas, saldos, depositos, envios, moderacoes e reservas criadas durante o teste.

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

## Arquitetura do frontend

O `App.tsx` mantem somente estado compartilhado, composicao e roteamento local. O restante esta organizado em:

- `src/screens/`: telas de autenticacao, inicio, envio, pesquisa, mensagens, moderacao, carteira e perfil.
- `src/components/`: shell visual, navegacao e componentes compartilhados.
- `src/actions/`: handlers de produto, formatadores e builders de dados.
- `src/styles/`: estilos React Native extraidos do componente raiz.
- `src/constants/` e `src/ui/`: constantes de layout, assets e tipos de interface.

As proximas subdivisoes planejadas, como `VideoPlayer`, `VideoCard`, `AppToast` e estilos por dominio, estao marcadas em `backlog.md`.

## Fluxo principal de teste

1. Crie uma conta como `Usuario` e envie um video.
2. Saia e crie uma conta como `Admin`.
3. Aprove, reprove ou solicite ajustes no envio.
4. Confirme que a solicitacao revisada saiu da fila.
5. Abra o `Inicio` e confira o video aprovado.
6. Verifique que publicacoes sem avaliacao nao exibem score, risco, box de aviso ou valores inventados.
7. Abra `Perfil`, toque no menu de tres barras e entre em `Carteira`.
8. Use `Depositar` para adicionar saldo simulado.
9. Abra o perfil demonstrativo e transfira saldo para a bolsa do atleta.
10. Use o icone ao lado do nome para abrir o perfil e alternar entre os videos publicados.
11. Pesquise um atleta pela aba `Pesquisar` e abra o perfil encontrado.
12. Confira o estado vazio honesto da aba `Mensagens`.
13. Expanda a legenda do video e confira o estado e o progresso da bolsa abaixo das hashtags.
14. Confirme que o saldo diminui e que a Carteira mostra o valor e a porcentagem da cota comprada.
15. Para testar como atleta, envie e aprove um video, volte a mesma conta e abra uma bolsa pelo Perfil.
16. Complete a meta e confirme o aviso de busca por contratantes no Perfil do atleta.

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
