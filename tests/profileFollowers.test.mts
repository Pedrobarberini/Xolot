import assert from "node:assert/strict";
import test from "node:test";
import { buildFollowerUserIdsByProfile } from "../src/utils/profileFollowers.ts";

test("agrupa seguidores por perfil sem duplicar um mesmo follow", () => {
  assert.deepEqual(
    buildFollowerUserIdsByProfile({
      "usuario-1": ["perfil-a", "perfil-a", "perfil-b"],
      "usuario-2": ["perfil-a"]
    }),
    {
      "perfil-a": ["usuario-1", "usuario-2"],
      "perfil-b": ["usuario-1"]
    }
  );
});
