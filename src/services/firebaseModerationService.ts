import { httpsCallable } from "firebase/functions";
import { getFirebaseFunctions } from "../config/firebase";

export type ModerationReport = {
  id: string;
  postId: string;
  postTitle: string;
  reason: string;
  status: string;
  createdAt: string | null;
};
export async function loadModerationReports(afterId?: string) {
  const run = httpsCallable<
    { afterId?: string },
    { reports: ModerationReport[]; nextCursor: string | null }
  >(getFirebaseFunctions(), "listModerationReports");
  return (await run(afterId ? { afterId } : {})).data;
}
export async function resolveModerationReport(
  reportId: string,
  decision: "reviewed" | "no_violation",
) {
  const run = httpsCallable(getFirebaseFunctions(), "resolveModerationReport");
  await run({ reportId, decision });
}
