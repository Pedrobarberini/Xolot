# Qualidade antes de publicar

`.github/workflows/quality.yml` prepara três jobs independentes para PR, main e
execução manual: qualidade do código, autorização em emuladores e artefatos.
Node vem de `.node-version`, pnpm de `packageManager` e as Actions oficiais estão
fixadas por commit. A instalação usa o lockfile congelado e não executa scripts
de dependências. Não há deploy, login ou segredo de produção nesses jobs.

O build web usa `EXPO_NO_DOTENV=1`; ele prova empacotamento sem exigir a conta de
produção. O job de Rules usa somente o projeto demo registrado em
[emuladores.md](emuladores.md). A suíte permanece obrigatória mesmo em PRs de
forks, onde segredos não estão disponíveis.

`pnpm run test:package:functions` copia apenas fonte, saída compilada e manifestos
do backend para um diretório temporário fora do repositório. Gera o importer
isolado a partir do lockfile existente, instala somente as versões de produção
congeladas, compila e carrega os exports sem invocar handlers. Recusa dependência
local sem pacote e resolução de SDK fora do diretório. Expo, React Native,
Jest e Firebase CLI precisam estar ausentes. A instalação da raiz é comparada
antes/depois; a cópia temporária é removida ao terminar.

YAML 2.9.0 foi declarado diretamente como ferramenta de desenvolvimento; essa
mesma versão já existia no lockfile. O primeiro ensaio com `pnpm deploy --legacy`
copiou dependências do cliente. O gate atual não usa esse caminho e validou
267 pacotes do backend, incluindo seus 24 exports, sem dependências do frontend.

Os comandos dos jobs foram exercitados localmente. O YAML foi lido e revisado;
a execução no runner GitHub ficará disponível quando estas alterações forem
publicadas no repositório. Não se apresenta execução remota como já aprovada.
