import type { VideoSubmission } from "../types";

export function removeOwnedVideoSubmission(
  submissions: VideoSubmission[],
  submissionId: string,
  ownerUserId: string
) {
  const ownsSubmission = submissions.some(
    (submission) =>
      submission.id === submissionId && submission.userId === ownerUserId
  );

  if (!ownsSubmission) {
    return submissions;
  }

  return submissions.filter(
    (submission) =>
      submission.id !== submissionId || submission.userId !== ownerUserId
  );
}
