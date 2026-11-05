# Componentes com estilos locais

Componentes extraídos de uso geral ficam em `src/shared/ui`; componentes de uma
funcionalidade ficam junto da respectiva `features/<nome>/ui`. Props locais
ficam no próprio componente ou em `types.ts` se houver múltiplos consumidores.
Estilos ficam em `<Componente>.styles.ts`, sem conhecer repositórios ou SDKs.

BackButton e LabeledInput são as referências iniciais. Seus sete estilos foram
removidos de `navigationStyles`/`sharedContentStyles`; há somente uma autoridade
para cada valor. Dimensões, cores, estados pressionado/desabilitado e
precedência do `style` fornecido pelo consumidor foram preservados. Testes
renderizados exercitam os temas claro/escuro e interações.

O agregador `src/styles/appStyles.ts` continua como fachada dos componentes
legados. Não copiar seus estilos para cada tela e manter os dois ativos.
Migrar apenas as chaves exclusivas de um componente delimitado; as demais
seguem com seus donos até U02–U08. Os reexports de componentes em Navigation
continuam temporariamente para os imports existentes.

A seleção e a persistência de tema ficam em `shared/theme`. Componentes novos
usam `useThemeColors()` e factories de estilos que recebem a paleta, como em
LabeledInput. Tokens não conhecem React ou persistência; os efeitos web e o
adaptador AsyncStorage são separados. A chave `@xolot/theme-mode-v1` continua
igual. A escolha só é aplicada em eventos ou após carregar a preferência.

`shared/theme/legacy.ts` mantém o proxy para os estilos antigos; ele é
sincronizado antes de agendar a atualização React, nunca no corpo do render.
Rerenderizar uma tela não altera o tema global. O adaptador continua até todas
as telas migrarem para paletas explícitas. Sem provider, primitives novos usam
a paleta clara; o app tem um provider único no bootstrap. Em erro de disco,
mantém a escolha da sessão e restaura o padrão claro se não conseguir ler.
