import { act, renderHook } from "@testing-library/react-native";
import { useNotificationNavigation } from "../../src/app/useNotificationNavigation";
import {
  loadNotificationCommentThread,
  loadNotificationMessage,
  loadNotificationPost,
} from "../../src/services/notificationDestinationService";
import type { AppNotification, DirectMessage, Player, PostComment } from "../../src/types";

jest.mock("../../src/services/notificationDestinationService", () => ({
  loadNotificationCommentThread: jest.fn(),
  loadNotificationMessage: jest.fn(),
  loadNotificationPost: jest.fn(),
}));

const post: Player = {
  id: "approved-old-post",
  profileId: "profile-ana",
  ownerUserId: "ana",
  name: "Ana",
  age: 23,
  city: "Recife",
  position: "",
  club: "",
  videoTitle: "Foto",
  videoUri: "https://example.test/photo.png",
  videoLength: "",
  mediaType: "image",
  highlight: "",
  tags: [],
};
const notification: AppNotification = {
  actorName: "Pedro",
  actorUsername: "pedro",
  actorUserId: "pedro",
  recipientUserId: "ana",
  id: "notification-1",
  kind: "like",
  playerId: post.id,
  sourceId: "pedro-old-post",
  createdAt: "2026-11-06T10:00:00.000Z",
};
const message: DirectMessage = {
  id: "message-1",
  body: "Olá",
  senderUserId: "pedro",
  recipientUserId: "ana",
  createdAt: notification.createdAt,
};
const comment: PostComment = {
  id: "reply-1",
  playerId: post.id,
  authorName: "Pedro",
  authorUsername: "pedro",
  authorUserId: "pedro",
  authorProfileId: "profile-pedro",
  body: "Resposta",
  createdAt: notification.createdAt,
  parentCommentId: "comment-1",
  replyToUserId: "ana",
  replyToUsername: "ana",
};
function options(): Parameters<typeof useNotificationNavigation>[0] {
  return {
    blockedProfileIds: new Set(),
    commentsByPlayer: {},
    currentUserId: "ana",
    messages: [],
    players: [post],
    users: [],
    tab: "feed",
    onNotice: jest.fn(),
    onOpenConversation: jest.fn(),
    onOpenPost: jest.fn(),
  };
}
beforeEach(() => {
  jest.mocked(loadNotificationPost).mockReset().mockResolvedValue(null);
  jest.mocked(loadNotificationMessage).mockReset().mockResolvedValue(null);
  jest.mocked(loadNotificationCommentThread).mockReset().mockResolvedValue([]);
});

test("abre a publicação correta e repete a ação ao clicar novamente na mesma notificação", async () => {
  const input = options();
  const hook = renderHook(() => useNotificationNavigation(input));
  await act(() => hook.result.current.openNotification(notification));
  const firstRequest = hook.result.current.postTarget?.requestId;
  expect(input.onOpenPost).toHaveBeenCalledWith(post);
  expect(loadNotificationPost).not.toHaveBeenCalled();
  await act(() => hook.result.current.openNotification(notification));
  expect(hook.result.current.postTarget?.requestId).not.toBe(firstRequest);
  expect(input.onOpenPost).toHaveBeenCalledTimes(2);
});

test("busca publicação fora da janela do feed e a resposta com seu comentário pai", async () => {
  const input = { ...options(), players: [] };
  jest.mocked(loadNotificationPost).mockResolvedValue(post);
  const parent = { ...comment, id: "comment-1", parentCommentId: undefined };
  jest.mocked(loadNotificationCommentThread).mockResolvedValue([parent, comment]);
  const hook = renderHook(() => useNotificationNavigation(input));
  await act(() =>
    hook.result.current.openNotification({ ...notification, kind: "reply", sourceId: comment.id }),
  );
  expect(loadNotificationPost).toHaveBeenCalledWith(post.id);
  expect(loadNotificationCommentThread).toHaveBeenCalledWith(comment.id, post.id);
  expect(hook.result.current.postTarget?.commentId).toBe(comment.id);
  expect(hook.result.current.commentsByPlayer[post.id]).toEqual([parent, comment]);
  act(() => hook.result.current.removeComment(comment.id));
  expect(hook.result.current.commentsByPlayer[post.id]).toEqual([parent]);
});

test("mensagem e publicação compartilhada abrem a conversa do remetente com a mensagem selecionada", async () => {
  const input = options();
  jest.mocked(loadNotificationMessage).mockResolvedValue(message);
  const hook = renderHook(() => useNotificationNavigation(input));
  for (const kind of ["message", "shared-post"] as const) {
    await act(() =>
      hook.result.current.openNotification({ ...notification, kind, sourceId: message.id }),
    );
    expect(input.onOpenConversation).toHaveBeenLastCalledWith("pedro");
    expect(hook.result.current.messageTarget?.message).toEqual(message);
    expect(hook.result.current.messageTarget?.contact.id).toBe("pedro");
  }
  expect(input.onOpenPost).not.toHaveBeenCalled();
});

test("conteúdo removido avisa; falha de rede permite tentar de novo", async () => {
  const input = { ...options(), players: [] };
  const hook = renderHook(() => useNotificationNavigation(input));
  await act(() => hook.result.current.openNotification(notification));
  expect(input.onNotice).toHaveBeenCalledWith("Publicação indisponível", expect.any(String));
  expect(input.onOpenPost).not.toHaveBeenCalled();
  jest.mocked(loadNotificationPost).mockRejectedValueOnce(new Error("unavailable"));
  await act(() => hook.result.current.openNotification(notification));
  expect(input.onNotice).toHaveBeenLastCalledWith("Não foi possível abrir", expect.any(String));
  jest.mocked(loadNotificationPost).mockResolvedValue(post);
  await act(() => hook.result.current.openNotification(notification));
  expect(input.onOpenPost).toHaveBeenCalledWith(post);
});

test("notificação de outra conta e perfil bloqueado não abrem destinos", async () => {
  const input = options();
  input.blockedProfileIds = new Set([post.profileId, "profile-pedro"]);
  const hook = renderHook(() => useNotificationNavigation(input));
  await act(() =>
    hook.result.current.openNotification({ ...notification, recipientUserId: "outra-conta" }),
  );
  await act(() => hook.result.current.openNotification(notification));
  await act(() =>
    hook.result.current.openNotification({
      ...notification,
      kind: "message",
      sourceId: message.id,
    }),
  );
  expect(input.onOpenPost).not.toHaveBeenCalled();
  expect(input.onOpenConversation).not.toHaveBeenCalled();
  expect(loadNotificationMessage).not.toHaveBeenCalled();
});

test("último clique prevalece quando uma consulta anterior termina depois", async () => {
  const input = { ...options(), players: [] };
  let resolve!: (value: Player | null) => void;
  jest.mocked(loadNotificationPost).mockReturnValueOnce(
    new Promise((done) => {
      resolve = done;
    }),
  );
  jest.mocked(loadNotificationMessage).mockResolvedValue(message);
  const hook = renderHook(() => useNotificationNavigation(input));
  let pending!: Promise<void>;
  act(() => {
    pending = hook.result.current.openNotification(notification);
  });
  await act(() =>
    hook.result.current.openNotification({
      ...notification,
      kind: "message",
      sourceId: message.id,
    }),
  );
  await act(async () => {
    resolve(post);
    await pending;
  });
  expect(input.onOpenPost).not.toHaveBeenCalled();
  expect(hook.result.current.messageTarget?.messageId).toBe(message.id);
});

test.each(["tab", "user"])(
  "consulta pendente não redireciona após mudança de %s",
  async (change) => {
    const input = { ...options(), players: [] };
    let resolve!: (value: Player | null) => void;
    jest.mocked(loadNotificationPost).mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    const hook = renderHook((props) => useNotificationNavigation(props), { initialProps: input });
    let pending!: Promise<void>;
    act(() => {
      pending = hook.result.current.openNotification(notification);
    });
    hook.rerender({
      ...input,
      ...(change === "tab" ? { tab: "profile" as const } : { currentUserId: "outra-conta" }),
    });
    await act(async () => {
      resolve(post);
      await pending;
    });
    expect(input.onOpenPost).not.toHaveBeenCalled();
    expect(hook.result.current.postTarget).toBeNull();
  },
);
