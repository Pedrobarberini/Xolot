import { createHash } from "node:crypto";
import { FieldPath, FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import { getAdminRequestContext, requireVerifiedUser, verifyRegisteredUser } from "../../auth";
import { REGION } from "../../config";
import { protectedOnCall } from "../../platform/abuseProtection";
import { requireCommandRecord, requireDocumentId } from "../../validation";

const reasons = ["spam", "harassment", "violence", "sexual", "fraud", "other"] as const;
export const postReportId = (uid: string, postId: string) =>
  createHash("sha256").update(`${uid}\0${postId}`).digest("hex");

export const setPostReport = protectedOnCall(
  "setPostReport",
  { region: REGION },
  async (request) => {
    const uid = requireVerifiedUser(request);
    await verifyRegisteredUser(uid);
    const data = requireCommandRecord(request.data, ["playerId", "active", "reason"], 1024);
    const playerId = requireDocumentId(data.playerId, "Publicação");
    const postId = playerId.startsWith("approved-") ? playerId.slice(9) : playerId;
    if (
      !postId ||
      typeof data.active !== "boolean" ||
      (data.reason !== undefined && !reasons.includes(data.reason as (typeof reasons)[number]))
    )
      throw new HttpsError("invalid-argument", "Denúncia inválida.");
    const active = data.active;
    const reason = data.reason ?? "other";
    const db = getFirestore();
    const reference = db.doc(`moderationReports/${postReportId(uid, postId)}`);
    return db.runTransaction(async (transaction) => {
      const [post, report] = await Promise.all([
        transaction.get(db.doc(`posts/${postId}`)),
        transaction.get(reference),
      ]);
      const existing = report.data();
      if (!active && !report.exists) return { active: false };
      if (active && (!post.exists || post.data()?.status !== "published"))
        throw new HttpsError("not-found", "Publicação indisponível para denúncia.");
      if (report.exists && existing?.reporterUid !== uid)
        throw new HttpsError("permission-denied", "Denúncia indisponível.");
      if (existing?.status === "resolved" && active) return { active: true }; // Retries cannot reopen or undo an operator decision.
      if (
        (existing?.status === "open") === active &&
        report.exists &&
        (!active || existing?.reason === reason)
      )
        return { active };
      transaction.set(reference, {
        reporterUid: uid,
        postId,
        postAuthorUid: active ? post.data()!.authorId : existing!.postAuthorUid,
        reason: active ? reason : existing!.reason,
        status: active ? "open" : "withdrawn",
        createdAt: existing?.createdAt ?? FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { active };
    });
  },
);

export const listModerationReports = protectedOnCall(
  "listModerationReports",
  { region: REGION },
  async (request) => {
    getAdminRequestContext(request);
    const data = requireCommandRecord(request.data, ["afterId"], 1024);
    const afterId =
      data.afterId === undefined ? undefined : requireDocumentId(data.afterId, "Cursor", 64);
    if (afterId && !/^[a-f0-9]{64}$/.test(afterId))
      throw new HttpsError("invalid-argument", "Cursor inválido.");
    let query = getFirestore()
      .collection("moderationReports")
      .where("status", "==", "open")
      .orderBy(FieldPath.documentId())
      .limit(26);
    if (afterId) query = query.startAfter(afterId);
    const snapshot = await query.get();
    const postIds = [
      ...new Set(
        snapshot.docs
          .slice(0, 25)
          .map((doc) => doc.data().postId)
          .filter(
            (id): id is string => typeof id === "string" && id.length > 0 && !id.includes("/"),
          ),
      ),
    ];
    const posts = postIds.length
      ? await getFirestore().getAll(...postIds.map((id) => getFirestore().doc(`posts/${id}`)))
      : [];
    const titles = new Map(
      posts.map((post) => [
        post.id,
        post.data()?.status === "published" && typeof post.data()?.title === "string"
          ? post.data()!.title.slice(0, 120)
          : "Publicação indisponível",
      ]),
    );
    const reports = snapshot.docs.slice(0, 25).map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        postId: d.postId,
        postTitle: titles.get(d.postId) ?? "Publicação indisponível",
        reason: d.reason,
        status: d.status,
        createdAt: d.createdAt?.toDate().toISOString() ?? null,
      };
    });
    // Reporter identities are not needed in the review interface.
    return { reports, nextCursor: snapshot.size > 25 ? reports.at(-1)!.id : null };
  },
);

export const resolveModerationReport = protectedOnCall(
  "resolveModerationReport",
  { region: REGION },
  async (request) => {
    const { uid } = getAdminRequestContext(request);
    const data = requireCommandRecord(request.data, ["reportId", "decision"], 1024);
    const id = requireDocumentId(data.reportId, "Denúncia", 64);
    if (
      !/^[a-f0-9]{64}$/.test(id) ||
      !["reviewed", "no_violation"].includes(data.decision as string)
    )
      throw new HttpsError("invalid-argument", "Decisão inválida.");
    const db = getFirestore();
    const ref = db.doc(`moderationReports/${id}`);
    return db.runTransaction(async (transaction) => {
      const report = await transaction.get(ref);
      if (!report.exists) throw new HttpsError("not-found", "Denúncia indisponível.");
      if (report.data()?.status === "resolved") return { resolved: true };
      if (report.data()?.status !== "open")
        throw new HttpsError("failed-precondition", "A denúncia não está aberta.");
      transaction.update(ref, {
        status: "resolved",
        decision: data.decision,
        reviewedByUid: uid,
        reviewedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { resolved: true };
    });
  },
);
