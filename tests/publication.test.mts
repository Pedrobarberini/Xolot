import assert from "node:assert/strict";
import test from "node:test";
import {
  DIRECT_PUBLICATION_STATUS,
  migrateSubmissionToDirectPublication
} from "../src/utils/publication.ts";

const pendingSubmission = {
  age: 18,
  athleteName: "Atleta Teste",
  city: "São Paulo, SP",
  club: "Projeto Teste",
  hasGuardianConsent: false,
  highlight: "Texto da publicação",
  id: "video-pendente",
  position: "Ponta",
  status: "Em revisão" as const,
  submittedAt: "2026-07-16T20:00:00.000Z",
  userId: "usuario-teste",
  videoLink: "https://nextstar.test/video.mp4",
  videoTitle: "Melhores lances"
};

test("define novos envios como publicação direta", () => {
  assert.equal(DIRECT_PUBLICATION_STATUS, "Aprovado");
});

test("migra pendência antiga para publicação visível", () => {
  const migrated = migrateSubmissionToDirectPublication(pendingSubmission);

  assert.equal(migrated.status, "Aprovado");
  assert.equal(migrated.approvedAt, pendingSubmission.submittedAt);
});

test("preserva uma publicação que já recebeu decisão", () => {
  const rejected = {
    ...pendingSubmission,
    status: "Reprovado" as const
  };

  assert.equal(migrateSubmissionToDirectPublication(rejected), rejected);
});
