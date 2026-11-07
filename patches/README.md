# Compatibilidade de segurança do Metro

Os patches de `metro@0.83.3` (usado pelo Expo) e `metro@0.83.7` (usado pelo React Native) adaptam somente a leitura de dimensões em `getAssetData` à API de `image-size@2.0.3`. A série 1 foi apontada por duas vulnerabilidades altas na auditoria atual. A série 2 mantém o export default, mas recebe bytes, sem aceitar o caminho de arquivo usado pelo Metro antigo.

O patch lê o arquivo de imagem com o `fs` já utilizado pelo Metro e passa os mesmos bytes ao leitor atualizado. Arquivos que não são imagens não são lidos para calcular dimensões. Os dados, nomes, escalas e hashes dos assets permanecem sob responsabilidade do Metro.

O pnpm aplica a alteração pela entrada `patchedDependencies`; não depende de uma edição manual permanente em `node_modules`. Verificar `tests/metroImageCompatibility.test.mts`, o build web e a instalação congelada. Ao atualizar o Metro/Expo, conferir se a versão nova já oferece suporte a `image-size` atualizado e remover este patch quando ele deixar de ser necessário.
