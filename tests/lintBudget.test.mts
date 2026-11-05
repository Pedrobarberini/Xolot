import assert from "node:assert/strict";
import test from "node:test";
import { compareDiagnostics } from "../scripts/lint.mjs";
import { ESLint } from "eslint";

test("orçamento de lint não aceita nova ocorrência nem falha fatal como dívida", () => {
  const old = { fingerprint: "known", ruleId: "unused", count: 1 };
  assert.equal(compareDiagnostics([old], [old]).length, 0);
  assert.equal(compareDiagnostics([old, old], [old]).length, 1);
  assert.equal(compareDiagnostics([{ ...old, fatal: true }], [old]).length, 1);
  assert.equal(
    compareDiagnostics([{ ...old, ruleId: "architecture/boundaries" }], [old]).length,
    1,
  );
});

test("fronteiras barram SDK no domínio e import profundo de outra funcionalidade", async () => {
  const eslint = new ESLint();
  const forbidden = await eslint.lintText(
    'import { getFirestore } from "firebase/firestore"; export const db = getFirestore();',
    { filePath: "src/features/posts/domain/example.ts" },
  );
  assert.ok(forbidden[0].messages.some((message) => message.ruleId === "architecture/boundaries"));
  const deep = await eslint.lintText('export { other } from "../../profiles/data/repository";', {
    filePath: "src/features/posts/application/example.ts",
  });
  assert.ok(deep[0].messages.some((message) => message.ruleId === "architecture/boundaries"));
  const valid = await eslint.lintText(
    "export function identity(value: string): string { return value; }",
    { filePath: "src/features/posts/domain/example.ts" },
  );
  assert.equal(
    valid[0].messages.filter((message) => message.ruleId === "architecture/boundaries").length,
    0,
  );
});

test("any novo falha no orçamento e tipagem explícita válida passa", async () => {
  const eslint = new ESLint();
  const invalid = await eslint.lintText("export function identity(value: any) { return value; }", {
    filePath: "src/features/posts/domain/example.ts",
  });
  const messages = invalid[0].messages.filter(
    (message) => message.ruleId === "@typescript-eslint/no-explicit-any",
  );
  assert.equal(messages.length, 1);
  assert.equal(messages[0].severity, 2);
  assert.equal(compareDiagnostics([{ fingerprint: "new-any", ...messages[0] }], []).length, 1);
  const valid = await eslint.lintText(
    "export function identity(value: string): string { return value; }",
    { filePath: "src/features/posts/domain/example.ts" },
  );
  assert.equal(valid[0].messages.length, 0);
});
