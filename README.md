# NextStar

Aplicativo mobile para descobrir jogadores de futebol por video e simular aportes em contratos de participacao futura.

## Primeira parte entregue

- Base React Native com Expo e TypeScript.
- Feed de jogadores com cards de video mockados.
- Tela de detalhe com metricas, tese e simulacao de aporte.
- Carteira com resumo dos aportes simulados.
- Plano de produto inicial em `docs/product-plan.md`.

## Segunda parte entregue

- Entrada/cadastro mockado com escolha entre investidor e atleta.
- Perfil de usuario com status de verificacao e termos.
- Area do atleta para enviar video, dados esportivos e objetivo do aporte.
- Consentimento obrigatorio para atleta menor de idade.
- Fila local de videos com status `Em revisao`.

## Terceira parte entregue

- Maquete completa sem dinheiro real.
- Perfil `Admin` para moderar videos enviados por atletas.
- Aprovacao, reprova e pedido de ajustes em oportunidades.
- Videos aprovados aparecem no feed como oportunidades simuladas.
- Investidor cria uma reserva simulada, sem pagamento.
- Carteira acompanha a esteira futura: reserva, KYC, contrato, pagamento e distribuicao, tudo apenas simulado.
- Identidade visual atualizada com a logo NextStar, paleta preto/dourado e layout mais responsivo.

## Como testar a maquete

1. Entre como `Atleta` e envie um video.
2. Saia e entre como `Admin` para aprovar ou pedir ajustes.
3. Saia e entre como `Investidor`.
4. Abra uma oportunidade no feed e crie uma reserva simulada.
5. Va em `Carteira` e avance as etapas da simulacao.

## Como rodar

1. Instale Node.js 20.19 ou superior.
2. Instale as dependencias:

```bash
pnpm install
```

3. Inicie o app:

```bash
pnpm start
```

Depois escaneie o QR Code com o Expo Go, ou rode em um emulador Android/iOS.

## Observacao importante

O modelo de investimento em atleta pode envolver regras de valores mobiliarios, contratos de imagem, direito desportivo, KYC, AML e protecao de menores. Antes de aceitar dinheiro real, essa parte precisa ser validada com advogado e contador especializados.
