import { protectedOnCall } from "./platform/abuseProtection";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import { requireVerifiedUser, verifyRegisteredUser } from "./auth";
import { REGION } from "./config";
import { requireRecord, requireText } from "./validation";

const callableOptions = { region: REGION };
const MAX_RECEIPTS_PER_REQUEST = 100;

function normalizeMessageIds(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value.filter(
        (messageId): messageId is string =>
          typeof messageId === "string" &&
          messageId.length > 0 &&
          messageId.length <= 128 &&
          /^[A-Za-z0-9_-]+$/.test(messageId),
      ),
    ),
  ).slice(0, MAX_RECEIPTS_PER_REQUEST);
}

export const updateDirectMessageReceipts = protectedOnCall(
  "updateDirectMessageReceipts",
  callableOptions,
  async (request) => {
    const uid = requireVerifiedUser(request);
    await verifyRegisteredUser(uid);
    const data = requireRecord(request.data);
    const status = requireText(data.status, "Status", 1, 16);
    if (status !== "delivered" && status !== "read") {
      throw new HttpsError("invalid-argument", "Status de mensagem inválido.");
    }

    const messageIds = normalizeMessageIds(data.messageIds);
    if (messageIds.length === 0) {
      return { updated: 0 };
    }

    const database = getFirestore();
    const updated = await database.runTransaction(async (transaction) => {
      let changed = 0;
      const snapshots = await Promise.all(
        messageIds.map((messageId) => transaction.get(database.doc(`directMessages/${messageId}`))),
      );

      snapshots.forEach((snapshot) => {
        if (!snapshot.exists) {
          return;
        }

        const message = snapshot.data();
        if (message?.recipientUserId !== uid) {
          throw new HttpsError(
            "permission-denied",
            "Você não pode alterar o recibo desta mensagem.",
          );
        }

        const receipt: Record<string, FieldValue> = {};
        if (!message.deliveredAt) {
          receipt.deliveredAt = FieldValue.serverTimestamp();
        }
        if (status === "read" && !message.readAt) {
          receipt.readAt = FieldValue.serverTimestamp();
        }
        if (Object.keys(receipt).length > 0) {
          transaction.update(snapshot.ref, receipt);
          changed += 1;
        }
      });
      return changed;
    });

    return { updated };
  },
);
