export type QueryName =
  | "feed"
  | "authorPosts"
  | "following"
  | "followers"
  | "comments"
  | "notifications"
  | "messagesSent"
  | "messagesReceived"
  | "profilesPrefix"
  | "tags";

export type QueryDefinition = {
  collection: string;
  valueField: string;
  valueKind: "timestamp" | "string";
  direction: "asc" | "desc";
  scopeField?: string;
  prefix?: boolean;
  equalities: readonly (readonly [string, string])[];
  pageSize: number;
  maxPageSize: number;
  visibility: "registered" | "owner";
  indexFields?: readonly (readonly [string, "ASCENDING" | "DESCENDING"])[];
};

const chronological = {
  valueField: "createdAt",
  valueKind: "timestamp",
  direction: "desc",
  pageSize: 30,
  maxPageSize: 50,
  equalities: [],
  visibility: "registered",
} as const;

// Consultas candidatas: os consumidores são migrados por Q01-Q08/M03-M04.
export const queryCatalog: Record<QueryName, QueryDefinition> = {
  feed: {
    ...chronological,
    collection: "posts",
    pageSize: 20,
    equalities: [["status", "published"]],
    indexFields: [
      ["status", "ASCENDING"],
      ["createdAt", "DESCENDING"],
    ],
  },
  authorPosts: {
    ...chronological,
    collection: "posts",
    scopeField: "authorId",
    pageSize: 20,
    equalities: [["status", "published"]],
    indexFields: [
      ["authorId", "ASCENDING"],
      ["status", "ASCENDING"],
      ["createdAt", "DESCENDING"],
    ],
  },
  following: {
    ...chronological,
    collection: "follows",
    scopeField: "followerUid",
    indexFields: [
      ["followerUid", "ASCENDING"],
      ["createdAt", "DESCENDING"],
    ],
  },
  followers: {
    ...chronological,
    collection: "follows",
    scopeField: "targetUid",
    indexFields: [
      ["targetUid", "ASCENDING"],
      ["createdAt", "DESCENDING"],
    ],
  },
  comments: {
    ...chronological,
    collection: "postComments",
    scopeField: "postId",
    direction: "asc",
    indexFields: [
      ["postId", "ASCENDING"],
      ["createdAt", "ASCENDING"],
    ],
  },
  notifications: {
    ...chronological,
    collection: "notifications",
    scopeField: "recipientUserId",
    visibility: "owner",
    indexFields: [
      ["recipientUserId", "ASCENDING"],
      ["createdAt", "DESCENDING"],
    ],
  },
  messagesSent: {
    ...chronological,
    collection: "directMessages",
    scopeField: "senderUserId",
    visibility: "owner",
    indexFields: [
      ["senderUserId", "ASCENDING"],
      ["createdAt", "DESCENDING"],
    ],
  },
  messagesReceived: {
    ...chronological,
    collection: "directMessages",
    scopeField: "recipientUserId",
    visibility: "owner",
    indexFields: [
      ["recipientUserId", "ASCENDING"],
      ["createdAt", "DESCENDING"],
    ],
  },
  profilesPrefix: {
    ...chronological,
    collection: "profiles",
    valueField: "username",
    valueKind: "string",
    direction: "asc",
    scopeField: "username",
    prefix: true,
    pageSize: 20,
  },
  tags: {
    ...chronological,
    collection: "tagCatalog",
    valueField: "key",
    valueKind: "string",
    direction: "asc",
  },
};
