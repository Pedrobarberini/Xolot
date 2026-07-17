import assert from "node:assert/strict";
import test from "node:test";
import type { VideoSubmission } from "../src/types.ts";
import { removeOwnedVideoSubmission } from "../src/utils/videoSubmission.ts";

function createSubmission(id: string, userId: string): VideoSubmission {
  return {
    age: 18,
    athleteName: `Atleta ${userId}`,
    city: "Sao Paulo, SP",
    club: "Projeto NextStar",
    guardianConsent: true,
    highlight: "Texto da publicacao",
    id,
    position: "Ponta",
    status: "Aprovado",
    submittedAt: "2026-07-16T00:00:00.000Z",
    userId,
    videoLink: `nextstar-video:${id}`,
    videoTitle: `Video ${id}`
  };
}

test("remove somente o video pertencente ao usuario conectado", () => {
  const ownVideo = createSubmission("video-1", "user-1");
  const otherVideo = createSubmission("video-1", "user-2");

  const result = removeOwnedVideoSubmission(
    [ownVideo, otherVideo],
    ownVideo.id,
    "user-1"
  );

  assert.deepEqual(result, [otherVideo]);
});

test("nao remove video pertencente a outro usuario", () => {
  const ownVideo = createSubmission("video-1", "user-1");
  const otherVideo = createSubmission("video-2", "user-2");
  const submissions = [ownVideo, otherVideo];

  const result = removeOwnedVideoSubmission(
    submissions,
    otherVideo.id,
    "user-1"
  );

  assert.equal(result, submissions);
  assert.deepEqual(result, [ownVideo, otherVideo]);
});
