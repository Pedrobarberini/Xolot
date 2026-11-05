export type Page<T, Cursor> = {
  items: T[];
  nextCursor: Cursor | null;
  hasMore: boolean;
};

export type CursorValue =
  | { kind: "timestamp"; seconds: number; nanoseconds: number }
  | { kind: "string"; value: string };

export type QueryCursor = {
  version: 1;
  queryId: string;
  scope: string | null;
  documentId: string;
  value: CursorValue;
};

export class InvalidQueryCursorError extends Error {
  constructor() {
    super("Cursor inválido ou incompatível com a consulta.");
  }
}

export function validateCursor(
  value: unknown,
  queryId: string,
  scope: string | null,
  kind: CursorValue["kind"],
): QueryCursor {
  if (!value || typeof value !== "object") throw new InvalidQueryCursorError();
  const cursor = value as Record<string, unknown>;
  const item = cursor.value;
  if (
    cursor.version !== 1 ||
    cursor.queryId !== queryId ||
    cursor.scope !== scope ||
    typeof cursor.documentId !== "string" ||
    !cursor.documentId ||
    cursor.documentId.length > 1500 ||
    /[\u0000-\u001f/]/.test(cursor.documentId) ||
    [".", ".."].includes(cursor.documentId) ||
    !item ||
    typeof item !== "object" ||
    !("kind" in item) ||
    item.kind !== kind
  )
    throw new InvalidQueryCursorError();
  let cursorValue: CursorValue;
  if (kind === "timestamp") {
    if (
      !("seconds" in item) ||
      typeof item.seconds !== "number" ||
      !Number.isInteger(item.seconds) ||
      item.seconds < -62135596800 ||
      item.seconds > 253402300799 ||
      !("nanoseconds" in item) ||
      typeof item.nanoseconds !== "number" ||
      !Number.isInteger(item.nanoseconds) ||
      item.nanoseconds < 0 ||
      item.nanoseconds >= 1_000_000_000
    )
      throw new InvalidQueryCursorError();
    cursorValue = { kind, seconds: item.seconds, nanoseconds: item.nanoseconds };
  } else {
    if (!("value" in item) || typeof item.value !== "string" || item.value.length > 4096)
      throw new InvalidQueryCursorError();
    cursorValue = { kind, value: item.value };
  }
  return { version: 1, queryId, scope, documentId: cursor.documentId, value: cursorValue };
}
