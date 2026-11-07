import assert from "node:assert/strict";
import test from "node:test";
import {
  createOptimisticEngagement,
  type EngagementSnapshot,
} from "../src/utils/optimisticEngagement.ts";
const snapshot = (liked = false, viewed = false): EngagementSnapshot => ({
  likedPlayerIds: liked ? ["post"] : [],
  viewedPlayerIds: viewed ? ["post"] : [],
  engagementByPlayer: { post: { likes: liked ? 11 : 10, views: viewed ? 21 : 20, shares: 3 } },
});
const tick = () => new Promise<void>((resolve) => setImmediate(resolve));
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  return {
    promise: new Promise<T>((yes, no) => {
      resolve = yes;
      reject = no;
    }),
    resolve,
    reject,
  };
}

test("curtida é imediata, cliques rápidos preservam a última intenção e snapshots antigos não piscam", async () => {
  const first = deferred<boolean>();
  const second = deferred<boolean>();
  const writes: boolean[] = [];
  const emitted: EngagementSnapshot[] = [];
  const controller = createOptimisticEngagement({
    setLike: async (_id, liked) => {
      writes.push(liked);
      return writes.length === 1 ? first.promise : second.promise;
    },
    recordView: async () => true,
    onChange: (state) => emitted.push(state),
    onError: assert.fail,
  });
  controller.update(snapshot());
  controller.toggleLike("post");
  assert.equal(emitted.at(-1)!.engagementByPlayer.post.likes, 11);
  controller.update(snapshot());
  assert.deepEqual(emitted.at(-1)!.likedPlayerIds, ["post"]);
  controller.toggleLike("post");
  assert.equal(emitted.at(-1)!.engagementByPlayer.post.likes, 10);
  assert.deepEqual(writes, [true]);
  first.resolve(true);
  await tick();
  assert.deepEqual(writes, [true, false]);
  controller.update(snapshot(true));
  assert.deepEqual(emitted.at(-1)!.likedPlayerIds, []);
  second.resolve(false);
  await tick();
  controller.update(snapshot());
  assert.deepEqual(emitted.at(-1), snapshot());
  controller.dispose();
});

test("falha reverte curtida e permite nova visualização, sem recontar abertura repetida", async () => {
  const failedView = deferred<boolean>();
  let calls = 0;
  const errors: unknown[] = [];
  let latest = snapshot();
  const controller = createOptimisticEngagement({
    setLike: async () => {
      throw new Error("offline");
    },
    recordView: async () => {
      calls += 1;
      return calls === 1 ? failedView.promise : true;
    },
    onChange: (state) => {
      latest = state;
    },
    onError: (error) => errors.push(error),
  });
  controller.update(snapshot());
  controller.toggleLike("post");
  await tick();
  assert.deepEqual(latest, snapshot());
  controller.recordView("post");
  controller.recordView("post");
  assert.equal(calls, 1);
  assert.equal(latest.engagementByPlayer.post.views, 21);
  failedView.reject(new Error("offline"));
  await tick();
  assert.equal(latest.engagementByPlayer.post.views, 20);
  controller.recordView("post");
  await tick();
  controller.update(snapshot(false, true));
  controller.recordView("post");
  assert.equal(calls, 2);
  assert.equal(latest.engagementByPlayer.post.views, 21);
  assert.equal(errors.length, 2);
  controller.dispose();
});

test("resposta de sessão encerrada não atualiza outra conta nem mostra erro atrasado", async () => {
  const pending = deferred<boolean>();
  const emitted: EngagementSnapshot[] = [];
  const errors: unknown[] = [];
  const controller = createOptimisticEngagement({
    setLike: () => pending.promise,
    recordView: () => pending.promise,
    onChange: (state) => emitted.push(state),
    onError: (error) => errors.push(error),
  });
  controller.toggleLike("post");
  controller.recordView("post");
  controller.dispose();
  const before = emitted.length;
  pending.reject(new Error("sessão antiga"));
  await tick();
  controller.update(snapshot(true));
  controller.toggleLike("post");
  controller.recordView("post");
  assert.equal(emitted.length, before);
  assert.equal(errors.length, 0);
});

test("falha ao descurtir conserva a curtida anterior confirmada e seu contador", async () => {
  const first = deferred<boolean>();
  const second = deferred<boolean>();
  let writes = 0;
  let latest = snapshot();
  const controller = createOptimisticEngagement({
    setLike: () => (++writes === 1 ? first.promise : second.promise),
    recordView: async () => true,
    onChange: (state) => {
      latest = state;
    },
    onError: () => undefined,
  });
  controller.update(snapshot());
  controller.toggleLike("post");
  controller.toggleLike("post");
  first.resolve(true);
  await tick();
  second.reject(new Error("offline"));
  await tick();
  assert.deepEqual(latest.likedPlayerIds, ["post"]);
  assert.equal(latest.engagementByPlayer.post.likes, 11);
  controller.dispose();
});

test("compartilhamentos atualizam antes do servidor, reconciliam confirmação em qualquer ordem e revertem somente o envio que falhou", () => {
  let latest = snapshot();
  const controller = createOptimisticEngagement({
    setLike: async () => true,
    recordView: async () => true,
    onChange: (state) => {
      latest = state;
    },
    onError: assert.fail,
  });
  controller.update(snapshot());
  const first = controller.beginShare("post", "message-1");
  assert.equal(latest.engagementByPlayer.post.shares, 4);
  const second = controller.beginShare("post", "message-2");
  assert.equal(latest.engagementByPlayer.post.shares, 5);
  controller.update(snapshot());
  assert.equal(latest.engagementByPlayer.post.shares, 5);
  first(true);
  second(false);
  assert.equal(latest.engagementByPlayer.post.shares, 4);
  const confirmed = snapshot();
  confirmed.engagementByPlayer.post.shares = 4;
  controller.update(confirmed);
  assert.equal(latest.engagementByPlayer.post.shares, 4);
  const third = controller.beginShare("post", "message-3");
  confirmed.engagementByPlayer.post.shares = 5;
  controller.update(confirmed); // Listener chega antes da resposta HTTPS.
  assert.equal(latest.engagementByPlayer.post.shares, 5);
  third(true);
  assert.equal(latest.engagementByPlayer.post.shares, 5);
  const fourth = controller.beginShare("post", "message-4");
  confirmed.engagementByPlayer.post.shares = 9; // Outros usuários também compartilharam.
  controller.update(confirmed);
  assert.equal(latest.engagementByPlayer.post.shares, 9);
  fourth(true);
  assert.equal(latest.engagementByPlayer.post.shares, 9);
  controller.dispose();
});

test("visualização já contabilizada por outro dispositivo remove o incremento provisório; envios de sessão encerrada não vazam", async () => {
  let latest = snapshot();
  let emissions = 0;
  const controller = createOptimisticEngagement({
    setLike: async () => true,
    recordView: async () => false,
    onChange: (state) => {
      latest = state;
      emissions++;
    },
    onError: assert.fail,
  });
  controller.update(snapshot());
  controller.recordView("post");
  assert.equal(latest.engagementByPlayer.post.views, 21);
  await tick();
  assert.equal(latest.engagementByPlayer.post.views, 20);
  const complete = controller.beginShare("post", "message");
  controller.dispose();
  const previous = emissions;
  complete(true);
  assert.equal(emissions, previous);
});
