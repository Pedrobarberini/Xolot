import {
  collection,
  documentId,
  getDocsFromServer,
  limit,
  orderBy,
  query,
  startAfter,
  Timestamp,
  where,
  type Firestore,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { queryCatalog, type QueryName } from "../../config/queryCatalog.ts";
import { validateCursor, type Page, type QueryCursor } from "../primitives/pagination.ts";

type Options = { scope?: string; pageSize?: number; cursor?: QueryCursor | null };

export async function readFirestorePage(
  database: Firestore,
  name: QueryName,
  options: Options = {},
): Promise<Page<QueryDocumentSnapshot, QueryCursor>> {
  const spec = queryCatalog[name];
  if (!spec) throw new Error("Consulta não registrada.");
  const queryId = `${name}:v1`;
  let scope: string | null = options.scope ?? null;
  if (spec.prefix && scope !== null) scope = scope.trim().replace(/^@+/, "").toLowerCase();
  if (
    spec.scopeField
      ? scope === null || (!spec.prefix && (!scope || scope.trim() !== scope || scope.length > 128))
      : scope !== null
  )
    throw new Error("Escopo inválido para a consulta.");
  if (spec.prefix && (scope?.length ?? 0) > 30) throw new Error("Prefixo inválido.");
  const size = options.pageSize ?? spec.pageSize;
  if (!Number.isInteger(size) || size < 1 || size > spec.maxPageSize)
    throw new Error("Tamanho da página fora do limite.");
  const constraints: QueryConstraint[] = spec.equalities.map(([field, value]) =>
    where(field, "==", value),
  );
  if (spec.scopeField && scope !== null) {
    if (spec.prefix)
      constraints.push(
        where(spec.scopeField, ">=", scope),
        where(spec.scopeField, "<=", scope + "\uf8ff"),
      );
    else constraints.push(where(spec.scopeField, "==", scope));
  }
  constraints.push(orderBy(spec.valueField, spec.direction), orderBy(documentId(), spec.direction));
  if (options.cursor !== undefined && options.cursor !== null) {
    const cursor = validateCursor(options.cursor, queryId, scope, spec.valueKind);
    const value =
      cursor.value.kind === "timestamp"
        ? new Timestamp(cursor.value.seconds, cursor.value.nanoseconds)
        : cursor.value.value;
    constraints.push(startAfter(value, cursor.documentId));
  }
  constraints.push(limit(size + 1));
  const snapshot = await getDocsFromServer(
    query(collection(database, spec.collection), ...constraints),
  );
  const items = snapshot.docs.slice(0, size);
  const hasMore = snapshot.size > size;
  const last = items.at(-1);
  let nextCursor: QueryCursor | null = null;
  if (hasMore && last) {
    const value: unknown = last.get(spec.valueField);
    const cursorValue =
      spec.valueKind === "timestamp" && value && typeof value === "object"
        ? {
            kind: "timestamp",
            seconds: "seconds" in value ? value.seconds : undefined,
            nanoseconds: "nanoseconds" in value ? value.nanoseconds : undefined,
          }
        : { kind: "string", value };
    nextCursor = validateCursor(
      { version: 1, queryId, scope, documentId: last.id, value: cursorValue },
      queryId,
      scope,
      spec.valueKind,
    );
  }
  return { items, hasMore, nextCursor };
}
