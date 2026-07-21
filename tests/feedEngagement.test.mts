import assert from "node:assert/strict";
import test from "node:test";
import type { Player } from "../src/types.ts";
import {
  countSelectionsByPlayer,
  getPlayerContentKey,
  getPlayerContentLabel,
  toggleSelection
} from "../src/utils/feedEngagement.ts";

const player: Player = {
  age: 18,
  city: "São Paulo, SP",
  club: "Projeto Teste",
  highlight: "Treino de domínio.",
  id: "player-a",
  name: "Atleta A",
  position: "Meia",
  profileId: "profile-a",
  tags: ["Técnica", "Treino"],
  videoLength: "0:08",
  videoTitle: "Domínio orientado",
  videoUri: "video.mp4"
};

test("gera uma categoria estável usando a primeira tag", () => {
  assert.equal(getPlayerContentKey(player), "tag:tecnica");
  assert.equal(getPlayerContentLabel(player), "#Técnica");
  assert.equal(
    getPlayerContentKey({ ...player, mediaType: "image", tags: [] }),
    "media:image"
  );
});

test("conta uma interação por conta mesmo com dados duplicados", () => {
  assert.deepEqual(
    countSelectionsByPlayer({
      "user-a": ["player-a", "player-a", "player-b"],
      "user-b": ["player-a"]
    }),
    {
      "player-a": 2,
      "player-b": 1
    }
  );
});

test("adiciona e remove uma seleção de forma reversível", () => {
  assert.deepEqual(toggleSelection([], "player-a"), ["player-a"]);
  assert.deepEqual(toggleSelection(["player-a", "player-b"], "player-a"), [
    "player-b"
  ]);
});
