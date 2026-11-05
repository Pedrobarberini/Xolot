# Protocolo para executar com um modelo menos capaz

## 1. Prompt mestre copiável

```text
Você está refatorando o Folko, rede social geral de divulgação no Brasil,
no repositório técnico existente conectado a
https://github.com/Pedrobarberini/Xolot.git.

Leia docs/refatoracao/README.md, docs/refatoracao/05-direcao-folko.md,
este protocolo e a ficha da tarefa indicada.
Mantenha os recursos existentes. O nicho esportivo anterior não define o produto.
O proprietário confirmou texto/fotos/vídeos; texto entra pelas tarefas P04–P07.
O ícone e as duas assinaturas Folko já foram fornecidos; consulte assets/brand/README.md.
Não invente nem troque a arte e não reutilize as duas primeiras versões descartadas.
Implemente SOMENTE a tarefa <ID>. Não implemente o programa inteiro.

1. Confira git status. Há alterações de limpeza/documentação anteriores:
   preserve-as e não as atribua à sua tarefa.
2. Leia estado.json, as provas dos pré-requisitos e os arquivos indicados.
   Consulte docs/architecture/mapa-arquivos.md se um caminho tiver sido movido.
3. Explique o contrato atual e o resultado exato da tarefa em poucas frases.
4. Escreva uma lista curta de passos, arquivos que pretende alterar e validações.
5. Faça a menor mudança completa que respeite a arquitetura e o comportamento.
6. Execute as validações apropriadas e confira o diff. Não invente resultados.
7. Atualize o estado e registre provas, comandos, resultados e dívida residual.
8. No modo de execução contínua autorizado pelo proprietário, conclua uma ficha
   por vez e avance para a próxima liberada. Se o pedido nomear apenas uma tarefa,
   encerre depois dela. Preserve os gates de dados, segurança e produção.

Restrições:
- Não troque a stack nem faça upgrade de versão principal nesta tarefa.
- Não mova todos os arquivos, renomeie todos os modelos ou reformate o repositório.
- Mudanças de cadastro/foco/marca seguem a direção Folko e a ficha P indicada.
  Nas extrações técnicas, preserve o resto da UI e dos contratos. Não mude preço,
  regra de selo, permissões ou política de publicação por conveniência.
- Não remova testes nem relaxe Rules para obter sucesso aparente.
- Não adicione pacotes sem justificar a função e verificar compatibilidade.
- Não use serviços reais ou dados de produção nos testes por conveniência.
- Não execute migrações/deploy em produção sem uma instrução explícita para
  essa ação, nesse alvo, depois de preparar o resultado revisável e a recuperação.
- Credenciais existentes não autorizam novas operações externas.
- Não copie segredos, dados de identidade, payloads privados ou tokens para
  documentos, fixtures, prompts, logs ou commits.
- Não force commits, reset, push ou limpeza de alterações alheias.

Se o escopo exceder uma mudança pequena e verificável, proponha subtarefas
<ID>-a/<ID>-b com dependência e aceite. Registre a divisão antes de implementar.
Não comece duas frentes ao mesmo tempo. Não preencha uma decisão de produto
ou produção desconhecida com uma suposição silenciosa.

Relatório final: objetivo; arquivos relevantes; comportamento preservado ou
alterado por contrato; comandos e resultados reais; riscos/pendências; estado
da tarefa. Não marque como concluída sem cumprir todos os aceites.
```

## 2. Como selecionar a próxima tarefa

As fichas estão em [tarefas/README.md](tarefas/README.md), na ordem sugerida. Escolher uma tarefa ainda planejada cujas dependências tenham provas de conclusão. IDs identificam trabalhos, não nomes de branches nem fases automaticamente publicáveis.

As tarefas técnicas concluídas mantêm suas provas. Novas tarefas P começam como `planejada`, exceto implementação explicitamente em curso ou dependência externa registrada como `bloqueada`. Código parcialmente semelhante não é conclusão. Confirmar o que existe e concluir apenas a diferença comprovada.

Em `estado.json`, usar os estados `planejada`, `em_execucao`, `em_revisao`, `concluida` ou `bloqueada`. Para bloqueio, registrar a informação/condição necessária. Não marcar um marco inteiro concluído porque um arquivo foi criado.

Estado de código e estado de rollout são separados. Uma tarefa local pode ficar em revisão aguardando staging; o executor não deve preencher prova de produção com o resultado do emulador.

## 3. Tamanho e fronteiras de uma tarefa

Normalmente trabalhar em um caso de uso, repositório, extração ou consulta por vez. Como sinal de atenção, reavaliar o escopo quando o plano exigir tocar mais de cinco arquivos de produção ou dois domínios. Isso não é uma regra cega: movimentações mecânicas podem precisar atualizar imports e testes, mas precisam de mapa e contrato estáveis.

Se uma ficha ainda for grande para o modelo disponível, dividi-la pelo resultado, por exemplo:

```text
Q01-a: consulta paginada e teste de cursor no repositório
Q01-b: hook consumindo páginas, com cancelamento e deduplicação
Q01-c: adaptação da tela e teste de navegação
```

Não dividir em “metade dos arquivos” sem um estado intermediário compilável. Não introduzir uma fachada temporária sem registrar quem a remove e em qual tarefa.

## 4. Relatório obrigatório por tarefa

Registrar as provas no objeto `evidence` da tarefa em `estado.json`. Fichas `.md` concluídas são removidas a pedido do proprietário, depois de persistir as provas e redirecionar os links para esse controle. Não criar outra ficha Markdown de conclusão apenas para substituir a que foi apagada. Documentos permanentes de arquitetura continuam sendo referências úteis.

Formato dos campos de evidência:

```json
{
  "summary": "Resultado e contrato preservado ou alterado explicitamente",
  "files": ["caminho/real/do/arquivo"],
  "dependenciesVerified": ["ID: prova conferida no estado"],
  "checks": [
    { "command": "comando realmente executado", "exitCode": 0, "result": "resultado observado" }
  ],
  "pendingAcceptance": [],
  "limitations": ["O que ainda não foi comprovado ou promovido"],
  "recovery": "Como recuperar especificamente esta mudança",
  "rolloutStatus": "local_sem_deploy"
}
```

Durante a execução, o JSON de entrada pode ficar em `tmp/<ID>-evidence.json`.
Somente após todos os aceites, executar
`node scripts/refactor-progress.mjs complete <ID> tmp/<ID>-evidence.json`.
O comando persiste as provas, repara links e remove a ficha concluída. O arquivo
temporário pode ser apagado depois; não duplicar o histórico em outro `.md`.

Documentação de evidência não deve conter credenciais, mensagens privadas ou dumps de dados reais. Atualizar o mapa de arquivos quando houver movimentação.

## 5. Quando parar a tarefa e pedir informação

- A ficha exige escolher edição, região, exposição pública, retenção ou política de cobrança que não estão confirmadas.
- O teste requer credenciais ou acesso não disponíveis.
- Há dados sem correspondência inequívoca ou risco de sobrescrever uma versão mais nova.
- Não é possível preparar uma recuperação adequada para uma mudança destrutiva.
- O contrato observado contradiz a ficha ou uma dependência ainda não foi realmente concluída.

Antes de perguntar, concluir o trabalho independente que estiver autorizado e produzir um resultado revisável. O usuário não deve ser interrompido para cada escolha mecânica de implementação.

Não tratar um obstáculo na CLI como autorização para alterar IAM, enfraquecer proteção ou criar recursos diferentes. Registrar o comando sanitizado, a falha e a alternativa segura.

## 6. Revisão para trabalhos críticos

Tarefas marcadas como críticas pedem revisão antes de promover efeitos externos. A revisão deve conferir diff, ameaça mitigada, testes negativos, ambiente exato, impacto nos clientes antigos, custo e procedimento de recuperação.

Para schema/Rules, billing, moderação, identidade e exclusão de conta, recomenda-se um revisor humano com experiência no domínio. Se não houver revisor disponível, o modelo pode concluir código e ensaios locais, mas não deve simular a aprovação necessária para produção.

## 7. Exemplo de primeira solicitação

```text
Consulte docs/refatoracao/estado.json e execute a primeira tarefa pendente
com dependências concluídas, conforme sua ficha em docs/refatoracao/tarefas/.
Siga docs/refatoracao/04-execucao-por-modelo.md.
Preserve todas as alterações locais existentes.
Ao terminar, registre as evidências. Se o proprietário autorizou a execução
contínua, prossiga sequencialmente para a próxima ficha liberada.
```

Para continuar depois, substituir o ID por uma tarefa cujas dependências estejam satisfeitas. Não é necessário reler todas as fichas em cada conversa.
