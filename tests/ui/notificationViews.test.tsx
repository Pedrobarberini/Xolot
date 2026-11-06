import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { ScrollView } from "react-native";
import { CommentsModal } from "../../src/components/CommentsModal";
import { MessagesScreen } from "../../src/screens/MessagesScreen";
import { NotificationsPopover } from "../../src/components/NotificationsPopover";
import { colors } from "../../src/theme";
import type { AppNotification, PostComment } from "../../src/types";

jest.mock("../../src/components/SharedPostThumbnail", () => ({ SharedPostThumbnail: () => null }));
const parent: PostComment = {
  id: "parent",
  playerId: "approved-post",
  authorName: "Ana",
  authorUsername: "ana",
  authorUserId: "ana",
  authorProfileId: "profile-ana",
  body: "Comentário inicial",
  createdAt: "2026-11-06T10:00:00.000Z",
};
const reply: PostComment = {
  ...parent,
  id: "reply",
  authorUserId: "pedro",
  authorName: "Pedro",
  authorUsername: "pedro",
  body: "Resposta selecionada",
  parentCommentId: parent.id,
  replyToUserId: "ana",
  replyToUsername: "ana",
};
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test("notificação é acionável e entrega seu objeto completo ao selecionar", () => {
  const notification: AppNotification = {
    actorName: "Ana",
    actorUsername: "ana",
    actorUserId: "ana",
    recipientUserId: "pedro",
    createdAt: parent.createdAt,
    id: "n1",
    kind: "message",
    sourceId: "m1",
    preview: "Oi!",
  };
  const onSelect = jest.fn();
  render(
    <NotificationsPopover
      notifications={[notification]}
      onSelect={onSelect}
      onClose={jest.fn()}
      visible
    />,
  );
  fireEvent.press(screen.getByRole("button", { name: "Ana te mandou uma mensagem" }));
  expect(onSelect).toHaveBeenCalledWith(notification);
});

test("abre a resposta recolhida, destaca e rola até o comentário selecionado", () => {
  const scrollTo = jest.spyOn(ScrollView.prototype, "scrollTo").mockImplementation(() => {});
  const props: React.ComponentProps<typeof CommentsModal> = {
    comments: [parent, reply],
    currentUserId: "ana",
    onAddComment: jest.fn(),
    onClose: jest.fn(),
    onDeleteComment: jest.fn(),
    onOpenAuthor: jest.fn(),
    profileAvatars: {},
    users: [],
    videoId: parent.playerId,
    videoTitle: "Foto",
    visible: true,
  };
  const ui = render(<CommentsModal {...props} />);
  expect(screen.queryByText("Resposta selecionada")).toBeNull();
  ui.rerender(<CommentsModal {...props} focusCommentId={reply.id} focusRequestId={1} />);
  const target = screen.getByTestId("comment-reply");
  expect(screen.getByText(/Resposta selecionada/)).toBeTruthy();
  expect(target).toHaveStyle({ backgroundColor: colors.primarySoft });
  fireEvent(target, "layout", { nativeEvent: { layout: { y: 420 } } });
  act(() => jest.advanceTimersByTime(30));
  expect(scrollTo).toHaveBeenCalledWith({ animated: false, y: 408 });
  const calls = scrollTo.mock.calls.length;
  fireEvent(target, "layout", { nativeEvent: { layout: { y: 430 } } });
  act(() => jest.advanceTimersByTime(30));
  expect(scrollTo).toHaveBeenCalledTimes(calls);
});

test("mensagem da notificação fica visível e destacada na conversa do contato correto", () => {
  const scrollTo = jest.spyOn(ScrollView.prototype, "scrollTo").mockImplementation(() => {});
  render(
    <MessagesScreen
      activeContactId="pedro"
      contacts={[{ id: "pedro", profileId: "profile-pedro", name: "Pedro", subtitle: "" }]}
      currentUserId="ana"
      followingProfileIds={["profile-pedro"]}
      messages={[
        {
          id: "m1",
          body: "Mensagem selecionada",
          senderUserId: "pedro",
          recipientUserId: "ana",
          createdAt: parent.createdAt,
        },
      ]}
      focusMessageId="m1"
      focusRequestId={1}
      mutedContactIds={[]}
      pinnedContactIds={[]}
      players={[]}
      profileAvatars={{}}
      onDeleteConversation={jest.fn()}
      onFindProfiles={jest.fn()}
      onOpenProfile={jest.fn()}
      onOpenSharedPost={jest.fn()}
      onMarkMessagesRead={jest.fn()}
      onSelectContact={jest.fn()}
      onSendMessage={jest.fn()}
      onToggleFollow={jest.fn()}
      onToggleMute={jest.fn()}
      onTogglePin={jest.fn()}
    />,
  );
  expect(screen.getByText("Mensagem selecionada")).toBeTruthy();
  const target = screen.getByTestId("message-m1");
  expect(target).toHaveStyle({ backgroundColor: colors.primarySoft });
  fireEvent(target, "layout", { nativeEvent: { layout: { y: 600 } } });
  act(() => jest.advanceTimersByTime(30));
  expect(scrollTo).toHaveBeenCalledWith({ animated: false, y: 588 });
});
