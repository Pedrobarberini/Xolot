import {
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  unlinkSync,
  renameSync,
} from "node:fs";
import { dirname, resolve, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repository = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const planDirectory = resolve(repository, "docs/refatoracao");

export function enrichTasks(state, readCard) {
  return {
    ...state,
    tasks: state.tasks.map((task) => {
      const card = readCard(task.id);
      const title = card?.match(/^# [A-Z]+\d+ — (.+)$/m)?.[1];
      const dependencies = card?.split("\n").find((line) => line.startsWith("- Dependências:"));
      return {
        ...task,
        title: task.title ?? title ?? task.id,
        dependencies:
          task.dependencies ??
          [...(dependencies?.matchAll(/\[([A-Z]+\d+)\]/g) ?? [])].map((match) => match[1]),
      };
    }),
  };
}

export function completeTask(state, id, evidence, completedAt = new Date().toISOString()) {
  if (!/^[A-Z]+\d+$/.test(id)) throw new Error("Identificador de tarefa inválido.");
  const task = state.tasks.find((item) => item.id === id);
  if (!task) throw new Error(`Tarefa inexistente: ${id}`);
  if (task.status === "concluida") throw new Error(`Tarefa já concluída: ${id}`);
  const unfinished = task.dependencies.filter(
    (dependency) => state.tasks.find((item) => item.id === dependency)?.status !== "concluida",
  );
  if (unfinished.length) throw new Error(`Dependências pendentes: ${unfinished.join(", ")}`);
  if (!evidence?.summary?.trim() || !Array.isArray(evidence.files) || !evidence.files.length)
    throw new Error("Resumo e arquivos são obrigatórios.");
  if (
    !Array.isArray(evidence.checks) ||
    !evidence.checks.length ||
    evidence.checks.some(
      (check) => !check.command?.trim() || check.exitCode !== 0 || !check.result?.trim(),
    )
  ) {
    throw new Error("Todos os checks da conclusão precisam de resultado real aprovado.");
  }
  if (evidence.pendingAcceptance?.length)
    throw new Error("Ainda há critérios de aceite pendentes.");
  return {
    ...state,
    status: "em_execucao",
    note: "Execução autorizada em etapas. Fichas concluídas são removidas; provas e dependências permanecem neste arquivo.",
    tasks: state.tasks.map((item) =>
      item.id === id
        ? {
            ...item,
            status: "concluida",
            codeStatus: "validado",
            completedAt,
            rolloutStatus: evidence.rolloutStatus ?? "local_sem_deploy",
            blocker: null,
            evidence,
          }
        : item,
    ),
  };
}

export function renderIndex(state) {
  const completed = state.tasks.filter((task) => task.status === "concluida");
  const pending = state.tasks.filter((task) => task.status !== "concluida");
  return `# Fila de refatoração\n\n${completed.length} concluídas; ${pending.length} pendentes de ${state.tasks.length} tarefas.\n\nAs fichas concluídas foram removidas a pedido do proprietário. As provas e os contratos de dependência ficam no [controle de progresso](../estado.json). Execute uma tarefa liberada por vez e continue enquanto houver trabalho autorizado com pré-requisitos satisfeitos.\n\n## Pendentes\n\n| Ordem | Tarefa | Dependências | Estado |\n|---:|---|---|---|\n${pending.map((task, index) => `| ${index + 1} | [${task.id} — ${task.title}](${task.id}.md) | ${task.dependencies.join(", ") || "—"} | ${task.status} |`).join("\n")}\n\n## Concluídas\n\n${completed.map((task) => `- ${task.id} — ${task.title}: [provas](../estado.json).`).join("\n") || "Nenhuma tarefa concluída."}\n`;
}

export function rewriteCompletedLinks(text, file, stateFile, completedFiles) {
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (original, label, target) => {
    if (/^[a-z]+:/i.test(target)) return original;
    const resolved = resolve(dirname(file), target.split("#")[0]);
    return completedFiles.has(resolved)
      ? `[${label}](${relative(dirname(file), stateFile).split(sep).join("/")})`
      : original;
  });
}

function main(args) {
  const stateFile = resolve(planDirectory, "estado.json");
  const cardsDirectory = resolve(planDirectory, "tarefas");
  const state = enrichTasks(JSON.parse(readFileSync(stateFile, "utf8")), (id) => {
    const card = resolve(cardsDirectory, `${id}.md`);
    return existsSync(card) ? readFileSync(card, "utf8") : null;
  });
  if (args[0] === "status") {
    const completed = state.tasks.filter((task) => task.status === "concluida");
    const ready = state.tasks.filter(
      (task) =>
        task.status === "planejada" &&
        task.dependencies.every((id) => completed.some((item) => item.id === id)),
    );
    console.log(
      JSON.stringify(
        {
          completed: completed.map((task) => task.id),
          ready: ready.map((task) => task.id),
          remaining: state.tasks.length - completed.length,
        },
        null,
        2,
      ),
    );
    return;
  }
  if (args[0] !== "complete" || !args[1] || !args[2])
    throw new Error(
      "Uso: node scripts/refactor-progress.mjs status | complete ID arquivo-de-provas.json",
    );
  const next = completeTask(
    state,
    args[1],
    JSON.parse(readFileSync(resolve(repository, args[2]), "utf8")),
  );
  const completedFiles = new Set(
    next.tasks
      .filter((task) => task.status === "concluida")
      .map((task) => resolve(cardsDirectory, `${task.id}.md`)),
  );
  const temporary = `${stateFile}.tmp`;
  writeFileSync(temporary, JSON.stringify(next, null, 2) + "\n");
  renameSync(temporary, stateFile);
  for (const directory of [planDirectory, cardsDirectory]) {
    for (const name of readdirSync(directory)) {
      if (!name.endsWith(".md")) continue;
      const file = resolve(directory, name);
      if (completedFiles.has(file)) continue;
      const old = readFileSync(file, "utf8");
      const updated = rewriteCompletedLinks(old, file, stateFile, completedFiles);
      if (updated !== old) writeFileSync(file, updated);
    }
  }
  writeFileSync(resolve(cardsDirectory, "README.md"), renderIndex(next));
  // A ficha só é removida depois de persistir as provas e reparar referências.
  for (const file of completedFiles) {
    if (!file.startsWith(cardsDirectory + sep))
      throw new Error("Ficha fora do diretório permitido.");
    if (existsSync(file)) unlinkSync(file);
  }
  console.log(`Concluída ${args[1]}; ficha removida e provas preservadas em estado.json.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  main(process.argv.slice(2));
