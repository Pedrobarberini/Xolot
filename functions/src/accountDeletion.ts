import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { getAuth } from "firebase-admin/auth";
import {
  type DocumentReference,
  type Query,
  getFirestore
} from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import * as functions from "firebase-functions/v1";
import { onCall } from "firebase-functions/v2/https";
import {
  REGION,
  R2_MEDIA_BUCKET,
  R2_UPLOADS_BUCKET,
  mercadoPagoAccessToken,
  r2AccessKeyId,
  r2SecretAccessKey
} from "./config";
import { assertRecentAuthentication, getVerifiedRequestContext } from "./auth";
import { cancelPlusSubscriptionForAccountDeletion } from "./mercadoPago";
import { createR2Client } from "./r2";

const MAX_IN_FILTER_VALUES = 30;
const RECENT_AUTH_WINDOW_SECONDS = 10 * 60;

function chunkValues<T>(values: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
}

function readKey(data: Record<string, unknown> | undefined, field: string) {
  const value = data?.[field];
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

async function deleteR2Objects(bucket: string, keys: Set<string>) {
  if (keys.size === 0) return;
  const client = createR2Client();
  try {
    for (const entries of chunkValues(Array.from(keys), 1000)) {
      const response = await client.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: {
            Objects: entries.map((Key) => ({ Key })),
            Quiet: true
          }
        })
      );
      if (response.Errors?.length) {
        throw new Error(
          `O R2 recusou a exclusão de ${response.Errors.length} arquivo(s).`
        );
      }
    }
  } finally {
    client.destroy();
  }
}

async function deleteLegacyStorage(uid: string) {
  const bucket = getStorage().bucket();
  await Promise.all([
    bucket.deleteFiles({ prefix: `posts/${uid}/` }),
    bucket
      .file(`avatars/${uid}/profile`)
      .delete({ ignoreNotFound: true })
  ]);
}

async function loadReferences(queries: Query[]) {
  const snapshots = await Promise.all(queries.map((query) => query.get()));
  return snapshots.flatMap((snapshot) =>
    snapshot.docs.map((document) => document.ref)
  );
}

async function deleteReferences(references: DocumentReference[]) {
  if (references.length === 0) return;
  const writer = getFirestore().bulkWriter();
  writer.onWriteError((error) => error.failedAttempts < 5);
  const uniqueReferences = new Map(
    references.map((reference) => [reference.path, reference])
  );
  uniqueReferences.forEach((reference) => writer.delete(reference));
  await writer.close();
}

export async function cleanupAccountData(uid: string) {
  const database = getFirestore();
  await cancelPlusSubscriptionForAccountDeletion(uid);

  const [
    profile,
    profileMedia,
    posts,
    mediaUploadIntents,
    avatarUploadIntents
  ] = await Promise.all([
    database.doc(`profiles/${uid}`).get(),
    database.doc(`profileMedia/${uid}`).get(),
    database.collection("posts").where("authorId", "==", uid).get(),
    database.collection("mediaUploadIntents").where("ownerUid", "==", uid).get(),
    database.collection("avatarUploadIntents").where("ownerUid", "==", uid).get()
  ]);

  const postIds = posts.docs.map((document) => document.id);
  const playerIds = postIds.flatMap((postId) => [
    postId,
    `approved-${postId}`
  ]);
  const profileData = profile.data();
  const profileMediaData = profileMedia.data();
  const mediaKeys = new Set<string>();
  const uploadKeys = new Set<string>();

  const profileMediaKey = readKey(profileMediaData, "mediaKey");
  if (profileMediaKey) mediaKeys.add(profileMediaKey);
  posts.docs.forEach((document) => {
    const data = document.data();
    const mediaKey = readKey(data, "mediaKey");
    const thumbnailKey = readKey(data, "thumbnailKey");
    if (mediaKey) mediaKeys.add(mediaKey);
    if (thumbnailKey) mediaKeys.add(thumbnailKey);
  });
  [...mediaUploadIntents.docs, ...avatarUploadIntents.docs].forEach(
    (document) => {
      const data = document.data();
      const uploadKey = readKey(data, "uploadKey");
      const mediaKey = readKey(data, "mediaKey");
      if (uploadKey) uploadKeys.add(uploadKey);
      if (mediaKey) mediaKeys.add(mediaKey);
    }
  );

  await Promise.all([
    deleteR2Objects(R2_MEDIA_BUCKET, mediaKeys),
    deleteR2Objects(R2_UPLOADS_BUCKET, uploadKeys),
    deleteLegacyStorage(uid)
  ]);

  const directQueries: Query[] = [
    database.collection("usernames").where("uid", "==", uid),
    database.collection("follows").where("followerUid", "==", uid),
    database.collection("follows").where("targetUid", "==", uid),
    database.collection("directMessages").where("senderUserId", "==", uid),
    database.collection("directMessages").where("recipientUserId", "==", uid),
    database.collection("notifications").where("actorUserId", "==", uid),
    database.collection("notifications").where("recipientUserId", "==", uid),
    database.collection("postComments").where("authorUserId", "==", uid)
  ];
  const relatedQueries: Query[] = [
    ...chunkValues(postIds, MAX_IN_FILTER_VALUES).flatMap((ids) => [
      database.collection("postComments").where("postId", "in", ids)
    ]),
    ...chunkValues(playerIds, MAX_IN_FILTER_VALUES).flatMap((ids) => [
      database.collection("notifications").where("playerId", "in", ids),
      database
        .collection("directMessages")
        .where("sharedPost.playerId", "in", ids),
      database.collectionGroup("posts").where("playerId", "in", ids)
    ])
  ];
  const queriedReferences = await loadReferences([
    ...directQueries,
    ...relatedQueries
  ]);

  const fixedReferences = [
    database.doc(`accounts/${uid}`),
    database.doc(`pendingAccounts/${uid}`),
    database.doc(`profiles/${uid}`),
    database.doc(`profileMedia/${uid}`),
    database.doc(`socialPreferences/${uid}`),
    database.doc(`subscriptions/${uid}`),
    database.doc(`mediaRateLimits/${uid}`),
    database.doc(`avatarRateLimits/${uid}`),
    database.doc(`tagRateLimits/${uid}`),
    database.doc(`socialRateLimits/${uid}_messages`)
  ];
  if (typeof profileData?.username === "string" && profileData.username) {
    fixedReferences.push(database.doc(`usernames/${profileData.username}`));
  }

  await deleteReferences([
    ...fixedReferences,
    ...posts.docs.map((document) => document.ref),
    ...mediaUploadIntents.docs.map((document) => document.ref),
    ...avatarUploadIntents.docs.map((document) => document.ref),
    ...queriedReferences,
    ...playerIds.map((playerId) =>
      database.doc(`postEngagement/${playerId}`)
    )
  ]);
  await Promise.all([
    database.recursiveDelete(database.doc(`userPostLikes/${uid}`)),
    database.recursiveDelete(database.doc(`userPostViews/${uid}`))
  ]);
}

export const deleteOwnAccount = onCall(
  { region: REGION },
  async (request) => {
    const context = getVerifiedRequestContext(request);
    const now = Math.floor(Date.now() / 1000);
    assertRecentAuthentication(context, now, RECENT_AUTH_WINDOW_SECONDS);
    await getAuth().deleteUser(context.uid);
    return { deleted: true };
  }
);

export const cleanupDeletedAccount = functions
  .region(REGION)
  .runWith({
    memory: "1GB",
    secrets: [
      r2AccessKeyId,
      r2SecretAccessKey,
      mercadoPagoAccessToken
    ],
    timeoutSeconds: 540
  })
  .auth.user()
  .onDelete(async (user) => {
    await cleanupAccountData(user.uid);
    console.info("Dados da conta excluídos.", { uid: user.uid });
  });
