const { existsSync, lstatSync, realpathSync, rmSync } = require("node:fs");
const { dirname, resolve, sep } = require("node:path");

const root = realpathSync(resolve(__dirname, ".."));
const target = resolve(root, "lib");
if (dirname(target) !== root || !target.startsWith(root + sep))
  throw new Error("Saída fora do pacote.");
if (
  existsSync(target) &&
  (lstatSync(target).isSymbolicLink() || !realpathSync(target).startsWith(root + sep))
)
  throw new Error("Limpeza de link ou saída externa recusada.");
rmSync(target, { recursive: true, force: true });
