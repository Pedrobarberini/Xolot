import {
  CopyObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { R2_MEDIA_BUCKET, R2_UPLOADS_BUCKET } from "../../../config";
import { createR2Client, getCopySource } from "../../../r2";
import type { PostMediaStorage } from "../application/mediaPorts";

export function createR2PostMedia(): PostMediaStorage {
  const client = createR2Client();
  return {
    signUpload: (key, mimeType, ttlSeconds) =>
      getSignedUrl(
        client,
        new PutObjectCommand({ Bucket: R2_UPLOADS_BUCKET, ContentType: mimeType, Key: key }),
        { expiresIn: ttlSeconds },
      ),
    async headUpload(key) {
      const object = await client.send(
        new HeadObjectCommand({ Bucket: R2_UPLOADS_BUCKET, Key: key }),
      );
      return { size: object.ContentLength, mimeType: object.ContentType };
    },
    async copyToPublic(sourceKey, targetKey, mimeType) {
      await client.send(
        new CopyObjectCommand({
          Bucket: R2_MEDIA_BUCKET,
          CacheControl: "public,max-age=31536000,immutable",
          ContentType: mimeType,
          CopySource: getCopySource(R2_UPLOADS_BUCKET, sourceKey),
          Key: targetKey,
          MetadataDirective: "REPLACE",
        }),
      );
    },
    async deleteUpload(key) {
      await client.send(new DeleteObjectCommand({ Bucket: R2_UPLOADS_BUCKET, Key: key }));
    },
    async deletePublic(key) {
      await client.send(new DeleteObjectCommand({ Bucket: R2_MEDIA_BUCKET, Key: key }));
    },
  };
}
