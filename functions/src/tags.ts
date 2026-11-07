import { protectedOnCall } from "./platform/abuseProtection";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import { requireVerifiedUser, verifyRegisteredUser } from "./auth";
import { REGION } from "./config";
import { requireRecord, requireText } from "./validation";

const callableOptions = { region: REGION };
const MAX_TAG_LENGTH = 40;

type CatalogTag = { key: string; label: string };

function normalizedCount(value: unknown) {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0 ? value : 0;
}

function normalizeTagKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/^#+/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_TAG_LENGTH);
}

function normalizeTagLabel(value: string) {
  return value
    .trim()
    .replace(/^#+/, "")
    .replace(/[^\p{L}\p{N} ._-]+/gu, "")
    .replace(/\s+/g, " ")
    .slice(0, MAX_TAG_LENGTH)
    .trim();
}

function normalizeTag(value: string): CatalogTag | null {
  const label = normalizeTagLabel(value);
  const key = normalizeTagKey(label);
  return label.length >= 1 && key ? { key, label } : null;
}

function getPublishedTags(data: Record<string, unknown> | undefined) {
  const tags = new Map<string, string>();
  if (!data || data.status !== "published" || !Array.isArray(data.tags)) {
    return tags;
  }
  data.tags.forEach((value) => {
    if (typeof value !== "string") return;
    const tag = normalizeTag(value);
    if (tag) tags.set(tag.key, tag.label);
  });
  return tags;
}

export const ensureTagCatalogEntry = protectedOnCall(
  "ensureTagCatalogEntry",
  callableOptions,
  async (request) => {
    const uid = requireVerifiedUser(request);
    await verifyRegisteredUser(uid);

    const data = requireRecord(request.data);
    const requestedLabel = requireText(data.label, "Hashtag", 1, MAX_TAG_LENGTH);
    const tag = normalizeTag(requestedLabel);
    if (!tag || !/^[a-z0-9][a-z0-9-]{0,39}$/.test(tag.key)) {
      throw new HttpsError("invalid-argument", "Hashtag inválida.");
    }

    const database = getFirestore();
    const reference = database.doc(`tagCatalog/${tag.key}`);
    const result = await database.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(reference);
      const current = snapshot.data();
      if (!snapshot.exists) {
        transaction.set(reference, {
          createdAt: FieldValue.serverTimestamp(),
          creatorCount: 0,
          key: tag.key,
          label: tag.label,
          postCount: 0,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      return {
        creatorCount: normalizedCount(current?.creatorCount),
        key: tag.key,
        label: typeof current?.label === "string" ? current.label : tag.label,
        postCount: normalizedCount(current?.postCount),
      };
    });
    return result;
  },
);

async function syncTagUsage({
  authorId,
  label,
  postId,
  shouldExist,
  tagKey,
}: {
  authorId: string;
  label: string;
  postId: string;
  shouldExist: boolean;
  tagKey: string;
}) {
  const database = getFirestore();
  const catalogReference = database.doc(`tagCatalog/${tagKey}`);
  const markerReference = database.doc(`tagCatalog/${tagKey}/posts/${postId}`);

  await database.runTransaction(async (transaction) => {
    const marker = await transaction.get(markerReference);
    if (marker.exists === shouldExist) return;

    const markerAuthorId =
      typeof marker.data()?.authorId === "string" ? (marker.data()?.authorId as string) : authorId;
    const usageReference = database.doc(`tagCatalog/${tagKey}/users/${markerAuthorId}`);
    const [catalog, usage] = await Promise.all([
      transaction.get(catalogReference),
      transaction.get(usageReference),
    ]);
    const catalogData = catalog.data();
    const currentPosts = normalizedCount(catalogData?.postCount);
    const currentCreators = normalizedCount(catalogData?.creatorCount);
    const userPosts = normalizedCount(usage.data()?.postCount);

    if (shouldExist) {
      transaction.set(markerReference, {
        authorId,
        createdAt: FieldValue.serverTimestamp(),
        postId,
      });
      transaction.set(usageReference, {
        authorId,
        createdAt: usage.exists
          ? (usage.data()?.createdAt ?? FieldValue.serverTimestamp())
          : FieldValue.serverTimestamp(),
        postCount: userPosts + 1,
        updatedAt: FieldValue.serverTimestamp(),
      });
      transaction.set(
        catalogReference,
        {
          ...(catalog.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
          creatorCount: currentCreators + (userPosts === 0 ? 1 : 0),
          key: tagKey,
          label: typeof catalogData?.label === "string" ? catalogData.label : label,
          postCount: currentPosts + 1,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
      return;
    }

    transaction.delete(markerReference);
    if (userPosts <= 1) transaction.delete(usageReference);
    else {
      transaction.set(
        usageReference,
        {
          postCount: userPosts - 1,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }
    transaction.set(
      catalogReference,
      {
        creatorCount: Math.max(0, currentCreators - (userPosts <= 1 ? 1 : 0)),
        postCount: Math.max(0, currentPosts - 1),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  });
}

export const syncPostTagCatalog = onDocumentWritten(
  { document: "posts/{postId}", region: REGION },
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();
    const beforeTags = getPublishedTags(beforeData);
    const afterTags = getPublishedTags(afterData);
    const beforeAuthorId = typeof beforeData?.authorId === "string" ? beforeData.authorId : "";
    const afterAuthorId = typeof afterData?.authorId === "string" ? afterData.authorId : "";
    const postId = event.params.postId;
    const tagKeys = new Set([...beforeTags.keys(), ...afterTags.keys()]);

    for (const tagKey of tagKeys) {
      const shouldExist = afterTags.has(tagKey) && Boolean(afterAuthorId);
      const wasPresent = beforeTags.has(tagKey) && Boolean(beforeAuthorId);
      if (shouldExist === wasPresent && beforeAuthorId === afterAuthorId) {
        continue;
      }
      await syncTagUsage({
        authorId: shouldExist ? afterAuthorId : beforeAuthorId,
        label: afterTags.get(tagKey) ?? beforeTags.get(tagKey) ?? tagKey,
        postId,
        shouldExist,
        tagKey,
      });
    }
  },
);
