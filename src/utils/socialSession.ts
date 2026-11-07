import type { SocialState } from "../services/socialStorage";

// A projeção local nunca carrega mapas privados de outra conta na sessão atual.
export function socialStateForUser(state: SocialState, uid: string): SocialState {
  const own = <T>(values: Record<string, T>): Record<string, T> =>
    Object.prototype.hasOwnProperty.call(values, uid) ? { [uid]: values[uid] } : {};
  return {
    blockedProfileIdsByUser: own(state.blockedProfileIdsByUser),
    conversationPreferencesByUser: own(state.conversationPreferencesByUser),
    directMessages: state.directMessages.filter(
      (message) => message.senderUserId === uid || message.recipientUserId === uid,
    ),
    followingByUser: own(state.followingByUser),
    hiddenPlayerIdsByUser: own(state.hiddenPlayerIdsByUser),
    interestedContentKeysByUser: own(state.interestedContentKeysByUser),
    likedPlayerIdsByUser: own(state.likedPlayerIdsByUser),
    messageContactsByUser: own(state.messageContactsByUser),
    mutedContentKeysByUser: own(state.mutedContentKeysByUser),
    postComments: state.postComments.filter((comment) => comment.authorUserId === uid),
    reportedPlayerIdsByUser: own(state.reportedPlayerIdsByUser),
    viewedPlayerIdsByUser: own(state.viewedPlayerIdsByUser),
  };
}

export function socialStorageKey(uid: string) {
  if (!uid || uid.length > 128 || /[\u0000-\u001f/]/.test(uid)) throw new Error("Sessão inválida.");
  return `@folko/social-state-v2:${uid}`;
}
