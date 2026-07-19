# Plano de produto

## Objetivo

NextStar aproxima atletas em desenvolvimento de pessoas e organizações que avaliam talento esportivo. O produto deve provar três pontos antes de qualquer camada financeira real: descoberta por vídeo, confiança na identidade do atleta e moderação consistente.

## Etapa atual: experiencia validavel

Entregue no aplicativo:

- Cadastro local com conta comum Usuário e perfil Admin separado para moderação.
- Feed vertical de vídeos com layout responsivo.
- Envio por galeria ou link direto.
- Consentimento obrigatório para atletas menores de idade.
- Fila administrativa que mostra apenas solicitações pendentes.
- Publicação no feed somente depois da aprovação.
- Perfil demonstrativo com vídeo real, removido quando existe vídeo aprovado.
- Avaliação esportiva e condicoes financeiras opcionais e separadas do envio.
- Saldo, depósitos, reservas e carteira exclusivamente simulados em memoria local.
- Bolsa simulada vinculada ao perfil do atleta, com meta, aporte mínimo, custódia sem saque e conclusão automática.

Limite atual: todo o estado é local e temporário. Não há autenticação, API, banco, armazenamento permanente, pagamento ou contrato real.

## Proxima etapa: backend mínimo

- Criar API para usuários, sessões e papéis.
- Persistir vídeos, status de moderação e histórico de decisões.
- Armazenar arquivos em bucket privado com URL temporária.
- Gerar thumbnail, duração e versoes otimizadas no servidor.
- Registrar aceite de termos e consentimento do responsável.
- Implementar recuperação de conta e revogação de sessão.

## Etapa seguinte: segurança e operação pública

- Fila de denúncia e bloqueio de conteúdo.
- Regras de moderação e recurso de decisão.
- Perfis verificados e trilha de auditoria.
- Observabilidade, alertas, backup e política de retenção.
- Testes automatizados dos fluxos de cadastro, envio e moderação.
- Revisão de acessibilidade, desempenho e suporte a aparelhos de entrada.

## Avaliação esportiva

Score, risco, métricas e qualquer valor financeiro não devem nascer da aprovação do vídeo. Esses dados exigem uma avaliação separada, com responsável, metodologia, data e evidência registradas.

Enquanto a avaliação não existir, a interface não deve exibir score, métricas, box de aviso ou valores financeiros como se fossem reais.

## Camada financeira futura

Somente depois da validação técnica, operacional e jurídica:

- Definir o instrumento contratual e o enquadramento regulatorio.
- Integrar KYC, AML e provedor de pagamentos.
- Definir custódia, cancelamento, extrato e comprovantes.
- Publicar metodologia de risco e limites de comúnicação de retorno.
- Implementar conciliação e distribuição com auditoria.
- Validar o modelo com assessoria jurídica especializada e com a CVM antes de qualquer oferta pública.
- Contratar plataforma de investimento participativo autorizada, quando aplicavel, ou definir outro enquadramento permitido.
- Contratar instituição financeira ou de pagamento autorizada para manter e transferir recursos de usuários.

## Pontos juridicos prioritarios

- Possivel enquadramento como valor mobiliario.
- Protecao de atletas menores de idade.
- Contratos de imagem, salario, bonus, premios e transferências.
- LGPD, retenção de dados e direito de exclusão.
- KYC, AML, termos de risco e limites de promessa de retorno.
