# Marca Folko

## Logos atuais de apresentação

O proprietário enviou `Folko logo 1.png` e `Folko Logo 2.png` e confirmou que o fundo deve ser separado das letras, como na extração anterior. Esses dois arquivos substituem as artes de apresentação na entrada/abertura e no cabeçalho/feed. Os originais permanecem byte a byte; apenas alpha e enquadramento mudam nos derivados, sem filtros de cor, desenho novo ou texto recriado.

| Original recebido | Cópia preservada | Derivado utilizado | Uso |
|---|---|---|---|
| Folko logo 1.png | folko-primary-original.png, 1254 × 1254 | folko-primary-transparent.png, 802 × 865 | Entrada, cadastro e abertura |
| Folko Logo 2.png | folko-horizontal-original.png, 1672 × 941 | folko-horizontal-display-transparent.png, 1213 × 780 | Nome completo no header/feed, substituindo símbolo e texto separados |

Execute `node scripts/prepare-display-logos.mjs` para reproduzir a remoção do fundo desses dois arquivos. [display-logos.json](display-logos.json) registra fontes, hashes, recortes e a comparação RGB: nenhum pixel visível alterado. Os espaços dentro das letras também têm alpha zero. O olho escuro é preservado.

Após revisão do proprietário, o logo horizontal mede 76 px no cabeçalho e no feed, cerca de 39% menor que a versão de 124 px; o espaçamento vertical do header compacto é 8 px. A versão completa no login/cadastro usa largura máxima de 140 px, reduzida de 210 px para deixar mais espaço para o formulário. Ambos mantêm a proporção e usam contain.

## Histórico e geração dos ícones

As três fontes finais foram fornecidas pelo proprietário em 2026-11-05 e são preservadas byte a byte. [provenance.json](provenance.json) registra os nomes recebidos, SHA-256, dimensões e derivados. Folko WPP.png e Folko Logan.png, enviados antes, foram descartados e não são usados.

| Fonte | Dimensões | Uso |
|---|---|---|
| folko-logo.png | 1254 × 1254 | Original fornecido, preservado para rastreabilidade |
| folko-horizontal.png | 1672 × 941 | Referência histórica da extração usada para gerar ícones |
| folko-stacked.png | 1920 × 1080 | Original alternativo fornecido, preservado para rastreabilidade |

Em 2026-11-05 o proprietário pediu fundo transparente e tema escuro, autorizou remover o fundo por cor preservando os pixels e apontou divergências na pena e no bico das tentativas automáticas. As versões de IA foram descartadas. O desenho horizontal passou a ser a referência única do símbolo e da abertura, evitando variações entre artes. Não redesenhar pena, olho ou bico.

Execute `node scripts/extract-brand-artwork.mjs` e depois `node scripts/prepare-brand-assets.mjs` na raiz. O primeiro altera alpha/enquadramento, verifica cada pixel RGB visível contra o original e salva o [mapa de extração](presentation.json). O segundo usa o pipeline já disponível no Expo para redimensionamento e composição, sem novas dependências.

| Derivado | Dimensões | Uso |
|---|---|---|
| folko-symbol-transparent.png | 780 × 780, RGBA | Fonte atual da geração dos ícones |
| folko-horizontal-transparent.png | 1213 × 780, RGBA | Recorte histórico, substituído na apresentação pelos dois arquivos acima |
| folko-app-icon.png | 1024 × 1024, fundo #090A0F | Ícone do aplicativo/favicon |
| folko-adaptive-icon.png | 1024 × 1024, RGBA | Foreground Android com margem de 128 px |
| folko-icon-192.png e folko-icon-512.png | 192/512 px, fundo #090A0F | PWA, margens 20/56 px |
| folko-maskable-512.png | 512 px, fundo #090A0F | PWA maskable, margem de 80 px |
| folko-apple-touch-icon.png | 180 px, fundo #090A0F | Apple touch icon, margem de 18 px |

A extração remove componentes do fundo e preserva os pixels do olho escuro. Os recortes têm margens transparentes de 24 px e usam contain, sem deformação. Não declarar a imagem colorida como monochromeImage.

## Paleta e implementação

`src/config/brand.ts` centraliza nome e referências: preto #090A0F, amarelo #FFD21F, laranja #FF7800, verde #00856A e creme #FFF5EC. `src/shared/theme/tokens.ts` define superfícies pretas/grafite, texto creme, links/seleção amarelos e ações principais amarelas com texto escuro. Ações auxiliares usam laranja escurecido com texto branco para contraste; verde é apoio. Erro/curtida mantêm significado próprio. Conteúdo de foto/vídeo conserva os controles brancos.

Escuro é o padrão para instalação nova, preferência inválida ou falha de leitura. Escolhas claras salvas continuam reconhecidas pela mesma chave; o usuário pode mudar nas configurações. A sessão usada no demonstrativo foi alterada para escuro conforme o pedido, sem limpar preferências de outras contas. A fachada legada ainda inicia a captura de estilos com valores da paleta clara e aplica a paleta restaurada antes da primeira tela; não alterar essa captura para escuro sem substituir o mapeamento legado.

Chaves de preferências, caches, slug/scheme Expo, Firebase, domínios de OAuth, bucket, URLs e contratos de cobrança mantêm os identificadores técnicos existentes. Mensagens próprias do backend e o nome exibido em novas solicitações de assinatura passam a Folko Plus; preço, moeda e external_reference continuam iguais. Nenhuma assinatura existente foi alterada no provedor e não houve deploy. Não renomear identificadores por substituição global.

As três URLs públicas antigas de ícones continuam disponíveis para manifestos já em cache, agora com bytes dos novos ícones Folko. O manifesto atual aponta para URLs Folko e Workbox revisiona os arquivos sem renomear caches de dados. Os quatro arquivos xolot-app-icon.png, xolot-horizontal-wordmark.png, xolot-symbol.png e xolot-wordmark.png foram retirados de assets/brand após substituição e busca por referências; arquivos históricos permanecem.

## Validação e limites

Testes conferem dimensões reais, hashes dos originais e derivados, apresentação acessível nos dois temas e contraste de pares de texto/ação. O build web verifica favicon, manifesto e precache. Splash/ícones nativos precisam de preview/release em dispositivo antes de publicar nas lojas; Expo Go e a revisão web não comprovam esse resultado, conforme a [documentação Expo](https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/).
