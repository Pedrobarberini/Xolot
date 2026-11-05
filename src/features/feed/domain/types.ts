import type { PublishedPost } from "../../posts/index";
import type { AuthUid } from "../../../shared/primitives/ids";

export type FeedItem = {
  post: PublishedPost;
  author: {
    uid: AuthUid;
    name: string;
    username: string;
    activity: string;
    photoURL?: string;
  };
  mediaUri: string;
  metrics: { likes: number; views: number; comments: number; shares: number };
};
