import { act, renderHook } from "@testing-library/react-native";
import { usePostEngagement } from "../../src/actions/usePostEngagement";
import { subscribeFirebaseEngagement } from "../../src/services/firebaseEngagementSubscription";
import {
  recordFirebasePostView,
  setFirebasePostLike,
} from "../../src/services/firebaseSocialService";
jest.mock("../../src/services/firebaseEngagementSubscription", () => ({
  subscribeFirebaseEngagement: jest.fn(),
}));
jest.mock("../../src/services/firebaseSocialService", () => ({
  setFirebasePostLike: jest.fn(),
  recordFirebasePostView: jest.fn(),
}));
const subscribe = jest.mocked(subscribeFirebaseEngagement);
const snapshot = (liked: boolean) => ({
  likedPlayerIds: liked ? ["post"] : [],
  viewedPlayerIds: [],
  engagementByPlayer: { post: { likes: liked ? 6 : 5, views: 0, shares: 0 } },
});
test("troca de UID descarta snapshot e erro da conta anterior, inclusive com requisição pendente", async () => {
  const stop = jest.fn();
  subscribe.mockReturnValue(stop);
  const errors = jest.fn();
  let reject!: (error: Error) => void;
  jest.mocked(setFirebasePostLike).mockReturnValue(
    new Promise((_resolve, no) => {
      reject = no;
    }),
  );
  const hook = renderHook(({ uid }) => usePostEngagement(uid, ["post"], errors), {
    initialProps: { uid: "alice" },
  });
  const old = subscribe.mock.calls[0];
  act(() => old[2](snapshot(false)));
  act(() => hook.result.current.toggleLike("post"));
  expect(hook.result.current.engagementByPlayer.post.likes).toBe(6);
  hook.rerender({ uid: "bruno" });
  expect(hook.result.current.likedPlayerIds).toEqual([]);
  await act(async () => {
    old[2](snapshot(true));
    old[3](new Error("old"));
    reject(new Error("old request"));
    await Promise.resolve();
  });
  expect(errors).not.toHaveBeenCalled();
  expect(hook.result.current.likedPlayerIds).toEqual([]);
  act(() => subscribe.mock.calls[1][2](snapshot(false)));
  expect(hook.result.current.engagementByPlayer.post.likes).toBe(5);
  expect(stop).toHaveBeenCalledTimes(1);
  hook.unmount();
});
test("mesmo conjunto de posts conserva a assinatura e a visualização é enviada uma vez", async () => {
  subscribe.mockReturnValue(jest.fn());
  jest.mocked(recordFirebasePostView).mockResolvedValue(true);
  const hook = renderHook(({ ids }) => usePostEngagement("alice", ids, jest.fn()), {
    initialProps: { ids: ["a", "post"] },
  });
  act(() => subscribe.mock.calls[0][2](snapshot(false)));
  hook.rerender({ ids: ["post", "a"] });
  expect(subscribe).toHaveBeenCalledTimes(1);
  await act(async () => {
    hook.result.current.recordView("post");
    hook.result.current.recordView("post");
    await Promise.resolve();
  });
  expect(recordFirebasePostView).toHaveBeenCalledTimes(1);
  hook.unmount();
});
