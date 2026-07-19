import type { VideoSubmission } from "../types";

export const DIRECT_PUBLICATION_STATUS = "Aprovado" as const;

export function migrateSubmissionToDirectPublication(
  submission: VideoSubmission
): VideoSubmission {
  if (
    submission.status !== "Em revisão" &&
    (submission.status as string) !== "Em revisao"
  ) {
    return submission;
  }

  return {
    ...submission,
    approvedAt: submission.approvedAt ?? submission.submittedAt,
    status: DIRECT_PUBLICATION_STATUS
  };
}
