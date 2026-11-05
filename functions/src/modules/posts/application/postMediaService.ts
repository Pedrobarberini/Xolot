import { OperationError } from "../../../domain/OperationError";
import { requireResourceOwner, type RequestContext } from "../../accounts/domain/requestContext";
import type {
  CreateUploadCommand,
  FinalizationMetadata,
  MediaKind,
  UploadIntent,
} from "../domain/mediaTypes";
import type { MediaDependencies } from "./mediaPorts";

export function createPostMediaService(dependencies: MediaDependencies) {
  const { repository, clock, ids, publicUrl, createStorage } = dependencies;
  const result = (intent: UploadIntent) => ({
    mediaKey: intent.mediaKey,
    mediaURL: publicUrl(intent.mediaKey),
    postId: intent.postId,
  });
  return {
    async consumeCreateQuota(context: RequestContext) {
      await repository.consumeCreateQuota(
        context.uid,
        clock.now(),
        dependencies.maximumIntentsPerMinute,
      );
    },
    async createUpload(context: RequestContext, command: CreateUploadCommand) {
      if (await repository.getPost(command.postId))
        throw new OperationError("already-exists", "Esta publicação já existe.");
      const uploadId = ids.next();
      const objectId = ids.next();
      const intent: UploadIntent = {
        expectedSize: command.fileSize,
        expiresAtMs: clock.now() + dependencies.intentTtlSeconds * 1000,
        fileName: command.fileName,
        mediaKey: `users/${context.uid}/posts/${command.postId}/${objectId}.${command.extension}`,
        mediaType: command.mediaType,
        mimeType: command.mimeType,
        ownerUid: context.uid,
        postId: command.postId,
        status: "pending",
        uploadKey: `pending/${context.uid}/${command.postId}/${objectId}.${command.extension}`,
      };
      await repository.createIntent(uploadId, intent);
      let uploadUrl: string;
      try {
        uploadUrl = await createStorage().signUpload(
          intent.uploadKey,
          intent.mimeType,
          dependencies.uploadUrlTtlSeconds,
        );
      } catch (error: unknown) {
        dependencies.reportSigningFailure(error);
        throw new OperationError(
          "failed-precondition",
          "O armazenamento de mídia ainda não está configurado corretamente.",
        );
      }
      return {
        contentType: intent.mimeType,
        expiresAt: new Date(intent.expiresAtMs).toISOString(),
        uploadId,
        uploadUrl,
      };
    },
    async finalizeUpload(
      context: RequestContext,
      uploadId: string,
      metadata: (kind: MediaKind) => FinalizationMetadata,
    ) {
      const intent = await repository.getIntent(uploadId);
      if (!intent)
        throw new OperationError("not-found", "O envio expirou. Selecione o arquivo novamente.");
      requireResourceOwner(context, intent.ownerUid, "Este envio pertence a outra conta.");
      if (intent.expiresAtMs < clock.now())
        throw new OperationError("deadline-exceeded", "O envio expirou. Tente novamente.");
      if (intent.status === "completed") return result(intent);
      const content = metadata(intent.mediaType);
      const storage = createStorage();
      const uploaded = await storage.headUpload(intent.uploadKey).catch(() => null);
      if (!uploaded)
        throw new OperationError("not-found", "O arquivo não chegou ao armazenamento.");
      if (uploaded.size !== intent.expectedSize || uploaded.mimeType !== intent.mimeType) {
        await storage.deleteUpload(intent.uploadKey).catch(() => undefined);
        throw new OperationError(
          "invalid-argument",
          "O arquivo enviado não corresponde ao arquivo autorizado.",
        );
      }
      await repository.markFinalizing(uploadId);
      await storage.copyToPublic(intent.uploadKey, intent.mediaKey, intent.mimeType);
      await repository.publish(uploadId, intent.postId, {
        ...content,
        authorId: context.uid,
        fileName: intent.fileName,
        fileSize: intent.expectedSize,
        mediaKey: intent.mediaKey,
        mediaPath: intent.mediaKey,
        mediaType: intent.mediaType,
        mimeType: intent.mimeType,
        status: "published",
        storageProvider: "r2",
      });
      await storage.deleteUpload(intent.uploadKey).catch(() => undefined);
      return result(intent);
    },
    async deletePost(context: RequestContext, id: string) {
      const post = await repository.getPost(id);
      if (!post) return { deleted: false };
      requireResourceOwner(context, post.authorId, "Esta publicação pertence a outra conta.");
      if (post.storageProvider !== "r2" || typeof post.mediaKey !== "string")
        throw new OperationError(
          "failed-precondition",
          "Esta publicação não usa o armazenamento R2.",
        );
      const storage = createStorage();
      await storage.deletePublic(post.mediaKey);
      if (typeof post.thumbnailKey === "string")
        await storage.deletePublic(post.thumbnailKey).catch(() => undefined);
      await repository.deletePost(id);
      return { deleted: true };
    },
  };
}
