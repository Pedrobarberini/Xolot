import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { FeedScreen } from "../../src/screens/FeedScreen";
import type { Player } from "../../src/types";
let mockMediaMounts = 0;
let mockMediaUnmounts = 0;
jest.mock("../../src/actions/useResolvedVideoSource", () => ({
  useResolvedVideoSource: (uri: string) => {
    const { useEffect } = jest.requireActual<typeof import("react")>("react");
    useEffect(() => {
      mockMediaMounts++;
      return () => {
        mockMediaUnmounts++;
      };
    }, []);
    return { source: uri, status: "ready" };
  },
}));
jest.mock("expo-video", () => ({ VideoView: () => null, useVideoPlayer: jest.fn() }));
jest.mock("../../src/components/CommentsModal", () => ({ CommentsModal: () => null }));
jest.mock("../../src/components/SharePostModal", () => ({ SharePostModal: () => null }));
jest.mock("../../src/components/ProfileListModal", () => ({ ProfileListModal: () => null }));
jest.mock("../../src/components/FeedPostOptionsModal", () => ({
  FeedPostOptionsModal: () => null,
}));
jest.mock("../../src/components/NotificationsPopover", () => ({
  NotificationsPopover: () => null,
}));
const post: Player = {
  id: "approved-post",
  age: 25,
  city: "São Paulo",
  club: "",
  name: "Pessoa",
  position: "Criador",
  profileId: "profile-alice",
  tags: [],
  videoLength: "0:00",
  videoTitle: "Publicação local",
  videoUri: "https://example.test/photo.png",
  mediaType: "image",
  highlight: "Foto de teste",
};
function props(): React.ComponentProps<typeof FeedScreen> {
  return {
    activeCampaignPlayerIds: new Set(),
    autoplayEnabled: true,
    blockedProfileIds: new Set(),
    commentsByPlayer: {},
    currentUserId: "alice",
    followingProfileIds: [],
    interestedContentKeys: new Set(),
    likedPlayerIds: new Set(),
    likeCountsByPlayer: {},
    shareCountsByPlayer: {},
    mutedContentKeys: new Set(),
    notifications: [],
    reportedPlayerIds: new Set(),
    players: [post],
    profileAvatars: {},
    shareContacts: [],
    users: [],
    onAddComment: () => true,
    onDeleteComment: jest.fn(),
    onMarkNotificationsRead: jest.fn(),
    onOpenNotification: jest.fn(),
    onOpenPlayer: jest.fn(),
    onOpenTaggedUser: jest.fn(),
    onRecordView: jest.fn(),
    onRefreshFeed: jest.fn(),
    onReportPlayer: jest.fn(),
    onShare: jest.fn(),
    onToggleBlockProfile: jest.fn(),
    onToggleFollow: jest.fn(),
    onToggleInterest: jest.fn(),
    onToggleLike: jest.fn(),
    onToggleMutedContent: jest.fn(),
  };
}
beforeEach(() => {
  jest.useFakeTimers();
  mockMediaMounts = 0;
  mockMediaUnmounts = 0;
});
afterEach(() => {
  jest.useRealTimers();
});

test("re-render não reinicia os 800ms da visualização e usa o callback atual", () => {
  const first = props();
  const next = jest.fn();
  const ui = render(<FeedScreen {...first} />);
  act(() => jest.advanceTimersByTime(400));
  ui.rerender(
    <FeedScreen {...first} onRecordView={next} likeCountsByPlayer={{ "approved-post": 1 }} />,
  );
  act(() => jest.advanceTimersByTime(400));
  expect(first.onRecordView).not.toHaveBeenCalled();
  expect(next).toHaveBeenCalledWith("approved-post");
  ui.unmount();
});

test("reset do feed conserva a mídia montada e saída cancela a visualização pendente", () => {
  const input = props();
  const ui = render(<FeedScreen {...input} />);
  expect(mockMediaMounts).toBe(1);
  fireEvent.press(screen.getByLabelText("Atualizar feed"));
  expect(input.onRefreshFeed).toHaveBeenCalledTimes(1);
  expect(mockMediaMounts).toBe(1);
  expect(mockMediaUnmounts).toBe(0);
  ui.unmount();
  act(() => jest.advanceTimersByTime(1000));
  expect(input.onRecordView).not.toHaveBeenCalled();
  expect(mockMediaUnmounts).toBe(1);
});

test("retorno restaura o post e salva posição relativa; contadores não fazem o scroll voltar ao início", () => {
  const input = props();
  const anchor = jest.fn();
  const posts = [post, { ...post, id: "approved-second", videoTitle: "Segundo post" }];
  const ui = render(
    <FeedScreen
      {...input}
      players={posts}
      entryKeys={["0:first", "0:second"]}
      initialAnchor={{ entryKey: "0:second", progress: 0.25 }}
      onAnchorChange={anchor}
    />,
  );
  fireEvent(screen.getByTestId("feed-pager-shell"), "layout", {
    nativeEvent: { layout: { height: 600 } },
  });
  act(() => jest.advanceTimersByTime(800));
  expect(input.onRecordView).toHaveBeenCalledWith("approved-second");
  fireEvent.scroll(screen.getByTestId("feed-pager-scroll"), {
    nativeEvent: { contentOffset: { y: 750 } },
  });
  act(() => jest.advanceTimersByTime(180));
  expect(anchor).toHaveBeenLastCalledWith({ entryKey: "0:second", progress: 0.25 });
  ui.rerender(
    <FeedScreen
      {...input}
      players={posts.map((player) => ({ ...player }))}
      entryKeys={["0:first", "0:second"]}
      initialAnchor={{ entryKey: "0:second", progress: 0.25 }}
      onAnchorChange={anchor}
      likeCountsByPlayer={{ [post.id]: 100 }}
    />,
  );
  ui.unmount();
  expect(anchor).toHaveBeenLastCalledWith({ entryKey: "0:second", progress: 0.25 });
});
