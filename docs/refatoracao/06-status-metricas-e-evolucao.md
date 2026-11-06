# Folko — entregas, pendências, métricas e evolução

Consolidação de 06/11/2026. Referência publicada: commit `dcf3622`, depois de `2d5a6d3` e `9a9847a`. Esta revisão organiza o trabalho; não publica código, altera infraestrutura nem autoriza executar as propostas de inovação.

Execução posterior iniciada por solicitação do proprietário: consultar o [diário por categoria](07-execucao-por-categoria.md). IM01 tem implementação local de medição operacional; não foi ativada no site nem encerra as tarefas amplas O03/I07.

## 1. Plano vigente e leitura do progresso

Folko é uma rede social geral de divulgação para o Brasil. Preservar contas, histórico, fotos/vídeos, interações, mensagens, profissional, assinatura e campanhas no estado real de cada recurso. Manter a identidade escura com o mascote fornecido. O cadastro não exige enquadramento esportivo e utiliza a seleção existente de hashtags, sem uma segunda área textual de interesse. Texto no feed continua um requisito confirmado, ainda a implementar.

Fontes do projeto: [direção atual](05-direcao-folko.md), [plano de produto](../product-plan.md), [fila](tarefas/README.md), [controle de progresso](estado.json) e [auditoria de segurança/desempenho](../architecture/otimizacao-seguranca-2026-11.md).

O controle registra **92 tarefas: 27 concluídas, 1 em revisão e 64 planejadas**. As 65 fichas abertas não equivalem a 65 trabalhos integralmente ausentes: há implementações parciais e entregas posteriores ainda não conciliadas com todas as fichas. Essa contagem não mede percentual de qualidade, prontidão mobile ou funcionalidades publicadas.

Estados usados nesta consolidação:

- **Publicado:** há registro de publicação e verificação no ambiente público.
- **Existente:** recurso presente na base; não significa que sua refatoração inteira foi concluída.
- **Local/preview:** código ou configuração foi preparado/testado, mas falta a promoção correspondente.
- **Pendente:** entrega ainda necessária ou aceite restante.
- **Proposta:** evolução sugerida; depende de decisão antes de implementação.

## 2. O que já foi feito

| Entrega | Situação verificada | Limite do que está concluído |
| --- | --- | --- |
| Reposicionamento para rede social geral | Direção Folko documentada; apresentação web publicada | Não renomear projeto Firebase, domínios ou identificadores técnicos por associação com a marca |
| Marca e tema | Nome Folko, tema escuro e paleta do logo publicados | Ícones/splash em release nativo e instalação PWA continuam com aceite próprio em P03 |
| Mascote no cabeçalho | Publicado em `dcf3622`: símbolo transparente de 48 × 48 px no feed e cabeçalho | Login conserva a assinatura completa, conforme o uso aprovado |
| Cadastro geral | Linguagem esportiva obrigatória retirada; valores antigos preservados | Não equivale à migração física de todos os campos legados do banco |
| Interesses | Área textual duplicada retirada em `2d5a6d3`; seleção de uma a seis hashtags mantida | Não recriar campo paralelo nem impor novos interesses obrigatórios sem decisão |
| Contas e perfis | Email/senha, Google, confirmação/recuperação, username, avatar e edição existentes | Revisar acessibilidade, consentimento e privacidade antes de ampliar o lançamento |
| Conteúdo social | Fotos, vídeos, curtidas, visualizações, comentários, compartilhamento e follows existentes | Publicação somente de texto ainda não existe como formato independente |
| Mensagens e notificações | Conversas, recibos e central interna existentes | Push nativo, paginação do histórico e organização completa dos módulos permanecem pendentes |
| Destinos das notificações | Publicado em `dcf3622`: curtida abre o post; comentário/resposta abre e destaca o comentário; mensagem/compartilhamento abre a conversa e destaca a mensagem | Trata indisponibilidade e busca conteúdo fora da janela carregada; não conclui todos os deep links externos ou push |
| Proteção durante navegação | Testes cobrem clique repetido, último clique prevalecendo, mudança de conta/tela e perfil bloqueado | Não substitui uma política integral de bloqueio aplicada pelo servidor |
| Infraestrutura web | Firebase Hosting e domínio `xolot.com.br` publicados; CI aprovada na última revisão | Atualizações de cache em instalações PWA e nativas exigem ensaios específicos |
| Fundação técnica | 27 tarefas concluídas no registro: ferramentas, fronteiras, contratos, testes, sessão/perfis e extrações iniciais, detalhadas no inventário ao fim | A conclusão técnica registrada pode ter escopo local; consultar a evidência antes de inferir deploy |

Evidências da última entrega: `output/testes/notificacoes-mascote-20261106/verificacao.json`, capturas de comentário/mensagem e site publicado; [CI da main](https://github.com/Pedrobarberini/Xolot/actions/runs/42245082993). A verificação confirmou o mesmo bundle nos dois domínios de produção e preservou as Rules daquela publicação.

## 3. O que foi preparado, mas ainda não está integralmente em produção

Esta seção descreve a auditoria local e o preview de segurança. Não confundir com a publicação isolada das notificações.

| Trabalho | Prova existente | Falta para concluir |
| --- | --- | --- |
| Curtida otimista e controle de concorrência | Alteração visual antecipada, serialização e recuperação testadas localmente | Rollout do cliente/backend, medida real de confirmação e falha em rede móvel |
| Visualizações e reset do feed | Cancelamento da espera, estabilidade durante re-render e reset sem remontar toda a mídia testados localmente | Publicar a etapa e validar memória/reprodução em aparelho |
| Leituras de métricas por IDs necessários | Implementação local em lotes; estimativa de escopo menor que o listener global | Medir leituras reais e custo por sessão; concluir paginação/limites de listeners |
| Mensagens e recibos mais confiáveis | Ordenação, concorrência, repetição do mesmo envio e lotes de recibos testados | Rollout coordenado; inbox e histórico paginados; ensaio entre dois aparelhos |
| Cache por conta e câmera | Isolamento por UID e liberação de streams/URLs testados localmente | Ensaiar troca de conta, permissões e ciclo de vida em hardware Android/iOS/web |
| Guardas de abuso | Autenticação, tamanho de payload, quotas e limites de execução preparados para 17 callables | Revisão e deploy do backend; telemetria de rejeições e testes graduais em staging |
| CAPTCHA/App Check web | Configuração no Google, chave exclusiva web restrita e testes no preview; Auth em AUDIT | Promover o cliente compatível, observar tráfego legítimo e planejar exigência gradual; nativos ainda precisam de provedor compatível |
| Regras de posts e dependências | Restrição adicional de leitura e atualizações de dependências testadas localmente | Reconciliar clientes, reexecutar audit e publicar separadamente; não chamar a etapa de proteção completa |
| Índices de consulta | Quatro índices necessários foram ativados e registrados como READY na auditoria | Outros índices/projeções dependem das consultas que efetivamente forem adotadas |

O último audit local registrou redução de 98 para 6 alertas de dependências, ainda com 2 de severidade alta. É um resultado histórico dessa árvore local, não uma auditoria nova da release publicada nem garantia sobre advisories atuais.

## 4. O que falta fazer, em ordem de trabalho

As prioridades abaixo orientam o planejamento; respeitar dependências e preservar os dados existentes. Alterações em produção continuam exigindo confirmação após a preparação e validação de cada ajuste.

### Prioridade 0 — confiança, dados e observabilidade

1. Instrumentar tempos reais de feed, curtida, visualização, mensagem e upload; criar painel de erros, custo e rejeições, sem registrar corpos de mensagens ou credenciais. Relação: O01/O03/I07.
2. Concluir o rollout da auditoria de segurança/desempenho, separando cliente, Functions, Rules e CAPTCHA por compatibilidade. Relação: Q05/S02/SEC02/SEC03.
3. Aplicar bloqueio e denúncias também nos comandos do servidor, com fila de moderação e acesso restrito. Relação: B07/I08/U08.
4. Revisar identidades dos runtimes com papel amplo Editor; preparar menor privilégio e validar antes da troca. Relação: SEC03/O05.
5. Verificar proteção de borda no caminho realmente usado pelas APIs, limites, origem e resposta a abuso. Não presumir que proteger o domínio web protege chamadas diretas de Functions. Relação: SEC03/O03/O05.
6. Preparar backup e provar restauração de banco e mídia. Definir retenção e tratamento de exclusão antes de ativar descarte automático. Relação: O04/I04/I09.
7. Completar inventário de dados privados, permissões administrativas, termos/política e fluxo de exportação/exclusão. Não declarar conformidade integral por existir uma tela de consentimento. Relação: SEC02/I08/I09.

### Prioridade 1 — desempenho, mensagens e experiência visual

8. Paginar feed, galeria, perfis, follows, comentários, catálogo e notificações com cursores e escopo por contexto. Relação: Q01–Q08.
9. Criar inbox e paginação da conversa ativa, envio recuperável e tratamento explícito de offline/erro. Migrações v2/backfills só após necessidade, compatibilidade e recuperação demonstradas. Relação: M01–M05/G01.
10. Extrair player, item do feed, overlays, perfil, conversa, câmera e onboarding em módulos menores; evitar uma nova árvore global de props. Relação: B05/B07–B12/U01–U08/S01–S04.
11. Virtualizar o feed e comprovar que players, listeners, memória e streams são liberados. Relação: U01–U03/Q05.
12. Melhorar legibilidade, rótulos dos campos, foco de teclado, contraste, áreas de toque e estados de carregamento, vazio, erro e retry. Relação: O02/U04–U07.
13. Tornar atualização do PWA previsível, preservando rascunhos e separação entre contas. O usuário não deve depender de recargas repetidas para receber uma release. Relação: O07/S02.
14. Tornar upload recuperável e validar conteúdo real no processamento confiável; gerar versões adequadas de imagem/vídeo e limpar órfãos com checkpoint. Relação: I01–I04/U06.

### Prioridade 1 — preparação mobile explícita

Estas lacunas precisam entrar nas fichas existentes ou receber fichas próprias; não foram adicionadas automaticamente às 92 tarefas do controle.

| Entrega mobile | Trabalho necessário | Relação com a fila |
| --- | --- | --- |
| Build Android/iOS | Definir identificadores definitivos, perfis de build, assinatura e ambientes; hoje não há `android.package`, `ios.bundleIdentifier` ou `eas.json` na base examinada | P03/O05/G02 |
| Navegação nativa | Voltar do Android, links de posts/perfis/conversas e restauração após abrir por notificação | N01–N05 |
| Layout no aparelho | Safe areas, teclado, barra do sistema, acessibilidade, tamanhos de toque e aparelhos menores | O02/U04–U07 |
| Câmera e microfone | Permissão negada/tardia, interrupção por chamada, troca de app, background e retomada sem stream vazando | U06/I01/O03 |
| Push nativo | Registro/renovação de tokens por dispositivo, logout, FCM/APNs, preferência por tipo e destino correto com app aberto/fechado | B08/B10/M05/N05/SEC03 |
| Rede instável | Rascunho por conta, envio pendente visível, retry sem duplicar, upload retomável e modo de economia de dados | M05/S02/I01–I04 |
| Qualidade e distribuição | Medir crashes, travamentos e inicialização; testar release real; preparar requisitos vigentes das lojas e privacidade antes do envio | O02–O05/P09/G02/G03 |

A documentação do [Expo Push](https://docs.expo.dev/push-notifications/overview/) descreve a integração com FCM/APNs; isso é uma opção técnica coerente com a stack, não uma integração já feita. [Testar push exige um build de desenvolvimento, não apenas Expo Go](https://docs.expo.dev/push-notifications/push-notifications-setup/).

### Prioridade 2 — completar o produto geral

15. Implementar contrato, comando, leitura e compositor de posts de texto, preservando mídia e notificações. Relação: P04–P07.
16. Melhorar descoberta por pessoas, hashtags e interesses gerais com busca paginada; validar exemplos sem nicho obrigatório. Relação: P08/Q03/Q08.
17. Validar em conjunto autenticação, perfil, conteúdo misto, interações, conversas, preferências e profissional. Relação: P09/G02.
18. Preservar assinatura, selo e campanhas; tratar reconciliação, limites e funcionalidades simuladas sem mudar preço ou transformar protótipo em cobrança real. Relação: B11/I05/I06/S03/S04.
19. Concluir observabilidade, ensaio de migração/staging, recuperação e promoção autorizada. Remover compatibilidade somente após a janela e provas correspondentes. Relação: O03–O06/G01–G04.

## 5. Métricas que precisam de atenção agora

Os limites abaixo são fatos do código ou medições datadas, não volume atual de usuários nem SLA. Os números de auditoria do banco são um retrato de 05/11; não houve nova contagem de documentos nesta consolidação.

| Indicador conhecido | Referência observada | Atenção necessária |
| --- | --- | --- |
| JavaScript web principal | Release `dcf3622`: 4.117.179 bytes, cerca de 4,12 MB sem compressão de transporte | Medir bytes transferidos, execução e primeira carga em 4G; identificar imports/assets adiáveis antes de trocar a stack |
| Precache PWA | Build registrou 16 URLs, aproximadamente 5,37 MB | Reduzir custo de instalação/atualização; separar conteúdo privado e não destruir rascunhos |
| Janela inicial de posts | Limite de 50 | Limite não é paginação; garantir continuidade, ordenação e ausência de duplicatas |
| Busca/perfis | Até 200 perfis no leitor atual | Crescimento não pode depender de baixar um catálogo global |
| Follows e comentários | Limites globais de 5.000 follows e 2.000 comentários | Recortar por perfil/post e medir leituras por tela |
| Conversas e notificações | Até 500 mensagens por direção e 100 notificações | Permitir histórico antigo sem perder mensagens novas ou recarregar tudo |
| Tamanho de mídia aceito | Foto até 15 MiB; vídeo até 200 MiB e 120 segundos, conforme validações atuais | Limite máximo não é tamanho recomendado; medir memória, tráfego e falhas antes de ampliá-lo |
| Integridade de contadores | Auditoria de 05/11 encontrou 2 agregados sem post correspondente | Reconciliar origem e marcadores antes de excluir ou reconstruir; repetir diagnóstico antes de qualquer correção |
| Restauração | PITR estava desabilitado na auditoria de 05/11 | Confirmar estado atual, orçamento e estratégia; ensaio de restauração ainda é necessário |
| Latência local | 12 operações por tipo em emulador: p95 de confirmação de curtida 113,6 ms; visualização 129,3 ms; mensagem 152,1 ms | Amostra pequena; exclui internet, cold start e CAPTCHA; não usar como latência de produção |
| Testes | Última execução local registrada: 226 de domínio e 43 de interface; 16 de interface no recorte isolado da última entrega; CI da main aprovada | Contagens têm escopos distintos; não somar resultados como cobertura nem inferir teste nativo |
| CAPTCHA e abuso | Configuração/preview testados; Auth AUDIT; burst pequeno emulado | Falta medir clientes legítimos, rejeições, abuso distribuído e comportamento por plataforma; não houve teste volumétrico de DDoS em produção |

### Metas iniciais propostas para o painel

Exceto as referências Core Web Vitals, os alvos abaixo são **propostas internas para validar e ajustar depois da primeira linha de base**. Nenhum está sendo apresentado como alcançado. p95 é o tempo abaixo do qual ficam 95% das observações; p75, 75%.

| Métrica | Como medir | Meta inicial / atenção |
| --- | --- | --- |
| Carregamento/interação web | LCP, INP e CLS no p75, separados por mobile/desktop | LCP ≤ 2,5 s; INP ≤ 200 ms; CLS ≤ 0,1, conforme [Core Web Vitals](https://web.dev/articles/vitals) |
| Feed utilizável | Da abertura até o primeiro item renderizado e interativo; distinguir cache frio/quente | Proposta: p95 ≤ 4 s no cenário de rede móvel definido para o teste |
| Resposta visual da curtida | Do toque até o frame com estado alterado | Proposta: p95 ≤ 100 ms; acompanhar reversões por falha separadamente |
| Confirmação da curtida | Do comando até o reconhecimento autoritativo, distinguindo listener e resposta | Proposta: p95 ≤ 800 ms online; medir erros de sincronização e divergência de contagem |
| Contabilização de view | Da elegibilidade da view até confirmação; medir separadamente a permanência mínima de 800 ms já configurada no cliente | Proposta: p95 ≤ 1 s após elegibilidade; ensaios de re-render, saída e retry sem dupla contagem |
| Mensagem | Tempo até aceitação pelo servidor e até renderização no destinatário online, em medidas separadas | Proposta: p95 de entrega visível ≤ 1,5 s no cenário de teste; zero duplicatas nos ensaios de retry |
| Abrir notificação | Toque até destino correto visível | Proposta: ≥ 99,5% de acerto para destinos existentes/autorizados; contar removidos e negados à parte, sem ocultar falhas técnicas |
| Upload | Sucesso de arquivos válidos, tempo por tamanho/rede, retries e cancelamentos | Proposta: ≥ 98% de sucesso no cenário de ensaio; nenhum post duplicado ou órfão após recuperação |
| Câmera | Preview pronto, falhas por dispositivo e recursos após sair | Proposta: p95 de preview ≤ 2 s após permissão concedida; zero streams retidos nos ensaios |
| Estabilidade nativa | Sessões sem crash e travamentos por versão/dispositivo | Proposta: ≥ 99,5% de sessões sem crash; travamento recorrente de fluxo crítico bloqueia release |
| Falhas técnicas | Timeouts/5xx e recusas indevidas de usuários legítimos | Proposta: < 1% por fluxo; erros de validação, senha incorreta e bloqueios esperados são séries separadas |
| Contadores | Comparar marcadores autoritativos e totais reconstruídos após fila estabilizar | Proposta: zero divergência persistente nos ensaios de concorrência; investigar toda divergência encontrada |
| Leituras/custo | Documentos e bytes por sessão, tela e usuário ativo; separar primeira carga e listener | Medir 7 dias primeiro; propor redução de ≥ 30% onde houver leitura global comprovada, sem tratar o número como economia já obtida |
| Memória/listeners | Navegar por 100 posts e voltar repetidamente; medir repouso após desmontagem | Zero crescimento monotônico de listeners/streams; estabelecer teto de memória por aparelho após baseline |
| Peso web/PWA | Bytes de artefato e bytes transferidos comprimidos, registrados separadamente | Proposta: reduzir em ~20% o JS e precache atuais, mantendo comportamento e instalação |
| App Check/CAPTCHA | Requisições verificadas, sem token, inválidas; login legítimo e falsos bloqueios por versão/plataforma | Exigir compatibilidade comprovada e reversão antes do enforcement; alertar para qualquer quebra de cliente suportado |
| Abuso e permissões | 429 por operação/conta, falhas de autorização, custo do limiter e tentativas distribuídas | 100% dos casos negativos conhecidos recusados nos testes; monitoramento contínuo não equivale a imunidade a DDoS |
| Recuperação | Idade do backup e tempo/perda de dados no ensaio de restauração | Definir RPO/RTO com orçamento e necessidade do produto; registrar resultado do ensaio antes de prometer prazo |

Paginar com cursores e limitar assinaturas permite reduzir leituras desnecessárias; offsets podem cobrar também os documentos pulados. Referências: [cursores Firestore](https://firebase.google.com/docs/firestore/query-data/query-cursors) e [custos de consultas/listeners](https://firebase.google.com/docs/firestore/pricing). A distribuição de requisições App Check deve orientar o rollout para não bloquear versões legítimas: [métricas oficiais](https://firebase.google.com/docs/app-check/monitor-metrics).

### Métricas de produto e qualidade da comunidade

Primeiro medir duas a quatro semanas; definir metas de crescimento depois, considerando o tamanho real da base. Não inventar DAU, retenção ou taxa de conversão.

- Ativação: cadastro verificado + perfil mínimo + primeira ação social válida; acompanhar queda em cada etapa e separar conta de pessoa/negócio apenas se houver esse dado legitimamente disponível.
- Retenção D1/D7/D30 por coorte: proporção de contas ativadas que voltam no intervalo definido. Fixar a definição e o fuso antes de comparar.
- Publicação: autores ativos, tempo até o primeiro post, sucesso por formato e proporção de rascunhos abandonados.
- Descoberta: buscas sem resultado, visita a perfil após recomendação, diversidade de autores e proporção de novas conexões que recebem resposta.
- Conversa: conversas recíprocas e tempo até resposta, usando metadados agregados; não ler nem registrar corpos privados para produzir o painel.
- Satisfação e confiança: “menos disso”, bloqueios, denúncias por mil interações e tempo até triagem/resolução. Um aumento de tempo de uso não compensa aumento de spam/assédio.
- Criadores/negócios: alcance real, interação, visita ao perfil e clique em link com definição de atribuição explícita; não mostrar previsão de vendas ou retorno financeiro inventado.
- Custo: leituras, gravações, mídia, Functions e CAPTCHA por usuário ativo e por publicação; alertar para variação sustentada sobre o baseline, com orçamento a aprovar.

### Instrumentação mínima e validade das medidas

Registrar versão, plataforma, cenário de rede, duração, resultado e um identificador aleatório da operação. Eventos sugeridos: primeiro item visível, toque/ack da curtida, elegibilidade/ack da view, envio/ack/renderização da mensagem, toque/destino da notificação, início/conclusão/falha do upload e abertura/fechamento da câmera.

Medições no mesmo cliente usam relógio monotônico. Não subtrair relógios de aparelhos diferentes como se fossem sincronizados; medir as etapas separadamente ou documentar a sincronização. Registrar tamanho da amostra e janela; sinalizar p95 instável em amostra pequena. Comparar cache frio/quente e primeiro plano/background; manter falhas e cancelamentos visíveis.

Não colocar email, senha, UID em claro, corpo de mensagem, documento de identidade, tokens ou URLs assinadas nos eventos/logs. Identificadores pessoais necessários à análise pertencem a armazenamento privado com acesso e retenção definidos; anonimização não é presumida. Definir coleta mínima, transparência, acesso ao painel e retenção antes de instrumentar.

## 6. Inovações alinhadas ao plano — propostas

Não são recursos já entregues nem novas obrigações comerciais. Implementar somente depois da base estável e da definição do escopo de cada experimento. Reutilizar hashtags, preferências, solicitações de conversa e painel existentes em vez de duplicá-los.

| Proposta | Evolução em relação ao que existe | Benefício e medida de sucesso |
| --- | --- | --- |
| INOV01 — Feed com escolha clara | Modos Seguindo/Descobrir e explicação curta da recomendação; adaptar controles de interesse já existentes | Maior controle; acompanhar diversidade de autores, respostas e “menos disso” |
| INOV02 — Descoberta local voluntária | Encontrar criadores, serviços e projetos por cidade/UF e hashtags, além das sugestões atuais; sem exigir GPS preciso | Conexões relevantes no Brasil; medir buscas úteis e conexões recíprocas, não somente cliques |
| INOV03 — Modo leve | Limitar autoplay/tráfego, oferecer mídia adequada à rede, rascunho e upload recuperável | Acesso melhor em 4G e aparelhos simples; medir MB/sessão, falhas e tempo até publicar |
| INOV04 — Coleções e organização pessoal | Salvar posts em coleções privadas e retomar conteúdo por tema | Utilidade além do feed; medir retorno a itens salvos e uso das coleções |
| INOV05 — Coautoria com aceite | Publicação compartilhada entre criadores/projetos mediante convite e aceite; menção simples já existe e não equivale a coautoria | Divulgação colaborativa; medir convites aceitos e publicações válidas, com autoria/permissões claras |
| INOV06 — Painel do criador explicável | Evoluir o profissional existente com origem de visitas, formatos e hashtags que geram interação real | Divulgação baseada em evidência; medir leitura do painel e melhoria sustentada de alcance/interação |
| INOV07 — Contato mais confiável | Evoluir solicitações existentes com controle de spam, bloqueio no servidor e acompanhamento de denúncia | Mais conversas úteis; medir reciprocidade, denúncias por mil contatos e falsos bloqueios |
| INOV08 — Assistência opcional de acessibilidade | Sugerir texto alternativo, legendas e hashtags com revisão do autor; avaliar solução local ou provedor antes | Melhor inclusão e descoberta; medir aceitação, correções, erros e custo. Nenhum conteúdo é enviado a novo provedor ou publicado automaticamente por esta proposta |

Cada experimento precisa de hipótese, responsável, custo, tratamento de dados, versão de início, resultado e opção de desligar sem perda de conteúdo. Ranking com pesos fixos, KYC, novos preços e impulsionamento pago não se tornam autorizados por aparecerem como ideias em um backlog antigo.

## 7. Como manter a fila sem repetir trabalho

1. Atualizar esta consolidação a cada entrega com commit, ambiente, prova e aceite restante.
2. Revisar a ficha correspondente e reconciliar a implementação parcial; não reabrir tarefas concluídas por mudança de nome.
3. Só marcar a ficha inteira concluída quando seus próprios critérios forem atendidos. Registrar provas em `estado.json` e então retirar a ficha conforme o controle existente.
4. Distinguir declaração de intenção, código, emulação, preview, produção e dispositivo real. Não apagar uma ficha com teste nativo pendente só porque o site funciona.
5. Incorporar as lacunas mobile e as inovações aceitas às fichas existentes ou criar fichas pequenas; propostas ainda não entram na contagem de 92.
6. Preparar cada ajuste completo e revisável, pedir confirmação para publicar e verificar o ambiente publicado após a confirmação.

Os inventários abaixo reproduzem os estados registrados, não uma nova aprovação técnica de todas as tarefas. As prioridades de execução estão na seção 4; a ordem histórica da lista não substitui dependências.

<!-- INVENTARIO_GERADO -->

## 8. Inventário das 27 tarefas concluídas no controle

Escopo abaixo é o registrado na prova histórica; as publicações posteriores estão na seção 2. Não significa que todas as 27 exigiram deploy.

| ID | Entrega registrada | Escopo registrado |
| --- | --- | --- |
| [F00](estado.json) | Registrar a base funcional e preservar o trabalho existente | local_sem_deploy |
| [F01](estado.json) | Fixar ferramentas e separar os alvos de compilação | local_sem_deploy |
| [F02](estado.json) | Registrar fronteiras e a convenção de pastas | local_sem_deploy |
| [F03](estado.json) | Adicionar lint e formatação com adoção incremental | local_sem_deploy |
| [F04](estado.json) | Criar testes reais das Rules em emuladores | local_sem_deploy |
| [F05](estado.json) | Preparar testes de comportamento para extrações | local_sem_deploy |
| [F06](estado.json) | Criar a CI de qualidade e empacotamento | local_sem_deploy |
| [D00](estado.json) | Confirmar o ambiente real de dados sem modificá-lo | local_sem_deploy |
| [D01](estado.json) | Definir IDs canônicos e mapas legados | local_sem_deploy |
| [D02](estado.json) | Fechar os contratos lógicos e a autoridade dos dados | local_sem_deploy |
| [D03](estado.json) | Versionar consultas, índices e paginação | local_sem_deploy |
| [O01](estado.json) | Estabelecer logs, erros e métricas sanitizados | local_sem_deploy |
| [SEC01](estado.json) | Definir ameaça, visibilidade e retenção | local_sem_deploy |
| [C01](estado.json) | Separar tipos de autenticação e perfil | local_sem_deploy |
| [C02](estado.json) | Separar Post, MediaAsset, Draft e FeedItem | local_sem_deploy |
| [C03](estado.json) | Extrair primitives visuais realmente compartilhados | local_sem_deploy |
| [C04](estado.json) | Estabelecer estilos colocados junto dos componentes | local_sem_deploy |
| [C05](estado.json) | Remover efeito de tema durante renderização | local_sem_deploy |
| [C06](estado.json) | Isolar a sessão e o ciclo de autenticação | local_sem_deploy |
| [C07](estado.json) | Isolar repositório e casos de uso de perfis | local_sem_deploy |
| [B01](estado.json) | Transformar o entrypoint do backend em composição | local_sem_deploy |
| [B02](estado.json) | Criar portas de infraestrutura e erros do backend | local_sem_deploy |
| [B03](estado.json) | Centralizar autorização e validação de comandos | local_sem_deploy |
| [B04](estado.json) | Extrair handlers e serviço de mídia de posts | local_sem_deploy |
| [P01](estado.json) | Generalizar cadastro para a rede social Folko | local_sem_deploy |
| [P02](estado.json) | Centralizar a marca Folko preservando integrações | local_sem_deploy |
| [B06](estado.json) | Isolar curtidas e visualizações idempotentes | local_sem_deploy |

## 9. Inventário das 65 fichas abertas

A ficha P03 permanece aberta por aceite nativo/PWA. As demais 64 constam como planejadas; implementações parciais precisam ser conciliadas antes de execução. Os ajustes recentes não encerram automaticamente fichas mais amplas.

| ID | Trabalho restante registrado | Estado no controle |
| --- | --- | --- |
| [P03](tarefas/P03.md) | Aplicar o logo e a paleta Folko fornecidos pelo proprietário | Em revisão; aceite restante |
| [P04](tarefas/P04.md) | Versionar contratos do feed de texto, fotos e vídeos | Planejada; conferir implementação parcial |
| [P05](tarefas/P05.md) | Publicar texto por comando autenticado e idempotente | Planejada; conferir implementação parcial |
| [P06](tarefas/P06.md) | Renderizar texto no feed, perfil e detalhes sem quebrar mídia | Planejada; conferir implementação parcial |
| [P07](tarefas/P07.md) | Adicionar texto ao compositor existente de fotos e vídeos | Planejada; conferir implementação parcial |
| [P08](tarefas/P08.md) | Generalizar descoberta e exemplos sem remover interesses existentes | Planejada; conferir implementação parcial |
| [P09](tarefas/P09.md) | Validar a experiência Folko e as funcionalidades preservadas | Planejada; conferir implementação parcial |
| [B05](tarefas/B05.md) | Extrair avatar e enquadramento em módulo próprio | Planejada; conferir implementação parcial |
| [B07](tarefas/B07.md) | Definir comandos protegidos de follow e comentário | Planejada; conferir implementação parcial |
| [B08](tarefas/B08.md) | Extrair o envio e recibos de mensagens existentes | Planejada; conferir implementação parcial |
| [B09](tarefas/B09.md) | Isolar catálogo de tags e sua projeção | Planejada; conferir implementação parcial |
| [B10](tarefas/B10.md) | Isolar geração e leitura de notificações | Planejada; conferir implementação parcial |
| [B11](tarefas/B11.md) | Extrair a integração de assinatura sem mudar cobrança | Planejada; conferir implementação parcial |
| [B12](tarefas/B12.md) | Extrair exclusão de conta e sua lista de recursos | Planejada; conferir implementação parcial |
| [G01](tarefas/G01.md) | Criar o mecanismo de migração retomável | Planejada; conferir implementação parcial |
| [Q01](tarefas/Q01.md) | Paginar o feed sem baixar toda a base | Planejada; conferir implementação parcial |
| [Q02](tarefas/Q02.md) | Consultar publicações por autor para a galeria | Planejada; conferir implementação parcial |
| [Q03](tarefas/Q03.md) | Substituir download global de perfis na descoberta geral | Planejada; conferir implementação parcial |
| [Q04](tarefas/Q04.md) | Limitar follows a seguidor ou perfil consultado | Planejada; conferir implementação parcial |
| [Q05](tarefas/Q05.md) | Carregar métricas e seleção social somente para os posts necessários | Planejada; conferir implementação parcial |
| [Q06](tarefas/Q06.md) | Paginar comentários pelo post aberto | Planejada; conferir implementação parcial |
| [Q07](tarefas/Q07.md) | Ordenar e paginar notificações por destinatário | Planejada; conferir implementação parcial |
| [Q08](tarefas/Q08.md) | Limitar catálogo e buscas de temas gerais | Planejada; conferir implementação parcial |
| [M01](tarefas/M01.md) | Definir conversa individual e escrita v2 idempotente | Planejada; conferir implementação parcial |
| [M02](tarefas/M02.md) | Preparar o backfill do histórico legado de mensagens | Planejada; conferir implementação parcial |
| [S01](tarefas/S01.md) | Separar preferências crescentes em documentos privados | Planejada; conferir implementação parcial |
| [S02](tarefas/S02.md) | Isolar cache e rascunhos por conta | Planejada; conferir implementação parcial |
| [S03](tarefas/S03.md) | Preservar modo profissional e autoridade das configurações | Planejada; conferir implementação parcial |
| [S04](tarefas/S04.md) | Preservar campanhas e isolar funcionalidades simuladas | Planejada; conferir implementação parcial |
| [M03](tarefas/M03.md) | Ler a inbox privada sem carregar todo o histórico | Planejada; conferir implementação parcial |
| [M04](tarefas/M04.md) | Paginar histórico somente da conversa ativa | Planejada; conferir implementação parcial |
| [M05](tarefas/M05.md) | Adicionar outbox local e recibos recuperáveis | Planejada; conferir implementação parcial |
| [U01](tarefas/U01.md) | Extrair o player e seu controlador | Planejada; conferir implementação parcial |
| [U02](tarefas/U02.md) | Decompor o item e os overlays do feed | Planejada; conferir implementação parcial |
| [U03](tarefas/U03.md) | Virtualizar o feed e limitar players ativos | Planejada; conferir implementação parcial |
| [U04](tarefas/U04.md) | Decompor perfil, galeria e configurações | Planejada; conferir implementação parcial |
| [U05](tarefas/U05.md) | Separar lista de conversas e tela de conversa | Planejada; conferir implementação parcial |
| [U06](tarefas/U06.md) | Decompor o envio existente de fotos e vídeos | Planejada; conferir implementação parcial |
| [U07](tarefas/U07.md) | Decompor autenticação e onboarding geral preservando o contrato | Planejada; conferir implementação parcial |
| [N01](tarefas/N01.md) | Introduzir um contrato de intenção de navegação | Planejada; conferir implementação parcial |
| [N02](tarefas/N02.md) | Preparar o bootstrap do Expo Router sem corte de produto | Planejada; conferir implementação parcial |
| [N03](tarefas/N03.md) | Migrar rotas de autenticação e onboarding | Planejada; conferir implementação parcial |
| [I01](tarefas/I01.md) | Tornar a finalização do upload repetível e recuperável | Planejada; conferir implementação parcial |
| [I02](tarefas/I02.md) | Implementar verificação real de conteúdo em worker isolado | Planejada; conferir implementação parcial |
| [I03](tarefas/I03.md) | Conectar fila durável, processamento e publicação | Planejada; conferir implementação parcial |
| [I04](tarefas/I04.md) | Tornar exclusão de post e limpeza de órfãos recuperáveis | Planejada; conferir implementação parcial |
| [I05](tarefas/I05.md) | Persistir e reconciliar eventos de cobrança | Planejada; conferir implementação parcial |
| [I06](tarefas/I06.md) | Unificar a projeção de identidade e benefícios | Planejada; conferir implementação parcial |
| [I07](tarefas/I07.md) | Conciliar contadores e medir a necessidade de fragmentação | Planejada; conferir implementação parcial |
| [I08](tarefas/I08.md) | Criar moderação e denúncias com autoridade server-side | Planejada; conferir implementação parcial |
| [I09](tarefas/I09.md) | Retomar exclusão de conta por etapas duráveis | Planejada; conferir implementação parcial |
| [U08](tarefas/U08.md) | Separar a interface administrativa do domínio de decisão | Planejada; conferir implementação parcial |
| [N04](tarefas/N04.md) | Migrar abas e telas de detalhe para rotas finas | Planejada; conferir implementação parcial |
| [N05](tarefas/N05.md) | Concluir deep links e histórico web/native | Planejada; conferir implementação parcial |
| [SEC02](tarefas/SEC02.md) | Versionar Rules dos novos caminhos e comandos | Planejada; conferir implementação parcial |
| [SEC03](tarefas/SEC03.md) | Preparar App Check, rate limits e proteção por plataforma | Planejada; conferir implementação parcial |
| [O02](tarefas/O02.md) | Padronizar estados de falha e acessibilidade | Planejada; conferir implementação parcial |
| [O03](tarefas/O03.md) | Medir desempenho, concorrência e custo por sessão | Planejada; conferir implementação parcial |
| [O04](tarefas/O04.md) | Ensaiar backup e restauração de dados e mídia | Planejada; conferir implementação parcial |
| [O07](tarefas/O07.md) | Controlar atualização e cache do PWA | Planejada; conferir implementação parcial |
| [O05](tarefas/O05.md) | Preparar release, recuperação e resposta a incidentes | Planejada; conferir implementação parcial |
| [G02](tarefas/G02.md) | Executar o ensaio integral de staging e migração | Planejada; conferir implementação parcial |
| [G03](tarefas/G03.md) | Promover clientes e dados por coortes autorizadas | Planejada; conferir implementação parcial |
| [G04](tarefas/G04.md) | Retirar compatibilidade e dados antigos após a janela | Planejada; conferir implementação parcial |
| [O06](tarefas/O06.md) | Concluir documentação e manutenção contínua | Planejada; conferir implementação parcial |
