# Plano de produto

## Objetivo

NextStar aproxima atletas em desenvolvimento de pessoas e organizacoes que avaliam talento esportivo. O produto deve provar tres pontos antes de qualquer camada financeira real: descoberta por video, confianca na identidade do atleta e moderacao consistente.

## Etapa atual: experiencia validavel

Entregue no aplicativo:

- Cadastro local com conta comum Usuario e perfil Admin separado para moderacao.
- Feed vertical de videos com layout responsivo.
- Envio por galeria ou link direto.
- Consentimento obrigatorio para atletas menores de idade.
- Fila administrativa que mostra apenas solicitacoes pendentes.
- Publicacao no feed somente depois da aprovacao.
- Perfil demonstrativo com video real, removido quando existe video aprovado.
- Avaliacao esportiva e condicoes financeiras opcionais e separadas do envio.
- Reservas e carteira exclusivamente simuladas.

Limite atual: todo o estado e local e temporario. Nao ha autenticacao, API, banco, armazenamento permanente, pagamento ou contrato real.

## Proxima etapa: backend minimo

- Criar API para usuarios, sessoes e papeis.
- Persistir videos, status de moderacao e historico de decisoes.
- Armazenar arquivos em bucket privado com URL temporaria.
- Gerar thumbnail, duracao e versoes otimizadas no servidor.
- Registrar aceite de termos e consentimento do responsavel.
- Implementar recuperacao de conta e revogacao de sessao.

## Etapa seguinte: seguranca e operacao publica

- Fila de denuncia e bloqueio de conteudo.
- Regras de moderacao e recurso de decisao.
- Perfis verificados e trilha de auditoria.
- Observabilidade, alertas, backup e politica de retencao.
- Testes automatizados dos fluxos de cadastro, envio e moderacao.
- Revisao de acessibilidade, desempenho e suporte a aparelhos de entrada.

## Avaliacao esportiva

Score, risco, metricas e qualquer valor financeiro nao devem nascer da aprovacao do video. Esses dados exigem uma avaliacao separada, com responsavel, metodologia, data e evidencia registradas.

Enquanto a avaliacao nao existir, a interface nao deve exibir score, metricas, box de aviso ou valores financeiros como se fossem reais.

## Camada financeira futura

Somente depois da validacao tecnica, operacional e juridica:

- Definir o instrumento contratual e o enquadramento regulatorio.
- Integrar KYC, AML e provedor de pagamentos.
- Definir custodia, cancelamento, extrato e comprovantes.
- Publicar metodologia de risco e limites de comunicacao de retorno.
- Implementar conciliacao e distribuicao com auditoria.

## Pontos juridicos prioritarios

- Possivel enquadramento como valor mobiliario.
- Protecao de atletas menores de idade.
- Contratos de imagem, salario, bonus, premios e transferencias.
- LGPD, retencao de dados e direito de exclusao.
- KYC, AML, termos de risco e limites de promessa de retorno.
