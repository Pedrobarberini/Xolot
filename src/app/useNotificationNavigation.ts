import { useEffect, useMemo, useRef, useState } from "react";
import type {
  AppNotification,
  AppUser,
  DirectMessage,
  MessageContact,
  Player,
  PostComment,
} from "../types";
import type { Tab } from "../ui/types";
import {
  getNotificationDestination,
  isSameNotificationPost,
} from "../utils/notificationDestination";
import {
  loadNotificationCommentThread,
  loadNotificationMessage,
  loadNotificationPost,
} from "../services/notificationDestinationService";
import type { NotificationContent } from "../utils/notificationDestination";

export type NotificationPostTarget = {
  player: Player;
  commentId?: string;
  comments: PostComment[];
  requestId: number;
};

type MessageTarget = {
  contact: MessageContact;
  message: DirectMessage | null;
  messageId: string;
  requestId: number;
};

type Options = {
  blockedProfileIds: Set<string>;
  commentsByPlayer: Record<string, PostComment[]>;
  currentUserId: string;
  messages: DirectMessage[];
  onNotice: (title: string, body: string) => void;
  onOpenConversation: (contactId: string) => void;
  onOpenPost: (player: Player) => void;
  onResolveContent?: (content: NotificationContent) => void;
  players: Player[];
  tab: Tab;
  users: AppUser[];
};

export function useNotificationNavigation(options: Options) {
  const latest = useRef(options);
  latest.current = options;
  const request = useRef(0);
  const [postTarget, setPostTarget] = useState<NotificationPostTarget | null>(null);
  const [messageTarget, setMessageTarget] = useState<MessageTarget | null>(null);

  useEffect(() => {
    request.current += 1;
    if (options.tab !== "feed") setPostTarget(null);
    if (options.tab !== "messages") setMessageTarget(null);
    return () => {
      request.current += 1;
    };
  }, [options.currentUserId, options.tab]);

  const sessionId = useRef(options.currentUserId);
  useEffect(() => {
    if (sessionId.current === options.currentUserId) return;
    sessionId.current = options.currentUserId;
    setPostTarget(null);
    setMessageTarget(null);
  }, [options.currentUserId]);

  async function openNotification(notification: AppNotification) {
    const operation = ++request.current;
    const { currentUserId, tab } = options;
    const isCurrent = () =>
      request.current === operation &&
      latest.current.currentUserId === currentUserId &&
      latest.current.tab === tab;
    const destination = getNotificationDestination(notification, currentUserId);
    setPostTarget(null);
    setMessageTarget(null);
    if (!destination) {
      options.onNotice(
        "Destino indisponível",
        "Não foi possível localizar o conteúdo desta notificação.",
      );
      return;
    }

    try {
      if (destination.type === "conversation") {
        const profileId = "profile-" + destination.contactId;
        if (options.blockedProfileIds.has(profileId)) {
          options.onNotice(
            "Perfil bloqueado",
            "Desbloqueie este perfil nas configurações para abrir a conversa.",
          );
          return;
        }
        const local = options.messages.find(
          (item) =>
            item.id === destination.messageId &&
            item.recipientUserId === currentUserId &&
            item.senderUserId === destination.contactId,
        );
        const message =
          local ??
          (await loadNotificationMessage(
            destination.messageId,
            currentUserId,
            destination.contactId,
          ));
        if (!isCurrent() || latest.current.blockedProfileIds.has(profileId)) return;
        setMessageTarget({
          contact: {
            id: destination.contactId,
            profileId,
            name: notification.actorName,
            username: notification.actorUsername,
            subtitle: "",
          },
          message,
          messageId: destination.messageId,
          requestId: operation,
        });
        options.onResolveContent?.({ userId: currentUserId, message });
        options.onOpenConversation(destination.contactId);
        if (!message)
          options.onNotice(
            "Mensagem indisponível",
            "A conversa foi aberta, mas esta mensagem não está mais disponível.",
          );
        return;
      }

      let player =
        options.players.find((item) => isSameNotificationPost(item.id, destination.playerId)) ??
        (await loadNotificationPost(destination.playerId));
      if (!isCurrent()) return;
      if (!player) {
        options.onNotice(
          "Publicação indisponível",
          "Esta publicação foi removida ou não está mais disponível para sua conta.",
        );
        return;
      }
      if (latest.current.blockedProfileIds.has(player.profileId)) {
        options.onNotice(
          "Perfil bloqueado",
          "Desbloqueie este perfil nas configurações para abrir a publicação.",
        );
        return;
      }
      const ownerUserId = player.ownerUserId;
      const author = options.users.find((account) => account.id === ownerUserId);
      if (!player.name)
        player = { ...player, name: author?.name ?? "Publicação", city: author?.city ?? "" };
      let comments: PostComment[] = [];
      let commentUnavailable = false;
      if (destination.commentId) {
        const loaded = options.commentsByPlayer[player.id] ?? [];
        const comment = loaded.find((item) => item.id === destination.commentId);
        if (
          !comment ||
          (comment.parentCommentId && !loaded.some((item) => item.id === comment.parentCommentId))
        ) {
          comments = await loadNotificationCommentThread(destination.commentId, player.id);
          commentUnavailable = !comments.some((item) => item.id === destination.commentId);
        }
      }
      if (!isCurrent() || latest.current.blockedProfileIds.has(player.profileId)) return;
      setPostTarget({ player, commentId: destination.commentId, comments, requestId: operation });
      options.onResolveContent?.({ userId: currentUserId, player, comments });
      options.onOpenPost(player);
      if (commentUnavailable)
        options.onNotice(
          "Comentário indisponível",
          "A publicação foi aberta, mas este comentário não está mais disponível.",
        );
    } catch {
      if (isCurrent())
        options.onNotice(
          "Não foi possível abrir",
          "Verifique sua conexão e tente abrir a notificação novamente. O conteúdo também pode ter sido removido ou ter acesso restrito.",
        );
    }
  }

  const notificationComments = useMemo(() => {
    if (!postTarget?.comments.length) return options.commentsByPlayer;
    const live = options.commentsByPlayer[postTarget.player.id] ?? [];
    const merged = new Map(postTarget.comments.map((comment) => [comment.id, comment]));
    live.forEach((comment) => merged.set(comment.id, comment));
    return {
      ...options.commentsByPlayer,
      [postTarget.player.id]: [...merged.values()].sort((left, right) =>
        left.createdAt.localeCompare(right.createdAt),
      ),
    };
  }, [options.commentsByPlayer, postTarget]);

  function removeComment(commentId: string) {
    setPostTarget((target) =>
      target
        ? { ...target, comments: target.comments.filter((comment) => comment.id !== commentId) }
        : null,
    );
  }

  return {
    openNotification,
    postTarget,
    messageTarget,
    commentsByPlayer: notificationComments,
    removeComment,
  };
}
