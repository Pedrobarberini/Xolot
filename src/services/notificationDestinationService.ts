import { doc, getDoc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { buildPlayerFromSubmission } from "../actions/appActions";
import { getFirebaseFirestore, getFirebaseStorage } from "../config/firebase";
import {
  firebasePostToSubmission,
  normalizeFirebasePostDocument,
} from "../utils/firebasePostDocument";
import { isNotificationDocumentId, isSameNotificationPost } from "../utils/notificationDestination";
import { normalizePostComment } from "../utils/postComments";
import { normalizeDirectMessage } from "./firebaseSocialService";
import { getR2MediaUrl } from "./r2PostService";

export async function loadNotificationPost(playerId: string) {
  if (!isNotificationDocumentId(playerId)) return null;
  const postId = playerId.startsWith("approved-") ? playerId.slice("approved-".length) : playerId;
  if (!isNotificationDocumentId(postId)) return null;
  const snapshot = await getDoc(doc(getFirebaseFirestore(), "posts", postId));
  const post = normalizeFirebasePostDocument(snapshot.id, snapshot.data());
  if (!post) return null;
  const mediaURL =
    post.storageProvider === "r2"
      ? getR2MediaUrl(post.mediaKey)
      : await getDownloadURL(ref(getFirebaseStorage(), post.mediaPath));
  return buildPlayerFromSubmission(firebasePostToSubmission(snapshot.id, post, mediaURL));
}

export async function loadNotificationMessage(
  messageId: string,
  recipientId: string,
  actorId: string,
) {
  if (!isNotificationDocumentId(messageId)) return null;
  const snapshot = await getDoc(doc(getFirebaseFirestore(), "directMessages", messageId));
  const message = normalizeDirectMessage(snapshot.id, snapshot.data());
  return message?.recipientUserId === recipientId && message.senderUserId === actorId
    ? message
    : null;
}

async function loadComment(commentId: string, playerId: string) {
  if (!isNotificationDocumentId(commentId)) return null;
  const snapshot = await getDoc(doc(getFirebaseFirestore(), "postComments", commentId));
  const data = snapshot.data();
  const timestamp = data?.createdAt;
  const comment = normalizePostComment({
    ...data,
    id: snapshot.id,
    createdAt:
      typeof timestamp?.toDate === "function" ? timestamp.toDate().toISOString() : timestamp,
  });
  return comment && isSameNotificationPost(comment.playerId, playerId)
    ? { ...comment, playerId }
    : null;
}

export async function loadNotificationCommentThread(commentId: string, playerId: string) {
  const comment = await loadComment(commentId, playerId);
  if (!comment) return [];
  const parent = comment.parentCommentId
    ? await loadComment(comment.parentCommentId, playerId)
    : null;
  return parent ? [parent, comment] : [comment];
}
