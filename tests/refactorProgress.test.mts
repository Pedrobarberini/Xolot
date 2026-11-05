import assert from "node:assert/strict";
import test from "node:test";
import { completeTask, enrichTasks, rewriteCompletedLinks } from "../scripts/refactor-progress.mjs";
import { resolve } from "node:path";

const state = {
  tasks: [
    { id: "F00", status: "planejada", dependencies: [] },
    { id: "F01", status: "planejada", dependencies: ["F00"] },
  ],
};
const evidence = {
  summary: "Baseline executado",
  files: ["baseline.json"],
  checks: [{ command: "check", exitCode: 0, result: "aprovado" }],
};

test("não conclui dependência pendente, check falho ou aceite incompleto", () => {
  assert.throws(() => completeTask(state, "F01", evidence), /Dependências/);
  assert.throws(() => completeTask(state, "../F00", evidence), /inválido/);
  assert.throws(
    () =>
      completeTask(state, "F00", {
        ...evidence,
        checks: [{ command: "check", exitCode: 1, result: "falhou" }],
      }),
    /checks/,
  );
  assert.throws(
    () => completeTask(state, "F00", { ...evidence, pendingAcceptance: ["build"] }),
    /aceite/,
  );
  assert.equal(state.tasks[0].status, "planejada");
});

test("conclusão preserva provas, desbloqueia próxima tarefa e não altera a base", () => {
  const completed = completeTask(state, "F00", evidence, "2026-11-01T00:00:00.000Z");
  assert.equal(completed.tasks[0].status, "concluida");
  assert.deepEqual(completed.tasks[0].evidence, evidence);
  assert.equal(completeTask(completed, "F01", evidence).tasks[1].status, "concluida");
  assert.throws(() => completeTask(completed, "F00", evidence), /já concluída/);
  assert.equal(state.tasks[0].status, "planejada");
});

test("preserva metadados da ficha antes de removê-la e redireciona apenas links concluídos", () => {
  const enriched = enrichTasks(
    { tasks: [{ id: "F01" }] },
    () => "# F01 — Ferramentas\n- Dependências: [F00](F00.md).",
  );
  assert.equal(enriched.tasks[0].title, "Ferramentas");
  assert.deepEqual(enriched.tasks[0].dependencies, ["F00"]);
  const directory = resolve("docs/refatoracao/tarefas");
  const updated = rewriteCompletedLinks(
    "[F00](F00.md) [F01](F01.md) [site](https://example.com)",
    resolve(directory, "F02.md"),
    resolve(directory, "../estado.json"),
    new Set([resolve(directory, "F00.md")]),
  );
  assert.equal(updated, "[F00](../estado.json) [F01](F01.md) [site](https://example.com)");
});
