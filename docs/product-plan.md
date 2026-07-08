# Plano por etapas

## Produto

NextStar conecta atletas em desenvolvimento a investidores que querem participar de uma fatia contratual de ganhos futuros do jogador. A primeira versao deve provar tres coisas: descoberta de talento, confianca no perfil do atleta e simulacao clara do retorno.

## MVP 1: prototipo mobile

- Feed com videos curtos dos jogadores.
- Perfil do jogador com idade, posicao, cidade, clube atual, metricas e tese.
- Simulador de aporte com percentual do pool de distribuicao.
- Carteira simples com aportes simulados.

## MVP 2: conta e upload

- Cadastro de atleta e investidor.
- Upload de video do atleta.
- Moderacao manual antes de publicar.
- Termos de aceite separados para atleta, responsavel legal e investidor.

Status atual: fluxo mockado implementado no app, sem backend e sem upload binario real. O atleta informa link do video, dados esportivos, objetivo do aporte e consentimento do responsavel quando menor de idade.

## MVP 2.1: backend minimo

- Criar API para usuarios, sessoes e papeis.
- Persistir videos enviados e status de moderacao.
- Armazenar midia em bucket privado.
- Criar painel administrativo para aprovar, reprovar ou pedir ajustes.
- Adicionar trilha de auditoria para termos aceitos e consentimento.

## MVP 3: maquete de investimento controlado

- Perfil admin para revisar oportunidades.
- Aprovacao, reprova e pedido de ajustes em videos.
- Feed recebe apenas oportunidades aprovadas.
- Reserva de investimento sem dinheiro real.
- Esteira simulada de KYC, contrato, pagamento e distribuicao.
- Carteira simulada com projecao hipotetica.

Status atual: maquete implementada dentro do app, com estado local. A experiencia mostra como o produto deve funcionar, mas nao cria conta real, contrato real, cobranca, transferencia, pagamento ou promessa de retorno.

## MVP 3.1: backend da maquete

- Persistir usuarios, videos, moderacao e reservas simuladas.
- Criar API local ou hospedada para o app consumir.
- Criar autenticacao real de teste.
- Criar painel admin web ou mobile.
- Criar trilha de auditoria dos eventos simulados.

## MVP 4: pagamentos e distribuicao real

- Integracao com provedor de pagamentos.
- Conta escrow ou fluxo equivalente definido juridicamente.
- Regra de distribuicao dos 15% de ganhos do atleta.
- Extrato, comprovantes e relatorios.

## Regras iniciais do modelo

- O atleta define um percentual de ganhos futuros destinado ao pool de investidores.
- Cada investidor recebe uma parte proporcional ao valor aportado dentro daquele pool.
- Exemplo: se o pool recebe R$ 100.000 e um investidor aporta R$ 10.000, ele tem 10% do pool. Se 15% dos ganhos mensais do atleta forem distribuiveis, esse investidor recebe 10% desses 15%.

## Pontos juridicos a validar cedo

- Se a oferta configura valor mobiliario.
- Como lidar com atletas menores de idade.
- Contratos de imagem, salario, bonus, premios e transferencias.
- Limites de promessa de retorno.
- KYC, AML, LGPD e termos de risco.
