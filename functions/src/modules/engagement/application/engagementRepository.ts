import type { EngagementSnapshot, EngagementChange } from "../domain/engagement";

export type EngagementKey = {
  uid: string;
  playerId: string;
  postId: string;
  kind: "like" | "view";
};
export type EngagementRepository = {
  transact: <Result>(
    key: EngagementKey,
    decide: (snapshot: EngagementSnapshot) => EngagementChange<Result>,
  ) => Promise<Result>;
};
