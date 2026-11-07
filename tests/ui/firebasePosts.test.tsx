import { act, renderHook } from "@testing-library/react-native";
import { useFirebasePosts } from "../../src/actions/useFirebasePosts";
import { subscribeFirebasePosts } from "../../src/services/firebasePostService";
import type { AppUser, VideoSubmission } from "../../src/types";

jest.mock("../../src/config/firebase", () => ({ isFirebaseMediaEnabled: () => true }));
jest.mock("../../src/services/firebasePostService", () => ({
  subscribeFirebasePosts: jest.fn(),
  getSafeFirebasePostSyncMessage: (error: Error) => error.message,
}));

const user = { id: "owner" } as AppUser;
const subscribe = jest.mocked(subscribeFirebasePosts);

test("aguarda o cache, substitui os posts e cancela a assinatura no unmount", () => {
  const unsubscribe = jest.fn();
  subscribe.mockReturnValue(unsubscribe);
  const setPosts = jest.fn();
  const hook = renderHook(({ loaded }) => useFirebasePosts(user, setPosts, loaded), {
    initialProps: { loaded: false },
  });
  expect(subscribe).not.toHaveBeenCalled();
  hook.rerender({ loaded: true });
  expect(setPosts).toHaveBeenCalledWith([]);
  expect(hook.result.current.isPostsLoaded).toBe(false);
  const remote = [{ id: "remote" }] as VideoSubmission[];
  act(() => subscribe.mock.calls[0][0](remote));
  expect(setPosts).toHaveBeenLastCalledWith(remote);
  expect(hook.result.current.isPostsLoaded).toBe(true);
  hook.unmount();
  expect(unsubscribe).toHaveBeenCalledTimes(1);
});

test("resposta antiga não preenche posts de outra conta; erro não vira sucesso silencioso", () => {
  subscribe.mockImplementation(() => jest.fn());
  const setPosts = jest.fn();
  const hook = renderHook(({ account }) => useFirebasePosts(account, setPosts, true), {
    initialProps: { account: user },
  });
  const oldSnapshot = subscribe.mock.calls[0][0];
  hook.rerender({ account: { ...user, id: "another" } });
  setPosts.mockClear();
  act(() => oldSnapshot([{ id: "stale" }] as VideoSubmission[]));
  expect(setPosts).not.toHaveBeenCalled();
  act(() => subscribe.mock.calls[1][1]?.(new Error("Sem conexão")));
  expect(hook.result.current.postsError).toBe("Sem conexão");
  expect(setPosts).not.toHaveBeenCalled();
  hook.unmount();
});

test("falha não apaga posts já sincronizados; tentar novamente assina sem limpar o feed", () => {
  const unsubscribe = jest.fn();
  subscribe.mockReturnValue(unsubscribe);
  const setPosts = jest.fn();
  const hook = renderHook(() => useFirebasePosts(user, setPosts, true));
  const posts = [{ id: "published" }] as VideoSubmission[];
  act(() => subscribe.mock.calls[0][0](posts));
  setPosts.mockClear();
  act(() => subscribe.mock.calls[0][1]?.(new Error("Sem conexão")));
  expect(setPosts).not.toHaveBeenCalled();
  expect(hook.result.current.postsError).toBe("Sem conexão");
  act(() => hook.result.current.retryPosts());
  expect(unsubscribe).toHaveBeenCalledTimes(1);
  expect(subscribe).toHaveBeenCalledTimes(2);
  expect(setPosts).not.toHaveBeenCalled();
  expect(hook.result.current.isPostsLoaded).toBe(true);
  act(() => subscribe.mock.calls[0][0]([]));
  expect(setPosts).not.toHaveBeenCalled();
  act(() => subscribe.mock.calls[1][0](posts));
  expect(setPosts).toHaveBeenLastCalledWith(posts);
  expect(hook.result.current.postsError).toBe("");
  hook.unmount();
});

test("acesso revogado limpa posts da conta em vez de conservar conteúdo sem autorização", () => {
  subscribe.mockReturnValue(jest.fn());
  const setPosts = jest.fn();
  const hook = renderHook(() => useFirebasePosts(user, setPosts, true));
  act(() => subscribe.mock.calls[0][0]([{ id: "published" }] as VideoSubmission[]));
  setPosts.mockClear();
  act(() =>
    subscribe.mock.calls[0][1]?.(
      Object.assign(new Error("Acesso revogado"), { code: "permission-denied" }),
    ),
  );
  expect(setPosts).toHaveBeenLastCalledWith([]);
  expect(hook.result.current.postsError).toBe("Acesso revogado");
  hook.unmount();
});
