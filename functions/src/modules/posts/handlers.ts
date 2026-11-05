import { randomUUID } from "node:crypto";
import { onCall } from "firebase-functions/v2/https";
import { getVerifiedRequestContext, verifyRegisteredUser } from "../../auth";
import {
  MAX_UPLOAD_INTENTS_PER_MINUTE,
  REGION,
  UPLOAD_INTENT_TTL_SECONDS,
  UPLOAD_URL_TTL_SECONDS,
  r2AccessKeyId,
  r2SecretAccessKey,
} from "../../config";
import { toCallableError } from "../../platform/callableErrors";
import { reportOperationFailure } from "../../platform/logger";
import { getPublicMediaUrl } from "../../r2";
import { createPostMediaService } from "./application/postMediaService";
import { parseCreateUpload, parseDeletePost, parseFinalization } from "./commands";
import { firestorePostMedia } from "./data/firestorePostMedia";
import { createR2PostMedia } from "./data/r2PostMedia";
import type { RequestInput } from "../accounts/domain/requestContext";

const service = createPostMediaService({
  repository: firestorePostMedia,
  createStorage: createR2PostMedia,
  publicUrl: getPublicMediaUrl,
  clock: { now: Date.now },
  ids: { next: randomUUID },
  reportSigningFailure: (error) => reportOperationFailure("media.upload.sign", error),
  intentTtlSeconds: UPLOAD_INTENT_TTL_SECONDS,
  uploadUrlTtlSeconds: UPLOAD_URL_TTL_SECONDS,
  maximumIntentsPerMinute: MAX_UPLOAD_INTENTS_PER_MINUTE,
});
const options = { region: REGION, secrets: [r2AccessKeyId, r2SecretAccessKey] };
async function command<T>(run: () => Promise<T>) {
  try {
    return await run();
  } catch (error: unknown) {
    throw toCallableError(error);
  }
}
export function createMediaCommandHandlers(
  mediaService: ReturnType<typeof createPostMediaService>,
  verifyRegistration: (uid: string) => Promise<void>,
) {
  return {
    create(request: RequestInput) {
      return command(async () => {
        const context = getVerifiedRequestContext(request);
        await verifyRegistration(context.uid);
        await mediaService.consumeCreateQuota(context);
        return mediaService.createUpload(context, parseCreateUpload(request.data));
      });
    },
    finalize(request: RequestInput) {
      return command(async () => {
        const context = getVerifiedRequestContext(request);
        await verifyRegistration(context.uid);
        const parsed = parseFinalization(request.data);
        return mediaService.finalizeUpload(context, parsed.uploadId, parsed.metadata);
      });
    },
    delete(request: RequestInput) {
      return command(async () => {
        const context = getVerifiedRequestContext(request);
        return mediaService.deletePost(context, parseDeletePost(request.data));
      });
    },
  };
}
const handlers = createMediaCommandHandlers(service, verifyRegisteredUser);
export const createMediaUpload = onCall(options, handlers.create);
export const finalizeMediaUpload = onCall(options, handlers.finalize);
export const deleteR2Post = onCall(options, handlers.delete);
