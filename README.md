# NextStar

Aplicativo mobile-first para descoberta, envio e moderacao de videos de atletas de futebol.

## Estado atual

- Interface React Native com Expo e TypeScript para Android, iOS e web.
- Identidade visual clara em verde, branco e tons neutros.
- Icone do app com o simbolo NextStar e splash animada com a marca completa.
- Feed vertical com video 9:16, reproducao automatica, som, tela cheia e ficha expansivel.
- Video demonstrativo real de 5 segundos enquanto nao houver publicacao aprovada.
- Conta comum `Usuario` com Feed, Envio, Carteira e Perfil no mesmo acesso.
- Bolsa simulada vinculada ao perfil do atleta, separada do video de apresentacao.
- Envio por galeria ou link direto, com validacao e confirmacao animada.
- Moderacao local por perfil Admin: aprovar, pedir ajustes ou reprovar.
- Solicitacoes revisadas saem imediatamente da fila administrativa.
- Videos reais aprovados substituem o perfil demonstrativo.
- Score, risco, metricas e valores financeiros so aparecem quando existe uma avaliacao explicita.
- Saldo, depositos, aportes e bolsas permanecem simulados, sem pagamento, saque ou contrato real.

## Teste online

A versao web e publicada em:

https://pedrobarberini.github.io/NextStar/

O estado ainda fica apenas na memoria do navegador. Recarregar a pagina apaga contas, saldos, depositos, envios, moderacoes e reservas criadas durante o teste.

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

## Fluxo principal de teste

1. Crie uma conta como `Usuario` e envie um video.
2. Saia e crie uma conta como `Admin`.
3. Aprove, reprove ou solicite ajustes no envio.
4. Confirme que a solicitacao revisada saiu da fila.
5. Abra o `Feed` e confira o video aprovado.
6. Verifique que publicacoes sem avaliacao nao exibem score, risco, box de aviso ou valores inventados.
7. Na `Carteira`, use `Depositar` para adicionar saldo simulado.
8. Abra o perfil demonstrativo e transfira saldo para a bolsa do atleta.
9. Confirme que o saldo diminui e o valor captado da bolsa aumenta.
10. Para testar como atleta, envie e aprove um video, volte a mesma conta e abra uma bolsa pelo Perfil.
11. Complete a meta e confirme o aviso de busca por contratantes no Perfil do atleta.

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
