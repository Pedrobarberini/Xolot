# Custos do piloto Folko — 6 de novembro de 2026

Estimativa de planejamento; não é fatura, limite garantido ou teste de capacidade. Dez usuários simultâneos em horários de pico não equivalem a dez conexões permanentemente ativas. A consulta não alterou serviços, permissões ou cobrança.

## Medição disponível

- Firestore `(default)`, Standard, São Paulo: 718.178 bytes de dados e índices, aproximadamente 0,685 MiB, segundo métrica agregada do provedor.
- Janela de sete dias terminada em 2026-11-06T23:50:50Z: 10.424 leituras de documentos, 162 gravações e 572 requisições Cloud Run. Inclui desenvolvimento/verificações; não representa carga estável de dez usuários nem fatura completa.
- Bucket principal `xolot-media`: 31,99 MB, classe Standard, painel Cloudflare. Não é inventário completo de todos os buckets e imagens de build.
- Evidência privada/ignorada: `output/testes/imediatas-20261106/cost-baseline.json`. Script de consulta descartável: `tmp/read-cost-baseline.mjs`. Apenas métricas agregadas; nenhum corpo de documento social ou segredo foi lido.

## Premissas de planejamento

Dez usuários no piloto, 1–2 horas de atividade por pessoa/dia, até aproximadamente 200 posts vistos por pessoa/dia, mídia total abaixo de 10 GB, sem SMS, transcodificação contratada ou ataques. A quantidade real de listeners, reconexões, mensagens e operações por post deve ser medida; atualizar a interface primeiro não elimina gravações no servidor.

Reservar **R$ 20–30/mês** nesse cenário é uma margem operacional, não um resultado calculado de faturamento. O uso principal pode ficar nas franquias; imagens de build, armazenamento acumulado, rede, segredos e serviços auxiliares ainda podem cobrar. Domínio, lojas mobile, serviços externos e taxas de pagamento não estão incluídos. Não extrapolar a janela de testes como previsão de produção.

## Custo adicional do bloco proposto

Tabela pública consultada com região **São Paulo (`southamerica-east1`)**, opção **mensal**, preço padrão, sem compromisso de uso:

| Item | Preço público em USD |
| --- | ---: |
| PITR | US$ 0,225/GiB-mês |
| Cada backup retido | US$ 0,045/GiB-mês |
| Clonagem do ensaio | US$ 0,3176/GiB, por operação |

Com banco de tamanho estável `D` GiB e 14 backups diários retidos, a reserva em regime estável é `D × (0,225 + 14 × 0,045) = US$ 0,855 × D/mês`. Não multiplicar PITR por sete: a cobrança já usa a média mensal do banco. O primeiro mês pode ter menos backups retidos. Com 1 GiB e conversão **hipotética**, não cotação, de R$ 6/US$, a recuperação recorrente equivale a R$ 5,13/mês e uma clonagem a R$ 1,91, além do armazenamento temporário e consultas do ensaio. No tamanho atual, a parcela de PITR/backups seria inferior a um centavo por mês antes de arredondamentos e tributos. Isso protege o Firestore; não inclui cópia independente de Auth/R2.

O painel usa métricas nativas do Google. A tabela atual de Monitoring indica cobrança de políticas de alerta somente a partir de setembro de 2027; consultas e ingestão têm regras próprias. Logs de aplicação têm franquia de 50 GiB/projeto/mês e retenção padrão de 30 dias. Reavaliar preços antes de 2027. Reduzir IAM não tem mensalidade adicional.

## Atenção especial: CAPTCHA/App Check

Na configuração padrão, cada navegador ativo pode renovar App Check aproximadamente duas vezes por hora. Dez conexões contínuas por 30 dias podem produzir `10 × 24 × 30 × 2 = 14.400` avaliações, sem contar avaliações de autenticação e outras chaves/projetos que compartilhem a franquia. A franquia é 10.000 avaliações/mês por organização; de 10.001 a 100.000, o projeto faturado entra em US$ 8/mês. Na conversão hipotética acima, são R$ 48 somente nesse item. Várias abas/dispositivos e reaberturas podem aumentar o volume. Dez pessoas usando duas horas/dia produzem uma ordem de grandeza de 1.200 renovações, mais inicializações/autenticações; medir, não tratar isso como cota fixa por usuário.

Não garantir R$ 50 para dez usuários ativos 24h/dia. Além do CAPTCHA, a frequência de ações pode gerar custo significativo de leituras, gravações, execução e rede. Ajustar TTL exige avaliar o equilíbrio entre custo e duração de validade da atestação; não enfraquecer a proteção silenciosamente.

## Controle e publicação

O orçamento proposto alerta em R$ 25, R$ 40 e R$ 50; não interrompe serviços. O orçamento Google cobre apenas o projeto Google, não a fatura Cloudflare. Ainda aguarda autorização do proprietário: a pergunta sobre custos não autoriza aplicar o bloco. Nenhuma assinatura paga Cloudflare/Cloud Armor foi contratada.

Fontes oficiais, consultadas em 06/11/2026: [Firestore](https://cloud.google.com/firestore/pricing), [Firebase](https://firebase.google.com/pricing), [R2](https://developers.cloudflare.com/r2/pricing/), [Monitoring e Logging](https://cloud.google.com/products/observability/pricing), [renovação App Check](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider), [faturamento reCAPTCHA](https://docs.cloud.google.com/recaptcha/docs/billing-information). Preços em reais seguem os SKUs da conta e tributos aplicáveis; a conversão ilustrativa não os substitui.
