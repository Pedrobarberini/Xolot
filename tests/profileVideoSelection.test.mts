import assert from "node:assert/strict";
import test from "node:test";
import {
  addProfileVideoSelection,
  toggleProfileVideoSelection
} from "../src/utils/profileVideoSelection.ts";

test("inicia a selecao sem duplicar o video pressionado", () => {
  assert.deepEqual(addProfileVideoSelection([], "video-1"), ["video-1"]);
  assert.deepEqual(addProfileVideoSelection(["video-1"], "video-1"), [
    "video-1"
  ]);
});

test("adiciona e remove videos por toque durante a selecao", () => {
  const selected = toggleProfileVideoSelection(["video-1"], "video-2");

  assert.deepEqual(selected, ["video-1", "video-2"]);
  assert.deepEqual(toggleProfileVideoSelection(selected, "video-1"), [
    "video-2"
  ]);
  assert.deepEqual(toggleProfileVideoSelection(["video-2"], "video-2"), []);
});
