const assert = require("node:assert/strict");
const { createRequire } = require("node:module");
const { join, resolve, relative, isAbsolute } = require("node:path");
const { realpathSync } = require("node:fs");

const portable = realpathSync(resolve(process.argv[2]));
const requirePortable = createRequire(join(portable, "package.json"));
for (const dependency of ["expo", "react-native", "jest", "firebase-tools"])
  assert.throws(() => requirePortable.resolve(dependency), { code: "MODULE_NOT_FOUND" });
for (const dependency of [
  "firebase-admin/app",
  "firebase-functions/v2/https",
  "@aws-sdk/client-s3",
  "@aws-sdk/s3-request-presigner",
  "mercadopago",
]) {
  const dependencyPath = realpathSync(requirePortable.resolve(dependency));
  const inside = relative(portable, dependencyPath);
  assert.ok(
    inside && !inside.startsWith("..") && !isAbsolute(inside),
    `${dependency} fora do pacote`,
  );
}
const functions = requirePortable("./lib/index.js");
const names = Object.keys(functions).sort();
assert.ok(names.length > 0);
for (const name of names) assert.equal(typeof functions[name], "function", name);
console.log(`Carregados ${names.length} exports de Functions a partir do pacote isolado.`);
