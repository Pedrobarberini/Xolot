import { protectedOnCall } from "../../platform/abuseProtection";
import { getFirestore } from "firebase-admin/firestore";
import { getVerifiedRequestContext, verifyRegisteredUser } from "../../auth";
import { REGION } from "../../config";
import type { RequestInput } from "../accounts/domain/requestContext";
import { toCallableError } from "../../platform/callableErrors";
import { createEngagementService } from "./application/engagementService";
import { createFirestoreEngagementRepository } from "./data/firestoreEngagement";
import { parseLikeCommand, parseViewCommand } from "./commands";

type EngagementRequest = RequestInput & { data: unknown };
export function createEngagementCommandHandlers(
  service: ReturnType<typeof createEngagementService>,
  requireRegistration: (uid: string) => Promise<void>,
) {
  return {
    async setLike(request: EngagementRequest) {
      try {
        const { uid } = getVerifiedRequestContext(request);
        await requireRegistration(uid);
        const command = parseLikeCommand(request.data);
        return await service.setLike(uid, command, command.liked);
      } catch (error: unknown) {
        throw toCallableError(error);
      }
    },
    async recordView(request: EngagementRequest) {
      try {
        const { uid } = getVerifiedRequestContext(request);
        await requireRegistration(uid);
        return await service.recordView(uid, parseViewCommand(request.data));
      } catch (error: unknown) {
        throw toCallableError(error);
      }
    },
  };
}
const handlers = createEngagementCommandHandlers(
  createEngagementService(createFirestoreEngagementRepository(getFirestore)),
  verifyRegisteredUser,
);
export const setPostLike = protectedOnCall("setPostLike", { region: REGION }, handlers.setLike);
export const recordPostView = protectedOnCall(
  "recordPostView",
  { region: REGION },
  handlers.recordView,
);
