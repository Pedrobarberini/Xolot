import assert from "node:assert/strict";
import test from "node:test";
import {
  getNotificationDestination,
  isSameNotificationPost,
} from "../src/utils/notificationDestination.ts";
import type { AppNotification } from "../src/types.ts";

const notification: AppNotification = {
  actorName: "Pedro",
  actorUsername: "pedro",
  actorUserId: "pedro",
  recipientUserId: "ana",
  id: "n1",
  kind: "like",
  sourceId: "source-1",
  playerId: "approved-post-1",
  createdAt: "2026-11-06T10:00:00.000Z",
};
test("resolve mensagem pelo remetente e comentários pelo sourceId, sem confundir compartilhamento com curtida", () => {
  assert.deepEqual(getNotificationDestination({ ...notification, kind: "shared-post" }, "ana"), {
    type: "conversation",
    contactId: "pedro",
    messageId: "source-1",
  });
  assert.deepEqual(getNotificationDestination({ ...notification, kind: "reply" }, "ana"), {
    type: "post",
    playerId: "approved-post-1",
    commentId: "source-1",
  });
  assert.deepEqual(getNotificationDestination(notification, "ana"), {
    type: "post",
    playerId: "approved-post-1",
  });
});
test("recusa destinos incompletos, caminhos de documentos e notificações de outra conta", () => {
  assert.equal(getNotificationDestination(notification, "outra-conta"), null);
  assert.equal(getNotificationDestination({ ...notification, playerId: undefined }, "ana"), null);
  assert.equal(
    getNotificationDestination({ ...notification, playerId: "posts/segredo" }, "ana"),
    null,
  );
  assert.equal(
    getNotificationDestination({ ...notification, kind: "message", sourceId: ".." }, "ana"),
    null,
  );
});
test("reconhece o ID legado da publicação sem misturar posts diferentes", () => {
  assert.equal(isSameNotificationPost("approved-post-1", "post-1"), true);
  assert.equal(isSameNotificationPost("approved-post-1", "post-2"), false);
});
