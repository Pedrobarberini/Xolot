import assert from "node:assert/strict";
import test from "node:test";
import { parseSubmissionTokens } from "../src/utils/submissionMetadata.ts";

test("normaliza tags sem duplicar e respeita o limite", () => {
  assert.deepEqual(
    parseSubmissionTokens("#Treino treino, #futebol; técnica", "#", 3),
    ["Treino", "futebol", "técnica"]
  );
});

test("normaliza marcacoes removendo caracteres invalidos", () => {
  assert.deepEqual(
    parseSubmissionTokens("@clube.oficial @@Projeto-10 pessoa!", "@"),
    ["clube.oficial", "Projeto-10", "pessoa"]
  );
});
